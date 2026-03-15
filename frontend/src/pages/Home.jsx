import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, ArrowRight, Brain, Zap, Target, BookOpen } from 'lucide-react';
import Loader from '../components/Loader';

const Home = () => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 2000); // 2 second loader
    return () => clearTimeout(timer);
  }, []);

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
            
            {/* Mockup Card */}
            <div className="relative glass-card border border-white/10 p-6 rounded-2xl shadow-2xl backdrop-blur-2xl bg-dark/40 z-10 overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/50 via-gold to-gold/50 opacity-50" />
              
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-sm text-silver">Current Readiness</h3>
                  <p className="text-3xl font-bold text-silk font-[var(--font-display)] mt-1">0%</p>
                </div>
                <div className="w-14 h-14 rounded-full border-[4px] border-white/5 border-t-gold/20 flex items-center justify-center relative">
                  <span className="text-[10px] font-bold text-silver-200">New</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="h-2 rounded-full bg-white/5 overflow-hidden w-full relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '0%' }}
                    className="absolute top-0 left-0 h-full bg-gold rounded-full" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-silver uppercase mb-1">Strongest Topic</p>
                    <p className="text-xs text-silver-200 italic font-medium truncate">None yet</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-silver uppercase mb-1">Needs Work</p>
                    <p className="text-xs text-silver-200 italic font-medium truncate">None yet</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating decoration cards */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -right-8 -top-8 glass-card border border-white/10 p-3 rounded-xl shadow-xl z-20 flex items-center gap-3 backdrop-blur-xl bg-dark/60 hidden sm:flex"
            >
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/5">
                <Target size={14} className="text-silver-200" />
              </div>
              <div>
                <p className="text-xs font-bold text-silk text-silver-200">Activity Level</p>
                <p className="text-[10px] text-silver-200">No attempts yet</p>
              </div>
            </motion.div>
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
      </div>
    </>
  );
};

export default Home;
