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

  /**
   * Download digital study material e-good securely
   * @param {string} orderId
   * @param {string} itemId
   * @param {string} fallbackTitle
   */
  downloadDigitalItem: async (orderId, itemId, fallbackTitle = 'study-pack') => {
    const response = await api.get(`/orders/${orderId}/download/${itemId}`, {
      responseType: 'blob',
    });
    let filename = `${fallbackTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    const disposition = response.headers && (response.headers['content-disposition'] || response.headers['Content-Disposition']);
    if (disposition && disposition.indexOf('filename=') !== -1) {
      const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].trim();
      }
    }
    const contentType = response.headers?.['content-type'] || 'application/octet-stream';
    const blob = new Blob([response.data], { type: contentType });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  },

  /**
   * Get tax invoice / payment receipt details
   * @param {string} orderId
   */
  getOrderInvoice: async (orderId) => {
    const response = await api.get(`/orders/${orderId}/invoice`);
    return response.data;
  },

  /**
   * Update shipment tracking info (Admin / Seller)
   * @param {string} orderId
   * @param {Object} trackingData
   */
  updateOrderTracking: async (orderId, trackingData) => {
    const response = await api.put(`/orders/${orderId}/tracking`, trackingData);
    return response.data;
  },

  /**
   * Process refund with audit trail (Admin / Authorized Seller)
   * @param {string} orderId
   * @param {Object} refundData
   */
  refundOrder: async (orderId, refundData) => {
    const response = await api.post(`/orders/${orderId}/refund`, refundData);
    return response.data;
  },

  /**
   * Fetch tutor / seller orders for their materials
   * @param {number} page
   * @param {number} limit
   */
  getSellerOrders: async (page = 1, limit = 10) => {
    const response = await api.get(`/orders/seller?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export default orderService;
