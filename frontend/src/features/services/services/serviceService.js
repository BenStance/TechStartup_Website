import { servicesApi } from '../../../api';

// Service functions for service operations
export const serviceService = {
  // Get all services
  async getAllServices() {
    try {
      const response = await servicesApi.getAllServices();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch services');
    }
  },

  // Get service by ID
  async getServiceById(id) {
    try {
      const response = await servicesApi.getServiceById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch service');
    }
  },

  // Create a new service
  async createService(serviceData) {
    try {
      const response = await servicesApi.createService(serviceData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create service');
    }
  },

  // Update service details
  async updateService(id, serviceData) {
    try {
      const response = await servicesApi.updateService(id, serviceData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update service');
    }
  },

  // Delete service
  async deleteService(id) {
    try {
      await servicesApi.deleteService(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete service');
    }
  }
};