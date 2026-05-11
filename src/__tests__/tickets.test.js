const request = require('supertest')
const { cuid, makeAuthHeader } = require('./helpers/test-data')

const purchaserId = cuid()
const eventId = cuid()

const prismaMock = {
  event: {
    findMany: jest.fn().mockResolvedValue([]),
    findUniqueOrThrow: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  user: {
    findMany: jest.fn().mockResolvedValue([]),
    findUnique: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(null),
  },
  ticket: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    update: jest.fn(),
    delete: jest.fn(),
  },
  refreshToken: {
    create: jest.fn(),
    findUnique: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn(async (callback) => callback(prismaMock)),
}

jest.mock('../../src/lib/prisma', () => ({ prisma: prismaMock }))

const verifyAccessTokenMock = jest.fn((token) => {
  if (token === 'user-token') return { userId: purchaserId, role: 'USER' }
  throw new Error('invalid token')
})

jest.mock('../../src/utils/jwt', () => ({
  verifyAccessToken: (token) => verifyAccessTokenMock(token),
  verifyRefreshToken: jest.fn(),
  signAccessToken: jest.fn(),
  signRefreshToken: jest.fn(),
}))

const appModule = require('../../src/app')
const app = appModule.default ?? appModule

describe('Tickets endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/v1/tickets returns 401 without token', async () => {
    const res = await request(app).post('/api/v1/tickets').send({ eventId, quantity: 2 })
    expect(res.statusCode).toBe(401)
  })

  test('POST /api/v1/tickets returns 400 for invalid body', async () => {
    const res = await request(app)
      .post('/api/v1/tickets')
      .set(makeAuthHeader('user-token'))
      .send({ quantity: 2 })

    expect(res.statusCode).toBe(400)
  })

  test('POST /api/v1/tickets returns 404 when event does not exist', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce(null)

    const res = await request(app)
      .post('/api/v1/tickets')
      .set(makeAuthHeader('user-token'))
      .send({ eventId, quantity: 2 })

    expect(res.statusCode).toBe(404)
  })

  test('POST /api/v1/tickets returns 409 when seats are insufficient', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce({
      id: eventId,
      price: 20,
      seats_available: 1,
    })

    const res = await request(app)
      .post('/api/v1/tickets')
      .set(makeAuthHeader('user-token'))
      .send({ eventId, quantity: 2 })

    expect(res.statusCode).toBe(409)
  })

  test('POST /api/v1/tickets returns 409 when user already bought the event', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce({
      id: eventId,
      price: 20,
      seats_available: 10,
    })
    prismaMock.ticket.findFirst.mockResolvedValueOnce({
      id: 1,
      eventId,
      userId: purchaserId,
      quantity: 2,
      totalPrice: 40,
    })
    prismaMock.event.update.mockResolvedValueOnce({ id: eventId, seats_available: 8 })
    prismaMock.ticket.update.mockResolvedValueOnce({
      id: 1,
      qrCode: 'qr-1',
      status: 'VALID',
      userId: purchaserId,
      eventId,
      quantity: 4,
      totalPrice: 80,
      event: { id: eventId, price: 20, seats_available: 8 },
    })

    const res = await request(app)
      .post('/api/v1/tickets')
      .set(makeAuthHeader('user-token'))
      .send({ eventId, quantity: 2 })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.ticket.quantity).toBe(4)
    expect(res.body.data.ticket.purchasedQuantity).toBe(2)
  })

  test('POST /api/v1/tickets returns 201, decrements seats and creates the ticket', async () => {
    prismaMock.event.findUnique.mockResolvedValueOnce({
      id: eventId,
      price: 20,
      seats_available: 10,
    })
    prismaMock.ticket.findFirst.mockResolvedValueOnce(null)
    prismaMock.event.update.mockResolvedValueOnce({ id: eventId, seats_available: 7 })
    prismaMock.ticket.create.mockResolvedValueOnce({
      id: 1,
      qrCode: 'qr-1',
      status: 'VALID',
      userId: purchaserId,
      eventId,
      quantity: 3,
      totalPrice: 60,
    })

    const res = await request(app)
      .post('/api/v1/tickets')
      .set(makeAuthHeader('user-token'))
      .send({ eventId, quantity: 3 })

    expect(res.statusCode).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.ticket.quantity).toBe(3)
    expect(res.body.data.ticket.purchasedQuantity).toBe(3)
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: { seats_available: 7 },
    })
    expect(prismaMock.ticket.create).toHaveBeenCalled()
  })

  test('DELETE /api/v1/tickets/:id returns 200 and restores seats when removing part of a ticket', async () => {
    prismaMock.ticket.findFirst.mockResolvedValueOnce({
      id: 1,
      qrCode: 'qr-1',
      status: 'VALID',
      userId: purchaserId,
      eventId,
      quantity: 4,
      totalPrice: 80,
      event: { id: eventId, price: 20, seats_available: 6, total_seats: 10 },
    })
    prismaMock.event.findUnique.mockResolvedValueOnce({
      id: eventId,
      price: 20,
      seats_available: 6,
      total_seats: 10,
    })
    prismaMock.event.update.mockResolvedValueOnce({ id: eventId, seats_available: 8 })
    prismaMock.ticket.update.mockResolvedValueOnce({
      id: 1,
      qrCode: 'qr-1',
      status: 'VALID',
      userId: purchaserId,
      eventId,
      quantity: 2,
      totalPrice: 40,
      event: { id: eventId, price: 20, seats_available: 8 },
    })

    const res = await request(app)
      .delete('/api/v1/tickets/1')
      .set(makeAuthHeader('user-token'))
      .send({ quantity: 2 })

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.removedQuantity).toBe(2)
    expect(prismaMock.event.update).toHaveBeenCalledWith({
      where: { id: eventId },
      data: { seats_available: 8 },
    })
  })

  test('GET /api/v1/users/tickets returns authenticated user tickets', async () => {
    prismaMock.ticket.findMany.mockResolvedValueOnce([
      {
        id: 1,
        qrCode: 'qr-1',
        quantity: 2,
        totalPrice: 40,
        eventId,
        userId: purchaserId,
      },
    ])

    const res = await request(app)
      .get('/api/v1/users/tickets')
      .set(makeAuthHeader('user-token'))

    expect(res.statusCode).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.tickets)).toBe(true)
    expect(prismaMock.ticket.findMany).toHaveBeenCalledWith({
      where: { userId: purchaserId },
      include: { event: true },
      orderBy: { purchaseDate: 'desc' },
    })
  })
})