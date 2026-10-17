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

  // Authorization check: ensure order belongs to authenticated user or user is admin
  if (req.user && req.user.role !== 'admin' && order.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to access this order');
  }

  const paymentDetails = await paymentService.createPaymentIntent(
    order.id,
    order.total_amount,
    order.currency
  );

  res.status(200).json({
    success: true,
    orderId: order.id,
    amount: order.total_amount,
    currency: order.currency,
    ...paymentDetails,
  });
});

// @desc    Check payment status
// @route   GET /api/payments/status/:id
// @access  Private
const getPaymentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const payment = await paymentService.getPaymentStatus(id);

  if (!payment) {
    res.status(404);
    throw new Error('Payment record not found');
  }

  // Ensure requester owns the payment or is admin
  if (req.user && req.user.role !== 'admin' && payment.user_id !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to view this payment');
  }

  res.status(200).json({
    success: true,
    data: payment,
  });
});

// @desc    Simulate payment success (for sandbox / local testing)
// @route   POST /api/payments/simulate-success
// @access  Private
const simulatePaymentSuccess = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400);
    throw new Error('Order ID is required');
  }

  const result = await paymentService.simulatePaymentSuccess(
    orderId,
    req.user ? req.user.id : null
  );

  res.status(200).json(result);
});

// @desc    Handle Stripe Webhook
// @route   POST /api/payments/webhook
// @access  Public (Stripe)
const handlePaymentWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    if (process.env.STRIPE_WEBHOOK_SECRET && sig) {
      event = require('stripe')(process.env.STRIPE_SECRET_KEY).webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      // In testing or without webhook secret signature, parse JSON body whether Buffer, string, or object
      if (Buffer.isBuffer(req.body)) {
        event = JSON.parse(req.body.toString('utf8'));
      } else if (typeof req.body === 'string') {
        event = JSON.parse(req.body);
      } else {
        event = req.body;
      }
    }
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
  getPaymentStatus,
  simulatePaymentSuccess,
  handlePaymentWebhook,
};
