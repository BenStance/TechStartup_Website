import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Eye, Edit, Trash2, Search, Filter, MoreVertical, 
  ChevronRight, ChevronDown, Download, Calendar, 
  Users, Briefcase, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowRight, X, Loader2
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import projectsApi from '../../../../api/projects.api';

const ClientProjects = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsApi.getClientProjects();
      console.log('Raw API response:', projectsData);
      
      // Convert snake_case fields to camelCase to match frontend expectations
      const convertedProjects = projectsData.map(project => ({
        ...project,
        serviceId: project.service_id || project.serviceId,
        clientId: project.client_id || project.clientId,
        controllerId: project.controller_id || project.controllerId,
        startDate: project.start_date || project.startDate,
        endDate: project.end_date || project.endDate,
        amountDescription: project.amount_description || project.amountDescription,
        clientName: project.client_name || project.clientName,
        controllerName: project.controller_name || project.controllerName,
        serviceName: project.service_name || project.serviceName,
        createdAt: project.created_at || project.createdAt,
        updatedAt: project.updated_at || project.updatedAt
      }));
      
      console.log('Converted projects:', convertedProjects);
      setProjects(convertedProjects);
      setError('');
    } catch (err) {
      setError('Failed to load projects. Please try again.');
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
      case 'inprogress':
      case 'development':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'pending':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
      case 'planning':
        return { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20' };
      case 'designing':
        return { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500/20' };
      case 'testing':
        return { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500/20' };
      case 'delivery':
        return { bg: 'bg-teal-500/10', text: 'text-teal-500', border: 'border-teal-500/20' };
      case 'cancelled':
        return { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20' };
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
      day: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProjects = projects
    .filter(project => {
      // Safe string operations to prevent crashes
      const title = project.title ?? '';
      const description = project.description ?? '';
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      if (sortBy === 'title') {
        aValue = (a.title ?? '').toLowerCase();
        bValue = (b.title ?? '').toLowerCase();
      } else if (sortBy === 'progress') {
        aValue = Number(a.progress || 0);
        bValue = Number(b.progress || 0);
      } else if (sortBy === 'amount') {
        aValue = Number(a.amount || 0);
        bValue = Number(b.amount || 0);
      } else {
        // Default sort by createdAt
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : Date.now();
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : Date.now();
        aValue = aDate;
        bValue = bDate;
      }
      
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen flex-1">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading your projects...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 min-h-screen pb-8">
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
            <h1 className="text-3xl font-bold">My Projects</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and track your projects
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{projects.length} total projects</span>
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
              onClick={() => navigate('/dashboard/client/projects/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Project
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
                placeholder="Search projects..."
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
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="planning">Planning</option>
              <option value="designing">Designing</option>
              <option value="development">Development</option>
              <option value="testing">Testing</option>
              <option value="delivery">Delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
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
              <option value="progress">Progress</option>
              <option value="amount">Amount</option>
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

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[{'label': 'Active', count: projects.filter(p => ['planning', 'designing', 'development', 'testing', 'delivery'].includes(p.status)).length, color: 'bg-blue-500' },
            {'label': 'Completed', count: projects.filter(p => p.status === 'completed').length, color: 'bg-emerald-500' },
            {'label': 'Pending', count: projects.filter(p => p.status === 'pending').length, color: 'bg-amber-500' },
            {'label': 'Cancelled', count: projects.filter(p => p.status === 'cancelled').length, color: 'bg-red-500' },
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'
              }`}>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">{stat.label}</span>
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
              </div>
              <div className="text-2xl font-bold mt-2">{stat.count}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {((stat.count / projects.length) * 100 || 0).toFixed(1)}% of total
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Grid/Table */}
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

        {filteredProjects.length === 0 ? (
          <div className="text-center py-16 flex-1 flex items-center justify-center">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Briefcase className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search or filters' : 'Get started by creating your first project'}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/client/projects/create')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 mx-auto shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="w-4 h-4" />
              Create New Project
            </motion.button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className="text-left p-6 font-medium">Project</th>
                  <th className="text-left p-6 font-medium">Status</th>
                  <th className="text-left p-6 font-medium">Progress</th>
                  <th className="text-left p-6 font-medium">Created</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => {
                  const statusColors = getStatusColor(project.status);
                  return (
                    <motion.tr
                      key={project.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'
                        } transition-colors`}
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${statusColors.bg} ${statusColors.border} border`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-medium">{project.title}</div>
                            <div className={`text-sm mt-1 max-w-md truncate ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                              }`}>
                              {project.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>{project.progress}%</span>
                          </div>
                          <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                            }`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${project.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${
                                project.progress >= 100 ? 'bg-emerald-500' :
                                project.progress >= 70 ? 'bg-green-500' :
                                project.progress >= 40 ? 'bg-blue-500' :
                                project.progress >= 20 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="font-medium">{formatDate(project.createdAt)}</div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/dashboard/client/projects/${project.id}`)}
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
                            onClick={() => navigate(`/dashboard/client/projects/${project.id}/edit`)}
                            className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                              ? 'hover:bg-blue-500/20 text-blue-400 hover:text-blue-300'
                              : 'bg-gray-100/50 hover:bg-gray-200/80 text-blue-600 hover:text-blue-800'
                              }`}
                            title="Edit Project"
                          >
                            <Edit className="w-4 h-4" />
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
        {filteredProjects.length > 0 && (
          <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                Showing {filteredProjects.length} of {projects.length} projects
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

export default ClientProjects;