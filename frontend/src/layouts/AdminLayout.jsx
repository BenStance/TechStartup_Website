import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Bell, Search, User, LogOut, Menu, X,
  Home, Users, Briefcase, ShoppingBag, BarChart as BarChartIcon, Shield, FileText,
  Bell as BellIcon, Clock,  CheckCircle,
  AlertCircle, ChevronRight, ChevronDown, Plus, 
  Server, PieChart as PieChartIcon, Star as StarIcon, Heart, Sparkles,
  Receipt
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import authApi from '../api/auth.api';
import usersApi from '../api/auth.api';
import projectsApi from '../api/projects.api';
import servicesApi from '../api/services.api';
import shopApi from '../api/shop.api';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Search function
  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      // Search across different entities
      const searchResults = [];
      
      // Search users
      try {
        const usersResponse = await usersApi.getAllUsers();
        const userMatches = usersResponse.filter(user => 
          user.firstName.toLowerCase().includes(query.toLowerCase()) ||
          user.lastName.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Limit to 3 results
        
        userMatches.forEach(user => {
          searchResults.push({
            title: `${user.firstName} ${user.lastName}`,
            description: `User - ${user.email}`,
            path: `/admin/users/${user.id}`,
            type: 'user'
          });
        });
      } catch (error) {
        console.error('Error searching users:', error);
      }
      
      // Search projects
      try {
        const projectsResponse = await projectsApi.getAllProjects();
        const projectMatches = projectsResponse.filter(project => 
          project.name.toLowerCase().includes(query.toLowerCase()) ||
          project.description.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Limit to 3 results
        
        projectMatches.forEach(project => {
          searchResults.push({
            title: project.name,
            description: `Project - ${project.description || 'No description'}`,
            path: `/admin/projects/${project.id}`,
            type: 'project'
          });
        });
      } catch (error) {
        console.error('Error searching projects:', error);
      }
      
      // Search services
      try {
        const servicesResponse = await servicesApi.getAllServices();
        const serviceMatches = servicesResponse.filter(service => 
          service.name.toLowerCase().includes(query.toLowerCase()) ||
          service.description.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Limit to 3 results
        
        serviceMatches.forEach(service => {
          searchResults.push({
            title: service.name,
            description: `Service - ${service.description || 'No description'}`,
            path: `/admin/services/${service.id}`,
            type: 'service'
          });
        });
      } catch (error) {
        console.error('Error searching services:', error);
      }
      
      // Search products
      try {
        const productsResponse = await shopApi.getAllProducts();
        const productMatches = productsResponse.filter(product => 
          product.name.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 3); // Limit to 3 results
        
        productMatches.forEach(product => {
          searchResults.push({
            title: product.name,
            description: `Product - ${product.category}`,
            path: `/admin/shop/${product.id}`,
            type: 'product'
          });
        });
      } catch (error) {
        console.error('Error searching products:', error);
      }
      
      setSearchResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle search input change with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      performSearch(searchQuery);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);
  const [scrollY, setScrollY] = useState(0);
  
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Home className="w-5 h-5" />, path: '/admin' },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" />, path: '/admin/users' },
    { id: 'projects', label: 'Projects', icon: <Briefcase className="w-5 h-5" />, path: '/admin/projects' },
    { id: 'services', label: 'Services', icon: <Server className="w-5 h-5" />, path: '/admin/services' },
    { id: 'shop', label: 'Shop', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/shop' },
    // { id: 'selling', label: 'Selling', icon: <ShoppingBag className="w-5 h-5" />, path: '/admin/selling' },
    { id: 'sales-history', label: 'Sales History', icon: <Receipt className="w-5 h-5" />, path: '/admin/selling/history' },
    { id: 'roles', label: 'Roles', icon: <Shield className="w-5 h-5" />, path: '/admin/roles' },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon className="w-5 h-5" />, path: '/admin/notifications' },
  ];

  // Quick actions
  const quickActions = [
    { icon: <Plus className="w-4 h-4" />, label: 'Add User', action: () => navigate('/admin/users/create') },
    { icon: <Plus className="w-4 h-4" />, label: 'New Project', action: () => navigate('/admin/projects/create') },
    { icon: <Plus className="w-4 h-4" />, label: 'Add Service', action: () => navigate('/admin/services/create') },
    { icon: <ShoppingBag className="w-4 h-4" />, label: 'Sell Product', action: () => navigate('/admin/selling') },
    { icon: <Receipt className="w-4 h-4" />, label: 'Sales History', action: () => navigate('/admin/selling/history') },
    { icon: <Plus className="w-4 h-4" />, label: 'New Product', action: () => navigate('/admin/Product/create') },
    { icon: <BellIcon className="w-4 h-4" />, label: 'Send Alert', action: () => navigate('/admin/notifications/create') },
  ];

  // Mock notifications
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New User Registration', message: 'John Doe has registered as a client', time: '5 min ago', type: 'info', unread: true },
    { id: 2, title: 'Project Completed', message: 'Website Redesign project has been completed', time: '1 hour ago', type: 'success', unread: true },
    { id: 3, title: 'Service Update', message: 'Web Development service has been modified', time: '2 hours ago', type: 'warning', unread: false },
    { id: 4, title: 'System Alert', message: 'High traffic detected on server', time: '3 hours ago', type: 'error', unread: false },
    { id: 5, title: 'New Order', message: 'Order #ORD-7890 has been placed', time: '4 hours ago', type: 'info', unread: false },
  ]);
  
  // Count unread notifications
  const unreadNotificationsCount = notifications.filter(n => n.unread).length;

  // Handle logout
  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark notification as read
    setNotifications(prevNotifications => 
      prevNotifications.map(n => 
        n.id === notification.id ? { ...n, unread: false } : n
      )
    );
    setNotificationsOpen(false);
    
    // Navigate to relevant page based on notification type
    if (notification.type === 'info' && notification.title.includes('User')) {
      navigate('/admin/users');
    } else if (notification.title.includes('Project')) {
      navigate('/admin/projects');
    } else if (notification.title.includes('Service')) {
      navigate('/admin/services');
    } else {
      navigate('/admin/notifications');
    }
  };

  // Animation variants
  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <div className={`w-full overflow-x-hidden transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white' 
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-white text-gray-900'
    }`}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Angular Grid Pattern */}
        <div className="absolute inset-0 angular-overlay opacity-10"></div>
        
        {/* Animated angular lines */}
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${
          theme === 'dark' ? 'via-blue-500' : 'via-blue-400'
        } to-transparent animate-pulse`}></div>
        <div className={`absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent ${
          theme === 'dark' ? 'via-purple-500' : 'via-purple-400'
        } to-transparent animate-pulse`}></div>
        
        {/* Floating angular shapes */}
        <motion.div 
          className={`absolute top-20 left-10 w-32 h-32 border-2 ${
            theme === 'dark' ? 'border-blue-400/20' : 'border-blue-500/30'
          } rotate-45`}
          animate={{ 
            rotate: [45, 90, 45],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className={`absolute bottom-20 right-10 w-40 h-40 border-2 ${
            theme === 'dark' ? 'border-purple-400/20' : 'border-purple-500/30'
          } rotate-12`}
          animate={{ 
            rotate: [12, -12, 12],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        {/* Enhanced geometric shapes with theme awareness */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/3 right-1/4 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
          theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'
        }`}></div>
        
        {/* Particle effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${
              theme === 'dark' ? 'bg-blue-400/30' : 'bg-blue-500/30'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Top Navigation Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`sticky top-0 z-50 backdrop-blur-md transition-all duration-300 ${
          scrollY > 50 ? 'shadow-2xl' : ''
        }`}
        style={{
          background: scrollY > 50 
            ? (theme === 'dark' 
                ? 'rgba(17, 24, 39, 0.9)' 
                : 'rgba(255, 255, 255, 0.9)')
            : theme === 'dark'
            ? 'rgba(17, 24, 39, 0.7)'
            : 'rgba(255, 255, 255, 0.7)',
          borderBottom: `1px solid ${
            theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)'
          }`
        }}
      >
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              {/* Mobile menu button */}
              <button
                onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                className={`p-2 rounded-lg md:hidden transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900'
                }`}
              >
                {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo/Brand */}
              <div className="flex items-center ml-4 md:ml-0">
                {/* <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"> */}
                  {/* OT */}
                <img src="/src/assets/Logo.png" alt="Origin Technologies" className="h-10 w-auto rounded-lg" />

                {/* </div> */}
                <div className="ml-3">
                  <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                    Origin Admin
                  </h1>
                  <div className="hidden sm:block text-xs opacity-70">Administration Panel</div>
                </div>
              </div>

              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`ml-6 p-2 rounded-lg hidden lg:block transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                }`} />
                <input
                  type="search"
                  placeholder="Search users, projects, services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    theme === 'dark' 
                      ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400' 
                      : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                  }`}
                />
                
                {/* Search Results Dropdown */}
                {searchQuery && searchResults.length > 0 && (
                  <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto ${
                    theme === 'dark' 
                      ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                      : 'bg-white/95 backdrop-blur-lg border-gray-200'
                  }`}>
                    {searchResults.map((result, index) => (
                      <div 
                        key={index}
                        className={`p-3 border-b cursor-pointer transition-colors last:border-b-0 ${
                          theme === 'dark' 
                            ? 'hover:bg-gray-700/50 border-gray-700/50' 
                            : 'hover:bg-gray-100/50 border-gray-200/50'
                        }`}
                        onClick={() => {
                          // Navigate to the result
                          navigate(result.path);
                          setSearchQuery('');
                        }}
                      >
                        <div className="font-medium text-sm">{result.title}</div>
                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {result.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Loading indicator */}
                {isSearching && (
                  <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 p-4 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                      : 'bg-white/95 backdrop-blur-lg border-gray-200'
                  }`}>
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                  </div>
                )}
                
                {/* No results */}
                {searchQuery && !isSearching && searchResults.length === 0 && (
                  <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 p-4 ${
                    theme === 'dark' 
                      ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                      : 'bg-white/95 backdrop-blur-lg border-gray-200'
                  }`}>
                    <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No results found for "{searchQuery}"
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-3">
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className={`p-2 rounded-lg md:hidden transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100' 
                    : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900'
                }`}
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Theme toggle */}
              <motion.button
                onClick={toggleTheme}
                className="p-2 rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300 hover:scale-110"
                style={{
                  background: theme === 'dark' 
                    ? 'rgba(0, 0, 0, 0.3)' 
                    : 'rgba(255, 255, 255, 0.3)',
                  borderColor: theme === 'dark' 
                    ? 'rgba(75, 85, 99, 0.5)' 
                    : 'rgba(209, 213, 219, 0.5)',
                }}
                aria-label="Toggle theme"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-300" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-600" />
                )}
              </motion.button>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className={`p-2 rounded-lg relative transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700/50 text-gray-300 hover:text-gray-100' 
                      : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </button>

                {/* Notifications dropdown */}
                <AnimatePresence>
                  {notificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className={`absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border z-50 ${
                        theme === 'dark' 
                          ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                          : 'bg-white/95 backdrop-blur-lg border-gray-200'
                      }`}
                    >
                      <div className={`p-4 border-b ${
                        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <h3 className="font-semibold flex items-center gap-2">
                          <BellIcon className="w-4 h-4" />
                          Notifications
                        </h3>
                        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                          {unreadNotificationsCount} unread
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-4 border-b cursor-pointer transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700/50 border-gray-700/50' 
                                : 'hover:bg-gray-100/50 border-gray-200/50'
                            } ${notification.unread ? (
                              theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-50/50'
                            ) : ''}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${
                                notification.type === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white' :
                                notification.type === 'warning' ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-white' :
                                notification.type === 'error' ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white' :
                                'bg-gradient-to-br from-blue-500 to-purple-500 text-white'
                              }`}>
                                {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> :
                                 notification.type === 'warning' ? <AlertCircle className="w-4 h-4" /> :
                                 <Bell className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{notification.title}</h4>
                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mt-1`}>{notification.message}</p>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-2 flex items-center gap-1`}>
                                  <Clock className="w-3 h-3" />
                                  {notification.time}
                                </div>
                              </div>
                              {notification.unread && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 animate-pulse"></div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className={`p-3 border-t ${
                        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => {
                              // Mark all as read
                              setNotifications(prevNotifications => 
                                prevNotifications.map(n => ({ ...n, unread: false }))
                              );
                            }}
                            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white' 
                                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                            }`}
                          >
                            Mark all read
                          </button>
                          <button 
                            onClick={() => navigate('/admin/notifications')}
                            className={`flex-1 py-2 text-sm rounded-lg transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white' 
                                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                            }`}
                          >
                            View all
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className={`flex items-center space-x-3 p-2 rounded-xl transition-colors ${
                    theme === 'dark' 
                      ? 'hover:bg-gray-700/50' 
                      : 'bg-gray-100/50 hover:bg-gray-200/50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                    {user?.firstName?.[0] || 'A'}
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium">{user?.firstName || 'Admin'} {user?.lastName || ''}</div>
                    <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Administrator</div>
                  </div>
                  <ChevronDown className={`w-4 h-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className={`absolute right-0 mt-2 w-48 rounded-2xl shadow-2xl border z-50 ${
                        theme === 'dark' 
                          ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                          : 'bg-white/95 backdrop-blur-lg border-gray-200'
                      }`}
                    >
                      <div className={`p-4 border-b ${
                        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                        <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} truncate`}>{user?.email}</div>
                      </div>
                      <div className={`border-t ${
                        theme === 'dark' ? 'border-gray-700/50' : 'border-gray-200/50'
                      }`}>
                        {[
                          { icon: <User className="w-4 h-4" />, label: 'Profile', action: () => navigate('/admin/profile') },
                          { icon: <LogOut className="w-4 h-4" />, label: 'Logout', action: handleLogout, danger: true }
                        ].map((item, index) => (
                          <button
                            key={index}
                            onClick={item.action}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                              theme === 'dark' 
                                ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white' 
                                : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                            } ${item.danger ? 'text-red-500 hover:text-red-600' : ''}`}
                          >
                            {item.icon}
                            <span>{item.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Mobile search bar */}
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden py-3"
              >
                <div className="relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                  }`} />
                  <input
                    type="search"
                    placeholder="Search users, projects, services..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-xl border backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                      theme === 'dark' 
                        ? 'bg-gray-800/70 border-gray-600 text-white placeholder-gray-400' 
                        : 'bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500'
                    }`}
                  />
                              
                  {/* Search Results Dropdown */}
                  {searchQuery && searchResults.length > 0 && (
                    <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 max-h-96 overflow-y-auto ${
                      theme === 'dark' 
                        ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                        : 'bg-white/95 backdrop-blur-lg border-gray-200'
                    }`}>
                      {searchResults.map((result, index) => (
                        <div 
                          key={index}
                          className={`p-3 border-b cursor-pointer transition-colors last:border-b-0 ${
                            theme === 'dark' 
                              ? 'hover:bg-gray-700/50 border-gray-700/50' 
                              : 'hover:bg-gray-100/50 border-gray-200/50'
                          }`}
                          onClick={() => {
                            // Navigate to the result
                            navigate(result.path);
                            setSearchQuery('');
                          }}
                        >
                          <div className="font-medium text-sm">{result.title}</div>
                          <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.description}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                              
                  {/* Loading indicator */}
                  {isSearching && (
                    <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 p-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                        : 'bg-white/95 backdrop-blur-lg border-gray-200'
                    }`}>
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      </div>
                    </div>
                  )}
                              
                  {/* No results */}
                  {searchQuery && !isSearching && searchResults.length === 0 && (
                    <div className={`absolute top-full left-0 w-full mt-2 rounded-xl shadow-2xl border z-50 p-4 ${
                      theme === 'dark' 
                        ? 'bg-gray-800/95 backdrop-blur-lg border-gray-700' 
                        : 'bg-white/95 backdrop-blur-lg border-gray-200'
                    }`}>
                      <div className={`text-center py-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                        No results found for "{searchQuery}"
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Main Layout */}
      <div className="flex">
        {/* Desktop Sidebar */}
        <motion.aside
          animate={{ width: sidebarOpen ? '16rem' : '5rem' }}
          className={`hidden lg:block transition-all duration-300 overflow-hidden ${
            theme === 'dark' 
              ? 'bg-gray-800/90 backdrop-blur-lg border-r border-gray-700/50' 
              : 'bg-white/90 backdrop-blur-lg border-r border-gray-300/50'
          }`}
        >
          <div className="h-full py-6">
            {/* Navigation */}
            <nav className="space-y-2 px-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all group ${
                    location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : theme === 'dark'
                      ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                      : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <div className="flex-shrink-0">{item.icon}</div>
                  {sidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      className="font-medium text-sm"
                    >
                      {item.label}
                    </motion.span>
                  )}
                  {sidebarOpen && location.pathname !== item.path && (
                    <ChevronRight className={`w-4 h-4 ml-auto ${
                      theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                    } opacity-0 group-hover:opacity-70 group-hover:translate-x-1 transition-all`} />
                  )}
                </button>
              ))}
            </nav>
            {/* Quick actions */}
            {sidebarOpen && (
              <div className="mt-8 px-3">
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 flex items-center gap-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  <Sparkles className="w-3 h-3" />
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      onClick={action.action}
                      whileHover={{ x: 5 }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                        theme === 'dark'
                          ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                          : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
            {/* System status */}
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-8 mx-3 p-4 rounded-xl border backdrop-blur-sm ${
                  theme === 'dark' 
                    ? 'bg-gray-800/50 border-gray-700/50' 
                    : 'bg-gray-50/80 border-gray-300/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>System Status</span>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={`text-xs ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>Online</span>
                  </div>
                </div>
                <div className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Uptime: 99.9%
                </div>
                <div className={`w-full h-1 rounded-full mt-2 overflow-hidden ${
                  theme === 'dark' ? 'bg-gray-700/30' : 'bg-gray-300/50'
                }`}>
                  <div className="w-3/4 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.aside>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {mobileSidebarOpen && (
            <motion.aside
              variants={sidebarVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className={`fixed inset-y-0 left-0 z-40 w-64 lg:hidden ${
                theme === 'dark' 
                  ? 'bg-gray-800/95 backdrop-blur-lg border-r border-gray-700/50' 
                  : 'bg-white/95 backdrop-blur-lg border-r border-gray-300/50'
              }`}
            >
              <div className="h-full py-6">
                <div className="flex items-center justify-between px-4 mb-8">
                  <div className="flex items-center">
                    {/* <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg"> */}
                <img src="/src/assets/Logo.png" alt="Origin Technologies" className="h-10 w-auto rounded-lg" />
                    {/* </div> */}
                    <span className={`ml-3 font-bold ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>Admin Panel</span>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`p-2 rounded-lg transition-colors ${
                      theme === 'dark' ? 'hover:bg-gray-700/50' : 'bg-gray-100/50 hover:bg-gray-200/50'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <nav className="space-y-2 px-3">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        navigate(item.path);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                        location.pathname === item.path
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                          : theme === 'dark'
                          ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                          : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium text-sm">{item.label}</span>
                    </button>
                  ))}
                </nav>
                <div className="mt-8 px-3">
                  <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 px-3 flex items-center gap-2 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          action.action();
                          setMobileSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === 'dark'
                            ? 'hover:bg-gray-700/70 text-gray-300 hover:text-white'
                            : 'bg-gray-100/50 hover:bg-gray-200/80 text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        {action.icon}
                        <span>{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden transition-all duration-300">
          <div className="w-full h-full relative z-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Global backdrop for dropdowns */}
      {(notificationsOpen || profileOpen) && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => {
            setNotificationsOpen(false);
            setProfileOpen(false);
          }}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .angular-overlay::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            45deg,
            transparent 45%,
            ${theme === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'} 50%,
            ${theme === 'dark' ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)'} 55%,
            transparent 60%
          );
          transform: rotate(0deg);
          animation: rotate 20s linear infinite;
          z-index: 1;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;