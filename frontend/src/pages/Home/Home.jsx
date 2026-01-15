import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, CheckCircle, ArrowRight, Shield, Zap, Globe, Pause, Sun, Moon,
  Users, BarChart, Code, Cloud, Lock, Smartphone, Database, Rocket,
  Sparkles, Award, TrendingUp, Globe2, ShieldCheck, Zap as ZapIcon,
  ArrowUpRight, Menu, X, Star, ChevronRight, CreditCard, Image, ShoppingCart, Clock, Calendar
} from 'lucide-react';
import './Home.css';
import { useTheme } from '../../context/ThemeContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { Fade, Zoom, Slide } from 'react-awesome-reveal';


// Add this component before your Home component
// Replace your CountUp component with this simpler version:
const CountUp = ({ end, suffix = '', duration = 2 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          let start = 0;
          const increment = end / (duration * 60); // 60fps
          
          const updateCount = () => {
            start += increment;
            if (start < end) {
              setCount(Math.ceil(start));
              animationRef.current = requestAnimationFrame(updateCount);
            } else {
              setCount(end);
            }
          };
          
          animationRef.current = requestAnimationFrame(updateCount);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [end, duration, isVisible]);

  return (
    <span ref={countRef}>
      {isVisible ? count.toLocaleString() + suffix : '0' + suffix}
    </span>
  );
};

const Home = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeVideo, setActiveVideo] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const videoRef = useRef(null);
  const mainRef = useRef(null);

  // Inside your Home component, after state declarations
useEffect(() => {
  // Initialize AOS
  AOS.init({
    duration: 1000,
    once: false, // Whether animation should happen only once
    offset: 100, // Offset (in px) from the original trigger point
    delay: 200, // Delay between animations
  });
  
  // Refresh AOS on route changes
  return () => {
    AOS.refresh();
  };
}, []);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // // Background images for carousel
  // const backgroundImages = [
  //   '/src/assets/WhatsApp Image 2025-12-02 at 10.54.49.jpeg',
  //   '/src/assets/WhatsApp Image 2025-12-02 at 10.55.02.jpeg',
  //   '/src/assets/Services.jpeg'
  // ];

  // Video assets
  const videoAssets = [
    '/src/assets/Video01.mp4'];

  // Auto-rotate background images
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentSlide((prev) => (prev + 1) % backgroundImages.length);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle video play/pause
  const toggleVideo = () => {
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  // Add these state variables
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Gallery data - replace with your actual images
  const galleryItems = [
    {
      id: 1,
      title: "E-Commerce Platform Redesign",
      description: "Complete overhaul of user experience resulting in 240% increase in conversions",
      image: "/src/assets/WhatsApp Image 2025-12-02 at 10.54.49.jpeg",
      tags: ["Web Design", "UI/UX", "E-commerce"],
      date: "Dec 2024",
      readTime: 5,
      caseStudyUrl: "#"
    },
    {
      id: 2,
      title: "Mobile Banking Application",
      description: "Secure fintech solution with biometric authentication and real-time analytics",
      image: "/src/assets/WhatsApp Image 2025-12-02 at 10.55.02.jpeg",
      tags: ["Mobile Apps", "FinTech", "Security"],
      date: "Nov 2024",
      readTime: 4,
      caseStudyUrl: "#"
    },
    {
      id: 3,
      title: "Corporate Branding System",
      description: "Comprehensive brand identity for global enterprise across all touchpoints",
      image: "/src/assets/Services.jpeg",
      tags: ["Branding", "Design System", "Corporate"],
      date: "Oct 2024",
      readTime: 6,
      caseStudyUrl: "#"
    },
    {
      id: 4,
      title: "AI-Powered Dashboard",
      description: "Real-time analytics dashboard with predictive insights and automated reporting",
      image: "/src/assets/Logo.jpeg",
      tags: ["Dashboard", "AI", "Analytics"],
      date: "Sep 2024",
      readTime: 3,
      caseStudyUrl: "#"
    },
    {
      id: 5,
      title: "Healthcare Management System",
      description: "Secure patient data management with HIPAA compliance and telemedicine integration",
      image: "/src/assets/WhatsApp Image 2025-12-02 at 10.54.50 (1).jpeg",
      tags: ["Healthcare", "Security", "SaaS"],
      date: "Aug 2024",
      readTime: 7,
      caseStudyUrl: "#"
    },
    {
      id: 6,
      title: "Education Technology Platform",
      description: "Interactive learning platform with AI tutor and progress tracking",
      image: "/src/assets/WhatsApp Image 2025-12-02 at 10.54.51 (2).jpeg",
      tags: ["EdTech", "AI", "Learning"],
      date: "Jul 2024",
      readTime: 4,
      caseStudyUrl: "#"
    }
  ];

  // Navigation functions
  const nextGalleryItem = () => {
    setCurrentGalleryIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevGalleryItem = () => {
    setCurrentGalleryIndex((prev) => (prev - 1 + galleryItems.length) % galleryItems.length);
  };

  // Auto-play effect for gallery
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        nextGalleryItem();
      }, 4000); // Change image every 4 seconds
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Enhanced features array
  const features = [
    {
      icon: <ShieldCheck className="w-10 h-10" />,
      title: "Military-Grade Security",
      description: "End-to-end encryption, multi-factor authentication, and compliance with global security standards including GDPR & ISO 27001.",
      gradient: "from-emerald-500 to-cyan-500",
      stats: "99.99% uptime"
    },
    {
      icon: <ZapIcon className="w-10 h-10" />,
      title: "AI-Powered Analytics",
      description: "Real-time insights with machine learning algorithms that predict trends and automate decision-making processes.",
      gradient: "from-violet-500 to-purple-500",
      stats: "10x faster insights"
    },
    {
      icon: <Globe2 className="w-10 h-10" />,
      title: "Global Infrastructure",
      description: "Deployed across 12 regions worldwide with edge computing capabilities for lightning-fast performance anywhere.",
      gradient: "from-blue-500 to-sky-500",
      stats: "12 global regions"
    },
    {
      icon: <Database className="w-10 h-10" />,
      title: "Unified Database",
      description: "Seamless integration with all major databases and APIs. Sync data in real-time across all platforms.",
      gradient: "from-orange-500 to-red-500",
      stats: "50+ integrations"
    },
    {
      icon: <Smartphone className="w-10 h-10" />,
      title: "Cross-Platform",
      description: "Fully responsive design with native mobile apps for iOS and Android. Work seamlessly across all devices.",
      gradient: "from-pink-500 to-rose-500",
      stats: "5 device sync"
    },
    {
      icon: <Rocket className="w-10 h-10" />,
      title: "Auto-Scaling",
      description: "Automatically scales infrastructure based on demand. Pay only for what you use with our flexible pricing.",
      gradient: "from-amber-500 to-yellow-500",
      stats: "Zero downtime scaling"
    }
  ];

  // Enhanced stats with icons
  const stats = [
    { value: "50K+", label: "Active Users", icon: <Users className="w-6 h-6" />, color: "text-blue-400" },
    { value: "99.99%", label: "Uptime SLA", icon: <TrendingUp className="w-6 h-6" />, color: "text-emerald-400" },
    { value: "24/7", label: "Priority Support", icon: <Award className="w-6 h-6" />, color: "text-amber-400" },
    { value: "200+", label: "Countries", icon: <Globe className="w-6 h-6" />, color: "text-purple-400" },
    { value: "50M", label: "Avg Response", icon: <Zap className="w-6 h-6" />, color: "text-red-400" },
    { value: "5", label: "Certified", icon: <Shield className="w-6 h-6" />, color: "text-cyan-400" }
  ];

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Chen",
      role: "CTO at TechCorp",
      content: "Origin Technologies transformed our workflow completely. The AI analytics alone saved us 40 hours of manual work weekly.",
      rating: 5,
      company: "TechCorp"
    },
    {
      name: "Marcus Rodriguez",
      role: "CEO at StartupX",
      content: "The security features gave us the confidence to handle sensitive financial data. Compliance was seamless.",
      rating: 5,
      company: "StartupX"
    },
    {
      name: "Elena Petrova",
      role: "Lead Developer at GlobalBank",
      content: "Global deployment was effortless. Our European and Asian teams experience identical performance.",
      rating: 5,
      company: "GlobalBank"
    }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      features: [
        "Up to 5 team members",
        "10GB storage",
        "Basic analytics",
        "Email support",
        "Community access"
      ],
      gradient: "from-gray-400 to-gray-600",
      popular: false
    },
    {
      name: "Professional",
      price: "$89",
      period: "/month",
      features: [
        "Up to 20 team members",
        "100GB storage",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations"
      ],
      gradient: "from-blue-500 to-purple-600",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Unlimited team members",
        "1TB+ storage",
        "AI-powered insights",
        "24/7 dedicated support",
        "SLA guarantee",
        "On-premise deployment"
      ],
      gradient: "from-emerald-500 to-cyan-600",
      popular: false
    }
  ];

  // Tech stack icons
  const techStack = [
    { name: "React", color: "text-cyan-400", icon: "⚛️" },
    { name: "Node.js", color: "text-green-400", icon: "🟢" },
    { name: "AWS", color: "text-amber-400", icon: "☁️" },
    { name: "MongoDB", color: "text-emerald-400", icon: "🍃" },
    { name: "Docker", color: "text-blue-400", icon: "🐳" },
    { name: "Kubernetes", color: "text-purple-400", icon: "☸️" },
    { name: "Redis", color: "text-red-400", icon: "🔴" },
    { name: "GraphQL", color: "text-pink-400", icon: "🔍" }
  ];

  return (
    <div
      ref={mainRef}
      className={`min-h-screen w-full overflow-x-hidden transition-colors duration-500 ${theme === 'dark'
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white'
        : 'bg-gradient-to-br from-gray-50 via-blue-50 to-white text-gray-900'
        }`}
    >
      {/* Angular Overlay Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Angular Grid Pattern */}
        <div className="absolute inset-0 angular-overlay opacity-10"></div>

        {/* Animated angular lines */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse"></div>
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-pulse"></div>

        {/* Floating angular shapes */}
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 border-2 border-blue-400/20 rotate-45"
          animate={{
            rotate: [45, 90, 45],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-40 h-40 border-2 border-purple-400/20 rotate-12"
          animate={{
            rotate: [12, -12, 12],
            y: [0, -20, 0]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />

        {/* Enhanced geometric shapes with theme awareness */}
        <div className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-300'
          }`}></div>
        <div className={`absolute top-1/3 right-1/4 w-72 h-72 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-2000 ${theme === 'dark' ? 'bg-purple-500' : 'bg-purple-300'
          }`}></div>
        <div className={`absolute bottom-1/4 left-1/3 w-60 h-60 rounded-full mix-blend-soft-light filter blur-3xl opacity-20 animate-blob animation-delay-4000 ${theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-300'
          }`}></div>

        {/* Particle effects */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-1 h-1 rounded-full ${theme === 'dark' ? 'bg-blue-400/30' : 'bg-blue-500/30'
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

      {/* Theme Toggle Button */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-3 rounded-full backdrop-blur-sm border shadow-lg transition-all duration-300 hover:scale-110"
        animate={{ rotate: scrollY > 100 ? 180 : 0 }}
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

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="fixed top-6 left-6 z-50 md:hidden p-2 rounded-lg backdrop-blur-sm border"
        style={{
          background: theme === 'dark'
            ? 'rgba(0, 0, 0, 0.3)'
            : 'rgba(255, 255, 255, 0.3)',
          borderColor: theme === 'dark'
            ? 'rgba(75, 85, 99, 0.5)'
            : 'rgba(209, 213, 219, 0.5)',
        }}
      >
        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-y-0 left-0 z-40 w-64 pt-20 px-6 backdrop-blur-lg border-r md:hidden"
            style={{
              background: theme === 'dark'
                ? 'rgba(17, 24, 39, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderColor: theme === 'dark'
                ? 'rgba(75, 85, 99, 0.5)'
                : 'rgba(209, 213, 219, 0.5)',
            }}
          >
            <div className="flex flex-col space-y-6">
              {['Features', 'Solutions', 'Pricing', 'Showcase', 'Testimonials', 'Contact'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsMenuOpen(false)}
                  className={`py-2 px-4 rounded-lg transition-colors ${theme === 'dark'
                    ? 'hover:bg-gray-800 text-gray-300'
                    : 'hover:bg-gray-100 text-gray-700'
                    }`}
                >
                  {item}
                </a>
              ))}
              <div className="pt-6 border-t border-gray-700/50">
                <a
                  href="/login"
                  className={`block py-3 px-4 rounded-lg text-center mb-3 transition-colors ${theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                >
                  Login
                </a>
                <a
                  href="/register"
                  className="block py-3 px-4 rounded-lg text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  <label className='text-white'> Get Started</label>

                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 w-full">
        {/* Navigation */}
        <motion.nav
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`sticky top-0 z-40 flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8 w-full backdrop-blur-md transition-all duration-300 ${scrollY > 50 ? 'shadow-lg' : ''
            }`}
          style={{
            background: scrollY > 50
              ? (theme === 'dark'
                ? 'rgba(17, 24, 39, 0.9)'
                : 'rgba(255, 255, 255, 0.9)')
              : 'transparent',
            borderBottom: scrollY > 50
              ? `1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.3)'}`
              : 'none'
          }}
        >
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/src/assets/Logo.jpeg"
              alt="Origin Technologies"
              className="h-12 w-auto rounded-lg shadow-lg"
            />
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                The Origin Technologies
              </span>
              <div className="text-xs opacity-70">Next-Gen Digital Solutions</div>
            </div>
          </motion.div>

          <div className="hidden md:flex space-x-8">
            {['Features', 'Solutions', 'Pricing', 'Showcase', 'Testimonials'].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className={`relative py-2 px-1 transition-colors ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm opacity-70">
              <Sparkles className="w-4 h-4" />
              <span>Trusted by 50K+ companies</span>
            </div>
            <a
              href="/login"
              className={`px-4 py-2 rounded-lg transition-colors ${theme === 'dark'
                ? 'hover:bg-gray-800 text-gray-300'
                : 'hover:bg-gray-100 text-gray-700'
                }`}
            >
              Login
            </a>
            <a
              href="/register"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-white"
            >
              Get Started
            </a>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <section className="relative py-20 md:py-32 flex flex-col items-center text-center w-full px-4 sm:px-6 lg:px-8 overflow-hidden">
          {/* Hero Background Effects */}
          <div className="absolute inset-0 z-0">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10 w-full max-w-6xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 backdrop-blur-sm border"
              style={{
                background: theme === 'dark'
                  ? 'rgba(59, 130, 246, 0.1)'
                  : 'rgba(59, 130, 246, 0.1)',
                borderColor: theme === 'dark'
                  ? 'rgba(96, 165, 250, 0.3)'
                  : 'rgba(59, 130, 246, 0.3)',
              }}
            >
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium"> The Origin Technologies</span>
              <ArrowUpRight className="w-4 h-4" />
            </motion.div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8">
              <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 animate-gradient">
                Revolutionize
              </span>
              <span className="block text-3xl md:text-5xl mt-4">
                Your Digital Ecosystem
              </span>
            </h1>

            <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto mb-12">
              Enterprise-grade platform powered by AI to manage projects, automate workflows,
              and scale your business globally with <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">zero friction</span>.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <motion.a
                href="/register"
                className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold flex items-center justify-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="w-5 h-5 text-white" />
                <p className='text-white'>Start Free Trial (14 Days)</p>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-2 transition-transform text-white" />
                <div className="absolute inset-0 rounded-xl border-2 border-white/20 animate-ping opacity-0 group-hover:opacity-100"></div>
              </motion.a>

              <motion.button
                onClick={toggleVideo}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all border ${theme === 'dark'
                  ? 'bg-gray-800/50 border-gray-700 hover:bg-gray-700/50'
                  : 'bg-gray-100/50 border-gray-300 hover:bg-gray-200/50'
                  }`}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                {isVideoPlaying ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause Demo
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Watch 2-min Demo
                  </>
                )}
              </motion.button>
            </div>

            {/* Tech Stack */}
<Zoom triggerOnce delay={300}>
  <div className="mt-16">
    <Fade direction="up" triggerOnce delay={200}>
      <div 
        className="text-sm uppercase tracking-wider opacity-70 mb-4 text-center"
        data-aos="fade-up"
        data-aos-delay="100"
      >
        Trusted by tech leaders using
      </div>
    </Fade>
    
    <div className="flex flex-wrap justify-center gap-4 md:gap-6">
      {techStack.map((tech, index) => (
        <motion.div
          key={tech.name}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.05,
            type: "spring",
            stiffness: 100
          }}
          viewport={{ once: true, amount: 0.3 }}
          whileHover={{ 
            scale: 1.05, 
            y: -5,
            boxShadow: theme === 'dark' 
              ? '0 10px 30px rgba(0, 0, 0, 0.3)' 
              : '0 10px 30px rgba(0, 0, 0, 0.1)'
          }}
          className={`flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-sm transition-all duration-300 cursor-pointer ${theme === 'dark' 
            ? 'bg-gray-800/50 hover:bg-gray-800/80 border border-gray-700/50' 
            : 'bg-white/80 hover:bg-white border border-gray-200'
          }`}
        >
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: index * 0.3
            }}
            className="text-2xl"
          >
            {tech.icon}
          </motion.div>
          <span className="font-semibold text-sm md:text-base">{tech.name}</span>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 + 0.3 }}
            className="text-xs opacity-70"
          >
            ✓
          </motion.div>
        </motion.div>
      ))}
    </div>
  </div>
</Zoom>
          </motion.div>
        </section>

        {/* Animated Hero Heading Section */}
<Slide direction="up" triggerOnce cascade damping={0.2}>
  <div className="text-center py-16">
    <motion.h1
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="text-5xl md:text-7xl font-bold mb-6"
    >
      <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Transform Your Digital
      </span>
      <br />
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-gray-800 dark:text-white"
      >
        Presence
      </motion.span>
    </motion.h1>
    
    <motion.p
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.8 }}
      className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto mb-10"
    >
      Enterprise-grade solutions that scale with your ambition
    </motion.p>
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300"
    >
      Get Started Free
      <motion.div
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <ArrowRight className="w-5 h-5" />
      </motion.div>
    </motion.div>
  </div>
</Slide>

        {/* Stats Section */}
<section className="py-20 w-full px-4 sm:px-6 lg:px-8 overflow-hidden">
  <Fade direction="up" triggerOnce>
    <div className="text-center mb-16">
      <h2 
        className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent"
        data-aos="zoom-in"
        data-aos-delay="200"
      >
        Everything You Need to Scale Faster
      </h2>
      <p 
        className="text-xl opacity-80 max-w-3xl mx-auto"
        data-aos="fade-up"
        data-aos-delay="300"
      >
        Join thousands of companies accelerating their growth with our platform
      </p>
    </div>
  </Fade>
  
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
    {stats.map((stat, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.5, y: 50 }}
        whileInView={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: index * 0.1,
          type: "spring",
          stiffness: 80,
          damping: 15
        }}
        viewport={{ once: true, amount: 0.3 }}
        whileHover={{ 
          y: -15,
          scale: 1.05,
          transition: { duration: 0.3 }
        }}
        className="text-center p-6 rounded-2xl backdrop-blur-sm border relative overflow-hidden group"
        style={{
          background: theme === 'dark'
            ? 'rgba(31, 41, 55, 0.5)'
            : 'rgba(255, 255, 255, 0.5)',
          borderColor: theme === 'dark'
            ? 'rgba(75, 85, 99, 0.3)'
            : 'rgba(209, 213, 219, 0.5)',
        }}
      >
        {/* Animated background effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-purple-600/0"
          initial={{ x: '-100%' }}
          whileInView={{ x: '100%' }}
          transition={{
            duration: 1.5,
            delay: index * 0.1,
            repeat: Infinity,
            repeatDelay: 3
          }}
        />
        
        <motion.div
          initial={{ rotate: -180, opacity: 0 }}
          whileInView={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
          className="flex justify-center mb-4"
        >
          <div className={`p-3 rounded-xl ${stat.color.replace('text-', 'bg-')}/10 group-hover:scale-110 transition-transform duration-300`}>
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
                delay: index * 0.5
              }}
            >
              {stat.icon}
            </motion.div>
          </div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
          className="relative"
        >
          <div 
            className={`text-3xl md:text-4xl font-bold mb-2 ${stat.color} relative inline-block`}
            data-aos="zoom-in"
            data-aos-delay={index * 100 + 300}
          >
            <CountUp end={parseInt(stat.value.replace('+', '').replace('K', '000'))} suffix={stat.value.includes('+') ? '+' : stat.value.includes('K') ? 'K' : ''} />
          </div>
          <div 
            className={`text-sm md:text-base ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} font-medium`}
            data-aos="fade-up"
            data-aos-delay={index * 100 + 400}
          >
            {stat.label}
          </div>
        </motion.div>
        
        {/* Floating particles */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 rounded-full"
            initial={{ 
              x: Math.random() * 100, 
              y: Math.random() * 100,
              opacity: 0 
            }}
            animate={{ 
              y: [null, -20, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: i * 0.5 + index * 0.2
            }}
            style={{
              left: `${20 + i * 20}%`,
              top: `${10 + i * 25}%`
            }}
          />
        ))}
      </motion.div>
    ))}
  </div>
</section>

        {/* Features Section */}
        <section id="features" className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">WHY CHOOSE US</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Scale Faster</span>
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Comprehensive suite of tools designed to accelerate your digital transformation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative p-8 rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -15 }}
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(145deg, rgba(31,41,55,0.5), rgba(17,24,39,0.3))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                  border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                }}
              >
                {/* Angular corner accent */}
                <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 rotate-45 translate-x-16 -translate-y-16 bg-gradient-to-br ${feature.gradient} opacity-10`}></div>
                </div>

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-6`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {feature.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold bg-gradient-to-r ${feature.gradient} bg-clip-text text-transparent`}>
                      {feature.stats}
                    </span>
                    <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Video Showcase with Angular Overlay */}
        <section id="showcase" className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Angular border effect */}
            <div className="absolute inset-0 angular-overlay opacity-20"></div>

            <div className="relative p-8 md:p-12 backdrop-blur-sm"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(31,41,55,0.4), rgba(17,24,39,0.2))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(249,250,251,0.4))',
                border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
              }}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center" data-aos="fade-up">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                    <Play className="w-4 h-4" />
                    <span className="text-sm font-medium">LIVE DEMO</span>
                  </div>

                  <h2 className="text-4xl md:text-5xl font-bold mb-6">
                    See the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Magic</span> in Action
                  </h2>

                  <p className="text-xl opacity-80 mb-8">
                    Watch how Fortune 500 companies use our platform to achieve 300% ROI in their first quarter.
                  </p>

                  <div className="space-y-4 mb-8">
                    {[
                      "Drag-and-drop interface requires zero coding",
                      "Real-time collaboration with 1000+ concurrent users",
                      "AI-powered suggestions optimize workflows",
                      "Enterprise-grade security with audit logs"
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span>{item}</span>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex gap-4">
                    {videoAssets.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveVideo(index)}
                        className={`px-4 py-2 rounded-lg transition-all ${index === activeVideo
                          ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                          : theme === 'dark'
                            ? 'bg-gray-800 hover:bg-gray-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                      >
                        Demo
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                    <video
                      ref={videoRef}
                      className="w-full h-auto rounded-2xl"
                      loop
                      muted
                      playsInline
                    >
                      <source src={videoAssets[activeVideo]} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>

                    {/* Video overlay with angular effects */}
                    <div className="absolute inset-0 angular-overlay opacity-10"></div>

                    {/* Play button overlay */}
                    <button
                      onClick={toggleVideo}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                    >
                      {isVideoPlaying ? (
                        <Pause className="w-8 h-8 text-white" />
                      ) : (
                        <Play className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>

                  {/* Floating stats */}
                  <motion.div
                    className="absolute -bottom-6 -right-6 p-6 rounded-2xl backdrop-blur-lg border shadow-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 }}
                    style={{
                      background: theme === 'dark'
                        ? 'rgba(31, 41, 55, 0.8)'
                        : 'rgba(255, 255, 255, 0.9)',
                      borderColor: theme === 'dark'
                        ? 'rgba(75, 85, 99, 0.5)'
                        : 'rgba(209, 213, 219, 0.5)',
                    }}
                  >
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                      89%
                    </div>
                    <div className="text-sm opacity-70">Faster deployment</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Carousel */}
        <section id="testimonials" className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-500">Industry Leaders</span>
            </h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              See what executives from top companies say about their experience
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            <div className="relative h-64 overflow-hidden rounded-3xl p-8 backdrop-blur-sm border"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(31,41,55,0.4), rgba(17,24,39,0.2))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(249,250,251,0.4))',
                borderColor: theme === 'dark'
                  ? 'rgba(75, 85, 99, 0.3)'
                  : 'rgba(209, 213, 219, 0.5)',
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5 }}
                  className="h-full flex flex-col justify-center"
                >
                  <div className="text-2xl italic mb-8">
                    "{testimonials[activeTestimonial].content}"
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xl">{testimonials[activeTestimonial].name}</div>
                      <div className="opacity-70">{testimonials[activeTestimonial].role}</div>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Testimonial indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-all ${index === activeTestimonial
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 w-8'
                    : theme === 'dark'
                      ? 'bg-gray-700'
                      : 'bg-gray-300'
                    }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="py-20 w-full px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-sm font-medium">WHY CHOOSE US</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Industry Leaders for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Exceptional Results</span>
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              We deliver cutting-edge solutions that drive growth, efficiency, and competitive advantage
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Proven Expertise",
                description: "Over a decade of experience delivering mission-critical solutions across diverse industries.",
                icon: <Code className="w-8 h-8" />,
                gradient: "from-blue-500 to-cyan-500",
                stat: "10+ Years",
                detail: "Industry Experience"
              },
              {
                title: "Guaranteed Results",
                description: "We measure success by your outcomes, offering performance guarantees on all our services.",
                icon: <BarChart className="w-8 h-8" />,
                gradient: "from-purple-500 to-indigo-500",
                stat: "98%",
                detail: "Client Retention"
              },
              {
                title: "24/7 Support",
                description: "Round-the-clock expert assistance ensures your systems operate at peak performance.",
                icon: <Shield className="w-8 h-8" />,
                gradient: "from-emerald-500 to-teal-500",
                stat: "24/7",
                detail: "Expert Support"
              },
              {
                title: "Future-Proof",
                description: "Solutions built with scalability in mind, adapting to your evolving business needs.",
                icon: <Zap className="w-8 h-8" />,
                gradient: "from-amber-500 to-orange-500",
                stat: "100%",
                detail: "Scalable Tech"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="group relative p-8 rounded-3xl overflow-hidden text-center"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(145deg, rgba(31,41,55,0.5), rgba(17,24,39,0.3))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                  border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                }}
              >
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${item.gradient} mb-6 text-white`}>
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.description}
                  </p>
                  <div className="pt-4 border-t border-gray-700/30 dark:border-gray-700/30">
                    <div className={`text-3xl font-bold bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                      {item.stat}
                    </div>
                    <div className="text-sm opacity-70 mt-1">{item.detail}</div>
                  </div>
                </div>

                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient.replace('from-', 'from-').replace('to-', 'to-')} opacity-0 group-hover:opacity-5 transition-all duration-500`}></div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">SUCCESS STORIES</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">Results</span> for Real Clients
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              See how we've helped businesses transform their operations and achieve extraordinary outcomes
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                title: "Global Retailer",
                description: "Increased online sales by 340% and reduced operational costs by 60% through our e-commerce platform overhaul.",
                image: "/src/assets/GlobalRetailer.avif",
                metric: "340%",
                result: "Sales Increase",
                industry: "E-commerce"
              },
              {
                title: "Financial Services",
                description: "Implemented real-time fraud detection system reducing fraudulent transactions by 92% while improving customer experience.",
                image: "/src/assets/FinancialServices.avif",
                metric: "92%",
                result: "Fraud Reduction",
                industry: "FinTech"
              },
              {
                title: "Healthcare Network",
                description: "Streamlined patient data management across 200+ facilities, reducing appointment scheduling time by 75%.",
                image: "/src/assets/Healthcare.avif",
                metric: "75%",
                result: "Time Saved",
                industry: "Healthcare"
              }
            ].map((study, index) => (
              <motion.div
                key={index}
                className="group relative rounded-3xl overflow-hidden"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(145deg, rgba(31,41,55,0.5), rgba(17,24,39,0.3))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                  border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                }}
              >
                <div className="relative overflow-hidden rounded-t-3xl h-48">
                  <img
                    src={study.image}
                    alt={study.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                  <div className="absolute bottom-4 left-6">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                      {study.industry}
                    </span>
                  </div>
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-bold mb-3">{study.title}</h3>
                  <p className={`mb-6 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {study.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-700/30 dark:border-gray-700/30">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                        {study.metric}
                      </div>
                      <div className="text-sm opacity-70">{study.result}</div>
                    </div>
                    <div className="flex items-center text-sm font-medium bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                      View Case Study
                      <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Partner Ecosystem Section */}
        <section className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">OUR ECOSYSTEM</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Strategic Partnerships</span>
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Collaborating with industry leaders to deliver unparalleled value and innovation
            </p>
          </div>

          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {[
                {
                  name: "Amazon Web Services",
                  description: "Advanced cloud infrastructure and scalable computing solutions",
                  logo: "/src/assets/AWS.png",
                  tier: "Premier Partner",
                  color: "from-orange-500 to-amber-500"
                },
                {
                  name: "Microsoft Azure",
                  description: "Enterprise-grade cloud services and hybrid solutions",
                  logo: "/src/assets/Azure.jpg",
                  tier: "Gold Partner",
                  color: "from-blue-500 to-sky-500"
                },
                {
                  name: "Google Cloud",
                  description: "AI-powered analytics and machine learning capabilities",
                  logo: "/src/assets/googlecloud.jpg",
                  tier: "Specialist Partner",
                  color: "from-emerald-500 to-green-500"
                },
                {
                  name: "Salesforce",
                  description: "CRM integration and customer experience optimization",
                  logo: "/src/assets/salesforce.jpg",
                  tier: "Platinum Partner",
                  color: "from-blue-600 to-indigo-600"
                }
              ].map((partner, index) => (
                <motion.div
                  key={index}
                  className="group relative p-6 rounded-2xl overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  style={{
                    background: theme === 'dark'
                      ? 'linear-gradient(145deg, rgba(31,41,55,0.5), rgba(17,24,39,0.3))'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                    border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 mr-4 overflow-hidden">
                      <img src={partner.logo} alt={partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-bold">{partner.name}</h3>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${partner.color} text-white`}>
                        {partner.tier}
                      </span>
                    </div>
                  </div>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {partner.description}
                  </p>

                  {/* Hover effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${partner.color} opacity-0 group-hover:opacity-5 transition-all duration-500`}></div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="text-center py-12 rounded-3xl"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(31,41,55,0.4), rgba(17,24,39,0.2))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(249,250,251,0.4))',
                border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
              }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Transform Your Business?</h3>
              <p className={`text-lg max-w-2xl mx-auto mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Join hundreds of industry leaders who trust Origin Technologies for their digital transformation journey
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/#contact"
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Schedule Consultation
                </a>
                <a
                  href="/register"
                  className={`px-8 py-4 font-semibold rounded-xl transition-all inline-flex items-center justify-center border ${theme === 'dark' ? 'border-gray-700 hover:border-gray-600' : 'border-gray-300 hover:border-gray-400'}`}
                >
                  View Partnership Options
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Future Projects Section */}
        <section id="future-projects" className="py-20 w-full px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">INNOVATION AHEAD</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Future <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Projects</span> & Innovations
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              Explore our upcoming revolutionary technologies that will reshape industries and redefine possibilities
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {[
              {
                name: "ORIGIN Ai",
                description: "Advanced artificial intelligence platform with predictive analytics and autonomous decision-making capabilities.",
                status: "Development",
                icon: <Zap className="w-8 h-8" />,
                gradient: "from-purple-500 to-indigo-600"
              },
              {
                name: "ORIGIN CONNECT",
                description: "Decentralized communication protocol for seamless IoT integration and real-time data exchange.",
                status: "Beta Testing",
                icon: <Globe className="w-8 h-8" />,
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                name: "ORIGIN PAY",
                description: "Next-generation payment gateway with instant settlements and blockchain-backed security.",
                status: "Planning",
                icon: <CreditCard className="w-8 h-8" />,
                gradient: "from-emerald-500 to-teal-500"
              },
              {
                name: "ORIGIN MOBILE",
                description: "Cross-platform mobile ecosystem with AR capabilities and adaptive user interfaces.",
                status: "Development",
                icon: <Smartphone className="w-8 h-8" />,
                gradient: "from-rose-500 to-pink-500"
              },
              {
                name: "FUTURE BY ORIGINS",
                description: "Quantum computing interface for complex problem solving and simulation environments.",
                status: "Research",
                icon: <Database className="w-8 h-8" />,
                gradient: "from-amber-500 to-orange-500"
              },
              {
                name: "ORIGIN DIGITAL TOKENS",
                description: "Proprietary digital asset framework for secure transactions and smart contracts.",
                status: "Development",
                icon: <Shield className="w-8 h-8" />,
                gradient: "from-violet-500 to-purple-500"
              },
              {
                name: "ORIGIN DIGITAL COINS",
                description: "Stablecoin ecosystem with real-world asset backing and instant global transfers.",
                status: "Beta Testing",
                icon: <BarChart className="w-8 h-8" />,
                gradient: "from-sky-500 to-blue-500"
              },
              {
                name: "ORIGIN NFTs",
                description: "Enterprise-grade NFT marketplace with fractional ownership and IP protection.",
                status: "Planning",
                icon: <Image className="w-8 h-8" />,
                gradient: "from-fuchsia-500 to-purple-500"
              },
              {
                name: "ORIGIN EXPO",
                description: "Virtual reality exhibition platform for immersive brand experiences and events.",
                status: "Research",
                icon: <Globe2 className="w-8 h-8" />,
                gradient: "from-cyan-500 to-teal-500"
              },
              {
                name: "ORIGIN DIGITAL CRYPTO POS",
                description: "Cryptocurrency point-of-sale system for retail businesses with multi-chain support.",
                status: "Development",
                icon: <ShoppingCart className="w-8 h-8" />,
                gradient: "from-green-500 to-emerald-500"
              }
            ].map((project, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative p-6 rounded-2xl overflow-hidden cursor-pointer"
                style={{
                  background: theme === 'dark'
                    ? 'linear-gradient(145deg, rgba(31,41,55,0.5), rgba(17,24,39,0.3))'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                  border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
                }}
              >
                {/* Glowing border effect */}
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${project.gradient} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`}></div>

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${project.gradient} mb-4 text-white`}>
                    {project.icon}
                  </div>

                  <h3 className="text-xl font-bold mb-2">{project.name}</h3>

                  <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${project.status === 'Development'
                      ? 'bg-blue-500/20 text-blue-500'
                      : project.status === 'Beta Testing'
                        ? 'bg-amber-500/20 text-amber-500'
                        : project.status === 'Planning'
                          ? 'bg-purple-500/20 text-purple-500'
                          : 'bg-cyan-500/20 text-cyan-500'
                      }`}>
                      {project.status}
                    </span>

                    <div className="flex items-center text-sm font-medium bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Learn More
                      <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/5 group-hover:to-blue-500/5 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>

          {/* Coming Soon Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 max-w-4xl mx-auto rounded-3xl overflow-hidden"
            style={{
              background: theme === 'dark'
                ? 'linear-gradient(135deg, rgba(31,41,55,0.4), rgba(17,24,39,0.2))'
                : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(249,250,251,0.4))',
              border: `1px solid ${theme === 'dark' ? 'rgba(75,85,99,0.3)' : 'rgba(209,213,219,0.5)'}`,
            }}
          >
            {/* <div className="p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                <Zap className="w-5 h-5 text-cyan-400" />
                <span className="text-sm font-medium text-cyan-400">EXCLUSIVE ACCESS</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold mb-4">
                Be the First to Experience Our Innovations
              </h3>

              <p className="text-lg opacity-80 max-w-2xl mx-auto mb-8">
                Join our innovation newsletter to receive early access invitations, exclusive previews, and insider updates on all future projects.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-6 py-4 rounded-xl border backdrop-blur-sm"
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(17, 24, 39, 0.5)'
                      : 'rgba(255, 255, 255, 0.7)',
                    borderColor: theme === 'dark'
                      ? 'rgba(75, 85, 99, 0.5)'
                      : 'rgba(209, 213, 219, 0.7)',
                    color: theme === 'dark' ? 'white' : 'black'
                  }}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
                >
                  Subscribe
                </motion.button>
              </div>
            </div> */}
          </motion.div>
        </section>
        {/* Gallery Section - Add this after the Partner Ecosystem section */}
        <section id="gallery" className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 bg-gradient-to-r from-rose-500/10 to-pink-500/10">
              <Image className="w-4 h-4" />
              <span className="text-sm font-medium">VISUAL SHOWCASE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our Work in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-pink-500">Motion</span>
            </h2>
            <p className="text-xl opacity-80 max-w-3xl mx-auto">
              A visual journey through our innovative projects and transformative solutions
            </p>
          </div>

          {/* Gallery Container */}
          <div className="relative max-w-7xl mx-auto">
            {/* Gallery Navigation */}
            <div className="flex justify-center gap-4 mb-12">
              {['All', 'Web Design', 'Mobile Apps', 'Branding', 'UI/UX', 'Development'].map((category, index) => (
                <motion.button
                  key={index}
                  className={`px-6 py-3 rounded-full text-sm font-medium transition-all ${index === 0
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white'
                    : theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-700/50 text-gray-300'
                      : 'bg-gray-100/50 hover:bg-gray-200/50 text-gray-700'
                    }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {category}
                </motion.button>
              ))}
            </div>

            {/* Animated Gallery Container */}
            <div className="relative h-[600px] md:h-[700px] overflow-hidden rounded-3xl backdrop-blur-sm border"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(31,41,55,0.3), rgba(17,24,39,0.2))'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.4), rgba(249,250,251,0.3))',
                borderColor: theme === 'dark'
                  ? 'rgba(75, 85, 99, 0.3)'
                  : 'rgba(209, 213, 219, 0.5)',
              }}
            >
              {/* Current Image Display */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentGalleryIndex}
                  initial={{ opacity: 0, x: 100, scale: 0.9 }}
                  animate={{
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    transition: {
                      duration: 1.2,
                      ease: [0.22, 1, 0.36, 1] // Smooth bounce curve
                    }
                  }}
                  exit={{
                    opacity: 0,
                    x: -100,
                    scale: 0.9,
                    transition: { duration: 0.8 }
                  }}
                  className="absolute inset-0 flex items-center justify-center p-8"
                >
                  <motion.div
                    className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={galleryItems[currentGalleryIndex].image}
                      alt={galleryItems[currentGalleryIndex].title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <motion.div
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-white"
                        >
                          <h3 className="text-2xl font-bold mb-2">{galleryItems[currentGalleryIndex].title}</h3>
                          <p className="text-gray-200 mb-4">{galleryItems[currentGalleryIndex].description}</p>
                          <div className="flex gap-2">
                            {galleryItems[currentGalleryIndex].tags.map((tag, idx) => (
                              <span key={idx} className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrows */}
              <motion.button
                onClick={prevGalleryItem}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-lg border flex items-center justify-center hover:scale-110 transition-transform z-20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: theme === 'dark'
                    ? 'rgba(31, 41, 55, 0.7)'
                    : 'rgba(255, 255, 255, 0.7)',
                  borderColor: theme === 'dark'
                    ? 'rgba(75, 85, 99, 0.5)'
                    : 'rgba(209, 213, 219, 0.5)',
                }}
              >
                <ArrowRight className="w-6 h-6 rotate-180" />
              </motion.button>

              <motion.button
                onClick={nextGalleryItem}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full backdrop-blur-lg border flex items-center justify-center hover:scale-110 transition-transform z-20"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                  background: theme === 'dark'
                    ? 'rgba(31, 41, 55, 0.7)'
                    : 'rgba(255, 255, 255, 0.7)',
                  borderColor: theme === 'dark'
                    ? 'rgba(75, 85, 99, 0.5)'
                    : 'rgba(209, 213, 219, 0.5)',
                }}
              >
                <ArrowRight className="w-6 h-6" />
              </motion.button>

              {/* Progress Indicator */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                {galleryItems.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentGalleryIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${index === currentGalleryIndex
                      ? 'w-8 bg-gradient-to-r from-rose-500 to-pink-500'
                      : theme === 'dark'
                        ? 'bg-gray-600 hover:bg-gray-500'
                        : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>

              {/* Auto-play Controls */}
              <div className="absolute top-8 right-8 z-20">
                <motion.button
                  onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-lg border text-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: theme === 'dark'
                      ? 'rgba(31, 41, 55, 0.7)'
                      : 'rgba(255, 255, 255, 0.7)',
                    borderColor: theme === 'dark'
                      ? 'rgba(75, 85, 99, 0.5)'
                      : 'rgba(209, 213, 219, 0.5)',
                  }}
                >
                  {isAutoPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Auto-play
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Auto-play
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="mt-8">
              <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
                {galleryItems.map((item, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setCurrentGalleryIndex(index)}
                    className={`flex-shrink-0 relative rounded-xl overflow-hidden transition-all ${index === currentGalleryIndex
                      ? 'ring-2 ring-rose-500 scale-105'
                      : 'opacity-60 hover:opacity-100'
                      }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="w-24 h-16 md:w-32 md:h-20">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {index === currentGalleryIndex && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-br from-rose-500/20 to-pink-500/20"
                        layoutId="gallery-active"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Gallery Info */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-4 p-6 rounded-2xl backdrop-blur-sm border max-w-2xl mx-auto"
                style={{
                  background: theme === 'dark'
                    ? 'rgba(31, 41, 55, 0.4)'
                    : 'rgba(255, 255, 255, 0.4)',
                  borderColor: theme === 'dark'
                    ? 'rgba(75, 85, 99, 0.3)'
                    : 'rgba(209, 213, 219, 0.5)',
                }}
              >
                <div className="text-left">
                  <h3 className="text-xl font-bold mb-2">{galleryItems[currentGalleryIndex].title}</h3>
                  <p className="opacity-80">{galleryItems[currentGalleryIndex].description}</p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 opacity-70" />
                      <span className="text-sm">{galleryItems[currentGalleryIndex].date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 opacity-70" />
                      <span className="text-sm">{galleryItems[currentGalleryIndex].readTime} min read</span>
                    </div>
                  </div>
                </div>
                <a
                  href={galleryItems[currentGalleryIndex].caseStudyUrl}
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:from-rose-600 hover:to-pink-600 transition-all whitespace-nowrap"
                >
                  View Case Study
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}        <section id="pricing" className="py-20 w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-cyan-500">Transparent</span> Pricing
            </h2>
            <p className="text-xl opacity-80 max-w-2xl mx-auto">
              Start free, upgrade as you grow. No hidden fees, cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative rounded-3xl p-8 backdrop-blur-sm border transition-all duration-300 ${tier.popular ? 'scale-105 shadow-2xl' : ''
                  }`}
                whileHover={{ y: -10 }}
                style={{
                  background: tier.popular
                    ? theme === 'dark'
                      ? 'linear-gradient(145deg, rgba(30, 64, 175, 0.2), rgba(124, 58, 237, 0.1))'
                      : 'linear-gradient(145deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))'
                    : theme === 'dark'
                      ? 'linear-gradient(145deg, rgba(31,41,55,0.4), rgba(17,24,39,0.2))'
                      : 'linear-gradient(145deg, rgba(255,255,255,0.8), rgba(249,250,251,0.6))',
                  borderColor: tier.popular
                    ? 'rgba(59, 130, 246, 0.5)'
                    : theme === 'dark'
                      ? 'rgba(75, 85, 99, 0.3)'
                      : 'rgba(209, 213, 219, 0.5)',
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium">
                    MOST POPULAR
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">{tier.name}</h3>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-5xl font-bold">{tier.price}</span>
                    <span className="opacity-70">{tier.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-3 rounded-xl font-semibold transition-all ${tier.popular
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                  {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                </button>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12 opacity-70">
            All plans include 14-day free trial. No credit card required.
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 w-full px-4 sm:px-6 lg:px-8" data-aos="fade-up">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Angular background */}
            <div className="absolute inset-0 angular-overlay opacity-20"></div>

            <div className="relative p-12 md:p-20 text-center"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, rgba(30, 64, 175, 0.3), rgba(124, 58, 237, 0.2))'
                  : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.05))',
                border: `1px solid ${theme === 'dark' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)'}`,
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-4xl md:text-6xl font-bold mb-6">
                  Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">Transform</span> Your Business?
                </h2>
                <p className="text-xl md:text-2xl opacity-80 max-w-3xl mx-auto mb-10">
                  Join 50,000+ forward-thinking companies that trust Origin Technologies for their digital transformation.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.a
                    href="/register"
                    className="group relative px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-lg flex items-center gap-3 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                    whileHover={{ y: -5 }}
                  >
                    <Rocket className="w-6 h-6 text-white" />
                    <p className='text-white'>Start Your Free Trial</p>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform text-white" />
                  </motion.a>

                  <a
                    href="/#contact"
                    className={`px-10 py-5 rounded-xl font-semibold text-lg border transition-all ${theme === 'dark'
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                      }`}
                  >
                    Schedule a Demo
                  </a>
                </div>

                <div className="mt-8 text-sm opacity-70">
                  No credit card required • 14-day free trial • Cancel anytime
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className={`py-16 w-full px-4 sm:px-6 lg:px-8 ${theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-50/50'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Main Footer Content */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 mb-16">
              {/* Brand Column */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                    <img
                      src="/src/assets/Logo.png"
                      alt="Origin Technologies"
                      className="h-12 w-auto rounded-lg"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                      Origin Technologies
                    </h2>
                    <p className="text-sm opacity-80 mt-1">Building the future, today</p>
                  </div>
                </div>

                <p className="text-sm opacity-80 leading-relaxed">
                  Leading the digital transformation across Southern Africa with innovative technology solutions.
                </p>

                {/* Social Links */}
                <div className="flex space-x-4 pt-4">
                  {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((platform) => (
                    <a
                      key={platform}
                      href="#"
                      className={`p-2 rounded-lg transition-all duration-300 ${theme === 'dark'
                        ? 'bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white'
                        : 'bg-white hover:bg-gray-100 text-gray-600 hover:text-gray-900'
                        } shadow-sm hover:shadow-md`}
                      aria-label={`Follow us on ${platform}`}
                    >
                      {platform}
                    </a>
                  ))}
                </div>
              </div>

              {/* Quick Links Columns */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Product
                  </h3>
                  <div className="space-y-3">
                    {['Features', 'Solutions', 'Pricing', 'Roadmap', 'API Docs', 'Integrations'].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className={`block transition-all duration-200 group ${theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <span className="relative">
                          {item}
                          <span className={`absolute left-0 -bottom-1 w-0 h-0.5 ${theme === 'dark'
                            ? 'bg-blue-400'
                            : 'bg-blue-500'
                            } transition-all duration-300 group-hover:w-full`} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Company
                  </h3>
                  <div className="space-y-3">
                    {['About Us', 'Careers', 'Blog', 'Press', 'Partners', 'Contact'].map((item) => (
                      <a
                        key={item}
                        href="#"
                        className={`block transition-all duration-200 group ${theme === 'dark'
                          ? 'text-gray-400 hover:text-white'
                          : 'text-gray-600 hover:text-gray-900'
                          }`}
                      >
                        <span className="relative">
                          {item}
                          <span className={`absolute left-0 -bottom-1 w-0 h-0.5 ${theme === 'dark'
                            ? 'bg-purple-400'
                            : 'bg-purple-500'
                            } transition-all duration-300 group-hover:w-full`} />
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contact & Locations Column */}
              <div className="space-y-8" id='contact'>
                <div>
                  <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Contact Us
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-900/30' : 'bg-blue-50'}`}>
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Phone</div>
                        <div className="text-sm opacity-80">+27 63 934 0199</div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3" >
                      <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="font-medium">Email</div>
                        <div className="text-sm opacity-80">info@origintech.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-6 pb-2 border-b border-gray-200 dark:border-gray-700">
                    Quick Locations
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 mb-2">
                        SOUTH AFRICA
                      </div>
                      <div className="text-sm opacity-80">Johannesburg • Pretoria • Cape Town</div>
                    </div>

                    <div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mb-2">
                        BOTSWANA
                      </div>
                      <div className="text-sm opacity-80">Gaborone • Francistown</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Locations Grid */}
            <div className="mb-16">
              <h3 className="text-xl font-bold mb-8 text-center">Our Locations Across Africa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { country: 'SOUTH AFRICA', addresses: ['113 Railway Street, Mayfair, Johannesburg 2092', '24 Clare Road, Fordsburg, JHB', '37 Mint Rd, Fordsburg, Johannesburg'] },
                  { country: 'BOTSWANA', addresses: ['Central Business District, Opposite Hilton Garden Inn, Gaborone', 'Junction Willie Seboni Dr & Nelson Mandela Dr'] },
                  { country: 'ZAMBIA', addresses: ['Lusaka Bus Stand, Shop #15, Opposite Likili Bus Offices'] },
                  { country: 'NAMIBIA', addresses: ['Coming Soon'] },
                  { country: 'ZIMBABWE', addresses: ['Plumtrees, Bulawayo Region'] },
                  { country: 'MALAWI', addresses: ['Lilongwe, Opposite Nedbank', 'Blantyre, Airport Road'] },
                  { country: 'MOZAMBIQUE', addresses: ['Tete Region'] },
                  { country: 'TANZANIA', addresses: ['Mayfair Plaza, Mikocheni B', 'SPOT ON ENTERPRISES, Moshi-Bar Road'] },
                ].map((location, index) => (
                  <div
                    key={location.country}
                    className={`p-6 rounded-2xl transition-all duration-300 ${theme === 'dark'
                      ? 'bg-gray-800/50 hover:bg-gray-800'
                      : 'bg-white hover:bg-gray-50'
                      } shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700`}
                  >
                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold mb-4 ${index % 2 === 0 ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                        : 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                      }`}>
                      {location.country}
                    </div>
                    <div className="space-y-3">
                      {location.addresses.map((addr, i) => (
                        <div key={i} className="flex items-start">
                          <svg className="w-4 h-4 mt-0.5 mr-2 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="text-sm opacity-80">{addr}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  © {new Date().getFullYear()} Origin Technologies. All rights reserved.
                  <span className="mx-2">•</span>
                  <a href="#" className="hover:underline">Privacy Policy</a>
                  <span className="mx-2">•</span>
                  <a href="#" className="hover:underline">Terms of Service</a>
                  <span className="mx-2">•</span>
                  <a href="#" className="hover:underline">Cookie Policy</a>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-sm">
                    <span className="font-medium">Support:</span>
                    <span className="ml-2 opacity-80">support@origintech.com</span>
                  </div>

                  <div className="flex items-center space-x-4">
                    <button className={`text-sm px-4 py-2 rounded-lg transition-all ${theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                      🌐 English
                    </button>
                    <button className={`p-2 rounded-lg transition-all ${theme === 'dark'
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-100 hover:bg-gray-200'
                      }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Custom animations */}
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
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
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
      `}</style>
    </div>
  );
};

export default Home;