import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, Box, Tag, FileText, DollarSign, CheckCircle, AlertCircle
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import servicesApi from '../../../../api/services.api';

const EditService = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { theme } = useTheme();
  
  const [serviceData, setServiceData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchService();
  }, [id]);

  const fetchService = async () => {
    try {
      setLoading(true);
      const service = await servicesApi.getServiceById(id);
      
      // Convert snake_case fields to camelCase to match frontend expectations
      const convertedService = {
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        createdAt: service.created_at || service.createdAt,
        updatedAt: service.updated_at || service.updatedAt
      };
      
      setServiceData(convertedService);
      setFormData({
        name: convertedService.name || '',
        description: convertedService.description || '',
        category: convertedService.category || '',
        price: convertedService.price || ''
      });
      setError('');
    } catch (err) {
      console.error('Error fetching service:', err);
      // Log full error for debugging
      console.error('Full error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
      setError('Failed to load service details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Service name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Service description is required');
      return false;
    }
    
    if (!formData.category.trim()) {
      setError('Service category is required');
      return false;
    }
    
    if (formData.price && isNaN(parseFloat(formData.price))) {
      setError('Price must be a valid number');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setSaving(true);
      setError('');
      
      // Prepare data for API call
      const updateData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: formData.price ? parseFloat(formData.price) : undefined
      };
      
      await servicesApi.updateService(id, updateData);
      
      setSuccess(true);
      
      // Redirect to services list after a short delay
      setTimeout(() => {
        navigate('/admin/services');
      }, 1500);
    } catch (err) {
      console.error('Error updating service:', err);
      setError(err.response?.data?.message || 'Failed to update service. Please try again.');
    } finally {
      setSaving(false);
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
            Loading service details...
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
        <div className="flex items-center gap-4 mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate('/admin/services')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">Edit Service</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Update service details below
        </p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border backdrop-blur-sm ${theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-white/50 border-gray-200'
          }`}
      >
        {success ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Service Updated Successfully!</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              The service details have been updated successfully.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'
                }`}>
                <div className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Service ID */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Service ID
                </label>
                <div className={`block w-full px-3 py-3 rounded-xl border backdrop-blur-sm ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-gray-400'
                  : 'bg-gray-100/80 border-gray-300 text-gray-500'
                  }`}>
                  #{serviceData?.id}
                </div>
              </div>

              {/* Created At */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Created At
                </label>
                <div className={`block w-full px-3 py-3 rounded-xl border backdrop-blur-sm ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-gray-400'
                  : 'bg-gray-100/80 border-gray-300 text-gray-500'
                  }`}>
                  {serviceData?.createdAt ? new Date(serviceData.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Service Name */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Service Name *
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Box className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter service name"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <div className="relative">
                  <div className={`absolute top-3 left-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter service description"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Category *
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Tag className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter category"
                  />
                </div>
              </div>

              {/* Price */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price (USD)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter price (optional)"
                  />
                </div>
                <p className={`mt-1 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Leave blank if price varies or is negotiable
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/admin/services')}
                className={`px-6 py-3 rounded-xl font-medium transition-colors ${theme === 'dark'
                  ? 'bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white'
                  : 'bg-gray-200/50 hover:bg-gray-300/50 text-gray-700 hover:text-gray-900'
                  }`}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Service
                  </>
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default EditService;