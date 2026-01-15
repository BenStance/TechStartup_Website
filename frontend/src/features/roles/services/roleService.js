import { rolesApi } from '../../../api';

// Service functions for role operations
export const roleService = {
  // Get all roles
  async getAllRoles() {
    try {
      const response = await rolesApi.getAllRoles();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch roles');
    }
  },

  // Get role by ID
  async getRoleById(id) {
    try {
      const response = await rolesApi.getRoleById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch role');
    }
  },

  // Create a new role
  async createRole(roleData) {
    try {
      const response = await rolesApi.createRole(roleData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create role');
    }
  },

  // Update role details
  async updateRole(id, roleData) {
    try {
      const response = await rolesApi.updateRole(id, roleData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update role');
    }
  },

  // Delete role
  async deleteRole(id) {
    try {
      await rolesApi.deleteRole(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete role');
    }
  }
};