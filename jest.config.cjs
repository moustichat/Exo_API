module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.(ts|js)'],
  transform: {
    '^.+\\.ts$': ['ts-jest']
  }
}
