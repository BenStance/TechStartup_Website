import React, { useState, useEffect } from 'react';
import { notificationsApi } from '../../../api';
import { formatTimeAgo } from '../../../utils/dateUtils';

const NotificationsList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationsData = await notificationsApi.getAllNotifications();
        setNotifications(notificationsData);
      } catch (err) {
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true } 
          : notification
      ));
    } catch (err) {
      alert('Failed to mark notification as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
    } catch (err) {
      alert('Failed to mark all notifications as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <button 
            onClick={markAllAsRead}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition duration-300"
          >
            Mark All as Read
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No notifications found</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <li 
                  key={notification.id} 
                  className={`p-4 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-1">
                      <div className={`h-3 w-3 rounded-full ${notification.isRead ? 'bg-gray-300' : 'bg-blue-500'}`}></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-sm font-medium ${notification.isRead ? 'text-gray-900' : 'text-blue-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {formatTimeAgo(notification.createdAt)}
                        </p>
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        <p>{notification.message}</p>
                      </div>
                      <div className="mt-2 flex space-x-4">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-500"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsList;