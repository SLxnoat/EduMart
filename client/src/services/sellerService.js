import api from './api';

const sellerService = {
  /**
   * Get seller dashboard metrics and recent sales
   */
  getDashboard: async () => {
    const response = await api.get('/seller/dashboard');
    return response.data;
  },

  /**
   * Get inventory of products authored by seller
   */
  getInventory: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/seller/inventory${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Update stock quantity of a physical material
   */
  updateStock: async (productId, stockQuantity) => {
    const response = await api.put(`/seller/inventory/${productId}/stock`, {
      stock_quantity: stockQuantity
    });
    return response.data;
  }
};

export default sellerService;
