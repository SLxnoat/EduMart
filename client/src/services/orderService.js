import api from './api';

const orderService = {
  /**
   * Create a new order with items and delivery address
   * @param {Object} orderData
   */
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  /**
   * Fetch current user's orders with pagination
   * @param {number} page
   * @param {number} limit
   */
  getMyOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Get order details by ID or order_number
   * @param {string} orderId
   */
  getOrderById: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  /**
   * Cancel an order
   * @param {string} orderId
   * @param {string} reason
   */
  cancelOrder: async (orderId, reason = '') => {
    const response = await api.post(`/orders/${orderId}/cancel`, { reason });
    return response.data;
  },

  /**
   * Update order status (Admin / Seller)
   * @param {string} orderId
   * @param {string} status
   * @param {string} notes
   */
  updateOrderStatus: async (orderId, status, notes = '') => {
    const response = await api.put(`/orders/${orderId}/status`, { status, notes });
    return response.data;
  },
};

export default orderService;
