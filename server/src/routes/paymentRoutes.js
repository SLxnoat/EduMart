const express = require('express');
const router = express.Router();
const {
  getPaymentConfig,
  createPaymentIntent,
  createPayPalOrder,
  capturePayPalOrder,
  processPayment,
  getPaymentStatus,
  simulatePaymentSuccess,
  handlePaymentWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.get('/config', getPaymentConfig);

// Protected payment endpoints
router.post('/create', protect, createPaymentIntent);
router.post('/process', protect, processPayment);
router.post('/paypal/create-order', protect, createPayPalOrder);
router.post('/paypal/capture-order', protect, capturePayPalOrder);
router.get('/status/:id', protect, getPaymentStatus);
router.post('/simulate-success', protect, simulatePaymentSuccess);

// Export router and raw webhook handler
module.exports = router;
module.exports.webhookHandler = handlePaymentWebhook;
