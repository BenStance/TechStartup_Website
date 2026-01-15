import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Save, FileText, User, Calendar, DollarSign, CheckCircle, AlertCircle, Tag, Upload, File, X
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { projectsApi, usersApi, servicesApi } from '../../../../api';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [projectData, setProjectData] = useState(null);
  const [client, setClient] = useState(null);
  const [controller, setController] = useState(null);
  const [service, setService] = useState(null);
  const [controllers, setControllers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    serviceId: '',
    clientId: '',
    controllerId: '',
    status: '',
    progress: 0,
    amount: '',
    amountDescription: ''
  });
  
  const [requirementFile, setRequirementFile] = useState(null);
  const [requirementPreview, setRequirementPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch project data
        const project = await projectsApi.getProjectById(id);
        
        // Convert snake_case fields to camelCase to match frontend expectations
        const convertedProject = {
          ...project,
          serviceId: project.service_id || project.serviceId,
          clientId: project.client_id || project.clientId,
          controllerId: project.controller_id || project.controllerId,
          startDate: project.start_date || project.startDate,
          endDate: project.end_date || project.endDate,
          amountDescription: project.amount_description || project.amountDescription,
          requirementsPdf: project.requirements_pdf || project.requirementsPdf,
          clientName: project.client_name,
          controllerName: project.controller_name,
          serviceName: project.service_name,
          createdAt: project.created_at || project.createdAt,
          updatedAt: project.updated_at || project.updatedAt
        };
        
        setProjectData(convertedProject);
        setFormData({
          title: convertedProject.title || '',
          description: convertedProject.description || '',
          serviceId: convertedProject.serviceId || '',
          clientId: convertedProject.clientId || '',
          clientName: convertedProject.clientName || '',
          controllerId: convertedProject.controllerId || '',
          status: convertedProject.status || '',
          progress: convertedProject.progress || 0,
          amount: convertedProject.amount || '',
          amountDescription: convertedProject.amountDescription || ''
        });
        
        // Set requirement document preview if exists
        if (convertedProject.requirementsPdf) {
          setRequirementPreview(convertedProject.requirementsPdf.split('/').pop()); // Get filename from path
        }
        
        setError('');
        
        // Fetch related data in parallel
        const [clientData, controllerData, serviceData, allUsers] = await Promise.all([
          usersApi.getUserById(convertedProject.clientId),
          convertedProject.controllerId ? usersApi.getUserById(convertedProject.controllerId) : Promise.resolve(null),
          servicesApi.getServiceById(convertedProject.serviceId),
          usersApi.getAllUsers() // Get all users to filter controllers
        ]);
        
        // Filter controllers (users with role 'controller')
        const filteredControllers = allUsers.filter(user => user.role === 'controller');
        
        setClient(clientData);
        setController(controllerData);
        setService(serviceData);
        setControllers(filteredControllers);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load project details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleRequirementChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.includes('pdf')) {
        setError('Please select a PDF file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      
      setRequirementFile(file);
      
      // Create preview - for PDF we'll just show the filename
      setRequirementPreview(file.name);
      
      // Clear error if any
      if (error) setError('');
    }
  };

  const removeRequirement = () => {
    setRequirementFile(null);
    setRequirementPreview(null);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Project title is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Project description is required');
      return false;
    }
    
    if (formData.progress && (isNaN(parseInt(formData.progress)) || parseInt(formData.progress) < 0 || parseInt(formData.progress) > 100)) {
      setError('Progress must be a number between 0 and 100');
      return false;
    }
    
    if (formData.amount && isNaN(parseFloat(formData.amount))) {
      setError('Amount must be a valid number');
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
        title: formData.title,
        description: formData.description,
        controllerId: formData.controllerId ? parseInt(formData.controllerId) : null,
        status: formData.status,
        progress: parseInt(formData.progress),
        amount: formData.amount ? parseFloat(formData.amount) : null,
        amountDescription: formData.amountDescription || null
      };
      
      const updatedProject = await projectsApi.updateProject(id, updateData);
      
      // If there's a requirement document to upload, upload it
      if (requirementFile) {
        await projectsApi.uploadProjectRequirement(id, requirementFile);
      }
      
      setSuccess(true);
      
      // Redirect to project details after a short delay
      setTimeout(() => {
        navigate(`/admin/projects/${id}`);
      }, 1500);
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err.response?.data?.message || 'Failed to update project. Please try again.');
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
            Loading project details...
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
            onClick={() => navigate('/admin/projects')}
            className={`p-2 rounded-xl ${theme === 'dark'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
              }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
          <h1 className="text-3xl font-bold">Edit Project</h1>
        </div>
        <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          Update project details below
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
            <h3 className="text-xl font-semibold mb-2">Project Updated Successfully!</h3>
            <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              The project details have been updated successfully.
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
              {/* Project ID */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project ID
                </label>
                <div className={`block w-full px-3 py-3 rounded-xl border backdrop-blur-sm ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-gray-400'
                  : 'bg-gray-100/80 border-gray-300 text-gray-500'
                  }`}>
                  #{projectData?.id}
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
                  {projectData?.createdAt ? new Date(projectData.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>

              {/* Service (Non-editable) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Service
                </label>
                <div className={`block w-full px-3 py-3 rounded-xl border backdrop-blur-sm ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-gray-400'
                  : 'bg-gray-100/80 border-gray-300 text-gray-500'
                  }`}>
                  {service ? service.name : `Service #${projectData?.serviceId}`}
                </div>
              </div>

              {/* Client (Non-editable) */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Client
                </label>
                <div className={`block w-full px-3 py-3 rounded-xl border backdrop-blur-sm ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-gray-400'
                  : 'bg-gray-100/80 border-gray-300 text-gray-500'
                  }`}>
                  {`${projectData?.clientName}`}
                </div>
              </div>

              {/* Project Title */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Project Title *
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter project title"
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
                    placeholder="Enter project description"
                  />
                </div>
              </div>

              {/* Controller */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Controller (Optional)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <User className="h-5 w-5" />
                  </div>
                  <select
                    name="controllerId"
                    value={formData.controllerId}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                  >
                    <option value="">Select a controller</option>
                    {controllers.map(controller => (
                      <option key={controller.id} value={controller.id}>
                        {controller.firstName} {controller.lastName} ({controller.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Tag className="h-5 w-5" />
                  </div>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                  >
                    <option value="">Select status</option>
                    <option value="pending">Pending</option>
                    <option value="planning">Planning</option>
                    <option value="designing">Designing</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="delivery">Delivery</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Progress */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Progress (%)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    name="progress"
                    value={formData.progress}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount (USD) (Optional)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    step="0.01"
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Enter amount in USD"
                  />
                </div>
              </div>

              {/* Amount Description */}
              <div className="md:col-span-2">
                <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  Amount Description (Optional)
                </label>
                <div className="relative">
                  <div className={`absolute top-3 left-3 flex items-center pointer-events-none ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <textarea
                    name="amountDescription"
                    value={formData.amountDescription}
                    onChange={handleChange}
                    rows={2}
                    className={`block w-full pl-10 pr-3 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400'
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    placeholder="Describe the amount (e.g., initial payment, final payment, etc.)"
                  />
                </div>
              </div>
            </div>

            {/* Requirement Document */}
            <div className="md:col-span-2">
              <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Requirement Document
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Document Upload Area */}
                <div className="flex-1">
                  <div className={`border-2 border-dashed rounded-xl p-6 text-center ${theme === 'dark' ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-400'} transition-colors duration-200`}>
                    <input
                      type="file"
                      id="requirement"
                      name="requirement"
                      accept="application/pdf"
                      onChange={handleRequirementChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="requirement"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'} mb-2`} />
                      <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                        Click to upload PDF
                      </span>
                      <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                        PDF up to 10MB
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* Document Preview */}
                {(requirementPreview || projectData?.requirementsPdf) && (
                  <div className="flex-1">
                    <div className="relative">
                      <div className={`p-4 rounded-xl border backdrop-blur-sm ${theme === 'dark' ? 'bg-gray-800/70 border-gray-600' : 'bg-white/80 border-gray-300'}`}>
                        <div className="flex items-center">
                          <File className="w-5 h-5 mr-2 text-red-500" />
                          <span className="text-sm truncate max-w-xs">{requirementPreview || projectData?.requirementsPdf?.split('/').pop()}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={removeRequirement}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1 text-center`}>
                        {requirementPreview ? 'New document selected' : 'Current document'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={() => navigate('/admin/projects')}
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
                    Update Project
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

export default EditProject;