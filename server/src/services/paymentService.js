const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Payment, Order } = require('../models');

const paymentService = {
  /**
   * Create a Stripe PaymentIntent
   * @param {string} orderId - ID of the order being paid
   * @param {number} amount - Total amount to charge
   * @param {string} currency - Currency code (e.g., 'USD')
   */
  createPaymentIntent: async (orderId, amount, currency = 'USD') => {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      metadata: { order_id: orderId },
      automatic_payment_methods: { enabled: true },
    });

    return {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  },

  /**
   * Process Stripe Webhook events
   * @param {Object} event - The event object from Stripe
   */
  handleWebhookEvent: async (event) => {
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.order_id;

        // 1. Update Payment Record
        await Payment.create({
          order_id: orderId,
          user_id: null, // Will be resolved via Order relationship
          amount: paymentIntent.amount / 100,
          currency: paymentIntent.currency.toUpperCase(),
          payment_method: 'credit_card', // Simplified for now
          provider: 'stripe',
          provider_payment_id: paymentIntent.id,
          status: 'completed',
          gateway_response: event.data.object,
        });

        // 2. Update Order Status
        await Order.update(
          { status: 'paid', payment_status: 'paid' },
          { where: { id: orderId } }
        );
        break;

      case 'payment_intent.payment_failure':
        const failedIntent = event.data.object;
        const failedOrderId = failedIntent.metadata.order_id;

        await Order.update(
          { status: 'failed', payment_status: 'failed' },
          { where: { id: failedOrderId } }
        );
        break;
    }
    return { received: true };
  },
};

module.exports = paymentService;
