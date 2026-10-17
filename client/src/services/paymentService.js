import api from './api';

const paymentService = {
  /**
   * Create a payment intent for an order
   * @param {string} orderId
   */
  createPaymentIntent: async (orderId) => {
    const response = await api.post('/payments/create', { orderId });
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
   * Simulate payment success in sandbox/test mode
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
