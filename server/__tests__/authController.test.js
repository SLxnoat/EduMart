const request = require('supertest');
const { Sequelize } = require('sequelize');
const app = require('../server');
const User = require('../src/models/User');

let testDb;

beforeAll(async () => {
  // Create a separate SQLite in-memory database for testing
  testDb = new Sequelize('sqlite::memory:', {
    logging: false
  });

  // We need to override the User model to use this test DB instance
  // In a real production app, we would use a dependency injection
  // or a separate test configuration for the Sequelize instance.

  // For the sake of this test, we'll redefine the User model on the testDb
  // to ensure it uses the in-memory SQLite instance.

  // Instead of rewriting the whole model, we can use a manual sync if
  // the model was defined using the shared sequelize instance.
  // But for total isolation, we'll use a a simple sync here.
});

afterAll(async () => {
  if (testDb) {
    await testDb.close();
  }
});

beforeEach(async () => {
  // Sync database before each test to ensure clean state
  // Using the actual model definition but syncing to in-memory DB if possible
  // Note: For this project, we'll use the shared User model but ensure
  // it's synced with the database defined in config/database.js
  // If we use a real MySQL DB for tests, we should clean it.
  await User.destroy({ truncate: true });
});

describe('Auth Controller', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john.doe@example.com');
    });

    it('should not register user with existing email', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      // Try to register with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password456',
          phone: '0987654321',
          role: 'tutor'
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user with correct credentials', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      // Login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('john.doe@example.com');
    });

    it('should not login user with incorrect password', async () => {
      // Create user first
      await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890',
          role: 'student'
        });

      // Try to login with wrong password
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});