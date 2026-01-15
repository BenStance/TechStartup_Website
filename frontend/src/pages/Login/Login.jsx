import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LogIn, Eye, EyeOff, Mail, Lock, AlertCircle, 
  Shield, User, Briefcase, Settings, Sparkles,
  Sun, Moon, ArrowRight, CheckCircle
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Get role-based dashboard path
  const getDashboardPath = (role) => {
    switch(role) {
      case 'admin':
        return '/admin';
      case 'controller':
        return '/dashboard/controller';
      case 'client':
      default:
        return '/dashboard/client';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await login(email, password);
      
      // Extract role from response
      const userRole = response?.role || 'client';
      const dashboardPath = getDashboardPath(userRole);
      
      // Navigate to appropriate dashboard
      navigate(dashboardPath);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle social login
  const handleSocialLogin = (provider) => {
    setError(`Social login with ${provider} would be implemented here`);
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
        <ArrowRight className="w-4 h-4 rotate-180" />
        <span className="text-sm font-medium">Back to Home</span>
      </motion.a>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col lg:flex-row items-center justify-center min-h-[90vh] gap-12 w-full"
        >
          {/* Left Column - Branding & Info */}
          <motion.div 
            variants={itemVariants}
            className="lg:w-1/2 w-full max-w-2xl text-center lg:text-left"
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
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Secure Login Portal</p>
              </div>
            </div>

            <h2 className={`text-4xl lg:text-5xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Back</span>
            </h2>
            
            <p className={`text-xl mb-8 max-w-xl mx-auto lg:mx-0 ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              Access your personalized dashboard and continue your journey with our platform.
            </p>

            {/* Features */}
            <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800/20 border-gray-700' 
                : 'bg-white/30 border-gray-300'
            }`}>
              <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Why Choose Origin?</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'Enterprise Security', icon: Shield },
                  { label: 'Real-time Analytics', icon: Briefcase },
                  { label: 'Multi-role Access', icon: User },
                  { label: '24/7 Support', icon: Settings }
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{feature.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Login Form */}
          <motion.div 
            variants={itemVariants}
            className="lg:w-1/3 w-full max-w-md mx-auto lg:mx-0"
          >
            <div className={`p-8 rounded-3xl shadow-2xl transition-all duration-300 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700/50'
                : 'bg-gradient-to-br from-white/90 to-gray-50/90 border border-gray-300/50'
            }`}>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Sign In</h2>
                <p className={`text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  Enter your credentials to continue
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
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
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 focus:ring-offset-0"
                    />
                    <span className={`ml-2 text-sm ${
                      theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Remember me
                    </span>
                  </label>
                  <Link
                    to="/forgot-password"
                    className={`text-sm font-medium transition-colors ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Forgot password?
                  </Link>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                    loading
                      ? 'opacity-70 cursor-not-allowed'
                      : 'hover:shadow-lg'
                  } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Signing In...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </motion.button>
              </form>

              {/* Social Login */}
              <div className="mt-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className={`w-full border-t ${
                      theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                    }`}></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className={`px-4 ${
                      theme === 'dark' ? 'bg-gray-800 text-gray-400' : 'bg-gray-50 text-gray-500'
                    }`}>
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { name: 'Google', color: 'bg-white text-gray-800', icon: 'G' },
                    { name: 'GitHub', color: 'bg-gray-900 text-white', icon: 'GH' },
                    { name: 'Microsoft', color: 'bg-blue-600 text-white', icon: 'M' }
                  ].map((social) => (
                    <motion.button
                      key={social.name}
                      type="button"
                      onClick={() => handleSocialLogin(social.name)}
                      whileHover={{ y: -2 }}
                      className={`py-3 rounded-lg font-medium transition-all ${social.color}`}
                    >
                      {social.icon}
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className={`mt-8 pt-6 border-t text-center ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
              }`}>
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  Don't have an account?{' '}
                  <Link
                    to="/register"
                    className={`font-semibold transition-colors ${
                      theme === 'dark'
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Create account
                  </Link>
                </p>
                <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
                  By signing in, you agree to our{' '}
                  <a href="#" className={`underline ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Terms</a> and{' '}
                  <a href="#" className={`underline ${theme === 'dark' ? 'text-blue-300' : 'text-blue-600'}`}>Privacy Policy</a>
                </p>
              </div>
            </div>

            {/* Security Badge */}
            <div className={`mt-6 flex items-center justify-center gap-3 p-4 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800/20 border-gray-700' 
                : 'bg-white/30 border-gray-300'
            }`}>
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm">
                <span className="font-semibold">Enterprise-grade</span> security
              </span>
            </div>
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

export default Login;