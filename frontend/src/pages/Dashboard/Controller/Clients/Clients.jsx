import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, User, Mail, Phone, Calendar, Shield, 
  Eye, Edit, MessageSquare, Briefcase, Users, Clock, CheckCircle, AlertCircle,
  TrendingUp, ArrowRight, X, Loader2
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import usersApi from '../../../../api/users.api';
import projectsApi from '../../../../api/projects.api';

const ControllerClients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load clients (users with role 'client')
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const allUsers = await usersApi.getAllUsers();
        const clientUsers = allUsers.filter(user => user.role === 'client');
        
        // Add project count to each client
        const clientsWithProjects = await Promise.all(clientUsers.map(async (client) => {
          const clientProjects = await projectsApi.getAllProjects();
          const userProjects = clientProjects.filter(project => project.clientId === client.id);
          
          // Convert snake_case fields to camelCase to match frontend expectations
          const convertedClient = {
            ...client,
            firstName: client.first_name || client.firstName,
            lastName: client.last_name || client.lastName,
            createdAt: client.created_at || client.createdAt,
            updatedAt: client.updated_at || client.updatedAt,
            phone: client.phone || client.phone,
            email: client.email || client.email,
            role: client.role || client.role,
            id: client.id || client.id,
            projectCount: userProjects.length,
            projects: userProjects
          };
          
          return convertedClient;
        }));
        
        setClients(clientsWithProjects);
        setError('');
      } catch (err) {
        setError('Failed to load clients. Please try again.');
        console.error('Error fetching clients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.projectCount?.toString().includes(searchTerm);
    
    return matchesSearch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
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
            Loading clients...
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
            <h1 className="text-3xl font-bold">My Clients</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage clients assigned to your projects
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{clients.length} total clients</span>
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
                placeholder="Search clients..."
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
            <option value="firstName-asc">Name A-Z</option>
            <option value="firstName-desc">Name Z-A</option>
            <option value="email-asc">Email A-Z</option>
            <option value="email-desc">Email Z-A</option>
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="projectCount-desc">Most Projects</option>
            <option value="projectCount-asc">Fewest Projects</option>
          </select>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Total Clients', count: clients.length, color: 'bg-green-500' },
            { label: 'Active Projects', count: clients.reduce((sum, client) => sum + client.projectCount, 0), color: 'bg-blue-500' },
            { label: 'Avg Projects/Client', count: clients.length > 0 ? (clients.reduce((sum, client) => sum + client.projectCount, 0) / clients.length).toFixed(1) : 0, color: 'bg-purple-500' },
            { label: 'Online', count: clients.length, color: 'bg-emerald-500' },
          ].map((stat, index) => (
            <div key={index} className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-800/30' : 'bg-gray-50/50'}`}>  
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-70">{stat.label}</span>
                <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
              </div>
              <div className="text-2xl font-bold mt-2">{stat.count}</div>
              <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {stat.label.includes('Avg') ? '' : `${((stat.count / clients.length) * 100 || 0).toFixed(1)}% of total`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clients Table */}
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

        {sortedClients.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Users className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No clients found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search' : 'You have no assigned clients yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>  
                  <th className="text-left p-6 font-medium">Client Name</th>
                  <th className="text-left p-6 font-medium">Email</th>
                  <th className="text-left p-6 font-medium">Role</th>
                  <th className="text-left p-6 font-medium">Projects</th>
                  <th className="text-left p-6 font-medium">Joined</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedClients.map((client, index) => {
                  const roleColors = getRoleColor(client.role);
                  return (
                    <motion.tr
                      key={client.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'}`}
                      transition-colors
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center text-white font-semibold">
                            {client.firstName?.[0]?.toUpperCase() || 'C'}
                          </div>
                          <div>
                            <div className="font-medium">{client.firstName} {client.lastName}</div>
                            <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                              ID: {client.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <Mail className="w-4 h-4" />
                          </div>
                          <span>{client.email}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${roleColors.bg} ${roleColors.text} ${roleColors.border}`}>
                          {client.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <Briefcase className="w-4 h-4" />
                          </div>
                          <span>{client.projectCount}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                            <Calendar className="w-4 h-4" />
                          </div>
                          <span>{formatDate(client.createdAt)}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/dashboard/controller/clients/${client.id}`)}
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
      {sortedClients.length > 0 && (
        <div className={`p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Showing {sortedClients.length} of {clients.length} clients
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

export default ControllerClients;