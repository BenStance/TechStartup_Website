import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, User, AlertCircle, Info, CheckCircle, 
  AlertTriangle, X, Loader2, ArrowLeft, Send
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import notificationsApi from '../../../../api/notifications.api';
import usersApi from '../../../../api/users.api';
import projectsApi from '../../../../api/projects.api';

const CreateControllerNotificationPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    userId: '',
    projectId: '',
    title: '',
    message: '',
    type: 'message', // Changed to use backend enum value
    sendTo: 'specific' // 'specific', 'clients', 'project'
  });

  useEffect(() => {
    fetchUsersAndProjects();
  }, [user]);

  const fetchUsersAndProjects = async () => {
    try {
      setUsersLoading(true);
      setProjectsLoading(true);
      
      // Fetch all users
      const usersData = await usersApi.getAllUsers();
      // Convert to expected format if needed
      const convertedUsers = usersData.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.first_name || user.firstName,
        lastName: user.last_name || user.lastName,
        role: user.role
      }));
      setUsers(convertedUsers);
      
      // Fetch projects assigned to this controller
      const allProjects = await projectsApi.getAllProjects();
      const controllerProjects = allProjects.filter(project => 
        project.controllerId === user?.id
      );
      setProjects(controllerProjects);
    } catch (err) {
      setError('Failed to load users or projects. Please try again.');
      console.error('Error fetching users or projects:', err);
    } finally {
      setUsersLoading(false);
      setProjectsLoading(false);
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
    if (!formData.title || !formData.message) {
      setError('Please fill in all required fields.');
      return;
    }

    // Validate based on sendTo option
    if (formData.sendTo === 'specific' && !formData.userId) {
      setError('Please select a recipient.');
      return;
    }

    if (formData.sendTo === 'clients' && !formData.projectId) {
      setError('Please select a project to send notifications to its clients.');
      return;
    }

    if (formData.sendTo === 'project' && !formData.projectId) {
      setError('Please select a project for project-related notifications.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      let recipients = [];
      
      if (formData.sendTo === 'specific') {
        // Send to specific user
        recipients = [parseInt(formData.userId)];
      } else if (formData.sendTo === 'clients') {
        // Send to clients of a specific project
        const project = projects.find(p => p.id === parseInt(formData.projectId));
        if (project) {
          const client = users.find(u => u.id === project.clientId);
          if (client) {
            recipients = [client.id];
          }
        }
      } else if (formData.sendTo === 'project') {
        // Send to users related to a specific project
        const project = projects.find(p => p.id === parseInt(formData.projectId));
        if (project) {
          // For controllers, this could mean sending to the client and any related users
          const client = users.find(u => u.id === project.clientId);
          if (client) {
            recipients = [client.id];
          }
        }
      }

      // Send notification to each recipient using the send-to-user endpoint
      // Note: Only users with appropriate permissions can create notifications to other users
      for (const recipientId of recipients) {
        await notificationsApi.sendNotificationToUser({
          userId: recipientId,
          title: formData.title,
          message: formData.message,
          type: formData.type
        });
      }
      
      if (recipients.length > 0) {
        setSuccess(`Notification sent successfully to ${recipients.length} recipient(s)!`);
      } else {
        setError('No recipients found for the selected option.');
        return;
      }
      
      // Reset form
      setFormData({
        userId: '',
        projectId: '',
        title: '',
        message: '',
        type: 'info',
        sendTo: 'specific'
      });
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/dashboard/controller/notifications');
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
      case 'reminder': return <AlertTriangle className="w-5 h-5" />;
      case 'message': return <Mail className="w-5 h-5" />;
      case 'project_update': return <Info className="w-5 h-5" />;
      case 'service_update': return <Info className="w-5 h-5" />;
      case 'shop_update': return <Info className="w-5 h-5" />;
      case 'profile_update': return <Info className="w-5 h-5" />;
      case 'user_update': return <Info className="w-5 h-5" />;
      default: return <Info className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'alert': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'reminder': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'message': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'project_update': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'service_update': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'shop_update': return 'bg-pink-500/10 text-pink-500 border-pink-500/20';
      case 'profile_update': return 'bg-teal-500/10 text-teal-500 border-teal-500/20';
      case 'user_update': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
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
            onClick={() => navigate('/dashboard/controller/notifications')}
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
            {/* Send To Option */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Send To *
              </label>
              <div className="grid grid-cols-1 gap-3">
                {[
                  { value: 'specific', label: 'Specific User', desc: 'Send to a particular user' },
                  { value: 'clients', label: 'Project Clients', desc: 'Send to clients of a specific project' },
                  { value: 'project', label: 'Project Related', desc: 'Send to users related to a project' }
                ].map(option => (
                  <label 
                    key={option.value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      formData.sendTo === option.value
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 border-2'
                        : theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-700/70'
                          : 'bg-white/80 border-gray-300 hover:bg-gray-100/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sendTo"
                      value={option.value}
                      checked={formData.sendTo === option.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="font-medium">{option.label}</div>
                      <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipient Selection */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                {formData.sendTo === 'specific' ? 'Recipient *' :
                 formData.sendTo === 'clients' ? 'Project *' : 'Project *'}
              </label>
              
              {usersLoading || projectsLoading ? (
                <div className="flex items-center gap-2 p-3 rounded-xl border">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading {formData.sendTo === 'clients' ? 'projects...' : 'users...'}</span>
                </div>
              ) : (
                <>
                  {formData.sendTo === 'specific' && (
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 text-white'
                          : 'bg-white/80 border-gray-300 text-gray-900'
                      }`}
                      required={formData.sendTo === 'specific'}
                    >
                      <option value="">Select a recipient</option>
                      <optgroup label="Users">
                        {users.map(user => (
                          <option key={user.id} value={user.id}>
                            {getUserName(user)} ({user.role})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  )}
                  
                  {formData.sendTo === 'clients' && (
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 text-white'
                          : 'bg-white/80 border-gray-300 text-gray-900'
                      }`}
                      required={formData.sendTo === 'clients'}
                    >
                      <option value="">Select a project</option>
                      <optgroup label="Your Projects">
                        {projects.map(project => {
                          const client = users.find(u => u.id === project.clientId);
                          return (
                            <option key={project.id} value={project.id}>
                              {project.title} - {client ? getUserName(client) : 'Unknown Client'}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  )}
                  
                  {formData.sendTo === 'project' && (
                    <select
                      name="projectId"
                      value={formData.projectId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 text-white'
                          : 'bg-white/80 border-gray-300 text-gray-900'
                      }`}
                      required={formData.sendTo === 'project'}
                    >
                      <option value="">Select a project</option>
                      <optgroup label="Your Projects">
                        {projects.map(project => {
                          const client = users.find(u => u.id === project.clientId);
                          return (
                            <option key={project.id} value={project.id}>
                              {project.title} - {client ? getUserName(client) : 'Unknown Client'}
                            </option>
                          );
                        })}
                      </optgroup>
                    </select>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Notification Type *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { value: 'alert', display: 'Alert', icon: <AlertCircle className="w-4 h-4" /> },
                  { value: 'reminder', display: 'Reminder', icon: <AlertTriangle className="w-4 h-4" /> },
                  { value: 'message', display: 'Message', icon: <Mail className="w-4 h-4" /> },
                  { value: 'project_update', display: 'Project Update', icon: <Info className="w-4 h-4" /> },
                  { value: 'service_update', display: 'Service Update', icon: <Info className="w-4 h-4" /> },
                  { value: 'shop_update', display: 'Shop Update', icon: <Info className="w-4 h-4" /> },
                  { value: 'profile_update', display: 'Profile Update', icon: <Info className="w-4 h-4" /> },
                  { value: 'user_update', display: 'User Update', icon: <Info className="w-4 h-4" /> }
                ].map(({ value, display, icon }) => (
                  <label 
                    key={value}
                    className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                      formData.type === value
                        ? getTypeColor(value) + ' border-current'
                        : theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 hover:bg-gray-700/70'
                          : 'bg-white/80 border-gray-300 hover:bg-gray-100/80'
                    }`}
                  >
                    <input
                      type="radio"
                      name="type"
                      value={value}
                      checked={formData.type === value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    {icon}
                    <span>{display}</span>
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
              onClick={() => navigate('/dashboard/controller/notifications')}
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

export default CreateControllerNotificationPage;