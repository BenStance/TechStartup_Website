import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Upload, FileText, Image, File, FolderOpen, 
  Download, Eye, AlertCircle, 
  CheckCircle, Clock, X 
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import projectsApi from '../../../../api/projects.api';
import shopApi from '../../../../api/shop.api';

const UploadsPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('project');
  const [projects, setProjects] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [projectFiles, setProjectFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load projects and products assigned to this controller
  useEffect(() => {
    fetchControllerData();
  }, [user]);

  const fetchControllerData = async () => {
    try {
      setLoading(true);
      const [projectsData, productsData] = await Promise.all([
        projectsApi.getAllProjects(),
        shopApi.getAllProducts()
      ]);

      // Filter projects assigned to this controller
      const controllerProjects = projectsData.filter(
        project => project.controllerId === user?.id
      );
      setProjects(controllerProjects);

      // Set products for image upload
      setProducts(productsData);
    } catch (err) {
      setError('Failed to load data. Please try again.');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFiles = async (projectId) => {
    try {
      setLoading(true);
      const files = await projectsApi.getProjectFiles(projectId);
      setProjectFiles(files);
    } catch (err) {
      setError('Failed to load project files. Please try again.');
      console.error('Error loading project files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProjectFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedProject) {
      setError('Please select a project first.');
      return;
    }

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed for project requirements.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await projectsApi.uploadProjectRequirement(selectedProject, file);
      setSuccess('Project requirement uploaded successfully!');
      
      // Refresh files
      await fetchProjectFiles(selectedProject);
    } catch (err) {
      setError('Failed to upload project requirement. Please try again.');
      console.error('Error uploading project requirement:', err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!selectedProduct) {
      setError('Please select a product first.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed for product images.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await shopApi.uploadProductImage(selectedProduct, file);
      setSuccess('Product image uploaded successfully!');

      // Refresh products
      const productsData = await shopApi.getAllProducts();
      setProducts(productsData);
    } catch (err) {
      setError('Failed to upload product image. Please try again.');
      console.error('Error uploading product image:', err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleProjectChange = async (projectId) => {
    setSelectedProject(projectId);
    if (projectId) {
      await fetchProjectFiles(projectId);
    } else {
      setProjectFiles([]);
    }
  };

  const getFileIcon = (mimeType, fileName) => {
    if (mimeType?.includes('pdf')) return <FileText className="w-5 h-5" />;
    if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5" />;
    if (fileName?.toLowerCase().endsWith('.doc') || fileName?.toLowerCase().endsWith('.docx')) return <File className="w-5 h-5" />;
    if (fileName?.toLowerCase().endsWith('.xls') || fileName?.toLowerCase().endsWith('.xlsx')) return <File className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  const getFileTypeColor = (mimeType) => {
    if (mimeType?.includes('pdf')) return 'bg-red-500/10 text-red-500 border-red-500/20';
    if (mimeType?.startsWith('image/')) return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
    return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-6 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
            : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50'
        } backdrop-blur-sm`}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">File Uploads</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Upload and manage project requirements and product images
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className={`rounded-2xl p-6 border backdrop-blur-sm ${
        theme === 'dark'
          ? 'bg-gray-800/30 border-gray-700'
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('project')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'project'
                ? theme === 'dark'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            <FolderOpen className="w-4 h-4" />
            Project Requirements
          </button>
          <button
            onClick={() => setActiveTab('product')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'product'
                ? theme === 'dark'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-600 text-white'
                : theme === 'dark'
                  ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  : 'bg-gray-200/50 text-gray-700 hover:bg-gray-300/50'
            }`}
          >
            <Image className="w-4 h-4" />
            Product Images
          </button>
        </div>

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

        {/* Project Requirements Tab */}
        {activeTab === 'project' && (
          <div className="space-y-6">
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
                      onChange={(e) => handleProjectChange(e.target.value)}
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
                          {project.title} - {project.clientName || 'Client'}
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
                        onChange={handleProjectFileUpload}
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

              {/* Files List */}
              <div className={`rounded-xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white/70 border-gray-300'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Uploaded Requirements
                </h3>
                
                {projectFiles.length > 0 ? (
                  <div className="space-y-3">
                    {projectFiles.map(file => (
                      <div
                        key={file.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-gray-700/30 border-gray-600'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            getFileTypeColor(file.fileType || file.mimeType)
                          }`}>
                            {getFileIcon(file.fileType || file.mimeType, file.fileName || file.name)}
                          </div>
                          <div>
                            <p className={`font-medium truncate max-w-xs ${
                              theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                              {file.fileName || file.name}
                            </p>
                            <p className={`text-sm ${
                              theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                            }`}>
                              {formatFileSize(file.fileSize || file.size)} • {formatDate(file.uploadedAt || file.uploaded_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <a
                            href={file.filePath || file.path}
                            download
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            className={`p-2 rounded-lg transition-colors ${
                              theme === 'dark'
                                ? 'hover:bg-gray-600 text-gray-300'
                                : 'hover:bg-gray-200 text-gray-700'
                            }`}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No files uploaded yet</p>
                    <p className="text-sm">Select a project and upload requirements</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Product Images Tab */}
        {activeTab === 'product' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upload Section */}
              <div className={`rounded-xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white/70 border-gray-300'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Product Image
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Select Product *
                    </label>
                    <select
                      value={selectedProduct}
                      onChange={(e) => setSelectedProduct(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                        theme === 'dark'
                          ? 'bg-gray-800/70 border-gray-600 text-white'
                          : 'bg-white/80 border-gray-300 text-gray-900'
                      }`}
                      required
                    >
                      <option value="">Choose a product</option>
                      {products.map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - ${product.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Upload Product Image *
                    </label>
                    <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                      theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
                        : 'border-gray-300 hover:border-gray-400 bg-gray-50/50'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProductImageUpload}
                        className="hidden"
                        id="product-image-upload"
                        disabled={loading || !selectedProduct}
                      />
                      <label
                        htmlFor="product-image-upload"
                        className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          loading || !selectedProduct
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:scale-105'
                        } ${
                          theme === 'dark'
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <Upload className="w-4 h-4" />
                        Choose Image File
                      </label>
                      <p className={`text-sm mt-2 ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        JPG, PNG, GIF files allowed (max 5MB)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List */}
              <div className={`rounded-xl p-6 border ${
                theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700'
                  : 'bg-white/70 border-gray-300'
              }`}>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Product Images
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {products.map(product => (
                    <div
                      key={product.id}
                      className={`p-4 rounded-lg border ${
                        theme === 'dark'
                          ? 'bg-gray-700/30 border-gray-600'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="aspect-square w-full bg-gray-200 border-2 border-dashed rounded-xl overflow-hidden mb-3">
                        {product.imageUrl ? (
                          <img
                            src={`http://127.0.0.1:3000${product.imageUrl}`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Image className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <h4 className={`font-medium truncate ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-800'
                      }`}>
                        {product.name}
                      </h4>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        ${product.price} • {product.stockQuantity} in stock
                      </p>
                      {product.imageUrl && (
                        <a
                          href={product.imageUrl}
                          download
                          className={`inline-block mt-2 px-3 py-1 rounded text-xs font-medium transition-colors ${
                            theme === 'dark'
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Download Image
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadsPage;