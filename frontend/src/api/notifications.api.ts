import axiosClient from './axiosClient';

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationRequest {
  userId: number;
  title: string;
  message: string;
  type: string;
  isRead?: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

class NotificationsApi {
  // Get all notifications (admin only)
  async getAllNotifications(): Promise<Notification[]> {
    const response = await axiosClient.get('/notifications/all');
    // Handle response wrapper from backend
    return response.data.data?.notifications ?? response.data.data ?? response.data;
  }

  // Get notifications for a specific user
  async getUserNotifications(userId: number): Promise<Notification[]> {
    const response = await axiosClient.get(`/notifications/${userId}`);
    // Handle response wrapper from backend
    return response.data.data?.notifications ?? response.data.data ?? response.data;
  }

  // Mark a specific notification as read
  async markAsRead(id: number): Promise<Notification> {
    const response = await axiosClient.post(`/notifications/${id}/read`);
    // Handle response wrapper from backend
    return response.data.data?.notification ?? response.data.data ?? response.data;
  }

  // Mark all notifications for the current user as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await axiosClient.post('/notifications/read-all');
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }

  // Create a new notification (admin only)
  async createNotification(data: CreateNotificationRequest): Promise<Notification> {
    const response = await axiosClient.post('/notifications', data);
    // Handle response wrapper from backend
    return response.data.data?.notification ?? response.data.data ?? response.data;
  }

  // Delete a specific notification
  async deleteNotification(id: number): Promise<void> {
    const response = await axiosClient.post(`/notifications/${id}/delete`);
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }

  // Get the count of unread notifications for a specific user
  async getUnreadCount(userId: number): Promise<UnreadCountResponse> {
    const response = await axiosClient.get(`/notifications/${userId}/unread-count`);
    // Handle response wrapper from backend
    return response.data.data?.unreadCount ? { count: response.data.data.unreadCount } : response.data.data ?? response.data;
  }

  // Get notifications for the current user
  async getMyNotifications(): Promise<Notification[]> {
    const response = await axiosClient.get('/notifications/user');
    // Handle response wrapper from backend
    return response.data.data?.notifications ?? response.data.data ?? response.data;
  }

  // Get a specific notification for the current user
  async getMyNotificationById(id: number): Promise<Notification> {
    const response = await axiosClient.get(`/notifications/user/${id}`);
    // Handle response wrapper from backend
    return response.data.data?.notification ?? response.data.data ?? response.data;
  }

  // Mark a specific notification as read for the current user
  async markMyNotificationAsRead(id: number): Promise<Notification> {
    const response = await axiosClient.post(`/notifications/user/${id}/read`);
    // Handle response wrapper from backend
    return response.data.data?.notification ?? response.data.data ?? response.data;
  }

  // Mark all notifications as read for the current user
  async markAllMyNotificationsAsRead(): Promise<{ message: string }> {
    const response = await axiosClient.post('/notifications/user/read-all');
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }

  // Delete a specific notification for the current user
  async deleteMyNotification(id: number): Promise<void> {
    const response = await axiosClient.post(`/notifications/user/${id}/delete`);
    // Handle response wrapper from backend
    return response.data.data ?? response.data;
  }

  // Send notification to a specific user (admin/controller only)
  async sendNotificationToUser(data: CreateNotificationRequest): Promise<Notification> {
    const response = await axiosClient.post('/notifications/send-to-user', data);
    // Handle response wrapper from backend
    return response.data.data?.notification ?? response.data.data ?? response.data;
  }
}

export default new NotificationsApi();