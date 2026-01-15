import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Users, Key, Eye, Search, Filter, 
  ChevronRight, ChevronDown, Loader2, AlertCircle,
  CheckCircle, X, Lock
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import rolesApi from '../../../../api/roles.api';

const RolesPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRole, setExpandedRole] = useState(null);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const rolesData = await rolesApi.getAllRoles();
      console.log('Raw API response:', rolesData);
      
      // Convert to expected format if needed
      const convertedRoles = rolesData.map(role => ({
        name: role.name,
        description: role.description,
        permissions: role.permissions || [],
        permissionCount: (role.permissions || []).length
      }));
      
      console.log('Converted roles:', convertedRoles);
      setRoles(convertedRoles);
      setError('');
    } catch (err) {
      setError('Failed to load roles. Please try again.');
      console.error('Error fetching roles:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRoleExpansion = (roleName) => {
    setExpandedRole(expandedRole === roleName ? null : roleName);
  };

  const getRoleColor = (roleName) => {
    switch (roleName?.toLowerCase()) {
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

  const filteredRoles = roles
    .filter(role => {
      const roleName = String(role.name ?? '').toLowerCase();
      const roleDescription = String(role.description ?? '').toLowerCase();
      const matchesSearch = roleName.includes(searchTerm.toLowerCase()) ||
                          roleDescription.includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let result = 0;

      if (sortBy === 'permissionCount') {
        result = a.permissionCount - b.permissionCount;
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
            Loading roles...
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
            <h1 className="text-3xl font-bold">Roles</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and view system roles and permissions
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">{roles.length} roles defined</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Shield className="w-4 h-4" />
              Manage Permissions
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
                placeholder="Search roles..."
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
          <div className="flex gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={`px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                ? 'bg-gray-800/70 border-gray-600 text-white'
                : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
            >
              <option value="name">Role Name</option>
              <option value="permissionCount">Permission Count</option>
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

        {/* Role Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { label: 'Admin Roles', count: roles.filter(r => r.name === 'admin').length, color: 'bg-red-500' },
            { label: 'Controller Roles', count: roles.filter(r => r.name === 'controller').length, color: 'bg-blue-500' },
            { label: 'Client Roles', count: roles.filter(r => r.name === 'client').length, color: 'bg-green-500' },
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

      {/* Roles List */}
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

        {filteredRoles.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
              <Shield className="w-12 h-12 opacity-50" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No roles found</h3>
            <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchTerm ? 'Try adjusting your search' : 'No roles are currently defined in the system'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
                  }`}>
                  <th className="text-left p-6 font-medium">Role</th>
                  <th className="text-left p-6 font-medium">Description</th>
                  <th className="text-left p-6 font-medium">Permissions</th>
                  <th className="text-left p-6 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((role) => {
                  const roleColors = getRoleColor(role.name);
                  const isExpanded = expandedRole === role.name;
                  
                  return (
                    <React.Fragment key={role.name}>
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'
                          } transition-colors`}
                      >
                        <td className="p-6">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${roleColors.bg} ${roleColors.border} border`}>
                              <Shield className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-medium capitalize">{role.name}</div>
                              <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                {role.permissionCount} permissions
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="max-w-md">{role.description}</div>
                        </td>
                        <td className="p-6">
                          <div className="flex flex-wrap gap-2">
                            {role.permissions.slice(0, 3).map((permission, index) => (
                              <span 
                                key={index} 
                                className={`px-2 py-1 rounded text-xs ${theme === 'dark' 
                                  ? 'bg-gray-700/50 text-gray-300' 
                                  : 'bg-gray-200/50 text-gray-700'}`}
                              >
                                {permission}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className={`px-2 py-1 rounded text-xs ${theme === 'dark' 
                                ? 'bg-gray-700/50 text-gray-300' 
                                : 'bg-gray-200/50 text-gray-700'}`}>
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => toggleRoleExpansion(role.name)}
                              className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                                }`}
                              title="View Details"
                            >
                              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                      
                      {/* Expanded row for permissions details */}
                      {isExpanded && (
                        <tr className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-100/50'}`}>
                          <td colSpan="4" className="p-6">
                            <div className="flex flex-col gap-4">
                              <h4 className="font-bold text-lg flex items-center gap-2">
                                <Key className="w-5 h-5" />
                                Permissions for {role.name}
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {role.permissions.map((permission, index) => (
                                  <div 
                                    key={index} 
                                    className={`p-3 rounded-lg flex items-center gap-3 ${theme === 'dark' 
                                      ? 'bg-gray-700/50' 
                                      : 'bg-white/50'}`}
                                  >
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span>{permission}</span>
                                  </div>
                                ))}
                              </div>
                              {role.permissions.length === 0 && (
                                <div className={`p-4 rounded-lg text-center ${theme === 'dark' 
                                  ? 'bg-gray-700/30 text-gray-400' 
                                  : 'bg-gray-200/30 text-gray-600'}`}>
                                  No permissions defined for this role
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RolesPage;