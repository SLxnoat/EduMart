const { Payment, Order } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationHelper');

let stripe = null;
if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes('placeholder')) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  } catch (err) {
    console.warn('Stripe initialization failed, running in simulation mode:', err.message);
  }
}

const paymentService = {
  /**
   * Create a Stripe PaymentIntent or mock fallback
   * @param {string} orderId - ID of the order being paid
   * @param {number} amount - Total amount to charge
   * @param {string} currency - Currency code (e.g., 'USD')
   */
  createPaymentIntent: async (orderId, amount, currency = 'USD') => {
    if (stripe) {
      try {
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Stripe expects amount in cents
          currency: currency.toLowerCase(),
          metadata: { order_id: orderId },
          automatic_payment_methods: { enabled: true },
        });

        return {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
          mode: 'live',
        };
      } catch (stripeError) {
        console.warn('Stripe API error, falling back to sandbox simulation:', stripeError.message);
      }
    }

    // Sandbox / Test fallback when Stripe is unconfigured or in offline test mode
    const mockPaymentIntentId = `pi_test_${orderId.replace(/-/g, '').slice(0, 16)}_${Date.now().toString(36)}`;
    return {
      clientSecret: `${mockPaymentIntentId}_secret_test`,
      paymentIntentId: mockPaymentIntentId,
      mode: 'sandbox',
    };
  },

  /**
   * Get payment details and status by payment id, provider id, or order id
   * @param {string} identifier
   */
  getPaymentStatus: async (identifier) => {
    return await Payment.findOne({
      where: {
        [Op.or]: [
          { id: identifier },
          { provider_payment_id: identifier },
          { order_id: identifier },
        ],
      },
      include: [{ model: Order, as: 'order' }],
    });
  },

  /**
   * Process Stripe Webhook events
   * @param {Object} event - The event object from Stripe
   */
  handleWebhookEvent: async (event) => {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata?.order_id;
        if (!orderId) break;

        const order = await Order.findByPk(orderId);
        if (!order) break;

        let payment = await Payment.findOne({ where: { provider_payment_id: paymentIntent.id } });
        if (!payment) {
          payment = await Payment.create({
            order_id: orderId,
            user_id: order.user_id, // Resolve user_id from Order to satisfy NOT NULL constraint
            amount: (paymentIntent.amount || Math.round(order.total_amount * 100)) / 100,
            currency: (paymentIntent.currency || order.currency || 'USD').toUpperCase(),
            payment_method: 'credit_card',
            provider: 'stripe',
            provider_payment_id: paymentIntent.id,
            status: 'completed',
            gateway_response: paymentIntent,
          });
        } else {
          await payment.update({
            status: 'completed',
            gateway_response: paymentIntent,
          });
        }

        await order.update({
          status: 'paid',
          payment_status: 'paid',
        });

        await createNotification({
          userId: order.user_id,
          type: 'payment_status',
          title: 'Payment Succeeded',
          message: `Your payment of $${parseFloat(order.total_amount).toFixed(2)} for Order #${order.order_number} has been received.`,
          relatedId: order.id,
          relatedType: 'order',
          priority: 'high',
        });
        break;
      }

      case 'payment_intent.payment_failed':
      case 'payment_intent.payment_failure': {
        const failedIntent = event.data.object;
        const failedOrderId = failedIntent.metadata?.order_id;
        if (!failedOrderId) break;

        const order = await Order.findByPk(failedOrderId);
        if (!order) break;

        let payment = await Payment.findOne({ where: { provider_payment_id: failedIntent.id } });
        if (!payment) {
          await Payment.create({
            order_id: failedOrderId,
            user_id: order.user_id,
            amount: (failedIntent.amount || Math.round(order.total_amount * 100)) / 100,
            currency: (failedIntent.currency || order.currency || 'USD').toUpperCase(),
            payment_method: 'credit_card',
            provider: 'stripe',
            provider_payment_id: failedIntent.id,
            status: 'failed',
            gateway_response: failedIntent,
          });
        } else {
          await payment.update({
            status: 'failed',
            gateway_response: failedIntent,
          });
        }

        await order.update({
          status: 'failed',
          payment_status: 'failed',
        });

        await createNotification({
          userId: order.user_id,
          type: 'payment_status',
          title: 'Payment Failed',
          message: `Payment processing for Order #${order.order_number} was unsuccessful. Please check your card details and try again.`,
          relatedId: order.id,
          relatedType: 'order',
          priority: 'urgent',
        });
        break;
      }
    }
    return { received: true };
  },

  /**
   * Simulate a successful payment transaction for testing or multi-method processing
   * @param {string} orderId
   * @param {string} userId
   * @param {string} paymentMethod
   * @param {object} paymentDetails
   */
  simulatePaymentSuccess: async (orderId, userId, paymentMethod = 'credit_card', paymentDetails = {}) => {
    const order = await Order.findByPk(orderId);
    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    if (userId && order.user_id !== userId) {
      const error = new Error('Not authorized to access this order');
      error.statusCode = 403;
      throw error;
    }

    // Map payment method to valid ENUM
    const normalizedMethod = ['credit_card', 'paypal', 'bank_transfer', 'digital_wallet', 'cash_on_delivery'].includes(paymentMethod)
      ? paymentMethod
      : 'credit_card';

    const providerMap = {
      credit_card: 'stripe_mock',
      paypal: 'paypal_sandbox',
      bank_transfer: 'bank_wire',
      digital_wallet: 'lanka_qr_wallet',
      cash_on_delivery: 'promptx_cod',
    };

    const provider = providerMap[normalizedMethod] || 'mock_gateway';
    const mockPaymentId = `pi_${normalizedMethod}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payment = await Payment.create({
      order_id: order.id,
      user_id: order.user_id,
      amount: order.total_amount,
      currency: order.currency || 'USD',
      payment_method: normalizedMethod,
      provider,
      provider_payment_id: mockPaymentId,
      status: 'completed',
      gateway_response: { simulated: true, success: true, method: normalizedMethod, details: paymentDetails, timestamp: new Date() },
    });

    await order.update({
      status: 'paid',
      payment_status: 'paid',
    });

    const methodLabels = {
      credit_card: 'Credit / Debit Card',
      paypal: 'PayPal Express',
      bank_transfer: 'Bank Wire Transfer',
      digital_wallet: 'Digital Mobile Wallet / LankaQR',
      cash_on_delivery: 'Cash on Delivery (COD)',
    };

    // Notify user of successful payment
    await createNotification({
      userId: order.user_id,
      type: 'payment_status',
      title: 'Payment Successful!',
      message: `Your payment of $${parseFloat(order.total_amount).toFixed(2)} via ${methodLabels[normalizedMethod] || normalizedMethod} for Order #${order.order_number} has been confirmed.`,
      relatedId: order.id,
      relatedType: 'order',
      priority: 'high',
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.order_number,
      paymentId: payment.id,
      paymentMethod: normalizedMethod,
      provider,
      status: 'completed',
    };
  },
};

module.exports = paymentService;
