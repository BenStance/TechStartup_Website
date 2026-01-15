import { dashboardApi } from '../../../api';

// Service functions for dashboard operations
export const dashboardService = {
  // Get dashboard statistics
  async getStats() {
    try {
      const response = await dashboardApi.getStats();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  },

  // Get recent activity
  async getRecentActivity() {
    try {
      const response = await dashboardApi.getRecentActivity();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent activity');
    }
  },

  // Get chart data
  async getChartData() {
    try {
      const response = await dashboardApi.getChartData();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chart data');
    }
  }
};