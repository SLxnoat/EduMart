const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const sequelize = require('./src/models').sequelize;

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Stripe Webhook handler needs the raw body
app.post('/api/payments/webhook', express.raw({type: 'application/json'}), require('./src/routes/paymentRoutes').webhookHandler);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Testing වලදී morgan log නොවන සේ සකස් කිරීම
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

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
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database Connection and Server Start logic
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('MySQL Database connected successfully.');

    await sequelize.sync({ force: false });
    console.log('MySQL models synchronized.');

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
};

// File එක direct run වෙන විට (npm start / node server.js) පමණක් server එක start කරන්න
// Jest testing (require/import) වලදී server එක listen වෙන්නේ නැත
if (require.main === module) {
  startServer();
}

module.exports = app;