import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import AccuracyChart from '../charts/AccuracyChart';
import RiskChart from '../charts/RiskChart';
import ChartPanel, { CHART_COLORS } from '../components/ChartPanel';
import {
  TrendingUp,
  Target,
  Clock,
  Award,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sparkles,
  Calendar,
  BarChart3,
  PieChart,
  Flame,
  ArrowLeft,
  X,
} from 'lucide-react';

const Analytics = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [timeRange, setTimeRange] = useState('week');

  // Analytics data (Reset for actual app)
  const overallStats = [
    { label: 'Total Attempts', value: '0', icon: BookOpen, color: CHART_COLORS.gold },
    { label: 'Avg Accuracy', value: '0%', icon: Target, color: CHART_COLORS.success },
    { label: 'Avg Time / Q', value: '0m', icon: Clock, color: CHART_COLORS.info },
    { label: 'Current Streak', value: '0 days', icon: Flame, color: CHART_COLORS.warning },
  ];

  const filteredStats = overallStats.filter(stat => 
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topicAccuracy = [];
  const difficultyData = [
    { name: 'Basic', value: 0, color: CHART_COLORS.success },
    { name: 'Intermediate', value: 0, color: CHART_COLORS.warning },
    { name: 'Advanced', value: 0, color: CHART_COLORS.danger },
  ];

  const practiceHistory = [];
  const weakTopics = [];
  const studyPlan = [];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-silver-200 hover:text-gold transition-all mb-4 group px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-gold/30"
            id="back-to-home-analytics"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-semibold uppercase tracking-wider">Back to Home</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)]">
            Performance Analytics
          </h1>
          <p className="text-silver-200 text-sm mt-1">
            {searchQuery ? (
              <span className="flex items-center gap-2">
                Results for <span className="text-gold font-bold">&quot;{searchQuery}&quot;</span>
                <button onClick={() => setSearchQuery('')} className="p-1 rounded-full hover:bg-white/10 text-silver-300">
                  <X size={12} />
                </button>
              </span>
            ) : (
              "Track your exam preparation progress"
            )}
          </p>
        </div>
        <div className="flex gap-2 p-1 bg-dark-200 rounded-xl">
          {['week', 'month', 'all'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                timeRange === range ? 'bg-gold text-dark shadow-lg' : 'text-silver-200 hover:text-silk'
              }`}
              id={`time-range-${range}`}
            >
              {range === 'all' ? 'All Time' : `This ${range}`}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {filteredStats.length > 0 ? (
          filteredStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.label} variants={item} className="stat-card">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon size={20} style={{ color: stat.color }} />
                </div>
                <p className="text-2xl font-bold text-silk font-[var(--font-display)]">{stat.value}</p>
                <p className="text-xs text-dark-700 mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full py-10 text-center glass-card opacity-50">
             <p className="text-sm italic text-silver-200">No matching metrics for &quot;{searchQuery}&quot;</p>
          </div>
        )}
      </motion.div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AccuracyChart />

        <ChartPanel
          title="Daily Practice"
          subtitle="Questions solved per day"
          type="bar"
          data={practiceHistory}
          dataKeys={['questions', 'accuracy']}
          colors={[CHART_COLORS.gold, CHART_COLORS.info]}
          height={280}
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RiskChart riskScore={0} />

        {/* Difficulty Performance */}
        <ChartPanel title="Difficulty Breakdown" subtitle="Accuracy by difficulty level">
          <div className="space-y-5 mt-2">
            {difficultyData.map((diff, i) => (
              <div key={diff.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-silk">{diff.name}</span>
                  <span className="text-sm font-bold" style={{ color: diff.color }}>{diff.value}%</span>
                </div>
                <div className="w-full h-3 rounded-full bg-dark-300 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: diff.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${diff.value}%` }}
                    transition={{ duration: 1, delay: 0.3 + i * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ChartPanel>
      </div>

      {/* Topic Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-5 mb-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">
            Topic-wise Performance
          </h3>
          <BarChart3 size={18} className="text-gold" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-8 text-center">
          {topicAccuracy.length > 0 ? (
            topicAccuracy.map((topic, i) => (
              <div key={topic.name}>
                {/* ... existing topic render ... */}
              </div>
            ))
          ) : (
            <div className="col-span-full py-10 opacity-40">
              <p className="text-sm italic">Detailed topic analytics will appear here after your first 5 sessions.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle size={18} className="text-warning" />
            <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">
              Weak Topics — Needs Attention
            </h3>
          </div>
          <div className="space-y-4 py-10 text-center opacity-40">
            {weakTopics.length > 0 ? (
              weakTopics.map((topic, i) => (
                <div key={topic.name}>
                  {/* ... existing topic render ... */}
                </div>
              ))
            ) : (
              <p className="text-sm italic">No weak topics detected yet.</p>
            )}
          </div>
        </motion.div>

        {/* AI Study Plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5"
        >
          <div className="flex items-center gap-2 mb-5">
            <Sparkles size={18} className="text-gold" />
            <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">
              AI Study Plan
            </h3>
          </div>
          <div className="space-y-4 py-10 text-center opacity-40">
            {studyPlan.length > 0 ? (
              studyPlan.map((day, i) => (
                <div key={day.day}>
                  {/* ... existing plan render ... */}
                </div>
              ))
            ) : (
              <p className="text-sm italic">Start practicing to generate your AI study plan.</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
