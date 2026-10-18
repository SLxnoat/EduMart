import api from './api';

const reviewService = {
  /**
   * Get reviews and rating summary for a product
   */
  getProductReviews: async (productId, page = 1, limit = 10) => {
    const response = await api.get(`/reviews/product/${productId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  /**
   * Submit or update a product review
   */
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/product/${productId}`, reviewData);
    return response.data;
  },

  /**
   * Upvote a review as helpful
   */
  voteReview: async (reviewId) => {
    const response = await api.post(`/reviews/${reviewId}/vote`);
    return response.data;
  },

  /**
   * Get reviews for admin moderation
   */
  getModerationReviews: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/reviews/moderation${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Moderate (approve or hide) a review
   */
  moderateReview: async (reviewId, moderationData) => {
    const response = await api.put(`/reviews/${reviewId}/moderate`, moderationData);
    return response.data;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  }
};

export default reviewService;
