const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  getPaymentStatus,
  simulatePaymentSuccess,
  handlePaymentWebhook,
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Protected payment endpoints
router.post('/create', protect, createPaymentIntent);
router.get('/status/:id', protect, getPaymentStatus);
router.post('/simulate-success', protect, simulatePaymentSuccess);

// Export router and raw webhook handler
module.exports = router;
module.exports.webhookHandler = handlePaymentWebhook;
