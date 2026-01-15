import { usersApi } from '../../../api';

// Service functions for user operations
export const userService = {
  // Get all users (admin only)
  async getAllUsers() {
    try {
      const response = await usersApi.getAllUsers();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch users');
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const response = await usersApi.getUserById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user');
    }
  },

  // Create a new user
  async createUser(userData) {
    try {
      const response = await usersApi.createUser(userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create user');
    }
  },

  // Update user details
  async updateUser(id, userData) {
    try {
      const response = await usersApi.updateUser(id, userData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update user');
    }
  },

  // Delete user (admin only)
  async deleteUser(id) {
    try {
      await usersApi.deleteUser(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete user');
    }
  }
};