import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearch } from '../context/SearchContext';
import questionsData from '../data/questions.json';
import {
  Search,
  BookOpen,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Layers,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

const subjects = [
  { id: 'math', name: 'Mathematics', icon: '📐', topics: ['Integration', 'Differentiation', 'Algebra', 'Probability', 'Trigonometry'] },
  { id: 'physics', name: 'Physics', icon: '⚡', topics: ['Mechanics', 'Thermodynamics', 'Optics', 'Electromagnetism', 'Waves'] },
  { id: 'cs', name: 'Computer Science', icon: '💻', topics: ['Data Structures', 'Algorithms', 'DBMS', 'OS', 'Networks'] },
  { id: 'chem', name: 'Chemistry', icon: '🧪', topics: ['Organic', 'Inorganic', 'Physical', 'Analytical'] },
];

const difficulties = [
  { value: 'easy', label: 'Basic', desc: 'Fundamental Concepts. Build a strong foundation.', color: '#2ECC71', icon: BookOpen },
  { value: 'intermediate', label: 'Intermediate', desc: 'Applying Knowledge. Deepen your understanding.', color: '#F39C12', icon: Brain },
  { value: 'hard', label: 'Advanced', desc: 'Complex Problem Solving. Master intricate topics.', color: '#E74C3C', icon: Zap },
];

const Practice = () => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useSearch();
  const [step, setStep] = useState('topic'); // topic | prerequisites | difficulty | generating | questions
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState([]);

  // Placeholder for prerequisites (to be fetched from backend)
  const prerequisites = {};

  const handleTopicSelect = (subject, topic) => {
    setSelectedSubject(subject);
    setSelectedTopic(topic);
    if (prerequisites[topic]) {
      setStep('prerequisites');
    } else {
      setStep('difficulty');
    }
  };

  const handleDifficultySelect = (diff) => {
    setSelectedDifficulty(diff);
    setStep('generating');
    
    // Preparation for AI Generating Questions via Backend
    setTimeout(async () => {
      try {
        const filtered = questionsData.filter(q => 
          q.topic.toLowerCase() === selectedTopic.toLowerCase() &&
          q.difficulty.toLowerCase() === diff.toLowerCase()
        );
        
        if (filtered.length > 0) {
          setGeneratedQuestions(filtered);
        } else {
          setGeneratedQuestions([]); // No questions found for now
        }
      } catch (err) {
        console.error("Failed to fetch questions", err);
        setGeneratedQuestions([]);
      }
      setStep('questions');
    }, 2500);
  };

  const handleStartPractice = (question) => {
    navigate('/upload-solution', { state: { question } });
  };

  const filteredSubjects = subjects.filter(
    (s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           s.topics.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="page-container">
      <AnimatePresence mode="wait">
        {/* STEP 1: Topic Selection */}
        {step === 'topic' && (
          <motion.div
            key="topic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {/* Header */}
            <div className="text-center mb-10">
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-silk font-[var(--font-display)] mb-4"
              >
                Which topic do you want to
                <br />
                <span className="text-gradient-gold">practice now?</span>
              </motion.h1>
              <p className="text-silver-200 text-sm sm:text-base">
                {searchQuery ? (
                  <span className="flex items-center justify-center gap-2">
                    Showing results for <span className="text-gold font-bold">&quot;{searchQuery}&quot;</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-full hover:bg-white/10 text-silver-300 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ) : (
                  "Explore subjects by categories"
                )}
              </p>
            </div>

            {/* Global Search Interaction for Custom Topics */}
            {searchQuery && filteredSubjects.length === 0 && (
              <div className="max-w-xl mx-auto mb-16 px-2">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="z-20"
                >
                  <button
                    onClick={() => handleTopicSelect({ name: 'Custom', id: 'custom', icon: '✨' }, searchQuery)}
                    className="w-full glass-card p-5 flex items-center justify-between group hover:border-gold/50 transition-all bg-dark-100/90 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center text-gold shadow-inner">
                        <Sparkles size={24} />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] text-gold uppercase tracking-[0.2em] font-black mb-0.5">Custom Practice</p>
                        <p className="text-silk text-lg font-bold font-[var(--font-display)] truncate max-w-[200px] sm:max-w-xs">{searchQuery}</p>
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold group-hover:text-dark transition-all">
                      <ArrowRight size={20} />
                    </div>
                  </button>
                </motion.div>
              </div>
            )}

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-4xl mx-auto pb-10">
              {filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject, si) => (
                  <motion.div
                    key={subject.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: si * 0.1 }}
                    className="glass-card p-5 sm:p-6 flex flex-col h-full"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                        {subject.icon}
                      </div>
                      <h3 className="text-xl font-bold text-silk font-[var(--font-display)]">{subject.name}</h3>
                    </div>
                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2.5">
                      {subject.topics
                        .filter((t) => t.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery)
                        .map((topic) => (
                          <button
                            key={topic}
                            onClick={() => handleTopicSelect(subject, topic)}
                            className="text-left p-3.5 rounded-xl bg-dark-200/50 hover:bg-gold/10 border border-white/5 hover:border-gold/30 transition-all text-sm text-silver-200 hover:text-silk group flex items-center justify-between"
                            id={`topic-${topic.toLowerCase().replace(/\s+/g, '-')}`}
                          >
                            <span className="flex items-center gap-2.5 truncate">
                              <Layers size={14} className="text-gold/40 group-hover:text-gold transition-colors shrink-0" />
                              <span className="truncate">{topic}</span>
                            </span>
                            <ChevronDown size={14} className="opacity-0 group-hover:opacity-40 -rotate-90 transition-all" />
                          </button>
                        ))}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full py-12 text-center">
                  <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                    <Search size={32} className="text-silver-200 opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-silk mb-2 font-[var(--font-display)]">No matching topics</h3>
                  <p className="text-silver-200 max-w-sm mx-auto">
                    Try typing a custom topic and click the practice card above to start.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* STEP 2: Prerequisites */}
        {step === 'prerequisites' && (
          <motion.div
            key="prerequisites"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="max-w-lg mx-auto text-center"
          >
            <div className="mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4"
              >
                <BookOpen size={28} className="text-gold" />
              </motion.div>
              <h2 className="text-2xl font-bold text-silk font-[var(--font-display)] mb-2">
                Topic: <span className="text-gradient-gold">{selectedTopic}</span>
              </h2>
            </div>
 
            <div className="glass-card p-6 mb-6 text-left">
              <div className="flex items-start gap-3 mb-4">
                <AlertTriangle size={20} className="text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-silk font-medium mb-2">
                    Before practicing {selectedTopic}, revise:
                  </p>
                  <ul className="space-y-2">
                    {(prerequisites[selectedTopic] || []).map((prereq) => (
                      <li key={prereq} className="flex items-center gap-2 text-sm text-silver-200">
                        <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
                        {prereq}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
 
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setStep('topic')}
                className="btn-gold flex-1 py-3 flex items-center justify-center gap-2"
                id="revise-prerequisites-btn"
              >
                <BookOpen size={16} />
                Revise Prerequisites
              </button>
              <button
                onClick={() => setStep('difficulty')}
                className="btn-dark flex-1 py-3 flex items-center justify-center gap-2"
                id="continue-anyway-btn"
              >
                Continue Anyway
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Difficulty Selection */}
        {step === 'difficulty' && (
          <motion.div
            key="difficulty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-10">
              <p className="text-sm text-gold mb-2 font-medium uppercase tracking-widest">
                {selectedSubject?.name} • {selectedTopic}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-2">
                Select Difficulty Level
              </h2>
              <p className="text-silver-200 text-sm">Choose based on your comfort level</p>
            </div>
 
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
              {difficulties.map((diff, i) => {
                const DiffIcon = diff.icon;
                return (
                  <motion.button
                    key={diff.value}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 }}
                    whileHover={{ y: -5, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDifficultySelect(diff.value)}
                    className="glass-card p-6 text-center group cursor-pointer border border-transparent hover:border-gold/30 transition-all"
                    id={`difficulty-${diff.value}`}
                  >
                    <div
                      className="w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 shadow-inner"
                      style={{ backgroundColor: `${diff.color}15` }}
                    >
                      <DiffIcon size={24} style={{ color: diff.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-silk font-[var(--font-display)] mb-2 group-hover:text-gold transition-colors">
                      {diff.label}
                    </h3>
                    <p className="text-xs text-silver-200 leading-relaxed">{diff.desc}</p>
                    <div className="mt-4 py-2 rounded-lg bg-dark-300 group-hover:bg-gold group-hover:text-dark transition-all">
                      <span className="text-sm font-semibold">Select</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
 
            <div className="text-center mt-6">
              <button onClick={() => setStep('topic')} className="text-sm text-silver-200 hover:text-gold transition-colors">
                ← Back to topic selection
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Generating Questions Loading */}
        {step === 'generating' && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh] text-center"
          >
            <div className="relative mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-t-2 border-r-2 border-gold/40 border-l-2 border-l-transparent absolute -inset-2"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border-b-2 border-gold absolute -inset-2 shadow-[0_0_15px_rgba(201,168,76,0.3)]"
              />
              <div className="w-24 h-24 rounded-full bg-dark-200 flex items-center justify-center shadow-inner relative z-10">
                <Sparkles size={32} className="text-gold animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-silk mb-2 font-[var(--font-display)] animate-pulse">
              AI Generating Questions...
            </h2>
            <p className="text-silver-200 text-sm max-w-xs mx-auto">
              Analyzing your selected topic and preparing specialized {selectedDifficulty} level problems.
            </p>
          </motion.div>
        )}

        {/* STEP 5: Question Selection */}
        {step === 'questions' && (
          <motion.div
            key="questions"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-10">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle size={18} className="text-success" />
                <span className="text-xs font-bold text-success uppercase tracking-[0.2em]">Ready for practice</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-2">
                Select a Question to Begin
              </h2>
              <p className="text-silver-200 text-sm">Pick the challenge that interests you most</p>
            </div>

            <div className="space-y-4 mb-8">
              {generatedQuestions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-gold/30 transition-all border-white/5 relative group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-bold uppercase tracking-widest">{selectedDifficulty}</span>
                      <span className="text-[10px] text-silver-200 flex items-center gap-1 font-mono uppercase">
                        <Clock size={10} /> {q.timeLimit} mins
                      </span>
                    </div>
                    <p className="text-silk text-lg font-medium leading-relaxed font-[var(--font-display)]">
                      {q.question}
                    </p>
                  </div>
                  <button
                    onClick={() => handleStartPractice(q)}
                    className="w-full sm:w-auto btn-gold px-8 py-3 whitespace-nowrap shadow-lg shadow-gold/10 group-hover:shadow-gold/20"
                  >
                    Solve Now
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <button 
                onClick={() => setStep('difficulty')} 
                className="text-sm text-silver-200 hover:text-gold transition-colors"
                id="back-to-diff-btn"
              >
                ← Back to difficulty
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Practice;
