const request = require('supertest')
const { HttpError } = require('../../src/utils/http-error')

const authServiceMock = {
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
}

jest.mock('../../src/services/auth.service', () => ({
  authService: authServiceMock,
}))

const app = require('../../src/app')

describe('Auth endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/v1/auth/register returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({ email: 'bad-email' })
    expect(res.statusCode).toBe(400)
  })

  test('POST /api/v1/auth/register returns 201 and sets cookies', async () => {
    const payload = { email: 'test@example.com', password: 'password123' }
    const loginResult = {
      user: { id: 'u1', email: payload.email, role: 'USER' },
      tokens: { accessToken: 'access-token', refreshToken: 'refresh-token' },
    }

    authServiceMock.register.mockResolvedValue({ id: 'u1' })
    authServiceMock.login.mockResolvedValue(loginResult)

    const res = await request(app).post('/api/v1/auth/register').send(payload)

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(authServiceMock.register).toHaveBeenCalledWith(payload)
    expect(authServiceMock.login).toHaveBeenCalledWith(payload)
    expect(res.headers['set-cookie']).toBeDefined()
    expect(res.headers['set-cookie'].join(';')).toMatch(/accessToken=/)
    expect(res.headers['set-cookie'].join(';')).toMatch(/refreshToken=/)
  })

  test('POST /api/v1/auth/login returns 400 for invalid body', async () => {
    const res = await request(app).post('/api/v1/auth/login').send({ email: 'x' })
    expect(res.statusCode).toBe(400)
  })

  test('POST /api/v1/auth/login returns 200 and sets cookies', async () => {
    const payload = { email: 'user@example.com', password: 'password123' }
    authServiceMock.login.mockResolvedValue({
      user: { id: 'u2', email: payload.email, role: 'USER' },
      tokens: { accessToken: 'access-token-2', refreshToken: 'refresh-token-2' },
    })

    const res = await request(app).post('/api/v1/auth/login').send(payload)

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(authServiceMock.login).toHaveBeenCalledWith(payload)
    expect(res.headers['set-cookie'].join(';')).toMatch(/accessToken=/)
    expect(res.headers['set-cookie'].join(';')).toMatch(/refreshToken=/)
  })

  test('POST /api/v1/auth/refresh returns 401 without refresh cookie', async () => {
    const res = await request(app).post('/api/v1/auth/refresh')
    expect(res.statusCode).toBe(401)
  })

  test('POST /api/v1/auth/refresh returns 401 on invalid token', async () => {
    authServiceMock.refresh.mockRejectedValue(new HttpError(401, 'Invalid refresh token'))

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=invalid-token'])

    expect(res.statusCode).toBe(401)
  })

  test('POST /api/v1/auth/refresh returns 200 and sets access token', async () => {
    authServiceMock.refresh.mockResolvedValue('new-access-token')

    const res = await request(app)
      .post('/api/v1/auth/refresh')
      .set('Cookie', ['refreshToken=good-token'])

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.accessToken).toBe('new-access-token')
    expect(res.headers['set-cookie'].join(';')).toMatch(/accessToken=/)
  })

  test('POST /api/v1/auth/logout returns 200 without cookie', async () => {
    const res = await request(app).post('/api/v1/auth/logout')
    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(authServiceMock.logout).not.toHaveBeenCalled()
  })

  test('POST /api/v1/auth/logout returns 200 and calls logout with cookie', async () => {
    authServiceMock.logout.mockResolvedValue(undefined)
    const res = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', ['refreshToken=to-revoke'])

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(authServiceMock.logout).toHaveBeenCalledWith('to-revoke')
  })
})
