import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, Package, Tag, Calendar, DollarSign, Briefcase, TrendingUp, File,
  Upload, Download, Folder, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import servicesApi from '../../../../api/services.api';

const ControllerServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$ ${price.toLocaleString()}`;
  };

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        const serviceData = await servicesApi.getServiceById(id);
        
        // Convert snake_case fields to camelCase to match frontend expectations
        const convertedService = {
          ...serviceData,
          name: serviceData.name || serviceData.name,
          description: serviceData.description || serviceData.description,
          category: serviceData.category || serviceData.category,
          price: serviceData.price || serviceData.price,
          createdAt: serviceData.created_at || serviceData.createdAt,
          updatedAt: serviceData.updated_at || serviceData.updatedAt,
          id: serviceData.id || serviceData.id
        };
        
        setService(convertedService);
        setError('');
      } catch (err) {
        console.error('Error fetching service:', err);
        if (err.response?.status === 403 || err.response?.data?.message?.includes('permission')) {
          setError('You do not have permission to view this service');
        } else {
          setError('Failed to load service details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchService();
    }
  }, [id]);

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

  if (error && error.includes('permission')) {
    return (
      <div className={`p-6 rounded-2xl ${theme === 'dark' ? 'bg-red-900/20 border border-red-700/50' : 'bg-red-50 border border-red-200'}`}>
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate('/dashboard/controller/services')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Back to Services
          </button>
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
            onClick={() => navigate('/dashboard/controller/services')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">{service?.name}</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Detailed information about the service
        </p>
      </motion.div>

      {/* Service Info Card */}
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
          <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-blue-100 border border-blue-200'}`}>
            <Package className="w-12 h-12 text-blue-500" />
          </div>

          {/* Service Details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {service?.name}
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service?.category}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${theme === 'dark' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-purple-100 text-purple-800 border-purple-200'}`}>
                    {service?.category}
                  </span>
                  
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    {formatPrice(service?.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Service Name</p>
                      <p className="font-medium">{service?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Service ID</p>
                      <p className="font-medium">#{service?.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                      <p className="font-medium">{service?.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Price</p>
                      <p className="font-medium">{formatPrice(service?.price)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Service Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created</p>
                      <p className="font-medium">{formatDate(service?.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                      <p className="font-medium">{formatDate(service?.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                      <p className="font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Service Description */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {service?.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ControllerServiceDetails;