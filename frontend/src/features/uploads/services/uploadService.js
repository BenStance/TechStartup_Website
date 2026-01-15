import { uploadsApi } from '../../../api';

// Service functions for upload operations
export const uploadService = {
  // Upload a file
  async uploadFile(fileData) {
    try {
      const response = await uploadsApi.uploadFile(fileData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to upload file');
    }
  },

  // Get uploaded file by ID
  async getFileById(id) {
    try {
      const response = await uploadsApi.getFileById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch file');
    }
  },

  // Delete uploaded file
  async deleteFile(id) {
    try {
      await uploadsApi.deleteFile(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete file');
    }
  }
};