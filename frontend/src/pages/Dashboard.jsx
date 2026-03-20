import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import AccuracyChart from '../charts/AccuracyChart';
import RiskChart from '../charts/RiskChart';
import ChartPanel, { CHART_COLORS } from '../components/ChartPanel';
import {
  BookOpen,
  Target,
  TrendingUp,
  Clock,
  Award,
  Zap,
  ArrowUpRight,
  FileUp,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Brain,
  Upload,
  ArrowLeft,
  History,
} from 'lucide-react';
import sessionService from '../services/sessionService';
import submissionService from '../services/submissionService';

const Dashboard = () => {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const [greeting, setGreeting] = useState('');
  const [latestSession, setLatestSession] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) setGreeting('Good Morning');
      else if (hour >= 12 && hour < 17) setGreeting('Good Afternoon');
      else if (hour >= 17 && hour < 21) setGreeting('Good Evening');
      else setGreeting('Good Night');
    };

    updateGreeting();
    fetchDashboardData();

    // Auto-refresh greeting and data
    const interval = setInterval(() => {
      updateGreeting();
      fetchDashboardData(false);
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const [sessionsRes, analyticsRes] = await Promise.all([
        sessionService.getAllSessions(),
        submissionService.getAnalytics()
      ]);
      
      if (sessionsRes.data && sessionsRes.data.length > 0) {
        setLatestSession(sessionsRes.data[0]);
      }
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  // Dashboard data using real analytics
  const stats = [
    {
      label: 'Questions Solved',
      value: analytics?.totalAttempts || '0',
      change: analytics?.streak ? `${analytics.streak} day streak` : 'Start practicing',
      changeType: 'neutral',
      icon: BookOpen,
      color: CHART_COLORS.gold,
    },
    {
      label: 'Overall Accuracy',
      value: `${analytics?.overallAccuracy || 0}%`,
      change: 'Lifetime average',
      changeType: 'neutral',
      icon: Target,
      color: CHART_COLORS.success,
    },
    {
      label: 'Current Readiness',
      value: `${analytics?.readinessIndex || 0}%`,
      change: 'Exam readiness score',
      changeType: 'neutral',
      icon: Zap,
      color: CHART_COLORS.info,
    },
    {
      label: 'Grade Rank',
      value: analytics?.overallAccuracy >= 90 ? 'A+' : analytics?.overallAccuracy >= 80 ? 'A' : analytics?.overallAccuracy >= 70 ? 'B+' : analytics?.overallAccuracy >= 60 ? 'B' : 'C',
      change: 'Academic standing',
      changeType: 'neutral',
      icon: Award,
      color: CHART_COLORS.warning,
    },
  ];

  const filteredStats = stats.filter(stat => 
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weakTopics = analytics?.weakTopics || [];
  const recentActivity = analytics?.recentActivity || [];
  const topicPerformance = (analytics?.topicBreakdown || []).map(t => ({
    name: t.name,
    value: t.accuracy
  }));

  // Generate dynamic AI feedback based on overall accuracy
  const getAiFeedback = () => {
    if (!analytics) return { title: 'Starting Your Journey', text: 'Complete your first practice session to see AI insights here.', type: 'neutral' };
    const acc = analytics.overallAccuracy || 0;
    if (acc >= 85) return { 
      title: 'Academic Excellence!', 
      text: `Congratulations! Your're excelling with ${acc}% accuracy. You've mastered the core concepts. Ready for higher difficulty?`,
      type: 'success',
      icon: Sparkles
    };
    if (acc >= 60) return { 
      title: 'Strong Foundation', 
      text: `Good progress with ${acc}% accuracy. You're consistent, but there's room to sharpen some edge cases in ${weakTopics[0] || 'challenging areas'}.`,
      type: 'warning',
      icon: TrendingUp
    };
    if (acc > 0) return { 
      title: 'Improvement Needed', 
      text: `Your current accuracy is ${acc}%. To improve, we recommend focusing on ${weakTopics.slice(0, 2).join(' and ') || 'fundamental topics'} and reviewing step-by-step solutions carefully.`,
      type: 'danger',
      icon: AlertTriangle
    };
    return { title: 'Welcome to ExamCraft', text: 'Upload your first material to begin your accelerated learning journey.', type: 'neutral', icon: Brain };
  };

  const aiFeedback = getAiFeedback();

  const recommendations = analytics?.weakTopics?.length > 0 
    ? analytics.weakTopics.slice(0, 3).map(t => ({ text: `Focus on improving your skills in ${t}`, priority: 'high', icon: Brain }))
    : [
        { text: 'Complete practice sessions to get AI recommendations', priority: 'medium', icon: Brain },
      ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="page-container">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-silver-200 hover:text-gold transition-all mb-4 group px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-gold/30"
          id="back-to-home"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-semibold uppercase tracking-wider">Back to Home</span>
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)]">
          {greeting}, <span className="text-gradient-gold">{user?.name || 'Student'}</span> 👋
        </h1>
        <p className="text-silver-200 text-sm mt-1">
          Here&apos;s your exam preparation overview
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {filteredStats.length > 0 ? (
          filteredStats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={item} className="stat-card group">
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon size={20} style={{ color: stat.color }} />
                  </div>
                  <ArrowUpRight size={16} className="text-dark-700 group-hover:text-gold transition-colors" />
                </div>
                <p className="text-2xl font-bold text-silk font-[var(--font-display)]">{stat.value}</p>
                <p className="text-xs text-dark-700 mt-0.5">{stat.label}</p>
                <p className="text-xs mt-2 font-medium" style={{ color: stat.color }}>
                  {stat.change}
                </p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-8 text-center glass-card opacity-50">
            <p className="text-sm italic text-silver-200">No matching statistics found for &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </motion.div>
      
      {/* AI Learning Insight Panel */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`mb-8 p-5 rounded-2xl border backdrop-blur-sm relative overflow-hidden group
          ${aiFeedback.type === 'success' ? 'bg-success/5 border-success/20' : 
            aiFeedback.type === 'danger' ? 'bg-danger/5 border-danger/20' : 
            aiFeedback.type === 'warning' ? 'bg-warning/5 border-warning/20' : 
            'bg-white/5 border-white/10'}`}
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
          {aiFeedback.icon && <aiFeedback.icon size={120} />}
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 relative z-10">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
            ${aiFeedback.type === 'success' ? 'bg-success/20 text-success shadow-success/10' : 
              aiFeedback.type === 'danger' ? 'bg-danger/20 text-danger shadow-danger/10' : 
              aiFeedback.type === 'warning' ? 'bg-warning/20 text-warning shadow-warning/10' : 
              'bg-white/10 text-silk shadow-white/5'}`}
          >
            {aiFeedback.icon ? <aiFeedback.icon size={28} /> : <Sparkles size={28} />}
          </div>
          <div>
            <h3 className={`text-lg font-bold font-[var(--font-display)] mb-1 
              ${aiFeedback.type === 'success' ? 'text-success' : 
                aiFeedback.type === 'danger' ? 'text-danger' : 
                aiFeedback.type === 'warning' ? 'text-warning' : 'text-silk'}`}
            >
              {aiFeedback.title}
            </h3>
            <p className="text-sm text-silver-200 leading-relaxed max-w-3xl">
              {aiFeedback.text}
            </p>
          </div>
          <Link to="/analytics" className="sm:ml-auto px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-silk transition-all active:scale-95">
            Full Analysis
          </Link>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8"
      >
        <Link
          to="/practice"
          className="glass-card glass-card-hover p-4 flex items-center gap-3 group"
          id="quick-practice"
        >
          <div className="w-11 h-11 rounded-xl bg-gold/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-gold" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-silk group-hover:text-gold transition-colors">Start Practice</p>
            <p className="text-xs text-dark-700">Begin a new session</p>
          </div>
          <ChevronRight size={16} className="text-dark-700 ml-auto group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          to="/upload-material"
          className="glass-card glass-card-hover p-4 flex items-center gap-3 group"
          id="quick-upload"
        >
          <div className="w-11 h-11 rounded-xl bg-info/10 flex items-center justify-center shrink-0">
            <Upload size={20} className="text-info" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-silk group-hover:text-gold transition-colors">Upload Materials</p>
            <p className="text-xs text-dark-700">PDFs, notes, syllabus</p>
          </div>
          <ChevronRight size={16} className="text-dark-700 ml-auto group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
        </Link>

        <Link
          to="/analytics"
          className="glass-card glass-card-hover p-4 flex items-center gap-3 group"
          id="quick-analytics"
        >
          <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
            <BarChart3 size={20} className="text-success" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-silk group-hover:text-gold transition-colors">View Analytics</p>
            <p className="text-xs text-dark-700">Track your progress</p>
          </div>
          <ChevronRight size={16} className="text-dark-700 ml-auto group-hover:text-gold group-hover:translate-x-1 transition-all shrink-0" />
        </Link>
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AccuracyChart data={analytics?.practiceHistory || []} />
        <RiskChart riskScore={analytics?.readinessIndex || 0} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Weak Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">Weak Topics</h3>
            <AlertTriangle size={16} className="text-warning" />
          </div>
          <div className="space-y-4 py-8 text-center">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center">
                      <AlertTriangle size={14} className="text-danger" />
                    </div>
                    <span className="text-sm text-silk">{topic}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-dark-700 italic">No data available yet</p>
            )}
          </div>
          <Link
            to="/analytics"
            className="flex items-center justify-between w-full text-xs text-gold font-bold mt-4 hover:text-gold-light transition-all group pt-4 border-t border-white/5"
            id="view-all-topics-btn"
          >
            <span className="uppercase tracking-[0.1em]">View all topics</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <h3 className="text-base font-semibold text-silk font-[var(--font-display)] mb-4">Recent Activity</h3>
          <div className="space-y-3 py-8 text-center">
            {recentActivity.length > 0 ? (
              recentActivity.map((act, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.04] border border-transparent hover:border-white/5 transition-all group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${act.isCorrect ? 'bg-success/10' : 'bg-danger/10'}`}>
                      <History size={14} className={act.isCorrect ? 'text-success' : 'text-danger'} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-silk truncate w-32 sm:w-40">{act.title}</p>
                      <p className="text-[10px] text-dark-700">{new Date(act.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-silver-200 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                </div>
              ))
            ) : (
              <p className="text-xs text-dark-700 italic">No recent activity</p>
            )}
          </div>
          <Link
            to="/analytics"
            className="flex items-center justify-between w-full text-xs text-gold font-bold mt-4 hover:text-gold-light transition-all group pt-4 border-t border-white/5"
          >
            <span className="uppercase tracking-[0.1em]">History</span>
            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">AI Recommendations</h3>
            <Sparkles size={16} className="text-gold" />
          </div>
          <div className="space-y-3">
            {recommendations.map((rec, i) => {
              const Icon = rec.icon;
              return (
                <div 
                  key={i}
                  className={`p-3 rounded-xl border flex items-start gap-4 transition-all hover:border-gold/30
                    ${rec.priority === 'high' ? 'bg-danger/5 border-danger/20' : 'bg-white/5 border-white/10'}`}
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${rec.priority === 'high' ? 'bg-danger/10 text-danger' : 'bg-gold/10 text-gold'}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-silk leading-relaxed">{rec.text}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest mt-1 block ${rec.priority === 'high' ? 'text-danger' : 'text-silver-200'}`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Topic Performance Mini Bar */}
          <div className="mt-5 pt-4 border-t border-white/5">
            <p className="text-xs text-dark-700 mb-3 font-medium">Topic Performance</p>
            <div className="space-y-2">
              {topicPerformance.slice(0, 4).map((topic) => (
                <div key={topic.name} className="flex items-center gap-2">
                  <span className="text-[11px] text-silver-200 w-20 shrink-0 truncate">{topic.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-dark-300 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${topic.value}%`,
                        backgroundColor: topic.value >= 75 ? CHART_COLORS.success : topic.value >= 50 ? CHART_COLORS.warning : CHART_COLORS.danger,
                      }}
                    />
                  </div>
                  <span className="text-[11px] text-dark-700 w-8 text-right">{topic.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Floating Grade removed - handled globally in AppLayout restricted to Home page */}

      {/* Current Session Summary Card (at bottom for quick glance) */}
      {latestSession && latestSession.status === 'active' && (
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mt-8 glass-card p-6 border-l-4 border-l-gold bg-gold/5"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center shrink-0">
                <Brain size={24} className="text-gold" />
              </div>
              <div>
                <h4 className="text-silk font-bold">Active Session: {latestSession.topic}</h4>
                <p className="text-xs text-silver-200/50">You have questions waiting to be solved. Resume to increase your grade!</p>
              </div>
            </div>
            <Link to="/upload-material" state={{ sessionId: latestSession._id, resume: true }}
              className="btn-gold px-6 py-2.5 rounded-xl text-xs flex items-center gap-2">
              Resume Now <ChevronRight size={14} />
            </Link>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;
