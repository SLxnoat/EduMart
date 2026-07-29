// Jest setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Mock config/database with a SQLite in-memory Sequelize instance.
// IMPORTANT: jest.mock factories are hoisted and CANNOT close over outer-scope vars.
// Everything must be instantiated with require() inside the factory.
jest.mock('./src/config/database', () => {
  const { Sequelize } = require('sequelize');
  return new Sequelize('sqlite::memory:', { logging: false });
});
