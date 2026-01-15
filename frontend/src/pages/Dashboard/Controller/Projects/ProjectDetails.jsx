import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit, FileText, User, Calendar, DollarSign, CheckCircle, AlertCircle, Clock, TrendingUp, File,
  Upload, Download, Folder, X
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import { projectsApi, usersApi, servicesApi } from '../../../../api';

const ControllerProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [client, setClient] = useState(null);
  const [service, setService] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fileUpload, setFileUpload] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [success, setSuccess] = useState('');

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
          id: projectData.id,
          title: projectData.title,
          description: projectData.description,
          serviceId: projectData.service_id || projectData.serviceId,
          clientId: projectData.client_id || projectData.clientId,
          controllerId: projectData.controller_id || projectData.controllerId,
          status: projectData.status,
          progress: projectData.progress,
          startDate: projectData.start_date || projectData.startDate,
          endDate: projectData.end_date || projectData.endDate,
          amount: projectData.amount,
          amountDescription: projectData.amount_description || projectData.amountDescription,
          requirementsPdf: projectData.requirements_pdf || projectData.requirementsPdf,
          createdAt: projectData.created_at || projectData.createdAt,
          updatedAt: projectData.updated_at || projectData.updatedAt,
          clientName: projectData.client_name,
          controllerName: projectData.controller_name,
          serviceName: projectData.service_name
        };
        
        setProject(convertedProject);
        setError('');
        
        // Fetch related data in parallel
        const [clientData, serviceData, projectFiles] = await Promise.all([
          usersApi.getUserById(convertedProject.clientId),
          servicesApi.getServiceById(convertedProject.serviceId),
          projectsApi.getProjectFiles(id)
        ]);
        
        setClient(clientData);
        setService(serviceData);
        setFiles(projectFiles || []);
      } catch (err) {
        console.error('Error fetching project:', err);
        if (err.response?.status === 403 || err.response?.data?.message?.includes('permission')) {
          setError('You do not have permission to view this project');
        } else {
          setError('Failed to load project details. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchProject();
    }
  }, [id, user]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf') && !file.type.includes('image')) {
      setError('Please select a PDF or image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setFileUpload(file);
      
      // Upload file to project
      const uploadResult = await projectsApi.uploadProjectFile(id, file);
      console.log('File upload result:', uploadResult);
      
      // Refresh project files
      const projectFiles = await projectsApi.getProjectFiles(id);
      setFiles(projectFiles || []);
      
      setFileUpload(null);
      setSuccess('File uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading file:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleRequirementUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.includes('pdf')) {
      setError('Please select a PDF file for requirements');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setIsUploading(true);
      setFileUpload(file);
      
      // Upload requirement document to project
      const uploadResult = await projectsApi.uploadProjectRequirement(id, file);
      console.log('Upload result:', uploadResult);
      
      // Refresh project details
      const projectData = await projectsApi.getProjectById(id);
      const convertedProject = {
        ...projectData,
        id: projectData.id,
        title: projectData.title,
        description: projectData.description,
        serviceId: projectData.service_id || projectData.serviceId,
        clientId: projectData.client_id || projectData.clientId,
        controllerId: projectData.controller_id || projectData.controllerId,
        status: projectData.status,
        progress: projectData.progress,
        startDate: projectData.start_date || projectData.startDate,
        endDate: projectData.end_date || projectData.endDate,
        amount: projectData.amount,
        amountDescription: projectData.amount_description || projectData.amountDescription,
        requirementsPdf: projectData.requirements_pdf || projectData.requirementsPdf,
        createdAt: projectData.created_at || projectData.createdAt,
        updatedAt: projectData.updated_at || projectData.updatedAt,
        clientName: projectData.client_name,
        controllerName: projectData.controller_name,
        serviceName: projectData.service_name
      };
      
      setProject(convertedProject);
      
      // Also refresh the project files to ensure they're up to date
      const projectFiles = await projectsApi.getProjectFiles(id);
      setFiles(projectFiles || []);
      
      setFileUpload(null);
      setSuccess('Requirement document uploaded successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading requirement:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload requirement document. Please try again.';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset file input
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      if (window.confirm('Are you sure you want to delete this file?')) {
        await projectsApi.deleteProjectFile(id, fileId);
        
        // Refresh project files
        const projectFiles = await projectsApi.getProjectFiles(id);
        setFiles(projectFiles || []);
        
        setSuccess('File deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to delete file. Please try again.';
      setError(errorMessage);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const updateData = {
        status: newStatus,
        progress: project.progress || 0 // Keep current progress
      };
      
      const updatedProject = await projectsApi.updateProject(id, updateData);
      
      // Update local state
      setProject(updatedProject);
      setSuccess('Project status updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating status:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project status. Please try again.';
      setError(errorMessage);
    }
  };

  const handleProgressChange = async (newProgress) => {
    try {
      const updateData = {
        status: project.status,
        progress: parseInt(newProgress)
      };
      
      const updatedProject = await projectsApi.updateProject(id, updateData);
      
      // Update local state
      setProject(updatedProject);
      setSuccess('Project progress updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating progress:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to update project progress. Please try again.';
      setError(errorMessage);
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
            Loading project details...
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
            onClick={() => navigate('/dashboard/controller/projects')}
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
            onClick={() => navigate('/dashboard/controller/projects')}
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

      {/* Success and Error Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            theme === 'dark' 
              ? 'bg-red-900/20 border border-red-700/50' 
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button 
              onClick={() => setError('')}
              className="ml-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            theme === 'dark' 
              ? 'bg-green-900/20 border border-green-700/50' 
              : 'bg-green-50 border border-green-200'
          }`}
        >
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
            <button 
              onClick={() => setSuccess('')}
              className="ml-auto"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

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
                    project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                    project.status === 'in_progress' || project.status === 'inProgress' || project.status === 'development' || project.status === 'testing' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                    project.status === 'cancelled' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                    project.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    project.status === 'planning' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                    project.status === 'designing' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
                    project.status === 'delivery' ? 'bg-teal-500/10 text-teal-500 border-teal-500/20' :
                    'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    {project.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
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
                onClick={() => navigate(`/dashboard/controller/projects/${project?.id}/edit`)}
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
                      <p className="font-medium">{client ? `${client.firstName || ''} ${client.lastName || ''}`.trim() || `${project.clientName}` : `Client #${project.clientId}`}</p>
                    </div>
                  </div>
                  
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
                
                {/* Status and Progress Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Update Status
                    </label>
                    <select
                      value={project.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white'
                        : 'bg-white/80 border-gray-300 text-gray-900'
                        }`}
                    >
                      <option value="pending">Pending</option>
                      <option value="planning">Planning</option>
                      <option value="designing">Designing</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="in_progress">In Progress</option>
                      <option value="delivery">Delivery</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Update Progress (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={project.progress}
                      onChange={(e) => handleProgressChange(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                        ? 'bg-gray-800/70 border-gray-600 text-white'
                        : 'bg-white/80 border-gray-300 text-gray-900'
                        }`}
                    />
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
                        {(project.requirementsPdf || project.requirements_pdf)?.split('/').pop() || 'requirement.pdf'}
                      </span>
                    </div>
                    <a 
                      href={`http://127.0.0.1:3000${project.requirementsPdf || project.requirements_pdf}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                      onClick={(e) => {
                        if (!project.requirementsPdf) {
                          e.preventDefault();
                          alert('No requirement document available');
                        }
                      }}
                    >
                      View Document
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Upload Requirement Document */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Upload New Requirement Document</h3>
              <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'} transition-colors duration-200`}>
                <input
                  type="file"
                  id="requirement-file"
                  name="requirement-file"
                  accept="application/pdf"
                  onChange={handleRequirementUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="requirement-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-2`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {isUploading ? 'Uploading...' : 'Click to upload requirement PDF'}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    PDF files up to 10MB
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Project Files Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 border backdrop-blur-sm ${theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-white/50 border-gray-200'
          }`}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Project Files
        </h3>
        
        {/* File Upload */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'} transition-colors duration-200`}>
                <input
                  type="file"
                  id="project-file"
                  name="project-file"
                  accept="application/pdf,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <label
                  htmlFor="project-file"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-2`} />
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                    {isUploading ? 'Uploading...' : 'Click to upload file'}
                  </span>
                  <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                    PDF or images up to 10MB
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Files */}
        {files.length > 0 ? (
          <div className="space-y-3">
            {files.map((file) => (
              <div key={file.id} className={`flex items-center justify-between p-4 rounded-xl border backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-700/30 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
                <div className="flex items-center">
                  {(file.fileType || file.mimeType)?.includes('pdf') ? (
                    <File className="w-5 h-5 mr-3 text-red-500" />
                  ) : (file.fileType || file.mimeType)?.includes('image/') ? (
                    <File className="w-5 h-5 mr-3 text-blue-500" />
                  ) : (
                    <File className="w-5 h-5 mr-3 text-gray-500" />
                  )}
                  <span className="font-medium truncate max-w-xs">{file.fileName || file.filename || file.name || file.originalname}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={`http://127.0.0.1:3000${file.filePath || file.path || file.url || file.file_path}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </a>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="p-2 rounded-lg text-red-500 hover:bg-red-500/20 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={`text-center py-8 rounded-xl ${theme === 'dark' ? 'bg-gray-700/20' : 'bg-gray-100'}`}>
            <Folder className={`w-12 h-12 mx-auto mb-4 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`} />
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              No files uploaded yet
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default ControllerProjectDetails;