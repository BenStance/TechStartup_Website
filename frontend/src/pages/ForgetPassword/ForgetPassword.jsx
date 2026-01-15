import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Key, Lock, AlertCircle, CheckCircle, Shield, ArrowRight, 
  Sun, Moon, ArrowLeft
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const ForgetPassword = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Reset
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

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

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          setStep(2); // Move to next step
        }, 2000);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
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
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blur-soft-light filter blur-3xl opacity-20 animate-blob ${
          theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/3 right-1/4 w-72 h-72 rounded-full mix-blur-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${
          theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
        }`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full mix-blur-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${
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
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  {step === 1 ? 'Forgot Password?' : 'Reset Your Password'}
                </h2>
                <p className={`mt-2 text-base ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                  {step === 1 
                    ? 'Enter your email to receive an OTP' 
                    : 'Enter the OTP and your new password'}
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
              
              {success && (
                <div className="flex items-center gap-3 p-4 mb-6 rounded-lg bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className={`text-sm ${theme === 'dark' ? 'text-green-300' : 'text-green-600'}`}>
                    {step === 1 
                      ? 'OTP sent successfully! Redirecting...' 
                      : 'Password reset successfully! Redirecting to login...'}
                  </span>
                </div>
              )}

              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-6">
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
                  
                  <motion.button
                    type="submit"
                    disabled={loading || success}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      (loading || success)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:shadow-lg'
                    } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending OTP...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Send OTP
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </motion.button>
                </form>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
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
                        readOnly
                        className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                            : 'bg-white/80 border-gray-300 text-gray-900'
                        } border outline-none opacity-70`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Verification Code
                    </label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl transition-all ${
                        theme === 'dark'
                          ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                          : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                      } border outline-none`}
                      placeholder="Enter 6-digit code"
                      required
                      maxLength={6}
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Lock className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } border outline-none`}
                        placeholder="Enter new password"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                        <Lock className={`w-5 h-5 ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-4 py-3 rounded-xl transition-all ${
                          theme === 'dark'
                            ? 'bg-gray-800/50 border-gray-700 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                            : 'bg-white/80 border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                        } border outline-none`}
                        placeholder="Confirm new password"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={loading || success}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                      (loading || success)
                        ? 'opacity-70 cursor-not-allowed'
                        : 'hover:shadow-lg'
                    } bg-gradient-to-r from-blue-600 to-purple-600 text-white`}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Resetting Password...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Reset Password
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </motion.button>
                </form>
              )}

              {step === 2 && (
                <div className={`mt-6 pt-6 border-t text-center ${
                  theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                }`}>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    Want to go back?{' '}
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className={`font-semibold transition-colors ${
                        theme === 'dark'
                          ? 'text-blue-400 hover:text-blue-300'
                          : 'text-blue-600 hover:text-blue-800'
                      }`}
                    >
                      Back to Email
                    </button>
                  </p>
                </div>
              )}
            </div>

            {/* Security Badge */}
            <div className={`mt-6 flex items-center justify-center gap-3 p-4 rounded-xl backdrop-blur-sm border ${
              theme === 'dark' 
                ? 'bg-gray-800/20 border-gray-700' 
                : 'bg-white/30 border-gray-300'
            }`}>
              <Shield className="w-5 h-5 text-blue-500" />
              <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                <span className="font-semibold">Secure Process</span> • Your account is protected
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

export default ForgetPassword;