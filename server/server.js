const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const sequelize = require('./src/models').sequelize;

const app = express();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
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
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/cart', require('./src/routes/cartRoutes'));
app.use('/api/coupons', require('./src/routes/couponRoutes'));
app.use('/api/payments', require('./src/routes/paymentRoutes'));
app.use('/api/chatbot', require('./src/routes/chatbotRoutes'));
app.use('/api/products', require('./src/routes/productRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/reviews', require('./src/routes/reviewRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/seller', require('./src/routes/sellerRoutes'));
app.use('/api/email', require('./src/routes/emailRoutes'));
app.use('/api/categories', (req, res, next) => {
  const { getCategories } = require('./src/controllers/productController');
  getCategories(req, res, next);
});

// Serve uploaded material files
app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Serve frontend static build in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.resolve(__dirname, '../client/build');
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res, next) => {
    if (req.originalUrl.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || err.status || (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);
  if (process.env.NODE_ENV !== 'test') {
    console.error(err.stack);
  }
  res.status(statusCode).json({
    message: err.message || 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const startServer = async () => {
  try {
    await sequelize.authenticate();
    const dialectName = typeof sequelize.getDialect === 'function' ? sequelize.getDialect().toUpperCase() : 'Database';
    console.log(`${dialectName} connected successfully.`);

    await sequelize.sync({ force: false });
    console.log(`${dialectName} models synchronized.`);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    const dialect = typeof sequelize.getDialect === 'function' ? sequelize.getDialect() : 'mysql';
    if (dialect === 'mysql') {
      console.warn('\n💡 Tip: To run without local MySQL setup, set DB_DIALECT=sqlite in server/.env\n');
    }
    process.exit(1);
  }
};

// File එක direct run වෙන විට (npm start / node server.js) පමණක් server එක start කරන්න
// Jest testing (require/import) වලදී server එක listen වෙන්නේ නැත
if (require.main === module) {
  startServer();
}

module.exports = app;