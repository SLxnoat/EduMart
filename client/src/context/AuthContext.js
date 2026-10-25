import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Helper to persist user in active storage
  const persistUserStorage = (userObj, token, rememberMe = true) => {
    const storage = rememberMe === false ? sessionStorage : localStorage;
    const otherStorage = rememberMe === false ? localStorage : sessionStorage;
    otherStorage.removeItem('token');
    otherStorage.removeItem('user');
    if (token) {
      storage.setItem('token', token);
    }
    storage.setItem('user', JSON.stringify(userObj));
  };

  const updateStoredUser = (userObj) => {
    if (sessionStorage.getItem('user') && !localStorage.getItem('user')) {
      sessionStorage.setItem('user', JSON.stringify(userObj));
    } else {
      localStorage.setItem('user', JSON.stringify(userObj));
    }
  };

  // Load user from localStorage or sessionStorage on init and sync fresh profile
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
      }
    }
    if (storedToken) {
      authService.getProfile()
        .then((fresh) => {
          if (fresh) {
            setUser(fresh);
            updateStoredUser(fresh);
          }
        })
        .catch(() => {});
    }
    setLoading(false);
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      const { rememberMe = true, ...apiCredentials } = credentials || {};
      const data = await authService.login({ ...apiCredentials, rememberMe });
      const { token, ...userInfo } = data;
      persistUserStorage(userInfo, token, rememberMe);
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      throw error;
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      const { token, ...userInfo } = data;
      persistUserStorage(userInfo, token, true);
      setUser(userInfo);
      return userInfo;
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setUser(null);
      navigate('/login');
    }
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      updateStoredUser(updatedUser);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  };

  // Verify email
  const verifyEmail = async (token) => {
    const res = await authService.verifyEmail(token);
    if (user) {
      const updated = { ...user, isVerified: true };
      setUser(updated);
      updateStoredUser(updated);
    }
    return res;
  };

  // Resend verification email
  const resendVerification = async (email) => {
    const res = await authService.resendVerification(email);
    if (res?.alreadyVerified) {
      const updated = { ...(user || {}), isVerified: true, is_verified: true };
      setUser(updated);
      updateStoredUser(updated);
    }
    return res;
  };

  // Forgot password
  const forgotPassword = async (email) => {
    return await authService.forgotPassword(email);
  };

  // Reset password
  const resetPassword = async (token, newPassword) => {
    return await authService.resetPassword(token, newPassword);
  };

  // Change password
  const changePassword = async (passwords) => {
    return await authService.changePassword(passwords);
  };

  // Refresh profile data from backend
  const refreshProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      updateStoredUser(profile);
      return profile;
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
  };

  // Active session management
  const getUserSessions = async () => {
    return await authService.getUserSessions();
  };

  const revokeOtherSessions = async () => {
    return await authService.revokeOtherSessions();
  };

  // GDPR data export
  const exportUserData = async () => {
    return await authService.exportUserData();
  };

  // Self-service account deactivation
  const deleteAccount = async (password) => {
    const res = await authService.deleteAccount(password);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    return res;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    changePassword,
    refreshProfile,
    getUserSessions,
    revokeOtherSessions,
    exportUserData,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};