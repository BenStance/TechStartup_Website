import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Eye, EyeOff, Mail, Lock, User, Phone, AlertCircle, 
  CheckCircle, Shield, Sparkles, Sun, Moon, ArrowRight, 
  ArrowLeft, Building, Globe, Key, CreditCard, Smartphone
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  
  const { register } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Password strength checker
  useEffect(() => {
    const calculateStrength = (password) => {
      let strength = 0;
      if (password.length >= 8) strength++;
      if (/[A-Z]/.test(password)) strength++;
      if (/[a-z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^A-Za-z0-9]/.test(password)) strength++;
      return strength;
    };
    
    setPasswordStrength(calculateStrength(formData.password));
  }, [formData.password]);

  // Password strength indicators
  const getStrengthColor = (strength) => {
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = (strength) => {
    if (strength <= 1) return 'Very Weak';
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Fair';
    if (strength <= 4) return 'Strong';
    return 'Very Strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!acceptedTerms) {
      setError('Please accept the terms and conditions');
      setLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Password is too weak. Please use a stronger password.');
      setLoading(false);
      return;
    }

    try {
      // Call your register API
      const response = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName,
        formData.phone
      );

      // After successful registration, redirect to verify OTP page
      navigate('/verify-otp', { 
        state: { 
          email: formData.email,
          message: 'Registration successful. Please check your email for verification.'
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  // Features for registration
  const registrationFeatures = [
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Enterprise Security",
      description: "Bank-level encryption and compliance"
    },
    {
      icon: <Building className="w-5 h-5" />,
      title: "Business Tools",
      description: "All-in-one platform for your business"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Global Access",
      description: "Access from anywhere in the world"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      title: "Flexible Payments",
      description: "Multiple payment options available"
    }
  ];

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Geometric shapes */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/3 right-1/4 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
          theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-200'
        }`}></div>
        
        {/* Angular overlay */}
        <div className="absolute inset-0 angular-overlay opacity-10"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px),
                              linear-gradient(90deg, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300 hover:scale-110"
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
          <Sun className="w-6 h-6 text-amber-300" />
        ) : (
          <Moon className="w-6 h-6 text-indigo-600" />
        )}
      </motion.button>

      {/* Back to Home */}
      <motion.a
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border transition-all"
        style={{
          background: theme === 'dark' 
            ? 'rgba(0, 0, 0, 0.3)' 
            : 'rgba(255, 255, 255, 0.3)',
          borderColor: theme === 'dark' 
            ? 'rgba(75, 85, 99, 0.5)' 
            : 'rgba(209, 213, 219, 0.5)',
        }}
        whileHover={{ x: -5 }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.a>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center justify-center min-h-[90vh] gap-12"
        >
          {/* Left Column - Branding & Info */}
          <motion.div 
            variants={itemVariants}
            className="lg:w-1/2 max-w-2xl text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-8">
              <img 
                src="/src/assets/Logo.jpeg" 
                alt="Origin Technologies" 
                className="h-12 w-auto rounded-lg"
              />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                  Origin Technologies
                </h1>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Join Our Platform</p>
              </div>
            </div>

            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Digital Journey</span>
            </h2>
            
            <p className={`text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Join thousands of businesses that trust Origin Technologies to transform their digital operations. Register as a client today.
            </p>

            {/* Registration Benefits */}
            <div className="mb-10">
              <h3 className={`text-lg font-semibold mb-6 flex items-center justify-center lg:justify-start gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Sparkles className="w-5 h-5" />
                Why Register as a Client?
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {registrationFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex items-start gap-3 p-4 rounded-xl backdrop-blur-sm border ${
                      theme === 'dark'
                        ? 'bg-gray-800/30 border-gray-700'
                        : 'bg-white/50 border-gray-300'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h4 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{feature.title}</h4>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Client Dashboard Preview */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800/20 border-gray-700' 
                : 'bg-white/30 border-gray-300'
            }`}>
              <h4 className={`font-semibold mb-4 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Smartphone className="w-5 h-5" />
                What You'll Get
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  'Project Management Tools',
                  'Real-time Analytics Dashboard',
                  'Secure File Storage',
                  'Team Collaboration',
                  'Client Support Portal',
                  'Custom Reporting'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-blue-500" />
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className={`mt-8 p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700' 
                : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-300'
            }`}>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">50K+</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Active Clients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">99.9%</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Uptime</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-500">24/7</div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Support</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Registration Form */}
          <motion.div 
            variants={itemVariants}
            className="lg:w-1/3 w-full max-w-md"
          >
            <div className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50'
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-300/50'
            }`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Create Account</h2>
                <p className={`mt-2 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Register as a client to access all features
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-red-500/10 border border-red-500/20"
                  >
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className={`text-sm ${theme === 'dark' ? 'text-red-300' : 'text-red-600'}`}>
                      {error}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Fields in Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <User className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } border outline-none`}
                        placeholder="John"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <User className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } border outline-none`}
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } border outline-none`}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Phone className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } border outline-none`}
                      placeholder="+255 123 456 789"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Lock className={`w-5 h-5 ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                      }`} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full pl-12 pr-12 py-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } border outline-none`}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showPassword ? (
                        <EyeOff className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      ) : (
                        <Eye className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {formData.password && (
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-sm font-medium ${
                          passwordStrength <= 2 ? 'text-red-500' :
                          passwordStrength <= 3 ? 'text-yellow-500' :
                          'text-green-500'
                        }`}>
                          {getStrengthText(passwordStrength)}
                        </span>
                        <span className="text-sm opacity-70">
                          {passwordStrength}/5
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-700/20 dark:bg-gray-600/20 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getStrengthColor(passwordStrength)}`}
                          style={{ width: `${(passwordStrength / 5) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className={`flex items-center gap-2 ${
                          formData.password.length >= 8 ? 'text-green-500' : 'opacity-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${formData.password.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>8+ characters</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          /[A-Z]/.test(formData.password) ? 'text-green-500' : 'opacity-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>Uppercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          /[a-z]/.test(formData.password) ? 'text-green-500' : 'opacity-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${/[a-z]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>Lowercase letter</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          /[0-9]/.test(formData.password) ? 'text-green-500' : 'opacity-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>Number</span>
                        </div>
                        <div className={`flex items-center gap-2 ${
                          /[^A-Za-z0-9]/.test(formData.password) ? 'text-green-500' : 'opacity-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                          <span>Special character</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-1 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="terms" className={`text-sm cursor-pointer ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    I agree to the{' '}
                    <a href="/terms" className="text-blue-500 hover:text-blue-400 font-medium">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-blue-500 hover:text-blue-400 font-medium">
                      Privacy Policy
                    </a>
                    . I understand that all registrations are for client accounts.
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading || !acceptedTerms || passwordStrength < 3}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    loading || !acceptedTerms || passwordStrength < 3
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Create Client Account
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Already have account */}
              <div className={`mt-8 pt-6 border-t text-center ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className={`font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className={`mt-6 flex items-center justify-center gap-3 p-4 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800/20 border-gray-700' 
                : 'bg-white/30 border-gray-300'
            }`}>
              <Shield className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-semibold">Secure Registration</span> • Email verification required
              </span>
            </div>

            {/* Next Steps Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className={`mt-6 p-6 rounded-2xl backdrop-blur-sm border ${
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-gray-700' 
                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-gray-300'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-3 flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <Sparkles className="w-5 h-5" />
                What happens next?
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-500">1</span>
                  </div>
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Complete registration with your details
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-purple-500">2</span>
                  </div>
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Verify your email with OTP code
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-500">3</span>
                  </div>
                  <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    Access your client dashboard instantly
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

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
            rgba(59, 130, 246, 0.1) 50%,
            rgba(139, 92, 246, 0.1) 55%,
            transparent 60%
          );
          transform: rotate(0deg);
          animation: rotate 20s linear infinite;
        }
        
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Register;