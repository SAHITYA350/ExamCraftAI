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
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { searchQuery } = useSearch();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  // Dashboard data (Reduced demo data for actual app transition)
  const stats = [
    {
      label: 'Questions Solved',
      value: '0',
      change: 'Start practicing',
      changeType: 'neutral',
      icon: BookOpen,
      color: CHART_COLORS.gold,
    },
    {
      label: 'Overall Accuracy',
      value: '0%',
      change: 'No attempts yet',
      changeType: 'neutral',
      icon: Target,
      color: CHART_COLORS.success,
    },
    {
      label: 'Study Hours',
      value: '0h',
      change: 'Welcome!',
      changeType: 'neutral',
      icon: Clock,
      color: CHART_COLORS.info,
    },
    {
      label: 'Topics Covered',
      value: '0/24',
      change: '0% complete',
      changeType: 'neutral',
      icon: Award,
      color: CHART_COLORS.warning,
    },
  ];

  const filteredStats = stats.filter(stat => 
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const weakTopics = [];
  const recentActivity = [];
  const topicPerformance = [];
  const recommendations = [
    { text: 'Complete your first practice session to get AI recommendations', priority: 'medium', icon: Brain },
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
        <AccuracyChart />
        <RiskChart riskScore={0} />
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
                <div key={topic.name}>
                  {/* ... existing topic render ... */}
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
                    {/* ... icon would go here ... */}
                    <span className="text-sm text-silk">{act.title}</span>
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
              const RecIcon = rec.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className={`p-3 rounded-xl border transition-colors cursor-pointer hover:border-gold/30 ${
                    rec.priority === 'high'
                      ? 'bg-danger/5 border-danger/15'
                      : rec.priority === 'medium'
                      ? 'bg-warning/5 border-warning/15'
                      : 'bg-success/5 border-success/15'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <RecIcon size={16} className={`mt-0.5 shrink-0 ${
                        rec.priority === 'high' ? 'text-danger' :
                        rec.priority === 'medium' ? 'text-warning' : 'text-success'
                      }`} />
                      <p className="text-sm text-silk leading-relaxed">{rec.text}</p>
                    </div>
                    <ChevronRight size={14} className="text-dark-700 mt-1 shrink-0 group-hover:text-gold group-hover:translate-x-1 transition-all" />
                  </div>
                </motion.div>
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
    </div>
  );
};

export default Dashboard;
