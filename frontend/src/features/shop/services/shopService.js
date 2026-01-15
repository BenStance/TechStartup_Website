import { shopApi } from '../../../api';

// Service functions for shop operations
export const shopService = {
  // Get all products
  async getAllProducts() {
    try {
      const response = await shopApi.getAllProducts();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch products');
    }
  },

  // Get product by ID
  async getProductById(id) {
    try {
      const response = await shopApi.getProductById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch product');
    }
  },

  // Create a new product
  async createProduct(productData) {
    try {
      const response = await shopApi.createProduct(productData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to create product');
    }
  },

  // Update product details
  async updateProduct(id, productData) {
    try {
      const response = await shopApi.updateProduct(id, productData);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product');
    }
  },

  // Delete product
  async deleteProduct(id) {
    try {
      await shopApi.deleteProduct(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete product');
    }
  },

  // Update product stock
  async updateProductStock(id, stock) {
    try {
      const response = await shopApi.updateProductStock(id, { stock });
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to update product stock');
    }
  }
};