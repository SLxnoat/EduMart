import api from './api';

const adminService = {
  /**
   * Get system KPI metrics
   */
  getMetrics: async () => {
    const response = await api.get('/admin/metrics');
    return response.data;
  },

  /**
   * Get paginated users with optional search/filter
   */
  getUsers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/users${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Toggle user active/suspended status
   */
  updateUserStatus: async (userId, statusData) => {
    const response = await api.put(`/admin/users/${userId}/status`, statusData);
    return response.data;
  },

  /**
   * Change user role
   */
  updateUserRole: async (userId, roleData) => {
    const response = await api.put(`/admin/users/${userId}/role`, roleData);
    return response.data;
  },

  /**
   * Get products requiring moderation
   */
  getModerationProducts: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/products${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Approve or reject a product listing
   */
  moderateProduct: async (productId, moderationData) => {
    const response = await api.put(`/admin/products/${productId}/moderate`, moderationData);
    return response.data;
  },

  /**
   * Get audit log history
   */
  getAdminLogs: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/admin/logs${query ? `?${query}` : ''}`);
    return response.data;
  }
};

export default adminService;
