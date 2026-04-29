const request = require('supertest')
const { cuid, makeAuthHeader } = require('./helpers/test-data')

const adminId = cuid()
const selfUserId = cuid()
const otherUserId = cuid()

const prismaMock = {
  event: {
    findMany: jest.fn().mockResolvedValue([]),
    findUniqueOrThrow: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([{ id: selfUserId, email: 'u@x.com' }]),
    findUnique: jest.fn().mockImplementation(({ where: { id } }) => Promise.resolve({ id, email: `${id}@x.com` })),
    delete: jest.fn().mockImplementation(({ where: { id } }) => Promise.resolve({ id, email: `${id}@x.com` })),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
}

jest.mock('../../src/lib/prisma', () => ({ prisma: prismaMock }))

const verifyAccessTokenMock = jest.fn((token) => {
  if (token === 'admin-token') return { userId: adminId, role: 'ADMIN' }
  if (token === 'self-user-token') return { userId: selfUserId, role: 'USER' }
  if (token === 'other-user-token') return { userId: otherUserId, role: 'USER' }
  throw new Error('invalid token')
})

jest.mock('../../src/utils/jwt', () => ({
  verifyAccessToken: (token) => verifyAccessTokenMock(token),
  verifyRefreshToken: jest.fn(),
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
}))

const app = require('../../src/app')

describe('Users endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET /api/v1/users returns 401 without token', async () => {
    const res = await request(app).get('/api/v1/users')
    expect(res.statusCode).toBe(401)
  })

  test('GET /api/v1/users returns 403 for non-admin user', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set(makeAuthHeader('self-user-token'))
    expect(res.statusCode).toBe(403)
  })

  test('GET /api/v1/users returns 200 for admin', async () => {
    const res = await request(app)
      .get('/api/v1/users')
      .set(makeAuthHeader('admin-token'))

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  test('GET /api/v1/users/:id returns 200 for self', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${selfUserId}`)
      .set(makeAuthHeader('self-user-token'))

    expect(res.statusCode).toBe(200)
    expect(res.body.id).toBe(selfUserId)
  })

  test('GET /api/v1/users/:id returns 403 for non-self user', async () => {
    const res = await request(app)
      .get(`/api/v1/users/${selfUserId}`)
      .set(makeAuthHeader('other-user-token'))
    expect(res.statusCode).toBe(403)
  })

  test('GET /api/v1/users/:id returns 400 for invalid id', async () => {
    const res = await request(app)
      .get('/api/v1/users/not-a-cuid')
      .set(makeAuthHeader('admin-token'))
    expect(res.statusCode).toBe(400)
  })

  test('DELETE /api/v1/users/:id returns 200 for self user', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${selfUserId}`)
      .set(makeAuthHeader('self-user-token'))

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })

  test('DELETE /api/v1/users/:id returns 403 for non-self user', async () => {
    const res = await request(app)
      .delete(`/api/v1/users/${selfUserId}`)
      .set(makeAuthHeader('other-user-token'))

    expect(res.statusCode).toBe(403)
  })

  test('DELETE /api/v1/users/:id returns 200 for admin', async () => {
    const targetId = cuid()
    const res = await request(app)
      .delete(`/api/v1/users/${targetId}`)
      .set(makeAuthHeader('admin-token'))

    expect(res.statusCode).toBe(200)
    expect(res.body.user.id).toBe(targetId)
  })
})
