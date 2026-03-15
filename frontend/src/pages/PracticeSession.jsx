import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import UploadAnswer from '../components/UploadAnswer';
import {
  Clock,
  ArrowLeft,
  Bookmark,
  Flag,
  CheckCircle2,
  XCircle,
  Award,
  TrendingUp,
  ChevronRight,
  Sparkles,
  Zap,
} from 'lucide-react';

const PracticeSession = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { question: questionData, topic, difficulty } = location.state || {};
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const timerRef = useRef(null);

  const question = questionData || {
    _id: '1',
    question_text: 'Evaluate the integral ∫(x² + 3x + 2)dx and find the constant of integration.',
    difficulty: 'intermediate',
    topic: 'Integration',
    time_limit: 15,
    marks: 10,
    expected_solution: 'x³/3 + 3x²/2 + 2x + C',
  };

  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerRunning]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const timeLimit = (question.time_limit || 15) * 60;
  const timePercentage = Math.min((timeElapsed / timeLimit) * 100, 100);
  const isOverTime = timeElapsed > timeLimit;

  const handleSubmit = async (answerData) => {
    setLoading(true);
    setIsTimerRunning(false);
    clearInterval(timerRef.current);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setResult({
      score: 0,
      maxScore: question.marks || 10,
      feedback: 'Awaiting AI evaluation...',
      keywordMatch: 0,
      conceptSimilarity: 0,
      mistakes: [],
      strengths: [],
      timeTaken: timeElapsed,
    });

    setLoading(false);
    setShowResult(true);
  };

  return (
    <div className="page-container max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/practice')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
            id="back-to-practice"
          >
            <ArrowLeft size={20} className="text-silver-200" />
          </button>
          <div>
            <p className="text-xs text-gold font-medium">{topic || question.topic} • {difficulty || question.difficulty}</p>
            <h1 className="text-lg sm:text-xl font-bold text-silk font-[var(--font-display)]">
              Practice Session
            </h1>
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${
          isOverTime ? 'bg-danger/10 border border-danger/20' : 'glass-card'
        }`}>
          <Clock size={18} className={isOverTime ? 'text-danger' : 'text-gold'} />
          <div>
            <p className={`text-lg font-bold font-mono ${isOverTime ? 'text-danger' : 'text-silk'}`}>
              {formatTime(timeElapsed)}
            </p>
            <p className="text-[10px] text-dark-700">
              Limit: {question.time_limit || 15} min
            </p>
          </div>
          {/* Timer progress */}
          <div className="w-16 h-1.5 rounded-full bg-dark-300 overflow-hidden hidden sm:block">
            <div
              className={`h-full rounded-full transition-all ${
                isOverTime ? 'bg-danger' : timePercentage > 75 ? 'bg-warning' : 'bg-gold'
              }`}
              style={{ width: `${Math.min(timePercentage, 100)}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!showResult ? (
          <motion.div
            key="session"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Question Panel */}
            <div className="lg:col-span-2">
              <div className="glass-card p-6 sticky top-20">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase bg-gold/10 text-gold border border-gold/20">
                    {question.difficulty || 'Intermediate'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" id="bookmark-question">
                      <Bookmark size={16} className="text-dark-700" />
                    </button>
                    <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors" id="report-question">
                      <Flag size={16} className="text-dark-700" />
                    </button>
                  </div>
                </div>

                <h2 className="text-lg font-semibold text-silk leading-relaxed mb-4 font-[var(--font-display)]">
                  {question.question_text || question.text}
                </h2>

                <div className="flex items-center gap-4 text-xs text-dark-700">
                  <span className="flex items-center gap-1">
                    <Zap size={12} />
                    {question.marks || 10} marks
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {question.time_limit || 15} min
                  </span>
                </div>
              </div>
            </div>

            {/* Answer Panel */}
            <div className="lg:col-span-3">
              <UploadAnswer
                questionId={question._id}
                onSubmit={handleSubmit}
                loading={loading}
              />
            </div>
          </motion.div>
        ) : (
          /* Result Panel */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto"
          >
            {/* Score Card */}
            <div className="glass-card p-8 text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
                style={{
                  background: result.score >= 70
                    ? 'linear-gradient(135deg, rgba(46,204,113,0.15), rgba(46,204,113,0.05))'
                    : result.score >= 50
                    ? 'linear-gradient(135deg, rgba(243,156,18,0.15), rgba(243,156,18,0.05))'
                    : 'linear-gradient(135deg, rgba(231,76,60,0.15), rgba(231,76,60,0.05))',
                  border: `2px solid ${result.score >= 70 ? '#2ECC71' : result.score >= 50 ? '#F39C12' : '#E74C3C'}40`,
                }}
              >
                <span className="text-3xl font-bold font-[var(--font-display)]" style={{
                  color: result.score >= 70 ? '#2ECC71' : result.score >= 50 ? '#F39C12' : '#E74C3C',
                }}>
                  {result.score}%
                </span>
              </motion.div>

              <h2 className="text-xl font-bold text-silk font-[var(--font-display)] mb-1">
                {result.score >= 80 ? 'Excellent!' : result.score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
              </h2>
              <p className="text-sm text-silver-200 mb-4">
                Score: {Math.round(result.score * result.maxScore / 100)}/{result.maxScore} • Time: {formatTime(result.timeTaken)}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-xl bg-dark-200">
                  <p className="text-xs text-dark-700 mb-1">Keyword Match</p>
                  <p className="text-lg font-bold text-gold">{result.keywordMatch}%</p>
                </div>
                <div className="p-3 rounded-xl bg-dark-200">
                  <p className="text-xs text-dark-700 mb-1">Concept Similarity</p>
                  <p className="text-lg font-bold text-info">{result.conceptSimilarity}%</p>
                </div>
              </div>

              {/* Feedback */}
              <div className="text-left p-4 rounded-xl bg-gold/5 border border-gold/10 mb-4">
                <p className="text-xs text-gold font-semibold mb-1.5 flex items-center gap-1">
                  <Sparkles size={12} /> AI Feedback
                </p>
                <p className="text-sm text-silk leading-relaxed">{result.feedback}</p>
              </div>
            </div>

            {/* Strengths & Mistakes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-success flex items-center gap-2 mb-3">
                  <CheckCircle2 size={16} /> Strengths
                </h3>
                <ul className="space-y-2">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-silver-200 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-danger flex items-center gap-2 mb-3">
                  <XCircle size={16} /> Areas to Improve
                </h3>
                <ul className="space-y-2">
                  {result.mistakes.map((m, i) => (
                    <li key={i} className="text-sm text-silver-200 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/practice')}
                className="btn-dark flex-1 py-3 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                Back to Practice
              </button>
              <button
                onClick={() => navigate('/analytics')}
                className="btn-gold flex-1 py-3 flex items-center justify-center gap-2"
              >
                <TrendingUp size={16} />
                View Analytics
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PracticeSession;
