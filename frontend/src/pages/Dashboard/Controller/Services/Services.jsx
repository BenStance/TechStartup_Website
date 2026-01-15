import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, Tag, Calendar, DollarSign, 
  Eye, Edit, MessageSquare, Briefcase, Users, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowRight, X, Loader2
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import servicesApi from '../../../../api/services.api';

const ControllerServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const allServices = await servicesApi.getAllServices();
        
        // Convert snake_case fields to camelCase to match frontend expectations
        const convertedServices = allServices.map(service => ({
          ...service,
          name: service.name || service.name,
          description: service.description || service.description,
          category: service.category || service.category,
          price: service.price || service.price,
          createdAt: service.created_at || service.createdAt,
          updatedAt: service.updated_at || service.updatedAt,
          id: service.id || service.id
        }));
        
        setServices(convertedServices);
        setError('');
      } catch (err) {
        setError('Failed to load services. Please try again.');
        console.error('Error fetching services:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `$ ${price.toLocaleString()}`;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.price?.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  const sortedServices = [...filteredServices].sort((a, b) => {
    let aValue = a[sortBy] || a[sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()];
    let bValue = b[sortBy] || b[sortBy.replace(/([A-Z])/g, '_$1').toLowerCase()];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading services...
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
            <h1 className="text-3xl font-bold">Services</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              View and manage available services
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{services.length} total services</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last updated: Just now</span>
              </div>
            </div>
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
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
              <input
                type="search"
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
              />
            </div>
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field);
              setSortOrder(order);
            }}
            className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
              ? 'bg-gray-800/70 border-gray-600 text-white'
              : 'bg-white/80 border-gray-300 text-gray-900'
              }`}
          >
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="price-desc">Price High-Low</option>
            <option value="price-asc">Price Low-High</option>
            <option value="category-asc">Category A-Z</option>
            <option value="category-desc">Category Z-A</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
          </select>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Services', count: services.length, color: 'bg-blue-500' },
            { label: 'Total Categories', count: [...new Set(services.map(s => s.category))].length, color: 'bg-purple-500' },
            { label: 'Avg Price', count: services.length > 0 ? `USD ${(services.reduce((sum, s) => sum + (s.price || 0), 0) / services.length).toFixed(0)}` : '0', color: 'bg-green-500' },
            { label: 'Active', count: services.length, color: 'bg-emerald-500' },
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'}`}>  
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">{stat.label}</span>
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
              </div>
              <div className="text-2xl font-bold mt-2">{stat.count}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label.includes('Avg') ? '' : `${((stat.count / services.length) * 100 || 0).toFixed(1)}% of total`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Table */}
      <div className={`rounded-2xl border overflow-hidden backdrop-blur-sm ${theme === 'dark'
        ? 'bg-gray-800/30 border-gray-700'
        : 'bg-white/50 border-gray-200'
        }`}>
        {error && (
          <div className={`p-4 m-4 rounded-lg ${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center gap-2 text-red-500">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {sortedServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Package className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search' : 'No services available yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>  
                  <th className="text-left p-6 font-medium">Service Name</th>
                  <th className="text-left p-6 font-medium">Description</th>
                  <th className="text-left p-6 font-medium">Category</th>
                  <th className="text-left p-6 font-medium">Price</th>
                  <th className="text-left p-6 font-medium">Created</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedServices.map((service, index) => {
                  return (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'}`}
                      transition-colors
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {service.name?.[0]?.toUpperCase() || 'S'}
                          </div>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              ID: {service.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="max-w-xs">
                          <div className="font-medium">{service.description}</div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${theme === 'dark' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' : 'bg-purple-100 text-purple-800 border-purple-200'}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <span>{formatPrice(service.price)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>{formatDate(service.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/dashboard/controller/services/${service.id}`)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                              : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                              }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {sortedServices.length > 0 && (
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {sortedServices.length} of {services.length} services
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
  );
};

export default ControllerServices;