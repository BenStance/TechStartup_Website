import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, FileText, User, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp, File
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { projectsApi, usersApi, servicesApi } from '../../../../api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [controller, setController] = useState(null);
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

  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true);
        const projectData = await projectsApi.getProjectById(id);
        
        // Convert snake_case fields to camelCase to match frontend expectations
        const convertedProject = {
          ...projectData,
          serviceId: projectData.service_id || projectData.serviceId,
          clientId: projectData.client_id || projectData.clientId,
          clientName: projectData.client_name || projectData.clientName,
          controllerId: projectData.controller_id || projectData.controllerId,
          controllerName: projectData.controller_name || projectData.controllerName,
          startDate: projectData.start_date || projectData.startDate,
          endDate: projectData.end_date || projectData.endDate,
          amountDescription: projectData.amount_description || projectData.amountDescription,
          requirementsPdf: projectData.requirements_pdf || projectData.requirementsPdf,
          createdAt: projectData.created_at || projectData.createdAt,
          updatedAt: projectData.updated_at || projectData.updatedAt
        };
        
        setProject(convertedProject);
        setError('');
        
        // Fetch related data in parallel
        const [clientData, controllerData, serviceData] = await Promise.all([
          usersApi.getUserById(convertedProject.clientId),
          convertedProject.controllerId ? usersApi.getUserById(convertedProject.controllerId) : Promise.resolve(null),
          servicesApi.getServiceById(convertedProject.serviceId)
        ]);
        
        setClient(clientData);
        setController(controllerData);
        setService(serviceData);
      } catch (err) {
        console.error('Error fetching project:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProject();
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
            Loading project details...
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
            onClick={() => navigate('/admin/projects')}
            className={`px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Back to Projects
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
            onClick={() => navigate('/admin/projects')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">{project.title}</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Detailed information about the project
        </p>
      </motion.div>

      {/* Project Info Card */}
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
            <FileText className="w-12 h-12 text-blue-500" />
          </div>

          {/* Project Details */}
          <div className="flex-grow">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {project.title}
                </h2>
                <p className={`mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {project.description}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
                    project.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    project.status === 'inProgress' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                    project.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {project.status}
                  </span>
                  
                  {project.progress !== undefined && (
                    <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-purple-500/10 text-purple-500 border border-purple-500/20">
                      <TrendingUp className="w-4 h-4 inline mr-1" />
                      {project.progress}%
                    </span>
                  )}
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/admin/projects/${project?.id}/edit`)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all self-start"
              >
                <Edit className="w-4 h-4" />
                Edit Project
              </motion.button>
            </div>

            {/* Project Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Project Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Project ID</p>
                      <p className="font-medium">#{project.id}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Client</p>
                      <p className="font-medium">{ `${project.clientName}`}</p>
                    </div>
                  </div>
                  
                  {controller && (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Controller</p>
                        <p className="font-medium">{controller ? `${controller.firstName || ''} ${controller.lastName || ''}`.trim() || `${project.controllerName}` : `${project.controllerName}`}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Service</p>
                      <p className="font-medium">{service ? service.name : `Service #${project.serviceId}`}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">Project Details</h3>
                <div className="space-y-4">
                  {(project.amount !== undefined && project.amount !== null) && (
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Amount (USD)</p>
                        <p className="font-medium">$ {project.amount.toLocaleString()}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Created</p>
                      <p className="font-medium">{formatDate(project?.createdAt)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Last Updated</p>
                      <p className="font-medium">{formatDate(project?.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Full Description */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Description</h3>
              <div className={`p-4 rounded-xl ${theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-100'}`}>
                <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {project?.description || 'No description available.'}
                </p>
              </div>
            </div>
            
            {/* Progress Tracking */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Progress Tracking</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Overall Progress</span>
                    <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{project.progress}%</span>
                  </div>
                  <div className={`w-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-full h-2.5`}>
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2.5 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Requirement Document */}
            {project?.requirementsPdf && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Requirement Document</h3>
                <div className={`p-4 rounded-xl border backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <File className="w-5 h-5 mr-3 text-red-500" />
                      <span className="font-medium truncate max-w-xs">
                        {project.requirementsPdf.split('/').pop()}
                      </span>
                    </div>
                    <a 
                      href={`http://127.0.0.1:3000${project.requirementsPdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProjectDetails;