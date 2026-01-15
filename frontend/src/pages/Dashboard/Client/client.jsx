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
import dashboardApi from '../../../api/dashboard.api';

const ClientDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    completedProjects: 0,
    inProgressProjects: 0,
    pendingProjects: 0,
    lastProjectProgress: 0,
    lastProjectTitle: '',
    totalNotifications: 0,
    unreadNotifications: 0,
    recentActivity: [],
    upcomingDeadlines: [],
    projectProgressSummary: []
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Get client dashboard stats
        const clientStats = await dashboardApi.getClientStats();
        
        // Process stats data
        setStats(clientStats);
        
        // Set recent activities from the response
        setRecentActivities(clientStats.recentActivity || []);
        
        // Set upcoming deadlines from the response
        setUpcomingDeadlines(clientStats.upcomingDeadlines || []);
        
        // Create quick actions
        setQuickActions([
          { 
            icon: <Upload className="w-4 h-4" />, 
            label: 'Upload Requirement', 
            action: () => navigate('/dashboard/client/uploads'),
            color: 'from-blue-500 to-cyan-500'
          },
          { 
            icon: <FileText className="w-4 h-4" />, 
            label: 'View Projects', 
            action: () => navigate('/dashboard/client/projects'),
            color: 'from-purple-500 to-pink-500'
          },
          { 
            icon: <Briefcase className="w-4 h-4" />, 
            label: 'Create Project', 
            action: () => navigate('/dashboard/client/projects/create'),
            color: 'from-emerald-500 to-teal-500'
          }
        ]);
        
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set default values on error
        setStats({
          totalProjects: 0,
          completedProjects: 0,
          inProgressProjects: 0,
          pendingProjects: 0,
          lastProjectProgress: 0,
          lastProjectTitle: '',
          totalNotifications: 0,
          unreadNotifications: 0,
          recentActivity: [],
          upcomingDeadlines: [],
          projectProgressSummary: []
        });
        setRecentActivities([]);
        setUpcomingDeadlines([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
    
    // Refresh data every 5 minutes
    const interval = setInterval(loadDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user]);

  // Animation variants
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
      <div className="flex items-center justify-center h-screen flex-1">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Loading Client Dashboard...
          </p>
        </div>
      </div>
    );
  }

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
      title: 'Total Projects',
      value: stats.totalProjects,
      change: '+2 this week',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      detail: `${stats.inProgressProjects} currently in progress`
    },
    {
      title: 'In Progress',
      value: stats.inProgressProjects,
      change: `${stats.pendingProjects} pending`,
      icon: <Activity className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      detail: 'Requires attention'
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
      title: 'Unread Notifications',
      value: stats.unreadNotifications,
      change: 'Action required',
      icon: <AlertCircle className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      detail: 'Check your notifications'
    }
  ];

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
            <h1 className="text-3xl font-bold">Client Dashboard</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Welcome back, {user?.firstName || 'Client'}. Here's an overview of your projects and activities.
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
              onClick={() => navigate('/dashboard/client/projects')}
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
            onClick={() => stat.title.includes('Projects') && navigate('/dashboard/client/projects')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <span className={stat.title.includes('pending') ? 'text-red-500' : 'text-green-500'}>
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
        {/* Recent Projects */}
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
            <h3 className="text-xl font-semibold">Your Projects</h3>
            <button 
              onClick={() => navigate('/dashboard/client/projects')}
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
            {recentActivities.length > 0 ? (
              recentActivities.slice(0, 5).map((activity, index) => {
                const status = activity.message.includes('updated') ? 'inprogress' : 'pending';
                const statusColors = getStatusColor(status);
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl flex items-center justify-between ${
                      theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${statusColors.bg} ${statusColors.border} border`}>
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">{activity.title}</div>
                        <div className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {activity.message} • {formatDate(activity.created_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-semibold">{activity.is_read ? 'Read' : 'New'}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          Status
                        </div>
                      </div>
                      
                      <span className={`px-3 py-1.5 rounded-full text-sm font-medium border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}>
                        {status}
                      </span>
                      
                      <button
                        onClick={() => navigate('/dashboard/client/projects')}
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
                <h3 className="text-xl font-semibold mb-2">No Recent Activities</h3>
                <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  You don't have any recent project activities yet.
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
              {upcomingDeadlines.length > 0 ? (
                upcomingDeadlines.map((deadline, index) => (
                  <div 
                    key={index}
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
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="inline-block p-6 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 mb-4">
                    <Calendar className="w-12 h-12 opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">No Upcoming Deadlines</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    You don't have any upcoming project deadlines.
                  </p>
                </div>
              )}
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
            <h3 className="text-xl font-semibold">Project Overview</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Current project status breakdown
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">All projects active</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Projects', value: stats.totalProjects, color: 'text-blue-500', status: 'Active' },
            { label: 'Completed', value: stats.completedProjects, color: 'text-emerald-500', status: 'Finished' },
            { label: 'In Progress', value: stats.inProgressProjects, color: 'text-purple-500', status: 'Ongoing' },
            { label: 'Pending', value: stats.pendingProjects, color: 'text-amber-500', status: 'Waiting' },
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
                  style={{ width: metric.value > 0 ? '100%' : '0%' }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ClientDashboard;