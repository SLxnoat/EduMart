const asyncHandler = require('express-async-handler');
const paymentService = require('../services/paymentService');
const { Order } = require('../models');

// @desc    Create a PaymentIntent
// @route   POST /api/payments/create
// @access  Private
const createPaymentIntent = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  const order = await Order.findByPk(orderId);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const paymentDetails = await paymentService.createPaymentIntent(
    order.id,
    order.total_amount,
    order.currency
  );

  res.status(200).json({
    success: true,
    ...paymentDetails
  });
});

// @desc    Handle Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Note: We need the raw body for this.
    // This controller assumes the middleware in server.js is configured correctly.
    event = require('stripe')(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  const result = await paymentService.handleWebhookEvent(event);
  res.status(200).json(result);
});

module.exports = {
  createPaymentIntent,
  handlePaymentWebhook,
};
