import api from './api';

const cartService = {
  /**
   * Fetch current user's cart from backend
   */
  getCart: async () => {
    const response = await api.get('/cart');
    return response.data;
  },

  /**
   * Add item to cart
   * @param {Object} itemData
   */
  addItem: async (itemData) => {
    const response = await api.post('/cart/items', itemData);
    return response.data;
  },

  /**
   * Update item quantity
   * @param {string} productId
   * @param {number} quantity
   */
  updateQuantity: async (productId, quantity) => {
    const response = await api.put(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  /**
   * Remove item from cart
   * @param {string} productId
   */
  removeItem: async (productId) => {
    const response = await api.delete(`/cart/items/${productId}`);
    return response.data;
  },

  /**
   * Clear entire cart
   */
  clearCart: async () => {
    const response = await api.delete('/cart');
    return response.data;
  },

  /**
   * Save item for later or move back to cart
   * @param {string} productId
   */
  toggleSaveForLater: async (productId) => {
    const response = await api.post(`/cart/save-for-later/${productId}`);
    return response.data;
  },

  /**
   * Validate coupon code against subtotal
   * @param {string} code
   * @param {number} subtotal
   */
  validateCoupon: async (code, subtotal) => {
    const response = await api.post('/coupons/validate', { code, subtotal });
    return response.data;
  },

  /**
   * Get available public coupons
   */
  getCoupons: async () => {
    const response = await api.get('/coupons');
    return response.data;
  },
};

export default cartService;
