import api from './api';

const notificationService = {
  /**
   * Fetch current user's notifications
   */
  getNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/notifications${query ? `?${query}` : ''}`);
    return response.data;
  },

  /**
   * Mark a single notification as read
   */
  markRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read
   */
  markAllRead: async () => {
    const response = await api.put('/notifications/read-all');
    return response.data;
  },

  /**
   * Broadcast announcement (Admin only)
   */
  broadcast: async (broadcastData) => {
    const response = await api.post('/notifications/broadcast', broadcastData);
    return response.data;
  },

  /**
   * Delete a notification
   */
  deleteNotification: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};

export default notificationService;
