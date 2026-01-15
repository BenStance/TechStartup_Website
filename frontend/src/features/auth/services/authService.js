import { authApi } from '../../../api';

// Service functions for authentication operations
export const authService = {
  // Login user
  async login(email, password) {
    try {
      const response = await authApi.login({ email, password });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  },

  // Register user
  async register(userData) {
    try {
      const response = await authApi.register(userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  },

  // Verify OTP
  async verifyOtp(email, otp) {
    try {
      const response = await authApi.verifyOtp({ email, otp });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'OTP verification failed');
    }
  },

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await authApi.forgotPassword({ email });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to send reset link');
    }
  },

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await authApi.resetPassword(resetData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  },

  // Logout user
  async logout() {
    try {
      await authApi.logout();
      return { success: true };
    } catch (error) {
      throw new Error('Logout failed');
    }
  }
};