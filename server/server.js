const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const sequelize = require('./src/config/database');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Database Connection and Synchronization
const startServer = async () => {
  try {
    // Authenticate and test connection
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');

    // Sync models (Use { force: false } for production to avoid data loss)
    // In a real project, you would use Sequelize CLI for migrations
    await sequelize.sync({ force: false });
    console.log('MySQL models synchronized.');

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to EduMart API' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
app.use('/api/auth', require('./src/routes/authRoutes'));
// Other routes would be added here as developed

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

startServer();

module.exports = app;