import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, User, Mail, Phone, Shield, Calendar, CheckCircle, XCircle
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import usersApi from '../../../../api/users.api';

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const userData = await usersApi.getUserById(id);
      
      // Convert snake_case fields to camelCase to match frontend expectations
      const convertedUser = {
        id: userData.id,
        email: userData.email,
        role: userData.role,
        firstName: userData.first_name || userData.firstName,
        lastName: userData.last_name || userData.lastName,
        phone: userData.phone || userData.phone,
        isVerified: userData.is_verified !== undefined ? !!userData.is_verified : (userData.isVerified || false),
        createdAt: userData.created_at || userData.createdAt,
        updatedAt: userData.updated_at || userData.updatedAt
      };
      
      setUser(convertedUser);
      setError('');
    } catch (err) {
      console.error('Error fetching user:', err);
      // Log full error for debugging
      console.error('Full error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError('Failed to load user details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
      case 'controller':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'client':
        return { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' };
      default:
        return { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20' };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 mx-auto mb-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading user details...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-2 text-red-500">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/admin/users')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const roleColors = getRoleColor(user?.role);

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
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/admin/users')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">User Details</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Detailed information about the user
        </p>
      </motion.div>

      {/* User Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border backdrop-blur-sm ${theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-white/50 border-gray-200'
          }`}
      >
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          {/* Avatar */}
          <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center ${roleColors.bg} ${roleColors.border} border`}>
            {user?.role === 'admin' ? (
              <Shield className="w-12 h-12 text-red-500" />
            ) : (
              <User className="w-12 h-12" />
            )}
          </div>

          {/* User Details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                    {user?.role}
                  </span>
                  
                  {user?.isVerified ? (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                      Verified
                    </span>
                  ) : (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
                      <XCircle className="w-4 h-4 inline mr-1" />
                      Unverified
                    </span>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/users/${user?.id}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all self-start"
              >
                <Edit className="w-4 h-4" />
                Edit User
              </motion.button>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className="font-medium">{user?.email || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                      <p className="font-medium">{user?.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
                      <p className="font-medium">{formatDate(user?.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                      <p className="font-medium">{formatDate(user?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserDetails;