const express = require('express');
const router = express.Router();
const { createPaymentIntent, handlePaymentWebhook } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

// Create payment intent (Requires user authentication)
router.post('/create', protect, createPaymentIntent);

// We export the webhook handler separately for server.js raw-body handling
module.exports = router;
module.exports.webhookHandler = handlePaymentWebhook;
