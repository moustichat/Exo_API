const request = require('supertest')
const { cuid, makeAuthHeader, makeEventPayload } = require('./helpers/test-data')

const prismaMock = {
  event: {
    findMany: jest.fn().mockResolvedValue([{ id: cuid(), title: 'Event 1' }]),
    findUniqueOrThrow: jest.fn().mockImplementation(({ where: { id } }) => Promise.resolve({ id, title: `Event ${id}` })),
    create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: cuid(), ...data })),
    update: jest.fn().mockImplementation(({ where: { id }, data }) => Promise.resolve({ id, ...data })),
    delete: jest.fn().mockImplementation(({ where: { id } }) => Promise.resolve({ id, title: `Event ${id}` })),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(null),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
}

jest.mock('../../src/lib/prisma', () => ({ prisma: prismaMock }))

const verifyAccessTokenMock = jest.fn((token) => {
  if (token === 'admin-token') return { userId: cuid(), role: 'ADMIN' }
  if (token === 'organizer-token') return { userId: cuid(), role: 'ORGANIZER' }
  if (token === 'user-token') return { userId: cuid(), role: 'USER' }
  throw new Error('invalid token')
})

jest.mock('../../src/utils/jwt', () => ({
  verifyAccessToken: (token) => verifyAccessTokenMock(token),
  verifyRefreshToken: jest.fn(),
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
}))

const app = require('../../src/app')

describe('Events endpoints', () => {
  test('GET /api/v1/events returns list', async () => {
    const res = await request(app).get('/api/v1/events')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })

  test('GET /api/v1/events/:id returns single event', async () => {
    const id = cuid()
    const res = await request(app).get(`/api/v1/events/${id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.id).toBe(id)
  })

  test('GET /api/v1/events/:id returns 400 for invalid id', async () => {
    const res = await request(app).get('/api/v1/events/not-a-cuid')
    expect(res.statusCode).toBe(400)
  })

  test('POST /api/v1/events returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/events').send(makeEventPayload())
    expect(res.statusCode).toBe(401)
  })

  test('POST /api/v1/events returns 403 for USER role', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set(makeAuthHeader('user-token'))
      .send(makeEventPayload())
    expect(res.statusCode).toBe(403)
  })

  test('POST /api/v1/events returns 400 for invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/events')
      .set(makeAuthHeader('organizer-token'))
      .send({ title: 'incomplete' })
    expect(res.statusCode).toBe(400)
  })

  test('POST /api/v1/events returns 201 for ORGANIZER', async () => {
    const payload = makeEventPayload()
    const res = await request(app)
      .post('/api/v1/events')
      .set(makeAuthHeader('organizer-token'))
      .send(payload)

    expect(res.statusCode).toBe(201)
    expect(res.body.message).toBe('success')
    expect(prismaMock.event.create).toHaveBeenCalled()
  })

  test('PATCH /api/v1/events/:id returns 401 without token', async () => {
    const id = cuid()
    const res = await request(app)
      .patch(`/api/v1/events/${id}`)
      .send({ title: 'Updated' })
    expect(res.statusCode).toBe(401)
  })

  test('PATCH /api/v1/events/:id returns 403 for USER role', async () => {
    const id = cuid()
    const res = await request(app)
      .patch(`/api/v1/events/${id}`)
      .set(makeAuthHeader('user-token'))
      .send({ title: 'Updated' })
    expect(res.statusCode).toBe(403)
  })

  test('PATCH /api/v1/events/:id returns 400 for invalid id', async () => {
    const res = await request(app)
      .patch('/api/v1/events/invalid-id')
      .set(makeAuthHeader('admin-token'))
      .send({ title: 'Updated' })
    expect(res.statusCode).toBe(400)
  })

  test('PATCH /api/v1/events/:id returns 400 for empty body', async () => {
    const id = cuid()
    const res = await request(app)
      .patch(`/api/v1/events/${id}`)
      .set(makeAuthHeader('admin-token'))
      .send({})
    expect(res.statusCode).toBe(400)
  })

  test('PATCH /api/v1/events/:id returns 200 for ADMIN', async () => {
    const id = cuid()
    const res = await request(app)
      .patch(`/api/v1/events/${id}`)
      .set(makeAuthHeader('admin-token'))
      .send({ title: 'Updated Event' })

    expect(res.statusCode).toBe(200)
    expect(res.body.message).toMatch(/mis à jour/i)
  })

  test('DELETE /api/v1/events/:id returns 401 without token', async () => {
    const id = cuid()
    const res = await request(app).delete(`/api/v1/events/${id}`)
    expect(res.statusCode).toBe(401)
  })

  test('DELETE /api/v1/events/:id returns 403 for USER role', async () => {
    const id = cuid()
    const res = await request(app)
      .delete(`/api/v1/events/${id}`)
      .set(makeAuthHeader('user-token'))
    expect(res.statusCode).toBe(403)
  })

  test('DELETE /api/v1/events/:id returns 200 for ORGANIZER', async () => {
    const id = cuid()
    const res = await request(app)
      .delete(`/api/v1/events/${id}`)
      .set(makeAuthHeader('organizer-token'))
    expect(res.statusCode).toBe(200)
    expect(res.text).toMatch(/Deleted event/i)
  })
})
