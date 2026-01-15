import { notificationsApi } from '../../../api';

// Service functions for notification operations
export const notificationService = {
  // Get all notifications
  async getAllNotifications() {
    try {
      const response = await notificationsApi.getAllNotifications();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notifications');
    }
  },

  // Get notification by ID
  async getNotificationById(id) {
    try {
      const response = await notificationsApi.getNotificationById(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch notification');
    }
  },

  // Mark notification as read
  async markAsRead(id) {
    try {
      const response = await notificationsApi.markAsRead(id);
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark notification as read');
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      const response = await notificationsApi.markAllAsRead();
      return response;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to mark all notifications as read');
    }
  },

  // Delete notification
  async deleteNotification(id) {
    try {
      await notificationsApi.deleteNotification(id);
      return { success: true };
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to delete notification');
    }
  }
};