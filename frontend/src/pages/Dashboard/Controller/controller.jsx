import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Briefcase, Users, FileText, Upload, Clock, CheckCircle, 
  AlertCircle, ArrowUpRight, ChevronRight, TrendingUp, 
  Activity, Target, Calendar, Star, Award, Zap,
  Database, Server, Cpu, Globe, Shield, Package, Truck
} from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { projectsApi, dashboardApi } from '../../../api';

const ControllerHome = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAssignedProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingReviews: 0,
    overdueProjects: 0,
    totalProgressUpdates: 0
  });
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        let statsData = {
          totalAssignedProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          pendingReviews: 0,
          overdueProjects: 0,
          totalProgressUpdates: 0
        };
        
        try {
          // Use controller-specific stats API
          const statsResponse = await dashboardApi.getControllerStats();
          if (statsResponse) {
            statsData = {
              totalAssignedProjects: statsResponse.totalAssignedProjects || 0,
              activeProjects: statsResponse.activeProjects || 0,
              completedProjects: statsResponse.completedProjects || 0,
              pendingReviews: statsResponse.pendingReviews || 0,
              overdueProjects: statsResponse.overdueProjects || 0,
              totalProgressUpdates: statsResponse.totalProgressUpdates || 0
            };
          }
        } catch (statsError) {
          console.error('Error fetching dashboard stats:', statsError);
        }
        
        // Process stats data
        setStats(statsData);

        // Fetch projects once to use for multiple purposes
        let allProjects = [];
        
        try {
          // Use controller-specific assigned projects API
          const projectsResponse = await dashboardApi.getControllerAssignedProjects();
          
          if (Array.isArray(projectsResponse)) {
            allProjects = projectsResponse.map(project => ({
              ...project,
              controllerId: project.controller_id || project.controllerId,
              clientId: project.client_id || project.clientId,
              clientName: project.client_name || project.clientName,
              createdAt: project.created_at || project.createdAt,
              updatedAt: project.updated_at || project.updatedAt,
              endDate: project.end_date || project.endDate
            }));
          }
        } catch (projectsError) {
          console.error('Error fetching projects:', projectsError);
        }
        
        // Set assigned projects (first 5 for dashboard)
        const assignedProjectsData = allProjects.slice(0, 5);
        setAssignedProjects(assignedProjectsData);

        // Create quick actions based on permissions
        setQuickActions([
          { 
            icon: <Upload className="w-4 h-4" />, 
            label: 'Upload File', 
            action: () => navigate('/dashboard/controller/uploads'),
            color: 'from-blue-500 to-cyan-500'
          },
          { 
            icon: <FileText className="w-4 h-4" />, 
            label: 'Update Progress', 
            action: () => navigate('/dashboard/controller/projects'),
            color: 'from-purple-500 to-pink-500'
          },
          { 
            icon: <Briefcase className="w-4 h-4" />, 
            label: 'View All Projects', 
            action: () => navigate('/dashboard/controller/projects'),
            color: 'from-emerald-500 to-teal-500'
          }
        ]);

        try {
          // Use controller-specific upcoming deadlines API
          const upcomingDeadlinesResponse = await dashboardApi.getControllerUpcomingDeadlines();
          if (Array.isArray(upcomingDeadlinesResponse)) {
            setUpcomingDeadlines(upcomingDeadlinesResponse);
          }
        } catch (deadlinesError) {
          console.error('Error fetching upcoming deadlines:', deadlinesError);
          // Fallback to original logic if API fails
          const today = new Date();
          const nextWeek = new Date();
          nextWeek.setDate(today.getDate() + 7);
          
          const upcomingDeadlinesData = allProjects
            .filter(project => project.endDate) // Only projects with end dates
            .filter(project => {
              const endDate = new Date(project.endDate);
              return endDate >= today && endDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.endDate) - new Date(b.endDate))
            .slice(0, 3) // Take only first 3 upcoming deadlines
            .map((project, index) => ({
              id: project.id,
              project: project.title,
              date: project.endDate,
              status: new Date(project.endDate).getTime() - today.getTime() < 2 * 24 * 60 * 60 * 1000 ? 'high' : 'medium' // High if within 2 days
            }));
          
          setUpcomingDeadlines(upcomingDeadlinesData);
        }

        try {
          // Use controller-specific recent activities API
          const recentActivitiesResponse = await dashboardApi.getControllerRecentActivities();
          if (Array.isArray(recentActivitiesResponse)) {
            setRecentActivities(recentActivitiesResponse);
          }
        } catch (activitiesError) {
          console.error('Error fetching recent activities:', activitiesError);
          // Fallback to original logic if API fails
          const recentActivitiesData = allProjects
            .sort((a, b) => new Date(b.updatedAt || b.updated_at || b.updatedAt) - new Date(a.updatedAt || a.updated_at || a.updatedAt))
            .slice(0, 3)
            .map((project, index) => {
              // Calculate time difference for display
              const updatedDate = new Date(project.updatedAt || project.updated_at || project.updatedAt);
              const now = new Date();
              const diffHours = Math.round((now - updatedDate) / (1000 * 60 * 60));
              
              let timeString;
              if (diffHours < 1) timeString = 'Just now';
              else if (diffHours < 24) timeString = `${diffHours} hours ago`;
              else {
                const diffDays = Math.round(diffHours / 24);
                timeString = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
              }
              
              // Determine activity type based on project status
              let activityType, action;
              if (project.status?.toLowerCase().includes('complete')) {
                activityType = 'review';
                action = `Completed project: ${project.title}`;
              } else if (project.progress > 75) {
                activityType = 'progress';
                action = `Updated progress on: ${project.title} (${project.progress}%)`;
              } else {
                activityType = 'upload';
                action = `Updated project: ${project.title}`;
              }
              
              return {
                id: project.id,
                action,
                time: timeString,
                type: activityType
              };
            });
          
          setRecentActivities(recentActivitiesData);
        }

      } catch (error) {
        console.error('Error fetching controller dashboard data:', error);
        // Set default values
        setStats({
          totalAssignedProjects: 0,
          activeProjects: 0,
          completedProjects: 0,
          pendingReviews: 0,
          overdueProjects: 0,
          totalProgressUpdates: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.id, navigate]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500/20' };
      case 'inprogress':
      case 'development':
        return { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20' };
      case 'pending':
        return { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/20' };
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

  const statCards = [
    {
      title: 'Assigned Projects',
      value: stats.totalAssignedProjects,
      change: '+2 this week',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      detail: `${stats.activeProjects} currently active`
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      change: `${stats.overdueProjects} overdue`,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      detail: 'Require attention'
    },
    {
      title: 'Completed',
      value: stats.completedProjects,
      change: '+23% this month',
      icon: <CheckCircle className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      detail: 'Delivered successfully'
    },
    {
      title: 'Pending Reviews',
      value: stats.pendingReviews,
      change: 'Action required',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      detail: 'Awaiting client feedback'
    }
  ];

  const statCardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 }
    })
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading Controller Dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-8 ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800/50 to-gray-900/50 border border-gray-700/50'
            : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-gray-200/50'
        } backdrop-blur-sm`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">Project Control Center</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.firstName || 'Controller'}. Here's an overview of your assigned projects.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Ready for project updates</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last activity: Today</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/dashboard/controller/projects')}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Briefcase className="w-4 h-4" />
              View All Projects
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={statCardVariants}
            className={`group p-6 rounded-2xl border backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer ${
              theme === 'dark'
                ? 'bg-gray-800/30 border-gray-700 hover:border-blue-500/50'
                : 'bg-white/50 border-gray-200 hover:border-blue-300'
            }`}
            onClick={() => stat.title.includes('Projects') && navigate('/dashboard/controller/projects')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <span className={stat.title.includes('overdue') ? 'text-red-500' : 'text-green-500'}>
                  {stat.change}
                </span>
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="font-medium">{stat.title}</div>
            <div className={`text-sm mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {stat.detail}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700/30 dark:border-gray-700/30 flex items-center justify-between">
              <span className="text-sm opacity-70">View details</span>
              <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assigned Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`lg:col-span-2 p-6 rounded-2xl border backdrop-blur-sm ${
            theme === 'dark'
              ? 'bg-gray-800/30 border-gray-700'
              : 'bg-white/50 border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Your Assigned Projects</h3>
            <button 
              onClick={() => navigate('/dashboard/controller/projects')}
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700/50' 
                  : 'text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200'
              }`}
            >
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-4">
            {assignedProjects.length > 0 ? (
              assignedProjects.map((project) => {
                const statusColors = getStatusColor(project.status);
                return (
                  <div 
                    key={project.id}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${statusColors.bg} ${statusColors.border} border`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{project.title}</div>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Client: {project.clientName} • Created: {formatDate(project.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{project.progress}%</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Progress
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {project.status}
                      </span>
                      
                      <button
                        onClick={() => navigate(`/dashboard/controller/projects/${project.id}`)}
                        className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
                theme === 'dark' 
                  ? 'text-blue-400 hover:text-white-300 hover:bg-gray-700/50' 
                  : 'text-blue-600 hover:text-white-800 bg-gray-100 hover:bg-gray-200'
              }`}
                        title="View Project"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                  <Briefcase className="w-12 h-12 opacity-50" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Projects Assigned</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  You haven't been assigned any projects yet.
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions & Upcoming Deadlines */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-2xl border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-gray-800/30 to-gray-900/30 border-gray-700'
                : 'bg-gradient-to-b from-blue-50/50 to-purple-50/50 border-gray-200'
            }`}
          >
            <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
            <div className="space-y-4">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  onClick={action.action}
                  whileHover={{ x: 5 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                theme === 'dark' 
                  ? 'text-white-400 hover:text-white-300 hover:bg-gray-700/50' 
                  : 'text-white-600 hover:text-white-800 bg-gray-100 hover:bg-gray-200'
              }`}
                >
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${action.color} text-white`}>
                    {action.icon}
                  </div>
                  <span className="font-medium">{action.label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-2xl border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-gray-800/30 border-gray-700'
                : 'bg-white/50 border-gray-200'
            }`}
          >
            <h3 className="text-xl font-semibold mb-6">Upcoming Deadlines</h3>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div 
                  key={deadline.id}
                  className={`p-4 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{deadline.project}</div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      deadline.status === 'high' ? 'bg-red-500/20 text-red-500' :
                      deadline.status === 'medium' ? 'bg-amber-500/20 text-amber-500' :
                      'bg-green-500/20 text-green-500'
                    }`}>
                      {deadline.status}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-70" />
                    <span className="text-sm opacity-70">
                      Due: {formatDate(deadline.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700'
            : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">Your Performance</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Current month metrics
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">Excellent Performance</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'On-time Delivery', value: '98%', color: 'text-green-500', status: 'Excellent' },
            { label: 'Client Satisfaction', value: '4.7/5', color: 'text-emerald-500', status: 'High' },
            { label: 'Project Quality', value: '95%', color: 'text-blue-500', status: 'Good' },
            { label: 'Team Collaboration', value: '92%', color: 'text-purple-500', status: 'Strong' },
          ].map((metric, index) => (
            <div key={index} className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{metric.label}</span>
                <span className={`text-sm font-medium ${metric.color}`}>{metric.status}</span>
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="w-full h-2 bg-gray-700/30 dark:bg-gray-600/30 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${metric.color.replace('text-', 'bg-')}`}
                  style={{ width: metric.value.includes('%') ? metric.value : '90%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ControllerHome;