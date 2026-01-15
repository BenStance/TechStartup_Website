import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, Users, Briefcase, DollarSign, Calendar, ArrowUpRight,
  CheckCircle, AlertCircle, Clock, BarChart as BarChartIcon, PieChart as PieChartIcon,
  Rocket, Shield, Database, Server, Zap, Activity, Globe,
  Star, Award, Target, Heart, ChevronRight, Download, Filter
} from 'lucide-react';
import { 
  LineChart, Line, BarChart as RechartsBarChart, Bar, PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { dashboardApi, notificationsApi } from '../../../api';

const AdminHome = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalClients: 0,
    totalControllers: 0,
    totalServices: 0,
    totalRevenue: 0,
    pendingProjects: 0,
    inProgressProjects: 0,
    completedProjects: 0,
    cancelledProjects: 0
  });
  const [projectStatusData, setProjectStatusData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const { theme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard stats
        console.log('Fetching dashboard stats...');
        const statsResponse = await dashboardApi.getStats();
        console.log('Stats response:', statsResponse);
        
        // Check if the response is wrapped in 'data' property
        const actualStatsData = statsResponse.data || statsResponse;
        console.log('Actual stats data:', actualStatsData);
        
        // Process stats data to match frontend expectations
        const processedStats = {
          totalProjects: actualStatsData.totalProjects || 0,
          totalClients: actualStatsData.totalClients || 0,
          totalControllers: actualStatsData.totalControllers || 0,
          totalServices: actualStatsData.totalServices || 0,
          totalRevenue: actualStatsData.totalRevenue || 0,
          pendingProjects: actualStatsData.projectStatusBreakdown?.find(s =>
            ['pending'].includes(s.status)
          )?.count || 0,
          inProgressProjects: actualStatsData.projectStatusBreakdown?.find(s =>
            ['in_progress', 'in-progress', 'In Progress'].includes(s.status)
          )?.count || 0,
          completedProjects: actualStatsData.projectStatusBreakdown?.find(s =>
            ['completed'].includes(s.status)
          )?.count || 0,
          cancelledProjects: actualStatsData.projectStatusBreakdown?.find(s =>
            ['cancelled', 'canceled'].includes(s.status)
          )?.count || 0
        };
        
        console.log('Processed stats:', processedStats);
        setStats(processedStats);
        
        // Fetch analytics data for charts
        console.log('Fetching analytics data...');
        const analyticsResponse = await dashboardApi.getAnalytics();
        console.log('Analytics response:', analyticsResponse);
        
        // Check if the response is wrapped in 'data' property
        const actualAnalyticsData = analyticsResponse.data || analyticsResponse;
        console.log('Actual analytics data:', actualAnalyticsData);
        
        // Process project status data for pie chart
        const statusData = [
          { name: 'Pending', value: processedStats.pendingProjects, color: '#f59e0b' },
          { name: 'In Progress', value: processedStats.inProgressProjects, color: '#3b82f6' },
          { name: 'Completed', value: processedStats.completedProjects, color: '#10b981' },
          { name: 'Cancelled', value: processedStats.cancelledProjects, color: '#ef4444' }
        ];
        
        // Safe fallback for pie chart
        const finalStatusData = statusData.some(s => s.value > 0)
          ? statusData
          : [{ name: 'No Data', value: 1, color: '#9ca3af' }];
        
        console.log('Status data for pie chart:', finalStatusData);
        setProjectStatusData(finalStatusData);
        
        // Process revenue data for line chart
        // Note: Revenue data would need to be calculated based on project data
        // For now, we'll create mock data based on project counts
        const monthlyData = Array.isArray(actualAnalyticsData.projectsByMonth) && actualAnalyticsData.projectsByMonth
          ? actualAnalyticsData.projectsByMonth.map(item => ({
              month: item.month || '',
              revenue: item.revenue || 0, // Use actual revenue from database
              projects: item.count || 0
            }))
          : [];
        
        // Safe fallback for line chart
        const finalMonthlyData = monthlyData.length 
          ? monthlyData 
          : [{ month: 'N/A', revenue: 0, projects: 0 }];
        
        console.log('Monthly data for line chart:', finalMonthlyData);
        setRevenueData(finalMonthlyData);
        
        // Fetch recent notifications for activity feed
        console.log('Fetching recent notifications...');
        const recentNotificationsResponse = await notificationsApi.getMyNotifications();
        console.log('Recent notifications response:', recentNotificationsResponse);
        
        // Process recent activities from notifications
        const activities = Array.isArray(recentNotificationsResponse) 
          ? recentNotificationsResponse.slice(0, 6).map((notification, index) => ({
              id: notification.id || index,
              user: notification.title || 'Notification',
              action: notification.message || 'No message',
              time: notification.createdAt ? new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now',
              type: notification.type || 'general'
            }))
          : [];
        console.log('Activities for feed:', activities);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values to prevent UI crashes
        setStats({
          totalProjects: 0,
          totalClients: 0,
          totalControllers: 0,
          totalServices: 0,
          totalRevenue: 0,
          pendingProjects: 0,
          inProgressProjects: 0,
          completedProjects: 0,
          cancelledProjects: 0
        });
        setProjectStatusData([]);
        setRevenueData([]);
        setRecentActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Remove mock data as we're now using real API data

  const statCards = [
    {
      title: 'Total Projects',
      value: stats.totalProjects,
      change: '+12%',
      icon: <Briefcase className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
      detail: `${stats.inProgressProjects} in progress`
    },
    {
      title: 'Active Users',
      value: stats.totalClients + stats.totalControllers + 1, // +1 for admin
      change: '+8%',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-500 to-pink-500',
      detail: `${stats.totalClients} clients, ${stats.totalControllers} controllers`
    },
    {
      title: 'Total Revenue',
      value: `$ ${stats.totalRevenue?.toLocaleString() || '0'}`,
      change: '+23%',
      icon: <DollarSign className="w-6 h-6" />,
      color: 'from-emerald-500 to-teal-500',
      detail: `From ${stats.totalProjects} projects`
    },
    {
      title: 'System Uptime',
      value: '99.9%',
      change: '+0.1%',
      icon: <Activity className="w-6 h-6" />,
      color: 'from-amber-500 to-orange-500',
      detail: 'Last 30 days'
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
            Loading Dashboard...
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
            <h1 className="text-3xl font-bold">Welcome back, Admin</h1>
            <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Here's what's happening with your platform today.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">All systems operational</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Last updated: Just now</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium flex items-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Download className="w-4 h-4" />
              Export Report
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
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <div className={`text-sm font-medium px-3 py-1 rounded-full ${
                theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
              }`}>
                <span className="text-green-500">{stat.change}</span>
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

      {/* Charts and Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Revenue Overview</h3>
              <p className="text-sm opacity-70">Monthly revenue and project count</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-xs">Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span className="text-xs">Projects</span>
              </div>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} 
                />
                <XAxis 
                  dataKey="month" 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                />
                <YAxis 
                  stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} 
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Distribution */}
        <div className={`p-6 rounded-xl border ${
          theme === 'dark'
            ? 'bg-gray-800/50 border-gray-700'
            : 'bg-white border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold">Project Status</h3>
              <p className="text-sm opacity-70">Distribution of project statuses</p>
            </div>
            <div className="text-3xl font-bold text-green-500">
              {stats.completedProjects}
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} projects`, 'Count']}
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff',
                    borderColor: theme === 'dark' ? '#374151' : '#e5e7eb',
                    color: theme === 'dark' ? '#f3f4f6' : '#111827'
                  }}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
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
            <h3 className="text-xl font-semibold">Recent Activity</h3>
            <button 
              className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-colors ${
              theme === 'dark' 
                ? 'text-blue-400 hover:text-blue-300 hover:bg-gray-700/50' 
                : 'text-blue-600 hover:text-blue-800 bg-gray-100 hover:bg-gray-200'
            }`}
              onClick={() => navigate('/admin/notifications')}>
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? (
              recentActivities.map((activity) => (
                <div 
                  key={activity.id}
                  className={`p-4 rounded-xl flex items-center gap-4 ${
                    theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-50/50'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${
                    activity.type === 'project' ? 'bg-blue-500/20 text-blue-500' :
                    activity.type === 'service' ? 'bg-purple-500/20 text-purple-500' :
                    activity.type === 'user' ? 'bg-green-500/20 text-green-500' :
                    'bg-amber-500/20 text-amber-500'
                  }`}>
                    {activity.type === 'project' ? <Briefcase className="w-4 h-4" /> :
                     activity.type === 'service' ? <Server className="w-4 h-4" /> :
                     activity.type === 'user' ? <Users className="w-4 h-4" /> :
                     <Database className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{activity.user}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      {activity.action}
                    </div>
                  </div>
                  <div className="text-sm opacity-70 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {activity.time}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  No recent activities found
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Stats */}
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
          <h3 className="text-xl font-semibold mb-6">Quick Stats</h3>
          <div className="space-y-6">
            {[
              { label: 'Avg. Project Duration', value: '45 days', icon: <Calendar className="w-5 h-5" /> },
              { label: 'Client Satisfaction', value: '4.8/5.0', icon: <Star className="w-5 h-5" /> },
              { label: 'Support Tickets', value: '12 open', icon: <AlertCircle className="w-5 h-5" /> },
              { label: 'Server Load', value: '42%', icon: <Activity className="w-5 h-5" /> },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'
                  }`}>
                    {item.icon}
                  </div>
                  <span>{item.label}</span>
                </div>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
          <div className={`mt-8 pt-6 border-t ${
            theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">99.9%</div>
              <div className="text-sm opacity-70">System Uptime</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* System Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-6 rounded-2xl border backdrop-blur-sm ${
          theme === 'dark'
            ? 'bg-gradient-to-r from-gray-800/30 to-gray-900/30 border-gray-700'
            : 'bg-gradient-to-r from-blue-50/50 to-purple-50/50 border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold">System Health</h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Real-time system monitoring
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm">All Systems Normal</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Database', status: 'Healthy', value: '98%', color: 'text-green-500' },
            { label: 'API Server', status: 'Optimal', value: '99%', color: 'text-green-500' },
            { label: 'Cache', status: 'Good', value: '92%', color: 'text-amber-500' },
            { label: 'Storage', status: 'Healthy', value: '85%', color: 'text-blue-500' },
          ].map((system, index) => (
            <div key={index} className={`p-4 rounded-xl ${
              theme === 'dark' ? 'bg-gray-800/30' : 'bg-white/50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{system.label}</span>
                <span className={`text-sm font-medium ${system.color}`}>{system.status}</span>
              </div>
              <div className="text-2xl font-bold">{system.value}</div>
              <div className="w-full h-2 bg-gray-700/30 dark:bg-gray-600/30 rounded-full mt-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${system.color.replace('text-', 'bg-')}`}
                  style={{ width: system.value }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AdminHome;