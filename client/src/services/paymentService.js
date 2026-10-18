import api from './api';

const paymentService = {
  /**
   * Fetch client-safe payment gateway configuration
   */
  getPaymentConfig: async () => {
    try {
      const response = await api.get('/payments/config');
      return response.data;
    } catch (err) {
      console.warn('Failed to fetch payment config, using defaults:', err.message);
      return { success: false, data: null };
    }
  },

  /**
   * Create a payment intent for an order
   * @param {string} orderId
   */
  createPaymentIntent: async (orderId) => {
    const response = await api.post('/payments/create', { orderId });
    return response.data;
  },

  /**
   * Process payment (Real Stripe/PayPal or sandbox fallback)
   * @param {string} orderId
   * @param {string} paymentMethod
   * @param {object} paymentDetails
   */
  processPayment: async (orderId, paymentMethod = 'credit_card', paymentDetails = {}) => {
    const response = await api.post('/payments/process', {
      orderId,
      paymentMethod,
      paymentDetails,
    });
    return response.data;
  },

  /**
   * Create PayPal Order via PayPal REST API
   * @param {string} orderId
   */
  createPayPalOrder: async (orderId) => {
    const response = await api.post('/payments/paypal/create-order', { orderId });
    return response.data;
  },

  /**
   * Capture PayPal Order via PayPal REST API
   * @param {string} orderId
   * @param {string} paypalOrderId
   */
  capturePayPalOrder: async (orderId, paypalOrderId) => {
    const response = await api.post('/payments/paypal/capture-order', { orderId, paypalOrderId });
    return response.data;
  },

  /**
   * Check payment status by orderId or paymentId
   * @param {string} identifier
   */
  getPaymentStatus: async (identifier) => {
    const response = await api.get(`/payments/status/${identifier}`);
    return response.data;
  },

  /**
   * Simulate payment success in sandbox/test mode (Backward-compatible)
   * @param {string} orderId
   * @param {string} paymentMethod
   * @param {object} paymentDetails
   */
  simulatePaymentSuccess: async (orderId, paymentMethod = 'credit_card', paymentDetails = {}) => {
    const response = await api.post('/payments/simulate-success', {
      orderId,
      paymentMethod,
      paymentDetails,
    });
    return response.data;
  },
};

export default paymentService;
