// Jest setup file
process.env.NODE_ENV = 'test';

// Mock MongoDB connection
jest.mock('mongoose', () => {
  const actualMongoose = jest.requireActual('mongoose');
  return {
    ...actualMongoose,
    connect: jest.fn(),
    connection: {
      readyState: 1
    }
  };
});

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn()
}));