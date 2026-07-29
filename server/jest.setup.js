// Jest setup file
process.env.NODE_ENV = 'test';

// Mock database connection for unit tests
// We use a real MySQL connection in integration tests, but can mock it here for units
const mockSequelize = {
  authenticate: jest.fn().mockResolvedValue(true),
  sync: jest.fn().mockResolvedValue(true),
  define: jest.fn().mockImplementation((name, attributes, options) => {
    // Create a mock model constructor
    const mockModel = function() {
      // Instance properties
      this.id = 'test-id';
      this.email = 'test@example.com';
      this.first_name = 'Test';
      this.last_name = 'User';
      this.password_hash = 'hashed-password';
      // Add other attributes as needed

      // Copy instance methods
      if (this.matchPassword) {
        // Preserve user-defined instance methods
      }
    };

    // Add static methods
    mockModel.create = jest.fn().mockResolvedValue(new mockModel());
    mockModel.findOne = jest.fn().mockResolvedValue(new mockModel());
    mockModel.findByPk = jest.fn().mockResolvedValue(new mockModel());
    mockModel.update = jest.fn().mockResolvedValue([1, [new mockModel()]]); // [count, affectedRows]
    mockModel.destroy = jest.fn().mockResolvedValue(1);

    // Add the instance method that's defined in the actual User model
    mockModel.prototype.matchUserPassword = async function(enteredPassword) {
      // This mimics the actual method in the User model
      return await require('bcryptjs').compare(enteredPassword, this.password_hash);
    };

    return mockModel;
  })
};

jest.mock('./src/config/database', () => {
  return mockSequelize;
});
