import { create } from 'zustand';

const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  
  // Add a notification
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications]
  })),
  
  // Mark a notification as read
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    )
  })),
  
  // Mark all notifications as read
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(notification => ({ ...notification, isRead: true }))
  })),
  
  // Remove a notification
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(notification => notification.id !== id)
  })),
  
  // Set notifications
  setNotifications: (notifications) => set({ notifications }),
  
  // Set unread count
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  // Get unread count
  getUnreadCount: () => {
    const { notifications } = get();
    return notifications.filter(notification => !notification.isRead).length;
  }
}));

export default useNotificationStore;