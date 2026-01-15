import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, User, AlertCircle, Info, CheckCircle, 
  AlertTriangle, X, Loader2, ArrowLeft, Send
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import notificationsApi from '../../../../api/notifications.api';
import usersApi from '../../../../api/users.api';

const CreateNotificationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    userId: '',
    title: '',
    message: '',
    type: 'info'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const usersData = await usersApi.getAllUsers();
      
      // Convert to expected format if needed
      const convertedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName
      }));
      
      setUsers(convertedUsers);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Error fetching users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const getUserName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    if (user.firstName) {
      return user.firstName;
    }
    
    if (user.lastName) {
      return user.lastName;
    }
    
    return user.email;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.userId || !formData.title || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Create notification for each selected user
      if (formData.userId === 'all') {
        // Broadcast to all users
        for (const user of users) {
          await notificationsApi.createNotification({
            userId: user.id,
            title: formData.title,
            message: formData.message,
            type: formData.type
          });
        }
        setSuccess(`Notification broadcast to all ${users.length} users successfully!`);
      } else {
        // Send to specific user
        await notificationsApi.createNotification({
          userId: parseInt(formData.userId),
          title: formData.title,
          message: formData.message,
          type: formData.type
        });
        setSuccess('Notification created successfully!');
      }
      
      // Reset form
      setFormData({
        userId: '',
        title: '',
        message: '',
        type: 'info'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/admin/notifications');
      }, 2000);
    } catch (err) {
      setError('Failed to create notification. Please try again.');
      console.error('Error creating notification:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'alert': return <AlertCircle className="w-5 h-5" />;
      case 'warning': return <AlertTriangle className="w-5 h-5" />;
      case 'success': return <CheckCircle className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'warning': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'success': return 'bg-green-500/10 text-green-500 border-green-500/20';
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Create Notification</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Send a new notification to users
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/admin/notifications')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              theme === 'dark'
                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Notifications
          </motion.button>
        </div>
      </motion.div>

      {/* Create Notification Form */}
      <div className={`rounded-2xl p-6 border backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        {error && (
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'
            } border`}>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <button 
                onClick={() => setError('')}
                className="ml-auto"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {success && (
          <div className={`p-4 rounded-lg mb-6 ${theme === 'dark' ? 'bg-green-900/20 border-green-700/50' : 'bg-green-50 border-green-200'
            } border`}>
            <div className="flex items-center gap-2 text-green-500">
              <CheckCircle className="w-5 h-5" />
              <span>{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recipient */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Recipient *
              </label>
              {usersLoading ? (
                <div className="flex items-center gap-2 p-3 rounded-xl border">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading users...</span>
                </div>
              ) : (
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white'
                      : 'bg-white/80 border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Select a recipient</option>
                  <option value="all">Broadcast to All Users ({users.length})</option>
                  <optgroup label="Individual Users">
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {getUserName(user)} ({user.email})
                      </option>
                    ))}
                  </optgroup>
                </select>
              )}
            </div>

            {/* Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Notification Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {['info', 'success', 'warning', 'alert'].map(type => (
                  <label 
                    key={type}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                      formData.type === type
                        ? getTypeColor(type) + ' border-current'
                        : theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-700/70'
                          : 'bg-white/80 border-gray-300 hover:bg-gray-100/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={type}
                      checked={formData.type === type}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {getTypeIcon(type)}
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter notification title"
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          {/* Message */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Message *
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Enter notification message"
              rows={5}
              className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
              }`}
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="button"
              onClick={() => navigate('/admin/notifications')}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-700/70 hover:bg-gray-600/70 text-gray-300 hover:text-white'
                  : 'bg-gray-200/80 hover:bg-gray-300/80 text-gray-700 hover:text-gray-900'
              }`}
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Notification
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNotificationPage;