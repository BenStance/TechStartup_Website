import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Eye, Edit, Trash2, Search, Filter, MoreVertical, 
  ChevronRight, ChevronDown, Download, Calendar, 
  Box, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowRight, X, Loader2
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import servicesApi from '../../../../api/services.api';

const Services = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const servicesData = await servicesApi.getAllServices();
      console.log('Raw API response:', servicesData);
      
      // Convert snake_case fields to camelCase to match frontend expectations
      const convertedServices = servicesData.map(service => ({
        id: service.id,
        name: service.name,
        description: service.description,
        category: service.category,
        price: service.price,
        createdAt: service.created_at || service.createdAt,
        updatedAt: service.updated_at || service.updatedAt
      }));
      
      console.log('Converted services:', convertedServices);
      console.log('Services state:', convertedServices);
      setServices(convertedServices);
      setError('');
    } catch (err) {
      setError('Failed to load services. Please try again.');
      console.error('Error fetching services:', err);
      // Log full error for debugging
      console.error('Full error details:', {
        message: err.message,
        response: err.response,
        stack: err.stack
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    
    try {
      setDeleting(true);
      await servicesApi.deleteService(serviceToDelete.id);
      setServices(prev => prev.filter(s => s.id !== serviceToDelete.id));
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      setError('Failed to delete service. Please try again.');
      console.error('Error deleting service:', err);
    } finally {
      setDeleting(false);
    }
  };

  const confirmDelete = (service) => {
    setServiceToDelete(service);
    setDeleteModalOpen(true);
  };

  const getCategoryColor = (category) => {
    const categories = [
      'web-development', 'mobile-apps', 'ui-design', 'consulting',
      'maintenance', 'seo', 'marketing', 'analytics'
    ];
    const index = categories.indexOf(category) % 8;
    
    const colors = [
      { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' },
      { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/20' },
      { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' },
      { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' },
      { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' },
      { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' },
      { bg: 'bg-pink-500/10', text: 'text-pink-500', border: 'border-pink-500/20' },
      { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' }
    ];
    
    return colors[index] || colors[0];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const filteredServices = services
    .filter(service => {
      // Safe string operations to prevent crashes
      const name = String(service.name ?? '').toLowerCase();
      const description = String(service.description ?? '').toLowerCase();
      const category = String(service.category ?? '').toLowerCase();
      const matchesSearch = name.includes(searchTerm.toLowerCase()) ||
                          description.includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let result = 0;

      if (sortBy === 'createdAt') {
        result =
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime();
      } else if (sortBy === 'price') {
        const aPrice = a.price !== undefined ? parseFloat(a.price) : 0;
        const bPrice = b.price !== undefined ? parseFloat(b.price) : 0;
        result = aPrice - bPrice;
      } else {
        const aVal = String(a[sortBy] ?? '').toLowerCase();
        const bVal = String(b[sortBy] ?? '').toLowerCase();
        result = aVal.localeCompare(bVal);
      }

      return sortOrder === 'asc' ? result : -result;
    });

  // Get unique categories for filter dropdown
  const categories = [...new Set(services.map(service => service.category))];

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
              Manage and track all your services
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
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/services/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Service
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

          {/* Filters */}
          <div className="flex gap-4">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Categories</option>
              {categories.map((category, index) => (
                <option key={index} value={category}>{category}</option>
              ))}
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
              <option value="name">Name</option>
              <option value="category">Category</option>
              <option value="price">Price</option>
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

        {/* Category Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {categories.slice(0, 4).map((category, index) => {
            const count = services.filter(s => s.category === category).length;
            const color = getCategoryColor(category);
            return (
              <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'
                }`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-70">{category}</span>
                  <div className={`w-2 h-2 rounded-full ${color.text.replace('text-', 'bg-')}`}></div>
                </div>
                <div className="text-2xl font-bold mt-2">{count}</div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {services.length > 0 ? ((count / services.length) * 100).toFixed(1) : 0}% of total
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Grid/Table */}
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

        {filteredServices.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Box className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No services found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first service'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/admin/services/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Service
            </motion.button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className="text-left p-6 font-medium">Service</th>
                  <th className="text-left p-6 font-medium">Category</th>
                  <th className="text-left p-6 font-medium">Description</th>
                  <th className="text-left p-6 font-medium">Price</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.map((service) => {
                  const categoryColors = getCategoryColor(service.category);
                  return (
                    <motion.tr
                      key={service.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'
                        } transition-colors`}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${categoryColors.bg} ${categoryColors.border} border`}>
                            <Box className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{service.name}</div>
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              Created: {formatDate(service.createdAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border}`}>
                          {service.category}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className={`max-w-md truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          {service.description}
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-medium">{formatCurrency(service.price)}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/services/${service.id}`)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                              : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                              }`}
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/admin/services/${service.id}/edit`)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                              : 'bg-gray-100/50 hover:bg-gray-200/80 text-blue-600 hover:text-blue-800'
                              }`}
                            title="Edit Service"
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => confirmDelete(service)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300'
                              : 'bg-gray-100/50 hover:bg-red-100/80 text-red-600 hover:text-red-800'
                              }`}
                            title="Delete Service"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination */}
        {filteredServices.length > 0 && (
          <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Showing {filteredServices.length} of {services.length} services
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => !deleting && setDeleteModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border p-6 z-50 ${theme === 'dark'
                ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700'
                : 'bg-white/95 backdrop-blur-lg border-gray-200'
                }`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-red-500/20 text-red-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Service</h3>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-xl mb-6 ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100/50'}`}>
                <div className="font-medium mb-1">{serviceToDelete?.name}</div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Category: {serviceToDelete?.category} • ID: {serviceToDelete?.id}
                </div>
              </div>

              <p className={`mb-6 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Are you sure you want to delete this service? This will remove it from all projects and cannot be undone.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setDeleteModalOpen(false);
                    setServiceToDelete(null);
                  }}
                  disabled={deleting}
                  className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                    ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                    : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteService}
                  disabled={deleting}
                  className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      Delete Service
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Services;