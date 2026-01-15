import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, Eye, EyeOff, Trash2, Search, Filter, 
  ChevronRight, ChevronDown, Loader2, AlertCircle,
  CheckCircle, X, User, Calendar, MessageSquare,
  Check, Mail
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import notificationsApi from '../../../../api/notifications.api';
import usersApi from '../../../../api/users.api';

const ControllerNotifications = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotificationsAndUsers();
  }, [user]);

  const fetchNotificationsAndUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch users first to create a lookup map
      const usersData = await usersApi.getAllUsers();
      const usersMap = {};
      usersData.forEach(user => {
        usersMap[user.id] = {
          id: user.id,
          firstName: user.first_name || user.firstName,
          lastName: user.last_name || user.lastName,
          email: user.email,
          role: user.role
        };
      });
      setUsers(usersMap);
      
      // Fetch notifications for the current user
      // Use the new API method that gets notifications for the current authenticated user
      const userNotifications = await notificationsApi.getMyNotifications();
      
      console.log('User notifications:', userNotifications);
      
      // Convert to expected format if needed
      const convertedNotifications = userNotifications.map(notification => ({
        id: notification.id,
        userId: notification.user_id || notification.userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        isRead: notification.is_read !== undefined ? !!notification.is_read : (notification.isRead || false),
        createdAt: notification.created_at || notification.createdAt,
        updatedAt: notification.updated_at || notification.updatedAt
      }));
      
      console.log('Converted notifications:', convertedNotifications);
      setNotifications(convertedNotifications);
      
      // Calculate unread count
      const unread = convertedNotifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
      
      setError('');
    } catch (err) {
      setError('Failed to load notifications. Please try again.');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Mark notification as read using the new API method
      await notificationsApi.markMyNotificationAsRead(id);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === id 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => prev - 1);
    } catch (err) {
      setError('Failed to mark notification as read.');
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      // Mark all notifications for the current user as read using the new API method
      await notificationsApi.markAllMyNotificationsAsRead();
      
      setNotifications(prev => 
        prev.map(notification => 
          !notification.isRead 
            ? { ...notification, isRead: true } 
            : notification
        )
      );
      
      setUnreadCount(0);
    } catch (err) {
      setError('Failed to mark all notifications as read.');
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await notificationsApi.deleteMyNotification(id);
      setNotifications(prev => prev.filter(notification => notification.id !== id));
      
      // Update unread count if the deleted notification was unread
      const deletedNotification = notifications.find(n => n.id === id);
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount(prev => prev - 1);
      }
    } catch (err) {
      setError('Failed to delete notification.');
      console.error('Error deleting notification:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'alert':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      case 'info':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'warning':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      case 'success':
        return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserName = (userId) => {
    const user = users[userId];
    if (!user) return `User #${userId}`;
    
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.lastName) {
      return user.lastName;
    }
    
    return user.email || `User #${userId}`;
  };

  const filteredNotifications = notifications
    .filter(notification => {
      const title = String(notification.title ?? '').toLowerCase();
      const message = String(notification.message ?? '').toLowerCase();
      const userName = getUserName(notification.userId).toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase()) ||
                          message.includes(searchTerm.toLowerCase()) ||
                          userName.includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || notification.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'read' && notification.isRead) || 
                           (statusFilter === 'unread' && !notification.isRead);
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let result = 0;

      if (sortBy === 'userName') {
        const nameA = getUserName(a.userId);
        const nameB = getUserName(b.userId);
        result = nameA.localeCompare(nameB);
      } else if (sortBy === 'createdAt') {
        result =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
      } else {
        const aVal = String(a[sortBy] ?? '').toLowerCase();
        const bVal = String(b[sortBy] ?? '').toLowerCase();
        result = aVal.localeCompare(bVal);
      }

      return sortOrder === 'asc' ? result : -result;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${theme === 'dark'
          ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
          : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50'
          } backdrop-blur-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">My Notifications</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track your notifications
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{notifications.length} total notifications</span>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="text-sm">{unreadCount} unread</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all ${
                unreadCount === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
              }`}
            >
              <Check className="w-4 h-4" />
              Mark All as Read
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/controller/notifications/create')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Mail className="w-4 h-4" />
              Create Notification
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <div className={`p-6 rounded-2xl border backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
              <input
                type="search"
                placeholder="Search notifications or users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Types</option>
              <option value="alert">Alert</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Status</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="createdAt">Date Created</option>
              <option value="title">Title</option>
              <option value="userName">User Name</option>
              <option value="type">Type</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white hover:bg-gray-700/70'
                : 'bg-white/80 border-gray-300 text-gray-900 hover:bg-gray-100/80'
                }`}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>

        {/* Notification Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total', count: notifications.length, color: 'bg-purple-500' },
            { label: 'Unread', count: unreadCount, color: 'bg-amber-500' },
            { label: 'Alerts', count: notifications.filter(n => n.type === 'alert').length, color: 'bg-red-500' },
            { label: 'Info', count: notifications.filter(n => n.type === 'info').length, color: 'bg-blue-500' },
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">{stat.label}</span>
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
              </div>
              <div className="text-2xl font-bold mt-2">{stat.count}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        {error && (
          <div className={`p-4 m-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'
            } border`}>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Bell className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No notifications found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm || typeFilter !== 'all' || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'No notifications have been created yet'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/controller/notifications/create')}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Mail className="w-4 h-4" />
              Create Your First Notification
            </motion.button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className="text-left p-6 font-medium">Notification</th>
                  <th className="text-left p-6 font-medium">Type</th>
                  <th className="text-left p-6 font-medium">Status</th>
                  <th className="text-left p-6 font-medium">Created</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredNotifications.map((notification) => {
                  const typeColors = getTypeColor(notification.type);
                  const userName = getUserName(notification.userId);
                  
                  return (
                    <motion.tr
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'
                        } transition-colors`}
                    >
                      <td className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-xl ${typeColors.bg} ${typeColors.border} border`}>
                            <MessageSquare className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{notification.title}</div>
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              {notification.message}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${typeColors.bg} ${typeColors.text} ${typeColors.border}`}>
                          {notification.type}
                        </span>
                      </td>
                      <td className="p-6">
                        {notification.isRead ? (
                          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <Check className="w-4 h-4 inline mr-1" />
                            Read
                          </span>
                        ) : (
                          <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            <Bell className="w-4 h-4 inline mr-1" />
                            Unread
                          </span>
                        )}
                      </td>
                      
                      <td className="p-6">
                        <div className="font-medium">{formatDate(notification.createdAt)}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                                ? 'hover:bg-green-500/20 text-green-400 hover:text-green-300'
                                : 'bg-gray-100/50 hover:bg-green-100/80 text-green-600 hover:text-green-800'
                                }`}
                              title="Mark as Read"
                            >
                              <Check className="w-4 h-4" />
                            </motion.button>
                          )}
                          {/* <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleDeleteNotification(notification.id)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                              : 'bg-gray-100/50 hover:bg-red-100/80 text-red-600 hover:text-red-800'
                              }`}
                            title="Delete Notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button> */}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredNotifications.length > 0 && (
          <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </div>
              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                    : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                    }`}
                  disabled
                >
                  ← Previous
                </button>
                <span className="px-3 py-2">1</span>
                <button
                  className={`px-3 py-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                    : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                    }`}
                  disabled
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ControllerNotifications;