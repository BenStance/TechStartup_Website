import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import projectsApi from '../../../../api/projects.api';
import uploadsApi from '../../../../api/uploads.api';
import {
  Upload, Download, FileText, Image, File, Folder,
  Search, Filter, X, AlertCircle, CheckCircle, Eye,
  Trash2, Clock, User, TrendingUp
} from 'lucide-react';

const ClientUploads = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [showSuccessRedirect, setShowSuccessRedirect] = useState(false);

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Get all projects for this client
        const projectsResponse = await projectsApi.getClientProjects();
        const allProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
        setProjects(allProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (selectedProject === 'all' || !selectedProject) {
      setError('Please select a project to upload to');
      return;
    }

    if (!file.type.includes('pdf')) {
      setError('Only PDF files are allowed for project requirements.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Upload file to selected project using the correct API
      await projectsApi.uploadProjectRequirement(selectedProject, file);
      
      setSuccess('Project requirement uploaded successfully!');
      
      // Refresh the project list to show updated information
      const projectsResponse = await projectsApi.getClientProjects();
      const allProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
      setProjects(allProjects);
      
    } catch (err) {
      console.error('Error uploading file:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload file. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
      // Reset file input
      e.target.value = '';
    }
  };

  // Redirect after successful upload
  useEffect(() => {
    let timer;
    if (success) {
      setShowSuccessRedirect(true);
      timer = setTimeout(() => {
        navigate('/dashboard/client/projects');
      }, 3000); // Redirect after 3 seconds
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [success, navigate]);

  if (showSuccessRedirect) {
    return (
      <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">File Uploaded Successfully!</h3>
                  <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    The file has been uploaded successfully. Redirecting to projects list...
                  </p>
                  <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mt-4"></div>
                </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading projects...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-screen ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className={`p-6 rounded-xl border ${theme === 'dark' ? 'bg-red-900/20 border-red-700/50' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => {
              setError('');
              const fetchProjects = async () => {
                try {
                  setLoading(true);
                  const projectsResponse = await projectsApi.getClientProjects();
                  const allProjects = Array.isArray(projectsResponse) ? projectsResponse : [];
                  setProjects(allProjects);
                } catch (err) {
                  console.error('Error fetching projects:', err);
                  setError('Failed to load projects. Please try again.');
                } finally {
                  setLoading(false);
                }
              };
              fetchProjects();
            }}
            className={`mt-4 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-screen flex flex-col">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
            : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50'
        } backdrop-blur-sm flex-shrink-0`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">File Uploads</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload and manage your project requirements
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto">
        {/* Error and Success Messages */}
        {error && (
          <div className={`p-4 rounded-lg mb-6 ${
            theme === 'dark' 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-red-50 border-red-200'
          } border`}>
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
          </div>
        )}

        {success && (
          <div className={`p-4 rounded-lg mb-6 ${
            theme === 'dark' 
              ? 'bg-green-900/20 border-green-700/50' 
              : 'bg-green-50 border-green-200'
          } border`}>
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
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white/70 border-gray-300'
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Project Requirement
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Select Project *
                </label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === 'dark'
                      ? 'bg-gray-800/70 border-gray-600 text-white'
                      : 'bg-white/80 border-gray-300 text-gray-900'
                  }`}
                  required
                >
                  <option value="">Choose a project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>
                      {project.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Upload PDF Requirement *
                </label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                  theme === 'dark'
                    ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                    : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                }`}>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="project-file-upload"
                    disabled={loading || !selectedProject}
                  />
                  <label
                    htmlFor="project-file-upload"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      loading || !selectedProject
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:scale-105'
                    } ${
                      theme === 'dark'
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Choose PDF File
                  </label>
                  <p className={`text-sm mt-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Only PDF files allowed (max 10MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className={`rounded-xl p-6 border ${
            theme === 'dark'
              ? 'bg-gray-800/50 border-gray-700'
              : 'bg-white/70 border-gray-300'
          }`}>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              How to Upload
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <span className="text-sm font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Select Project</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Choose the project you want to upload requirements for
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <span className="text-sm font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Prepare PDF</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Make sure your document is in PDF format and under 10MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>
                  <span className="text-sm font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Upload File</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Click "Choose PDF File" and select your document
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientUploads;