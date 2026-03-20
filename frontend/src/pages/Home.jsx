import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Brain, Zap, Target, BookOpen, Sparkles } from 'lucide-react';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import sessionService from '../services/sessionService';
import submissionService from '../services/submissionService';

const Home = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const { isAuthenticated } = useAuth();
  const [latestSession, setLatestSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 600); // Reduced from 2000ms to 600ms for snappier feel
    
    if (isAuthenticated) fetchHomeData();
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const fetchHomeData = async () => {
    try {
      const [sessionsRes, analyticsRes] = await Promise.all([
        sessionService.getAllSessions(),
        submissionService.getAnalytics()
      ]);
      
      if (sessionsRes.data && sessionsRes.data.length > 0) {
        setLatestSession(sessionsRes.data[0]);
      }
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch home data", err);
    }
  };

  const getDifficultyColor = (diff) => {
    switch(diff?.toLowerCase()){
      case 'hard': return '#E74C3C';
      case 'intermediate': return '#F39C12';
      default: return '#2ECC71';
    }
  };

  const features = [
    {
      icon: <Brain size={24} className="text-gold" />,
      title: 'AI-Powered Analysis',
      description: 'Get deep insights into your learning patterns and weak areas with advanced artificial intelligence.',
    },
    {
      icon: <Target size={24} className="text-success" />,
      title: 'Precision Practice',
      description: 'Custom-tailored question sets designed specifically to improve your weak topics.',
    },
    {
      icon: <Zap size={24} className="text-info" />,
      title: 'Instant Feedback',
      description: 'Upload your solutions and get immediate, detailed corrections on your methodology.',
    },
    {
      icon: <BookOpen size={24} className="text-warning" />,
      title: 'Smart Material',
      description: 'Organize, summarize, and extract key concepts from your study materials automatically.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <>
      <AnimatePresence>
        {isInitialLoading && (
          <Loader key="splash-loader" fullScreen={true} message="Initializing Hub..." />
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-dark bg-grid-pattern overflow-x-hidden selection:bg-gold/20 selection:text-gold">
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 h-20 bg-dark/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.2)] shrink-0">
                <GraduationCap size={22} className="text-dark sm:w-6 sm:h-6" />
              </div>
              <span className="text-lg sm:text-xl font-bold font-[var(--font-display)] text-gradient-gold hidden xs:block">
                ExamCraftAI
              </span>
            </Link>

            <div className="flex items-center gap-4 border-l border-white/10 pl-6 sm:pl-8">
              <Link to="/login" className="btn-premium-outline text-[10px] sm:text-xs py-1 px-3 sm:py-2 sm:px-5 whitespace-nowrap">
                Log in
              </Link>
              <Link to="/register" className="btn-premium text-[10px] sm:text-xs py-1 px-3 sm:py-2 sm:px-5 whitespace-nowrap">
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/20 bg-gold/5 mb-8">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
              <span className="text-xs font-semibold text-gold tracking-wide uppercase">Next Gen Study Hub</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold font-[var(--font-display)] text-silk leading-[1.1] mb-6">
              Master your exams with <span className="text-gradient-gold">Artificial Intelligence</span>
            </h1>
            <p className="text-lg text-silver-200 mb-10 max-w-2xl mx-auto lg:mx-0">
              Stop guessing what to study. ExamCraftAI analyzes your past performance, builds custom study plans, and predicts exactly what you need to master next.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link to="/register" className="btn-premium text-base py-4 px-10 w-full sm:w-auto flex items-center justify-center gap-3 group">
                Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-premium-outline text-base py-4 px-10 w-full sm:w-auto flex items-center justify-center gap-3">
                Sign In
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1 w-full max-w-lg lg:max-w-none relative"
          >
            {/* Abstract Decorative Elements */}
            <div className="absolute inset-0 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Dynamic Session Card - Primary Hub */}
            {latestSession ? (
              <motion.div 
                layout
                className="relative glass-card hover:border-gold/25 transition-all group overflow-hidden border border-white/10 p-5 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-2xl bg-dark/40 z-10"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gold opacity-50" />
                
                {/* Session Header */}
                <div className="flex flex-col xs:flex-row justify-between items-start gap-3 mb-6">
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
                      <Zap size={24} className="text-gold" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-silver-200 uppercase tracking-[0.2em] mb-1">Latest Activity</p>
                      <h3 className="text-silk font-bold text-lg sm:text-xl leading-tight group-hover:text-gold transition-colors truncate">
                        {latestSession.topic}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold text-silver-200/40 uppercase tracking-widest">{new Date(latestSession.createdAt).toLocaleDateString()}</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: getDifficultyColor(latestSession.difficulty) }}>{latestSession.difficulty}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shrink-0
                    ${latestSession.status === 'active' ? 'bg-info/10 text-info border-info/20' : 'bg-success/10 text-success border-success/20'}`}>
                    {latestSession.status}
                  </div>
                </div>

                {/* Progress Content */}
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] text-silver-200 uppercase tracking-widest font-bold">Overall Accuracy</span>
                      <span className="text-sm font-bold text-gold">{Math.round((latestSession.currentScore / (latestSession.totalQuestions * 100)) * 100)}%</span>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(latestSession.currentScore / (latestSession.totalQuestions * 100)) * 100}%` }}
                        className="h-full bg-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-silver-200/40 font-bold uppercase mb-1">Solved</p>
                      <p className="text-sm font-bold text-silk">{latestSession.submissions?.length || 0} / {latestSession.totalQuestions}</p>
                    </div>
                    <div className="bg-white/[0.03] p-4 rounded-xl border border-white/5">
                      <p className="text-[10px] text-silver-200/40 font-bold uppercase mb-1">Avg Score</p>
                      <p className="text-sm font-bold text-silk">{(latestSession.currentScore / (latestSession.submissions?.length || 1)).toFixed(1)}</p>
                    </div>
                  </div>

                  <Link 
                    to={latestSession.status === 'active' ? '/practice' : '/sessions'}
                    state={latestSession.status === 'active' ? { sessionId: latestSession._id, resume: true } : undefined}
                    className="btn-gold w-full py-4 rounded-2xl flex items-center justify-center gap-3 text-sm group/btn shadow-xl shadow-gold/10"
                  >
                    {latestSession.status === 'active' ? (
                      <><Zap size={18} className="animate-pulse" /> Resume Session</>
                    ) : (
                      <><Target size={18} /> View Analysis</>
                    )}
                    <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ) : (
              /* Fallback Mockup for New Users */
              <div className="relative glass-card border border-white/10 p-5 sm:p-8 rounded-2xl shadow-2xl backdrop-blur-2xl bg-dark/40 z-10 overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50 opacity-50" />
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div>
                    <p className="text-[10px] font-bold text-silver-200 uppercase tracking-[0.2em] mb-1">Ready to start?</p>
                    <h3 className="text-lg sm:text-xl font-bold text-silk font-[var(--font-display)]">No sessions yet</h3>
                  </div>
                </div>
                <Link to={isAuthenticated ? "/upload-material" : "/register"} className="btn-gold w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-sm">
                   Get Started <ArrowRight size={16} />
                </Link>
              </div>
            )}
            
            {/* Detail Floating Elements (Only if analysis exists) */}
            {analytics && (
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-8 -top-8 glass-card border border-white/10 p-4 rounded-xl shadow-xl z-20 flex items-center gap-4 backdrop-blur-xl bg-dark/60 hidden sm:flex"
              >
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center border border-gold/20">
                  <Brain size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-xs font-bold text-gold uppercase tracking-tighter">Readiness</p>
                  <p className="text-lg font-black text-silk">{analytics.readinessIndex}%</p>
                </div>
              </motion.div>
            )}
          </motion.div>

        </div>
      </main>

      {/* Features Grid */}
      <section className="border-t border-white/5 bg-dark-100/30">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-[var(--font-display)] text-silk mb-4">Why choose ExamCraftAI?</h2>
            <p className="text-silver-200">Everything you need to excel in your exams, powered by the latest in AI.</p>
          </div>
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, i) => (
              <motion.div key={i} variants={itemVariants} className="glass-card hover:bg-white/[0.03] transition-colors p-6 rounded-2xl border border-white/5 group">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-silk mb-3 font-[var(--font-display)]">{feature.title}</h3>
                <p className="text-sm text-silver leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Footer minimal */}
      <footer className="border-t border-white/5 py-8 text-center bg-dark">
        <p className="text-xs text-silver-200">© 2026 ExamCraftAI. All rights reserved.</p>
      </footer>

      {/* Floating Grade removed - now handled globally by AppLayout in protected routes */}
      </div>
    </>
  );
};

export default Home;
