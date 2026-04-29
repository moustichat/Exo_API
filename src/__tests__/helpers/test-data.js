const cuid = require('cuid')

function makeAuthHeader(token) {
  return { Authorization: `Bearer ${token}` }
}

function makeEventPayload(overrides = {}) {
  return {
    title: 'Concert test',
    description: 'Description test',
    date: '2030-01-01T10:00:00.000Z',
    duree: '01:30:00',
    location: 'Salle A',
    city: 'Paris',
    price: 20,
    total_seats: 100,
    seats_available: 100,
    category: 'Concert',
    organizerId: cuid(),
    picture: null,
    ...overrides,
  }
}

module.exports = {
  cuid,
  makeAuthHeader,
  makeEventPayload,
}
