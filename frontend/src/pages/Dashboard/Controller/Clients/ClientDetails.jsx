import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, User, Mail, Phone, Calendar, Shield, Briefcase, TrendingUp, File,
  Upload, Download, Folder, CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import usersApi from '../../../../api/users.api';
import projectsApi from '../../../../api/projects.api';

const ControllerClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [client, setClient] = useState(null);
  const [clientProjects, setClientProjects] = useState([]);
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

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const clientData = await usersApi.getUserById(id);
        
        // Convert snake_case fields to camelCase to match frontend expectations
        const convertedClient = {
          ...clientData,
          firstName: clientData.first_name || clientData.firstName,
          lastName: clientData.last_name || clientData.lastName,
          createdAt: clientData.created_at || clientData.createdAt,
          updatedAt: clientData.updated_at || clientData.updatedAt,
          phone: clientData.phone || clientData.phone,
          email: clientData.email || clientData.email,
          role: clientData.role || clientData.role,
          id: clientData.id || clientData.id
        };
        
        setClient(convertedClient);
        setError('');
        
        // Fetch client's projects
        const allProjects = await projectsApi.getAllProjects();
        const userProjects = allProjects.filter(project => project.clientId === parseInt(id));
        setClientProjects(userProjects);
      } catch (err) {
        console.error('Error fetching client:', err);
        if (err.response?.status === 403 || err.response?.data?.message?.includes('permission')) {
          setError('You do not have permission to view this client');
        } else {
          setError('Failed to load client details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClient();
    }
  }, [id]);

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
            Loading client details...
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
            onClick={() => navigate('/dashboard/controller/clients')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Back to Clients
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
            onClick={() => navigate('/dashboard/controller/clients')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">{client?.firstName} {client?.lastName}</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Detailed information about the client
        </p>
      </motion.div>

      {/* Client Info Card */}
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
          <div className={`flex-shrink-0 w-24 h-24 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-green-500/10 border border-green-500/20' : 'bg-green-100 border border-green-200'}`}>
            <User className="w-12 h-12 text-green-500" />
          </div>

          {/* Client Details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {client?.firstName} {client?.lastName}
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {client?.email}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${getRoleColor(client?.role).bg} ${getRoleColor(client?.role).text} ${getRoleColor(client?.role).border}`}>
                    {client?.role}
                  </span>
                  
                  <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Briefcase className="w-4 h-4 inline mr-1" />
                    {clientProjects.length} Projects
                  </span>
                </div>
              </div>
            </div>

            {/* Client Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Client Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Client Name</p>
                      <p className="font-medium">{client?.firstName} {client?.lastName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Client ID</p>
                      <p className="font-medium">#{client?.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                      <p className="font-medium">{client?.email}</p>
                    </div>
                  </div>
                  
                  {client?.phone && (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Phone</p>
                        <p className="font-medium">{client?.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Account Details</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Joined</p>
                      <p className="font-medium">{formatDate(client?.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                      <p className="font-medium">{formatDate(client?.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Status</p>
                      <p className="font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Full Details */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client information and additional details would be displayed here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Client Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border backdrop-blur-sm ${theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-white/50 border-gray-200'
          }`}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5" />
          Client Projects ({clientProjects.length})
        </h3>
        
        {clientProjects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left p-4 font-medium">Project</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Progress</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clientProjects.map((project) => {
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
                  
                  const statusColors = getStatusColor(project.status);
                  
                  return (
                    <tr key={project.id} className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'}`}>
                      <td className="p-4">
                        <div className="font-medium">{project.title}</div>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {project.description?.substring(0, 50)}...
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                          {project.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${project.progress || 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{project.progress || 0}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium">
                          {project.amount ? `TZS ${project.amount.toLocaleString()}` : 'N/A'}
                        </div>
                      </td>
                      <td className="p-4">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/dashboard/controller/projects/${project.id}`)}
                          className={`p-2 rounded-lg transition-colors ${theme === 'dark'
                            ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                            : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                            }`}
                          title="View Project"
                        >
                          <Eye className="w-4 h-4" />
                        </motion.button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={`text-center py-8 rounded-xl ${theme === 'dark' ? 'bg-gray-700/20' : 'bg-gray-100'}`}>
            <Briefcase className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              This client has no projects yet
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ControllerClientDetails;