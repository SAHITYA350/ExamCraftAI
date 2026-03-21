import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import AccuracyChart from '../charts/AccuracyChart';
import RiskChart from '../charts/RiskChart';
import ChartPanel, { CHART_COLORS } from '../components/ChartPanel';
import submissionService from '../services/submissionService';
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
  Loader2,
  Download,
  RefreshCw,
  Plus,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  ChefHat,
  Settings2,
  ChevronDown
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Analytics = () => {
  const { searchQuery, setSearchQuery } = useSearch();
  const [timeRange, setTimeRange] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [practiceHistory, setPracticeHistory] = useState([]);
  const [radialHistory, setRadialHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [userTopics, setUserTopics] = useState('');
  const [planDays, setPlanDays] = useState(7);
  const [showPlanSettings, setShowPlanSettings] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState({});

  const toggleTaskExpansion = (day) => {
    setExpandedTasks(prev => ({ ...prev, [day]: !prev[day] }));
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 60 seconds
    const interval = setInterval(() => fetchAnalytics(false), 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await submissionService.getAnalytics();
      setAnalytics(res.data);

      // Process practice history
      const rawHistory = res.data?.practiceHistory || [];
      const mappedHistory = (rawHistory.length === 1
        ? [{ date: 'Initial', attempts: 0, correct: 0, incorrect: 0, accuracy: 0 }, ...rawHistory]
        : rawHistory).map((d, i) => ({
            ...d,
            name: d.date === 'Initial' ? 'Begin' : `S${i}`,
            _sin: Math.sin(i * 1.0) * 8 + 35,
            _cos: Math.cos(i * 0.7) * 10 + 55,
            _tan: Math.min(100, Math.max(0, Math.tan(i * 0.5) * 3 + 25))
          }));

      // Transform practice history for radial visualization
      const radialData = (mappedHistory || []).slice(-6).map((s, i) => ({
        name: s.name || `Session ${i + 1}`,
        value: s.accuracy || 0,
        fill: s.accuracy >= 80 ? CHART_COLORS.success : s.accuracy >= 60 ? CHART_COLORS.warning : CHART_COLORS.danger
      }));

      setPracticeHistory(mappedHistory);
      setRadialHistory(radialData);

    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setLoading(false);
    }
  };

  // Analytics data mapping
  const overallStats = [
    { label: 'Total Attempts', value: analytics?.totalAttempts || '0', icon: BookOpen, color: CHART_COLORS.gold },
    { label: 'Avg Accuracy', value: `${analytics?.overallAccuracy || 0}%`, icon: Target, color: CHART_COLORS.success },
    { label: 'Avg Time / Q', value: '1.2m', icon: Clock, color: CHART_COLORS.info },
    { label: 'Current Streak', value: `${analytics?.streak || 0} days`, icon: Flame, color: CHART_COLORS.warning },
  ];

  const filteredStats = overallStats.filter(stat => 
    stat.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topicAccuracy = analytics?.topicBreakdown || [];
  const difficultyData = [
    { name: 'Basic', value: analytics?.difficultyBreakdown?.Easy || 0, color: CHART_COLORS.success },
    { name: 'Intermediate', value: analytics?.difficultyBreakdown?.Medium || 0, color: CHART_COLORS.warning },
    { name: 'Advanced', value: analytics?.difficultyBreakdown?.Hard || 0, color: CHART_COLORS.danger },
  ];

  const studyPlan = analytics?.studyPlan || [];
  const weakTopics = analytics?.weakTopics || [];

  const handleGenerateStudyPlan = async () => {
    try {
      setLoading(true);
      const topicsArray = userTopics.split(',').map(t => t.trim()).filter(Boolean);
      const res = await submissionService.generateStudyPlan({
        topics: topicsArray,
        numDays: parseInt(planDays) || 7
      });
      setAnalytics(prev => ({ ...prev, studyPlan: res.data }));
      setShowPlanSettings(false);
    } catch (err) {
      console.error("Failed to generate study plan", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (day) => {
    const updatedPlan = studyPlan.map(task => 
      task.day === day ? { ...task, isCompleted: !task.isCompleted } : task
    );
    try {
      // Optimistic update
      setAnalytics(prev => ({ ...prev, studyPlan: updatedPlan }));
      await submissionService.saveStudyPlan(updatedPlan);
    } catch (err) {
      console.error("Failed to save study plan", err);
      // Rollback on error
      fetchAnalytics(false);
    }
  };

  const exportAsImage = async (format = 'png') => {
    const element = document.getElementById('study-plan-container');
    if (!element || exportLoading) return;
    try {
      setExportLoading(true);
      const canvas = await html2canvas(element, { 
        backgroundColor: '#121212',
        scale: 1.5,
        onclone: (clonedDoc) => {
          // Aggressive Rule-level stripping: Remove oklch/oklab from ALL stylesheets
          Array.from(clonedDoc.styleSheets).forEach(sheet => {
            try {
              const rules = Array.from(sheet.cssRules);
              for (let i = rules.length - 1; i >= 0; i--) {
                const rule = rules[i];
                if (rule.cssText && (rule.cssText.indexOf('okl') !== -1)) {
                  sheet.deleteRule(i);
                }
              }
            } catch (e) {} // Ignore cross-origin issues
          });

          // Robust element-level fix: Force override all colored properties
          const all = clonedDoc.querySelectorAll('*');
          all.forEach(el => {
            try {
              if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
              
              const style = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'outlineColor', 'stopColor', 'columnRuleColor', 'textDecorationColor', 'caretColor'];
              
              props.forEach(prop => {
                const val = style[prop];
                if (val && val.indexOf('okl') !== -1) {
                  if (prop === 'color') el.style.setProperty(prop, '#F5F0E8', 'important');
                  else if (prop === 'backgroundColor') el.style.setProperty(prop, '#1A1A1A', 'important');
                  else if (prop === 'borderColor' || prop === 'stroke' || prop === 'outlineColor') el.style.setProperty(prop, 'rgba(255,255,255,0.1)', 'important');
                  else el.style.setProperty(prop, 'transparent', 'important');
                }
              });

              // Check background shorthand (gradients/image)
              const bg = style.background || style.backgroundImage;
              if (bg && bg.indexOf('okl') !== -1) {
                el.style.setProperty('background', '#1A1A1A', 'important');
                el.style.setProperty('backgroundImage', 'none', 'important');
              }
            } catch (e) {}
          });

          // Expand study plan steps
          const stepContainers = clonedDoc.querySelectorAll('.study-steps-container');
          stepContainers.forEach(container => {
            container.style.height = 'auto';
            container.style.opacity = '1';
            container.style.overflow = 'visible';
            container.style.display = 'block';
          });
          
          // Hide UI elements 
          clonedDoc.querySelectorAll('.export-hidden, button').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
          });
        }
      });
      const image = canvas.toDataURL(`image/${format}`);
      const link = document.createElement('a');
      link.href = image;
      link.download = `ExamCraftAI_StudyPlan.${format}`;
      link.click();
    } catch (err) {
      console.error("Image export failed", err);
    } finally {
      setExportLoading(false);
    }
  };

  const exportAsPDF = async () => {
    const element = document.getElementById('study-plan-container');
    if (!element || exportLoading) return;
    try {
      setExportLoading(true);
      const canvas = await html2canvas(element, { 
        backgroundColor: '#121212',
        scale: 1.5,
        onclone: (clonedDoc) => {
          // Aggressive Rule-level stripping: Remove oklch/oklab from ALL stylesheets
          Array.from(clonedDoc.styleSheets).forEach(sheet => {
            try {
              const rules = Array.from(sheet.cssRules);
              for (let i = rules.length - 1; i >= 0; i--) {
                const rule = rules[i];
                if (rule.cssText && (rule.cssText.indexOf('okl') !== -1)) {
                  sheet.deleteRule(i);
                }
              }
            } catch (e) {} 
          });

          const all = clonedDoc.querySelectorAll('*');
          all.forEach(el => {
            try {
              if (el.tagName === 'SCRIPT' || el.tagName === 'STYLE') return;
              const style = window.getComputedStyle(el);
              const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'stopColor', 'outlineColor'];
              
              props.forEach(prop => {
                const val = style[prop];
                if (val && val.indexOf('okl') !== -1) {
                  if (prop === 'color') el.style.setProperty(prop, '#F5F0E8', 'important');
                  else if (prop === 'backgroundColor') el.style.setProperty(prop, '#1A1A1A', 'important');
                  else el.style.setProperty(prop, 'rgba(255,255,255,0.1)', 'important');
                }
              });
              
              const bg = style.background || style.backgroundImage;
              if (bg && bg.indexOf('okl') !== -1) {
                el.style.setProperty('background', '#1A1A1A', 'important');
                el.style.setProperty('backgroundImage', 'none', 'important');
              }
            } catch (e) {}
          });

          // Expand study plan steps
          clonedDoc.querySelectorAll('.study-steps-container').forEach(container => {
            container.style.height = 'auto';
            container.style.opacity = '1';
            container.style.overflow = 'visible';
            container.style.display = 'block';
          });

          // Hide UI elements 
          clonedDoc.querySelectorAll('.export-hidden, button').forEach(el => {
            el.style.setProperty('display', 'none', 'important');
          });
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('ExamCraftAI_StudyPlan.pdf');
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setExportLoading(false);
    }
  };

  // Generate dynamic AI feedback based on overall accuracy
  const getAiFeedback = () => {
    if (!analytics) return { title: 'Analytics Pending', text: 'Start your practice sessions to generate deeper AI insights.', type: 'neutral' };
    const acc = analytics.overallAccuracy || 0;
    if (acc >= 85) return { 
      title: 'Legendary Performance!', 
      text: `Outstanding! Your ${acc}% accuracy places you in the top tier of students. You've mastered your current set of topics.`,
      type: 'success',
      icon: Sparkles
    };
    if (acc >= 60) return { 
      title: 'Solid Progress', 
      text: `You're maintaining a strong ${acc}% average. We've detected slight inconsistencies in ${weakTopics[0] || 'your recent topics'}. Consistent review will bridge the gap.`,
      type: 'warning',
      icon: TrendingUp
    };
    if (acc > 0) return { 
      title: 'Critical Focus Required', 
      text: `Your ${acc}% accuracy indicates some fundamental misunderstandings. Focus on ${weakTopics.slice(0, 2).join(' and ') || 'the basics'} and take your time with the step-by-step explanations.`,
      type: 'danger',
      icon: AlertTriangle
    };
    return { title: 'No Data Yet', text: 'Complete a session to see your AI-analyzed academic profile.', type: 'neutral', icon: BarChart3 };
  };

  const aiFeedback = getAiFeedback();

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="page-container relative">
      {/* Export Overlay */}
      {exportLoading && (
        <div className="fixed inset-0 z-[100] bg-dark/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-3xl bg-gold/10 flex items-center justify-center mb-6 relative">
            <Loader2 size={40} className="animate-spin text-gold" />
            <div className="absolute inset-0 rounded-3xl border-2 border-gold/20 animate-ping" />
          </div>
          <h2 className="text-2xl font-bold text-silk font-[var(--font-display)] mb-2">Generating Your Roadmap</h2>
          <p className="text-silver-300 text-sm max-w-md">
            Please wait while we prepare your high-quality study plan. 
            This usually takes 5-10 seconds depending on the plan length.
          </p>
        </div>
      )}

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

      {/* AI AI Analysis Insight */}
       <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className={`mb-8 p-6 rounded-2xl border backdrop-blur-sm relative overflow-hidden flex items-center gap-6
          ${aiFeedback.type === 'success' ? 'bg-success/5 border-success/20' : 
            aiFeedback.type === 'danger' ? 'bg-danger/5 border-danger/20' : 
            aiFeedback.type === 'warning' ? 'bg-warning/5 border-warning/20' : 
            'bg-white/5 border-white/10'}`}
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg
          ${aiFeedback.type === 'success' ? 'bg-success/20 text-success shadow-success/10' : 
            aiFeedback.type === 'danger' ? 'bg-danger/20 text-danger shadow-danger/10' : 
            aiFeedback.type === 'warning' ? 'bg-warning/20 text-warning shadow-warning/10' : 
            'bg-white/10 text-silk shadow-white/5'}`}
        >
          {aiFeedback.icon ? <aiFeedback.icon size={28} /> : <Sparkles size={28} />}
        </div>
        <div>
          <h3 className={`text-lg font-bold font-[var(--font-display)] mb-0.5 
            ${aiFeedback.type === 'success' ? 'text-success' : 
              aiFeedback.type === 'danger' ? 'text-danger' : 
              aiFeedback.type === 'warning' ? 'text-warning' : 'text-silk'}`}
          >
            {aiFeedback.title}
          </h3>
          <p className="text-sm text-silver-200/80 leading-relaxed">
            {aiFeedback.text}
          </p>
        </div>
      </motion.div>

      {/* Charts Row 1 */}
      {loading ? (
        <div className="flex items-center justify-center py-20 opacity-40">
           <Loader2 size={40} className="animate-spin text-gold" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AccuracyChart data={practiceHistory} />

          <ChartPanel
            title="Session Performance Orbit"
            subtitle="Individual session accuracy trajectory"
            type="radialBar"
            data={radialHistory}
            dataKeys={['value']}
            height={280}
          />
        </div>
      )}

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RiskChart riskScore={analytics?.readinessIndex || 0} />


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
              <div key={topic.name} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                <p className="text-[10px] text-silver-200 uppercase mb-2 tracking-widest">{topic.name}</p>
                <p className="text-xl font-bold text-gold">{topic.accuracy}%</p>
                <p className="text-[10px] text-dark-700 mt-1">{topic.count} questions</p>
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
          <div className="space-y-4 py-10 text-center">
            {weakTopics.length > 0 ? (
              weakTopics.map((topicName, i) => (
                <div key={topicName} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                   <span className="text-sm text-silk font-medium">{topicName}</span>
                   <span className="text-xs font-bold text-danger">Needs Work</span>
                </div>
              ))
            ) : (
              <p className="text-sm italic opacity-40">No weak topics detected yet.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-card p-5 col-span-1 lg:col-span-1"
        >
          {/* AI Study Plan Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-30">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-gold animate-pulse" />
              <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">
                AI Personalized Study Plan
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {studyPlan.length > 0 && (
                <div className="dropdown dropdown-bottom sm:dropdown-end">
                  <div tabIndex={0} role="button" className={`btn btn-xs sm:btn-sm bg-white/5 hover:bg-white/10 border-white/10 text-silk flex items-center gap-2 rounded-xl transition-all ${exportLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {exportLoading ? (
                      <Loader2 size={14} className="animate-spin text-gold" />
                    ) : (
                      <Download size={14} className="text-gold" /> 
                    )}
                    <span className="font-semibold">{exportLoading ? 'Processing...' : 'Export'}</span>
                    <ChevronDown size={14} className="opacity-40" />
                  </div>
                  {!exportLoading && (
                    <ul tabIndex={0} className="dropdown-content z-[50] menu p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-[#0A0A0A] border border-white/10 rounded-2xl w-52 mt-2 backdrop-blur-3xl">
                      <li className="menu-title px-4 py-3 text-[10px] uppercase tracking-widest text-dark-700 font-bold border-b border-white/5 mb-2">Select Format</li>
                      <li>
                        <button onClick={exportAsPDF} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 group">
                          <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger group-hover:scale-110 transition-transform">
                            <FileText size={16} />
                          </div>
                          <span className="text-xs font-semibold text-silk">PDF Document</span>
                        </button>
                      </li>
                      <li>
                        <button onClick={() => exportAsImage('png')} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 group">
                          <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center text-gold group-hover:scale-110 transition-transform">
                            <ImageIcon size={16} />
                          </div>
                          <span className="text-xs font-semibold text-silk">PNG Image</span>
                        </button>
                      </li>
                      <li>
                        <button onClick={() => exportAsImage('jpeg')} className="flex items-center gap-3 py-3 px-4 rounded-xl hover:bg-white/5 group">
                          <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center text-info group-hover:scale-110 transition-transform">
                            <ImageIcon size={16} />
                          </div>
                          <span className="text-xs font-semibold text-silk">JPEG Image</span>
                        </button>
                      </li>
                    </ul>
                  )}
                </div>
              )}
              <button 
                onClick={() => setShowPlanSettings(!showPlanSettings)}
                className={`btn btn-xs sm:btn-sm flex items-center gap-2 rounded-xl transition-all ${
                  showPlanSettings ? 'bg-gold text-dark' : 'bg-gold/10 hover:bg-gold/20 text-gold border-gold/20'
                }`}
              >
                <Settings2 size={14} className={showPlanSettings ? 'rotate-90 transition-transform' : ''} />
                <span className="font-semibold">{studyPlan.length > 0 ? 'Adjust Goals' : 'Set Goals'}</span>
              </button>
            </div>
          </div>

          <div id="study-plan-container" className="p-1">
            {/* Plan Goals Input Panel */}
            <motion.div 
               animate={{ height: showPlanSettings ? 'auto' : 0, opacity: showPlanSettings ? 1 : 0 }}
               initial={false}
               className="overflow-hidden mb-6"
            >
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <ChefHat size={16} className="text-gold" />
                  <span className="text-xs font-bold uppercase tracking-wider text-silk">Personalize Your Roadmap</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-dark-700 uppercase font-bold mb-1.5 block px-1">Study Topics (comma separated)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Physics, IOT, Kinematics, Calculus"
                      value={userTopics}
                      onChange={(e) => setUserTopics(e.target.value)}
                      className="w-full h-11 bg-dark-400 border border-white/10 rounded-xl px-4 text-sm text-silk focus:border-gold/50 focus:outline-none transition-all placeholder:text-dark-700"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1">
                       <label className="text-[10px] text-dark-700 uppercase font-bold mb-1.5 block px-1">Duration (Days)</label>
                       <select 
                         value={planDays}
                         onChange={(e) => setPlanDays(e.target.value)}
                         className="w-full h-11 bg-dark-400 border border-white/10 rounded-xl px-4 text-sm text-silk focus:border-gold/50 focus:outline-none transition-all appearance-none cursor-pointer"
                       >
                         {[3, 5, 7, 10, 14, 21, 30].map(d => (
                           <option key={d} value={d}>{d} Days</option>
                         ))}
                       </select>
                    </div>
                    <div className="sm:pt-5">
                      <button 
                        onClick={handleGenerateStudyPlan}
                        disabled={loading}
                        className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gold text-dark font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-gold/20 disabled:opacity-50"
                      >
                        {loading ? 'Thinking...' : 'Generate Roadmap'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {studyPlan.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {studyPlan.sort((a,b) => a.day - b.day).map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      item.isCompleted ? 'bg-success/5 border-success/20 opacity-70' : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="relative pt-1">
                      <button 
                        onClick={() => handleToggleTask(item.day)}
                        className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          item.isCompleted ? 'bg-success border-success text-dark' : 'border-silver-600 hover:border-gold'
                        }`}
                      >
                        {item.isCompleted && <CheckCircle size={14} />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase tracking-wider ${item.isCompleted ? 'text-success/70' : 'text-gold'}`}>
                          Day {item.day} • {item.topic}
                        </span>
                        {item.isCompleted && <span className="text-[9px] font-bold text-success px-1.5 py-0.5 rounded bg-success/10 uppercase">Done</span>}
                      </div>
                      <p className={`text-sm leading-snug ${item.isCompleted ? 'text-silver-400 line-through' : 'text-silk'}`}>
                        {item.task}
                      </p>
                      
                      {item.steps && (
                        <div className="mt-3">
                          <button 
                            onClick={() => toggleTaskExpansion(item.day)}
                            className="text-[10px] font-bold text-gold/60 hover:text-gold flex items-center gap-1 transition-colors uppercase tracking-tighter"
                          >
                            {expandedTasks[item.day] ? 'Hide Full Steps' : 'See Full Steps'}
                            <ChevronDown size={10} className={`transition-transform export-hidden ${expandedTasks[item.day] ? 'rotate-180' : ''}`} />
                          </button>
                          
                          <motion.div
                            initial={false}
                            animate={{ height: expandedTasks[item.day] ? 'auto' : 0, opacity: expandedTasks[item.day] ? 1 : 0 }}
                            className="overflow-hidden study-steps-container"
                          >
                            <div className="pt-3 pb-1 text-xs text-silver-300 space-y-2 border-l-2 border-gold/20 pl-4 ml-1 mt-2">
                              {item.steps.split('\n').map((step, idx) => (
                                <p key={idx} className="leading-relaxed">
                                  {step.replace(/^\d+\.\s*/, '')}
                                </p>
                              ))}
                            </div>
                          </motion.div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center glass-card border-dashed border-white/10 opacity-60">
                <Brain size={32} className="mx-auto text-silver-600 mb-3" />
                 <p className="text-sm italic text-silver-300 px-4">Based on your performance, we can generate a custom 7-day study roadmap.</p>
                 <button 
                   onClick={handleGenerateStudyPlan}
                   className="mt-4 px-4 py-2 bg-gold/10 hover:bg-gold text-gold hover:text-dark border border-gold/20 rounded-lg text-xs font-bold transition-all"
                 >
                   Create My Roadmap
                 </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Analytics;
