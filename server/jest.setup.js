// Jest setup file
process.env.NODE_ENV = 'test';

// Mock database connection for unit tests
// We use a real MySQL connection in integration tests, but can mock it here for units
jest.mock('../src/config/database', () => {
  return {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true)
  };
});
