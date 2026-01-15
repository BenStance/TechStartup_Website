import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, TrendingDown, Calendar, 
  Briefcase, Users, DollarSign, Clock, CheckCircle, Eye, FileText, Activity
} from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useAuth } from '../../../../context/AuthContext';
import projectsApi from '../../../../api/projects.api';
import dashboardApi from '../../../../api/dashboard.api';

// Chart imports
import {
  Bar, Line, Pie
} from 'react-chartjs-2';
import 'chart.js/auto';

const ControllerReports = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [timeRange, setTimeRange] = useState('month');

  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    if (!user) return;
    
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get projects assigned to this controller
        const controllerProjectsResponse = (await projectsApi.getAllProjects());
        const allProjects = Array.isArray(controllerProjectsResponse.data) ? controllerProjectsResponse.data : [];
        
        // Map snake_case fields to camelCase to match frontend expectations
        const mappedProjects = allProjects.map(project => ({
          ...project,
          controllerId: project.controller_id || project.controllerId,
          clientId: project.client_id || project.clientId,
          createdAt: project.created_at || project.createdAt,
          updatedAt: project.updated_at || project.updatedAt
        }));
        
        // Get dashboard analytics
        const dashboardAnalytics = await dashboardApi.getAnalytics();
        setAnalytics(dashboardAnalytics.data);
        
        // Get recent projects
        const recentProjectsResponse = (await dashboardApi.getProjects());
        const recentProjs = Array.isArray(recentProjectsResponse.data) ? recentProjectsResponse.data : [];
        
        // Map snake_case fields to camelCase to match frontend expectations
        const mappedRecentProjects = recentProjs.map(project => ({
          ...project,
          controllerId: project.controller_id || project.controllerId,
          clientId: project.client_id || project.clientId,
          createdAt: project.created_at || project.createdAt,
          updatedAt: project.updated_at || project.updatedAt
        }));
        
        setRecentProjects(mappedRecentProjects);
        
        // Calculate stats
        const totalProjects = mappedProjects.length;
        const completedProjects = mappedProjects.filter(p => p.status === 'completed').length;
        const inProgressProjects = mappedProjects.filter(p => p.status === 'inProgress' || p.status === 'In Progress').length;
        const pendingProjects = mappedProjects.filter(p => p.status === 'pending').length;
        const cancelledProjects = mappedProjects.filter(p => p.status === 'cancelled').length;
        
        const averageProgress = mappedProjects.length > 0 
          ? Math.round(mappedProjects.reduce((sum, p) => sum + (p.progress || 0), 0) / mappedProjects.length)
          : 0;
        
        const totalAmount = mappedProjects.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
        
        setProjects(mappedProjects);
        
        setStats({
          totalProjects,
          completedProjects,
          inProgressProjects,
          pendingProjects,
          cancelledProjects,
          averageProgress,
          totalAmount,
          completionRate: totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0
        });
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values on error
        setStats({
          totalProjects: 0,
          completedProjects: 0,
          inProgressProjects: 0,
          pendingProjects: 0,
          cancelledProjects: 0,
          averageProgress: 0,
          totalAmount: 0,
          completionRate: 0
        });
        setProjects([]);
        setRecentProjects([]);
        setAnalytics({
          projectsByMonth: [],
          topServices: [],
          avgProjectDuration: 30
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, [user, timeRange]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading reports...
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const projectStatusData = {
    labels: ['Completed', 'In Progress', 'Pending', 'Cancelled'],
    datasets: [
      {
        label: 'Projects by Status',
        data: [
          stats?.completedProjects || 0,
          stats?.inProgressProjects || 0,
          stats?.pendingProjects || 0,
          stats?.cancelledProjects || 0
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',  // green
          'rgba(59, 130, 246, 0.8)', // blue
          'rgba(251, 191, 36, 0.8)', // yellow
          'rgba(239, 68, 68, 0.8)'    // red
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2,
      },
    ],
  };

  const monthlyRevenueData = {
    labels: analytics?.projectsByMonth ? analytics.projectsByMonth.map(item => item.month) : [],
    datasets: [
      {
        label: 'Monthly Revenue',
        data: analytics?.projectsByMonth ? analytics.projectsByMonth.map(item => item.revenue) : [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  const projectTrendData = {
    labels: analytics?.projectsByMonth ? analytics.projectsByMonth.map(item => item.month) : [],
    datasets: [
      {
        label: 'Projects Count',
        data: analytics?.projectsByMonth ? analytics.projectsByMonth.map(item => item.count) : [],
        fill: false,
        borderColor: 'rgb(53, 162, 235)',
        tension: 0.1,
        backgroundColor: 'rgba(53, 162, 235, 0.2)',
      },
    ],
  };

  const topServicesData = {
    labels: analytics?.topServices ? analytics.topServices.map(service => service.name) : [],
    datasets: [
      {
        label: 'Projects per Service',
        data: analytics?.topServices ? analytics.topServices.map(service => service.project_count) : [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 205, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 2,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#d1d5db' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false, // Set to false to remove title since we're showing it separately
        color: theme === 'dark' ? '#d1d5db' : '#374151',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: theme === 'dark' ? '#d1d5db' : '#374151',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
      x: {
        ticks: {
          color: theme === 'dark' ? '#d1d5db' : '#374151',
        },
        grid: {
          color: theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  // Pie chart options (without scales)
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === 'dark' ? '#d1d5db' : '#374151',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false, // Set to false to remove title since we're showing it separately
        color: theme === 'dark' ? '#d1d5db' : '#374151',
        font: {
          size: 16,
        },
      },
    },
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 p-4 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                Reports & Analytics
              </h1>
              <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Track your performance and project metrics
              </p>
            </div>
            
            <div className="flex gap-2">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className={`px-4 py-2 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${theme === 'dark'
                  ? 'bg-gray-800/70 border-gray-600 text-white'
                  : 'bg-white/80 border-gray-300 text-gray-900'
                }`}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="quarter">Last 90 Days</option>
                <option value="year">Last Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-blue-500/20 text-blue-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-blue-500/20 text-blue-500">
                +0%
              </div>
            </div>
            <div className="text-3xl font-bold">{stats?.totalProjects ?? 0}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Total Projects
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20 text-green-500">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-500/20 text-green-500">
                +5%
              </div>
            </div>
            <div className="text-3xl font-bold">{stats?.completedProjects ?? 0}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Completed
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20 text-yellow-500">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500">
                +2%
              </div>
            </div>
            <div className="text-3xl font-bold">{stats?.inProgressProjects ?? 0}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              In Progress
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-purple-500/20 text-purple-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <div className="text-xs font-medium px-2 py-1 rounded-full bg-purple-500/20 text-purple-500">
                +10%
              </div>
            </div>
            <div className="text-3xl font-bold">${(stats?.totalAmount ?? 0).toLocaleString()}</div>
            <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
              Total Revenue
            </div>
          </motion.div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Status Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Project Status Distribution
            </h3>
            <div className="h-80">
              {stats && stats.totalProjects > 0 ? <Pie data={projectStatusData} options={pieOptions} /> : <div className="h-full flex items-center justify-center">No data</div>}
            </div>
          </motion.div>

          {/* Monthly Revenue */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Monthly Revenue
            </h3>
            <div className="h-80">
              {analytics?.projectsByMonth?.length > 0 ? <Line data={monthlyRevenueData} options={chartOptions} /> : <div className="h-full flex items-center justify-center">No data</div>}
            </div>
          </motion.div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Project Trend
            </h3>
            <div className="h-80">
              {analytics?.projectsByMonth?.length > 0 ? <Line data={projectTrendData} options={chartOptions} /> : <div className="h-full flex items-center justify-center">No data</div>}
            </div>
          </motion.div>

          {/* Top Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-red-500" />
              Top Services
            </h3>
            <div className="h-80">
              {analytics?.topServices?.length > 0 ? <Bar data={topServicesData} options={chartOptions} /> : <div className="h-full flex items-center justify-center">No data</div>}
            </div>
          </motion.div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Completion Rate
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats?.completionRate ?? 0}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                    style={{ width: `${stats?.completionRate ?? 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Average Progress
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {stats?.averageProgress ?? 0}%
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${stats?.averageProgress ?? 0}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Avg Project Duration
                  </span>
                  <span className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {analytics?.avgProjectDuration ?? 0} days
                  </span>
                </div>
                <div className={`w-full h-2 rounded-full ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                    style={{ width: `${Math.min(analytics?.avgProjectDuration ?? 0, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className={`p-6 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            }`}
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500" />
              Project Timeline
            </h3>
            <div className="space-y-3">
              {(projects || []).slice(0, 5).map((project, index) => (
                <div key={project.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      project.status === 'completed' ? 'bg-green-500' :
                      project.status === 'inProgress' || project.status === 'In Progress' ? 'bg-blue-500' :
                      project.status === 'pending' ? 'bg-yellow-500' :
                      project.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {project.title}
                    </span>
                  </div>
                  <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {(project.progress ?? 0)}%
                  </span>
                </div>
              ))}
                        
              {(projects || []).length === 0 && (
                <div className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No projects found
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className={`p-6 rounded-xl backdrop-blur-sm border ${
            theme === 'dark' ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          }`}
        >
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Recent Projects
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className={`border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className="text-left p-4 font-medium">Project</th>
                  <th className="text-left p-4 font-medium">Client</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Progress</th>
                  <th className="text-left p-4 font-medium">Amount</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(recentProjects || []).slice(0, 5).map((project) => (
                  <tr 
                    key={project.id}
                    className={`border-b ${theme === 'dark' ? 'border-gray-700/50 hover:bg-gray-700/30' : 'border-gray-200/50 hover:bg-gray-50/50'}`}
                  >
                    <td className="p-4">
                      <div className="font-medium">{project.title}</div>
                      <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">{project.client_name || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                        project.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                        project.status === 'inProgress' || project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-500' :
                        project.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                        project.status === 'cancelled' ? 'bg-red-500/20 text-red-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {project.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${project.progress ?? 0}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{(project.progress ?? 0)}%</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium">
                        {project.budget ? `TZS ${Number(project.budget).toLocaleString()}` : 'N/A'}
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
                ))}
                
                {(recentProjects || []).length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8">
                      <div className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No recent projects found
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ControllerReports;