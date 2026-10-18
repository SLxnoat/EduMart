import api from './api';

const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  logout: async () => {
    try {
      const response = await api.post('/auth/logout');
      return response.data;
    } catch (err) {
      // Return gracefully even if token was already cleared
      return { message: 'Logged out' };
    }
  },
  verifyEmail: async (token) => {
    const response = await api.post('/auth/verify-email', { token });
    return response.data;
  },
  resendVerification: async (email) => {
    const response = await api.post('/auth/resend-verification', email ? { email } : {});
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  },
  changePassword: async (passwords) => {
    const response = await api.put('/users/change-password', passwords);
    return response.data;
  },
  getUserSessions: async () => {
    const response = await api.get('/users/sessions');
    return response.data;
  },
  revokeOtherSessions: async () => {
    const response = await api.delete('/users/sessions');
    return response.data;
  },
  exportUserData: async () => {
    const response = await api.get('/users/export-data');
    return response.data;
  },
  deleteAccount: async (password) => {
    const response = await api.delete('/users/profile', { data: { password } });
    return response.data;
  }
};

export default authService;
