import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Upload, FileText, File, X, CheckCircle, Loader2,
  BookOpen, FileUp, Layers, Sparkles, Type, Brain, Zap, Clock,
  AlertTriangle, ChevronRight, UploadCloud, FileImage,
  TrendingUp, Award, BarChart2, Target, Shield, Star,
  ArrowRight, Check, RotateCcw, PenLine, Plus, LayoutDashboard
} from 'lucide-react';

import questionService from '../services/questionService';
import submissionService from '../services/submissionService';
import sessionService from '../services/sessionService';

/* ─── Constants ─────────────────────────────────────── */
const MOCK_TOPICS = [];

const PREREQUISITES = {
  Integration:       ['Basic Differentiation', 'Limits'],
  Differentiation:   ['Limits', 'Algebra'],
  Thermodynamics:    ['Laws of Motion', 'Heat Transfer Basics'],
  'Data Structures': ['Basic Programming', 'Arrays & Loops'],
};

const DIFFICULTIES = [
  { value: 'easy',         label: 'Basic',        desc: 'Fundamental concepts — build a strong foundation.',  color: '#2ECC71', icon: BookOpen },
  { value: 'intermediate', label: 'Intermediate',  desc: 'Apply knowledge and deepen understanding.',          color: '#F39C12', icon: Brain   },
  { value: 'hard',         label: 'Advanced',      desc: 'Complex problem solving — master intricate topics.', color: '#E74C3C', icon: Zap     },
];

const buildQuestions = (topic) => [
  { id: 'q1', text: `Explain the core fundamentals of "${topic}" with a practical, real-world example.`,              time: 15 },
  { id: 'q2', text: `A student applies "${topic}" to solve the following scenario — describe the steps involved.`,    time: 20 },
  { id: 'q3', text: `Compare and contrast two key concepts within "${topic}" and give situations where each applies.`, time: 12 },
];
// (DEPRECATED - Moved to real AI)

const STEPS_CONFIG = [
  { id: 1, label: 'Upload'     },
  { id: 2, label: 'Topics'     },
  { id: 3, label: 'Check'      },
  { id: 4, label: 'Difficulty' },
  { id: 5, label: 'Practice'   },
  { id: 6, label: 'Results'    },
  { id: 7, label: 'Summary'    },
];

/* ─── Step Bar ───────────────────────────────────────── */
function StepBar({ current }) {
  return (
    <div className="w-full mb-4 sm:mb-8 overflow-x-auto pb-3 scrollbar-hide -mx-2 px-2 mask-fade-edges">
      <div className="flex items-center min-w-max mx-auto justify-start sm:justify-center gap-1">
        {STEPS_CONFIG.map((s, i) => {
          const done   = current > s.id;
          const active = current === s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5 px-1.5 sm:px-2">
                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[9px] sm:text-xs font-bold transition-all duration-300
                  ${done   ? 'bg-gold text-dark shadow-[0_0_12px_rgba(201,168,76,0.35)]'            : ''}
                  ${active ? 'bg-gold/15 border-2 border-gold text-gold ring-2 ring-gold/20'        : ''}
                  ${!done && !active ? 'bg-dark-300 border border-white/8 text-silver-200/30'       : ''}`}>
                  {done ? <Check size={10} /> : s.id}
                </div>
                <span className={`text-[7px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest transition-colors leading-none
                  ${active ? 'text-gold' : done ? 'text-silver-200/70' : 'text-silver-200/25'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS_CONFIG.length - 1 && (
                <div className={`w-2 sm:w-12 lg:w-16 h-px mb-4 transition-all duration-300
                  ${done ? 'bg-gold/50' : 'bg-white/8'}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section heading helper ─────────────────────────── */
function SectionHead({ badge, badgeIcon: BadgeIcon, title, subtitle, step, total }) {
  return (
    <div className="text-center mb-6 sm:mb-9 px-2">
      {badge && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-4">
          {BadgeIcon && <BadgeIcon size={13} className="text-gold" />}
          <span className="text-[10px] sm:text-xs font-bold text-gold uppercase tracking-[0.15em]">{badge}</span>
        </div>
      )}
      <h2 className="text-xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-2 leading-tight">
        {title}
      </h2>
      {subtitle && <p className="text-silver-200 text-xs sm:text-sm max-w-sm sm:max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}

/* ─── Main page ──────────────────────────────────────── */
export default function UploadMaterial() {
  const location = useLocation();
  const navigate = useNavigate();
  const routeState = location.state || {};

  /* ── State Management ── */
  const [step,           setStep]           = useState(1);
  const [uploadKind,     setUploadKind]     = useState('notes'); // 'notes' | 'pdf' | 'syllabus'
  const [textInput,      setTextInput]      = useState('');
  const [files,          setFiles]          = useState([]);
  const [uploading,      setUploading]      = useState(false);
  const [materialId,     setMaterialId]     = useState(null);
  const [sessionId,      setSessionId]      = useState(null);
  const [detectedTopics, setDetectedTopics] = useState([]);
  const [extractedText,  setExtractedText]  = useState('');
  
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopic,    setCustomTopic]    = useState('');
  const [topicPrereqs,   setTopicPrereqs]   = useState([]);
  
  const [difficulty,     setDifficulty]     = useState('');
  const [questionCount,  setQuestionCount]  = useState(10); // Number of Questions Default: 10
  const [generating,     setGenerating]     = useState(false);
  const [loadingMore,    setLoadingMore]    = useState(false);
  
  const [questions,      setQuestions]      = useState([]);
  const [pickedQ,        setPickedQ]        = useState(null);
  const [solveMode,      setSolveMode]      = useState(false);
  
  const [inputMode,      setInputMode]      = useState('upload'); // 'upload' | 'write'
  const [plainText,      setPlainText]      = useState('');
  const [solFile,        setSolFile]        = useState(null);
  const [solDrag,        setSolDrag]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [score,          setScore]          = useState(null);
  
  const [timeLeft,       setTimeLeft]       = useState(null);
  const [dragActive,     setDragActive]     = useState(false);

  const [bookmarks,      setBookmarks]      = useState([]); // Question IDs
  const [solvedQIds,     setSolvedQIds]     = useState([]); // Question IDs
  const [viewedSolutions, setViewedSolutions] = useState([]); // Question IDs
  const [viewingSol,      setViewingSol]     = useState(null); // { id, text } or null
  const [sessionSubmissions, setSessionSubmissions] = useState([]); // Full submission history
  const [sessionData,    setSessionData]    = useState(null); // Full session object on finish

  // Derived state to fix reference errors
  const selectedTopic = selectedTopics[0] || 'General Topic';

  const fileInputRef = useRef(null);
  const solFileRef   = useRef(null);
  const timerRef     = useRef(null);

  /* ── Handle navigation from Practice page or Sessions (Resume) ── */
  useEffect(() => {
    if (routeState.resume && routeState.sessionId) {
      resumeSession(routeState.sessionId);
    } else if (routeState.skipToQuestions && routeState.topic && routeState.difficulty) {
      handlePracticeStart(routeState.topic, routeState.difficulty);
    }
  }, [routeState]);

  const handlePracticeStart = async (topic, diff) => {
    setSelectedTopics([topic]);
    setDifficulty(diff);
    setGenerating(true);
    setStep(5);
    try {
      // Call real backend for practice topics (creates virtual material + session)
      const response = await questionService.processMaterial(null, diff, 5, topic);
      const payload = response.data || response;
      const questionsArray = payload.questions || [];
      
      setSessionId(payload.sessionId);
      setMaterialId(payload.material?._id);

      const generated = questionsArray.map((q, idx) => ({
        ...q,
        id: q._id || q.id || `gen-${idx}`,
        text: q.questionText,
        time: diff === 'hard' ? 9 : diff === 'intermediate' ? 6 : 3
      }));
      setQuestions(generated);
    } catch (err) {
      console.error("Practice start failed", err);
      // Fallback to minimal state if even AI-virtual fails
      setStep(4);
    } finally {
      setGenerating(false);
    }
  };

  const resumeSession = async (id) => {
    setGenerating(true);
    setStep(5);
    try {
      const res = await sessionService.getSessionById(id);
      const s = res.data;
      setSessionId(s._id);
      setMaterialId(s.studyMaterial?._id);
      setSelectedTopics(Array.isArray(s.topic) ? s.topic : (s.topic?.includes(',') ? s.topic.split(',').map(t => t.trim()) : [s.topic]));
      setDifficulty(s.difficulty);
      
      const mappedQs = s.questions.map(q => ({
        ...q,
        id: q._id,
        text: q.questionText,
        time: s.difficulty === 'hard' ? 9 : s.difficulty === 'intermediate' ? 6 : 3
      }));
      setQuestions(mappedQs);
      
      // Load solved status and bookmarks
      if (s.submissions) {
        const solved = s.submissions.map(sub => sub.question?._id || sub.question);
        setSolvedQIds(solved);
        setSessionSubmissions(s.submissions);
      }
      if (s.bookmarks) {
        setBookmarks(s.bookmarks);
      }
      if (s.viewedSolutions) {
        setViewedSolutions(s.viewedSolutions.map(v => v._id || v));
      }

      // Direct navigation to Analysis if requested
      if (routeState.showAnalysis) {
        setSessionData(s);
        setStep(7);
      } else {
        setStep(5);
      }
    } catch (err) {
      console.error("Resume failed", err);
      setStep(1);
    } finally {
      setGenerating(false);
    }
  };

  /* ── Timer Logic ── */
  useEffect(() => {
    if (solveMode && pickedQ && timeLeft === null) setTimeLeft(pickedQ.time * 60);
  }, [solveMode, pickedQ, timeLeft]);

  useEffect(() => {
    if (solveMode && timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(p => {
          if (p <= 1) {
            clearInterval(timerRef.current);
            handleTimerExpired();
            return 0;
          }
          return p - 1;
        });
      }, 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [solveMode, timeLeft]);


  const fmt = (s) => {
    if (s === null) return '--:--:--';
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  /* ── Step-1 handlers ── */
  const addFiles = (newFiles) => {
    const list = Array.from(newFiles).map(f => ({
      file: f, id: Date.now() + Math.random(), name: f.name, size: f.size, type: f.type,
    }));
    setFiles(prev => [...prev, ...list]);
  };

  const removeFile = (id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const fileIcon    = (type) => type?.includes('pdf')
    ? <FileText size={17} className="text-danger" />
    : <File size={17} className="text-info" />;

  const handleUpload = async () => {
    if (files.length === 0 && uploadKind !== 'syllabus') {
      alert("Please upload at least one file.");
      return;
    }
    if (uploadKind === 'syllabus' && textInput.trim().length === 0) {
      alert("Please enter your syllabus content.");
      return;
    }

    setUploading(true);
    try {
      let response;
      if (uploadKind === 'syllabus') {
        // Send as text input
        response = await questionService.uploadText(textInput, "Syllabus Analysis");
      } else {
        // Send as files
        response = await questionService.uploadMaterial(files.map(f => f.file), files[0]?.name || "Material Cluster");
      }

      console.log("[Client] Upload Response:", response);
      const payload = response.data || response; 
      const materialObj = payload.material || payload;
      const topicsList = payload.detectedTopics || [];
      const textFound = materialObj?.extractedText || "";
      
      setMaterialId(materialObj?._id || materialObj?.id);
      setDetectedTopics(topicsList);
      setExtractedText(textFound);
      setStep(2);
    } catch (err) {
      console.error("Upload failed", err);
      alert("AI Scanning failed. Please Check Backend Status.");
    } finally {
      setUploading(false);
    }
  };
  const canUpload = (uploadKind !== 'syllabus' && files.length > 0)
                 || (uploadKind === 'syllabus' && textInput.trim().length > 0);

  const toggleTopic = (t) => {
    setSelectedTopics(prev => 
      prev.includes(t) ? prev.filter(i => i !== t) : [...prev, t]
    );
  };

  const confirmTopicsSelection = async () => {
    const topics = selectedTopics.length > 0 ? selectedTopics : (customTopic.trim() ? [customTopic.trim()] : []);
    if (topics.length === 0) return;
    
    // For prerequisites, we'll just check the first one or a combined list if the backend supports it.
    // Given the current backend, we'll fetch for the first one for now, or just skip to difficulty for multiple.
    if (topics.length === 1) {
      try {
        const response = await questionService.getPrerequisites(topics[0]);
        if (response && response.data && response.data.length > 0) {
          setTopicPrereqs(response.data);
          setStep(3);
          return;
        }
      } catch (err) {
        console.error("Failed to fetch prerequisites", err);
      }
    }
    setStep(4);
  };

  /* ── Step-4 handlers ── */
  const selectDifficulty = async (diff) => {
    setDifficulty(diff);
    setGenerating(true);
    setStep(5);
    try {
      const topicString = selectedTopics.join(', ');
      const response = await questionService.processMaterial(materialId, diff, questionCount, topicString);
      console.log("[Client] Process Response:", response);

      const payload = response.data || response;
      const questionsArray = payload.questions || [];
      const newSessionId = payload.sessionId;

      if (newSessionId) setSessionId(newSessionId);

      const generated = questionsArray.map((q, idx) => ({
        ...q,
        id: q._id || q.id || `gen-${idx}`,
        text: q.questionText,
        time: diff === 'hard' ? 9 : diff === 'intermediate' ? 6 : 3
      }));
      setQuestions(generated);
    } catch (err) {
      console.error("Generation failed", err);
      alert("AI Generation failed. Check backend/Groq limits.");
      setStep(4);
    } finally {
      setGenerating(false);
    }
  };

  const loadMoreQuestions = async () => {
    if (loadingMore) return;
    setLoadingMore(true);
    try {
      const topicString = selectedTopics.join(', ');
      const response = await questionService.processMaterial(materialId, difficulty, 5, topicString, sessionId);
      const payload = response.data || response;
      const newQuestions = (payload.questions || []).map((q, idx) => ({
        ...q,
        id: q._id || q.id || `gen-more-${questions.length + idx}`,
        text: q.questionText,
        time: difficulty === 'hard' ? 9 : difficulty === 'intermediate' ? 6 : 3
      }));
      
      setQuestions(prev => {
        const existingTexts = new Set(prev.map(q => q.text));
        const filteredNew = newQuestions.filter(q => !existingTexts.has(q.text));
        return [...prev, ...filteredNew];
      });
    } catch (err) {
      console.error("Failed to load more questions", err);
    } finally {
      setLoadingMore(false);
    }
  };

  /* ── Solution handlers ── */
  const handleSolDrop = (e) => {
    e.preventDefault(); setSolDrag(false);
    if (e.dataTransfer.files?.[0]) setSolFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    const has = inputMode === 'upload' ? solFile : plainText.trim();
    if (!has) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    
    try {
      let result;
      if (inputMode === 'upload') {
        const formData = new FormData();
        formData.append('file', solFile);
        formData.append('questionId', pickedQ._id || pickedQ.id);
        if (sessionId) formData.append('sessionId', sessionId);
        result = await submissionService.uploadAnswer(formData);
      } else {
        result = await submissionService.submitAnswer({
          questionId: pickedQ._id || pickedQ.id,
          userAnswer: plainText,
          timeTaken: (pickedQ.time * 60) - (timeLeft || 0),
          sessionId: sessionId
        });
      }
      
      setScore(result.data.score || 0);
      setStep(6);
      
      // Update solved status locally
      const qId = pickedQ._id || pickedQ.id;
      if (!solvedQIds.includes(qId)) {
        setSolvedQIds(prev => [...prev, qId]);
      }

      // Store full result for analysis display
      setPickedQ(prev => ({ ...prev, lastResult: result.data }));
      setSessionSubmissions(prev => [...prev, result.data]);
      
      // Update viewed status to "Lock" the question after submission
      if (!viewedSolutions.includes(qId)) {
        setViewedSolutions(prev => [...prev, qId]);
      }
    } catch (err) {
      console.error("Evaluation failed", err);
      alert("AI Evaluation failed. Please check your connection.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBookmark = async (qId) => {
    if (!sessionId) return;
    try {
      const res = await sessionService.toggleBookmark(sessionId, qId);
      // res.data is the updated bookmarks array
      setBookmarks(res.data);
    } catch (err) {
      console.error("Failed to toggle bookmark", err);
    }
  };

  const handleViewSolution = async (qId, solText) => {
    if (!sessionId) return;
    try {
      if (viewedSolutions.includes(qId)) {
        setViewingSol({ id: qId, text: solText });
        return;
      }
      
      const res = await sessionService.viewSolution(sessionId, qId);
      // res.data is the updated viewedSolutions array
      setViewedSolutions(res.data);
      setViewingSol({ id: qId, text: solText });
      
    } catch (err) {
      console.error("Failed to record solution view", err);
    }
  };

  const handleTimerExpired = async () => {
    if (pickedQ) {
       // Lock the question and show solution
       const solText = `Correct Answer: ${pickedQ.correctAnswer}\n${pickedQ.options && pickedQ.options.length > 0 ? `\nOptions:\n${pickedQ.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join('\n')}\n` : ''}${pickedQ.explanation ? `\nExplanation:\n${pickedQ.explanation}` : ''}`;
       handleViewSolution(pickedQ._id || pickedQ.id, solText);
       alert("⏱️ Time is up! This question has been locked to maintain academic integrity. You can review the correct solution, but you can no longer submit an answer for it.");
    }
  };

  /* ── Full reset ── */
  const resetAll = () => {
    setStep(1); setFiles([]); setTextInput(''); setDetectedTopics([]);
    setSelectedTopics([]); setCustomTopic(''); setDifficulty('');
    setQuestions([]); setPickedQ(null); setGenerating(false);
    setSolveMode(false); setInputMode('upload'); setPlainText('');
    setSolFile(null); setSubmitting(false); setScore(null);
    setTimeLeft(null); setDragActive(false); setSolDrag(false);
    setUploadKind('notes');
  };

  const backToPrevStep = () => setStep(s => Math.max(1, s - 1));

  /* ─────────────────────────────────────────────────── */
  return (
    <div className="page-container max-w-4xl mx-auto">

      {/* ── Step bar ── */}
      <StepBar current={step} />

      {/* ── Persistent Back Button ── */}
      {step > 1 && step < 6 && (
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={backToPrevStep}
          className="flex items-center gap-2 text-silver-200/60 hover:text-gold transition-colors mb-4 group px-1"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-gold/10 transition-all">
            <RotateCcw size={14} className="group-hover:rotate-[-45deg] transition-transform" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Go Back / Change</span>
        </motion.button>
      )}

      <AnimatePresence mode="wait">

        {/* ════════════════════════════════════════════
            1 — Upload Study Material
        ════════════════════════════════════════════ */}
        {step === 1 && (
          <motion.div key="s1"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>

            <SectionHead
              badge="Step 1 · Upload"
              badgeIcon={FileUp}
              title="Upload Study Materials"
              subtitle="Choose a material type and upload — AI will analyze topics & knowledge gaps automatically" />

            {/* ── 3-card type selector (matches reference image) ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
              {[
                { key: 'notes',   emoji: '📝', label: 'Upload Notes',      desc: 'Handwritten or typed notes',   accept: '.txt,.doc,.docx,.png,.jpg,.jpeg', color: '#3498DB' },
                { key: 'pdf',     emoji: '📄', label: 'Upload PDF',        desc: 'Textbooks, lecture slides',    accept: '.pdf',                           color: '#E74C3C' },
                { key: 'syllabus',emoji: '📚', label: 'Syllabus Coverage', desc: 'Paste your syllabus as text',  accept: null,                             color: '#F39C12' },
              ].map((kind, i) => (
                <motion.button key={kind.key}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setUploadKind(kind.key)}
                  className={`glass-card p-4 sm:p-5 flex sm:flex-col items-center gap-3 sm:gap-0 text-left sm:text-center border-2 transition-all cursor-pointer
                    ${uploadKind === kind.key
                      ? 'border-gold bg-gold/5 shadow-[0_0_24px_rgba(201,168,76,0.12)]'
                      : 'border-white/6 hover:border-gold/25'}`}
                  id={`kind-${kind.key}`}>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 sm:mx-auto rounded-2xl flex items-center justify-center shrink-0 sm:mb-3 text-2xl sm:text-3xl"
                    style={{ backgroundColor: `${kind.color}14` }}>
                    {kind.emoji}
                  </div>
                  <div className="flex-1 sm:flex-none">
                    <p className={`text-sm sm:text-base font-bold mb-0.5 sm:mb-1 transition-colors
                      ${uploadKind === kind.key ? 'text-gold' : 'text-silk'}`}>
                      {kind.label}
                    </p>
                    <p className="text-[10px] sm:text-xs text-silver-200/60">{kind.desc}</p>
                  </div>
                  {uploadKind === kind.key && (
                    <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center shrink-0 sm:mx-auto sm:mt-2">
                      <Check size={11} className="text-dark" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* ── Upload area based on kind ── */}
            <AnimatePresence mode="wait">
              {uploadKind !== 'syllabus' ? (
                <motion.div key="file-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  {/* Drop zone */}
                  <div
                    onDrop={e => { e.preventDefault(); setDragActive(false); addFiles(e.dataTransfer.files); }}
                    onDragOver={e => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`glass-card p-6 sm:p-10 text-center cursor-pointer mb-4 border-2 border-dashed transition-all
                      ${dragActive ? 'border-gold bg-gold/5 scale-[1.015]' : 'border-dark-500 hover:border-gold/40'}`}
                    id="material-dropzone">
                    <input ref={fileInputRef} type="file"
                      accept={uploadKind === 'pdf' ? '.pdf' : '.txt,.doc,.docx,.png,.jpg,.jpeg'}
                      multiple onChange={e => { addFiles(e.target.files); e.target.value = null; }} className="hidden" />
                    <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-3 sm:mb-4">
                      <FileUp size={24} className="text-gold" />
                    </div>
                    <p className="text-sm sm:text-base font-medium text-silk mb-1">
                      Drop {uploadKind === 'pdf' ? 'PDF files' : 'notes'} here or{' '}
                      <span className="text-gold">browse</span>
                    </p>
                    <p className="text-xs text-silver-200/50">
                      {uploadKind === 'pdf' ? 'PDF files only' : 'DOC · TXT · PNG · JPG'} — multiple files supported
                    </p>
                  </div>

                  {/* File list */}
                  <AnimatePresence>
                    {files.map(f => (
                      <motion.div key={f.id}
                        initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 14 }}
                        className="glass-card p-3 flex items-center gap-3 mb-2">
                        {fileIcon(f.type)}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-silk truncate">{f.name}</p>
                          <p className="text-[10px] sm:text-xs text-silver-200/50">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); removeFile(f.id); }}
                          className="p-1.5 rounded-lg hover:bg-danger/10 text-silver-200/40 hover:text-danger transition-colors shrink-0">
                          <X size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div key="text-area" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4">
                  <div className="mb-3 flex items-center gap-2 text-xs text-silver-200/60">
                    <Type size={13} className="text-gold" />
                    <span>Paste or type your syllabus content below</span>
                  </div>
                  <textarea value={textInput} onChange={e => setTextInput(e.target.value)}
                    placeholder="e.g. Unit 1: Integration\nUnit 2: Differential Equations\nUnit 3: Probability..."
                    className="input-dark min-h-[180px] sm:min-h-[220px] resize-y w-full leading-relaxed p-4 sm:p-5 text-sm" />
                  <p className="text-right text-[10px] sm:text-xs text-silver-200/40 mt-1">{textInput.length} characters</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Analyze button */}
            {canUpload && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                onClick={handleUpload} disabled={uploading}
                className="btn-gold w-full py-3 sm:py-3.5 flex items-center justify-center gap-2 text-sm sm:text-[15px] mt-2"
                id="upload-btn">
                {uploading ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>System Analysis in Progress…</span>
                  </>
                ) : (
                  <>
                    <Upload size={17} />
                    Analyze &amp; Detect Topics
                  </>
                )}
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            2 — Topic Selection
        ════════════════════════════════════════════ */}
        {step === 2 && (
          <motion.div key="s2"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>

            <SectionHead
              badge="Topics Detected"
              badgeIcon={Sparkles}
              title="Select a Topic to Practice"
              subtitle="AI found these topics — pick one to start or search anything else" />

            {/* Detected chips */}
            <div className="glass-card p-4 sm:p-6 mb-4 sm:mb-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain size={15} className="text-gold" />
                <h3 className="text-sm font-semibold text-silk">
                  AI-Detected Topics <span className="text-silver-200/50">({detectedTopics.length})</span>
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {detectedTopics.map((t, i) => {
                  const isSelected = selectedTopics.includes(t);
                  return (
                    <motion.button key={t}
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => toggleTopic(t)}
                      className={`flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl border text-xs sm:text-sm font-medium transition-all active:scale-95 
                        ${isSelected 
                          ? 'bg-gold text-dark border-gold shadow-[0_0_15px_rgba(201,168,76,0.3)]' 
                          : 'bg-gold/8 text-gold border-gold/20 hover:bg-gold/18 hover:border-gold/45'}`}>
                      <Layers size={12} /> {t}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Custom topic */}
            <div className="glass-card p-4 sm:p-5 border border-white/8 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <PenLine size={14} className="text-gold" />
                <p className="text-xs sm:text-sm font-semibold text-silk">Or add a custom topic</p>
              </div>
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <input type="text" value={customTopic}
                    onChange={e => setCustomTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && customTopic.trim() && (toggleTopic(customTopic.trim()), setCustomTopic(''))}
                    placeholder="e.g. Quantum Mechanics, Machine Learning…"
                    className="w-full bg-dark-200/60 border border-white/8 rounded-xl px-4 py-3 text-silk text-sm placeholder-silver-200/30 outline-none focus:border-gold/50 transition-all pr-8" />
                  {customTopic && (
                    <button onClick={() => setCustomTopic('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-silver-200/40 hover:text-silver-200">
                      <X size={13} />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => { if(customTopic.trim()) { toggleTopic(customTopic.trim()); setCustomTopic(''); } }}
                  disabled={!customTopic.trim()}
                  className="px-4 rounded-xl bg-gold/10 border border-gold/20 text-gold hover:bg-gold/20 transition-all disabled:opacity-30">
                  <Plus size={18} />
                </button>
              </div>

              {selectedTopics.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                  <p className="w-full text-[10px] font-bold text-silver-200/40 uppercase tracking-widest mb-1">Selected Topics:</p>
                  {selectedTopics.map(t => (
                    <div key={t} className="flex items-center gap-1.5 px-2 py-1 bg-gold/20 text-gold rounded-lg text-xs font-bold border border-gold/20">
                      {t}
                      <X size={10} className="hover:text-silk cursor-pointer" onClick={() => toggleTopic(t)} />
                    </div>
                  ))}
                </div>
              )}

              <button onClick={confirmTopicsSelection} disabled={selectedTopics.length === 0 && !customTopic.trim()}
                className="w-full btn-gold py-2.5 sm:py-3 text-sm flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                {selectedTopics.length > 0 
                  ? `Continue with ${selectedTopics.length} Topic${selectedTopics.length > 1 ? 's' : ''}` 
                  : 'Practice This Topic'} <ChevronRight size={14} />
              </button>
            </div>

            {/* Recognized Content Visualization */}
            {extractedText && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-4 sm:p-5 border border-gold/10 bg-gold/5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-gold" />
                  <p className="text-xs font-bold text-silk uppercase tracking-widest">Recognized Content Preview</p>
                </div>
                <div className="max-h-32 overflow-y-auto text-[11px] text-silver-200/80 leading-relaxed font-mono whitespace-pre-wrap scrollbar-hide">
                  {extractedText.substring(0, 500)}{extractedText.length > 500 ? '...' : ''}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            3 — Prerequisite Check
        ════════════════════════════════════════════ */}
        {step === 3 && (
          <motion.div key="s3"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}
            className="max-w-lg mx-auto">

            <SectionHead
              badge="Prerequisite Check"
              badgeIcon={AlertTriangle}
              title="Revise Before You Start"
              subtitle="We recommend reviewing these foundational topics first for the best results" />

            <div className="glass-card p-4 sm:p-6 mb-5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-warning/10 flex items-center justify-center mb-4">
                <AlertTriangle size={24} className="text-warning" />
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 mb-5 mx-auto flex justify-center">
                <span className="text-xs sm:text-sm font-bold text-gold">{selectedTopics.join(' + ')}</span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-silk mb-4 flex items-center gap-2">
                <BookOpen size={14} className="text-gold shrink-0" />
                Before practicing, revise:
              </p>
              <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {topicPrereqs.map(p => (
                  <li key={p} className="flex items-center gap-3 text-[11px] sm:text-sm text-silver-200 bg-white/5 p-2 rounded-lg border border-white/5">
                    <CheckCircle size={12} className="text-success shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setStep(2)}
                className="btn-dark flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                <BookOpen size={14} /> Revise Prerequisites
              </button>
              <button onClick={() => setStep(4)}
                className="btn-gold flex-1 py-3 flex items-center justify-center gap-2 text-sm">
                Continue Anyway <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            4 — Difficulty Selection
        ════════════════════════════════════════════ */}
        {step === 4 && (
          <motion.div key="s4"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>

            <SectionHead
              badge="Configure Practice"
              badgeIcon={Target}
              title="Tailor Your Practice Quiz"
              subtitle="Select question range and difficulty for real-time AI generation" />

            {/* Range Selection — Clean Premium Slider — Matches Reference Image 2 */}
            <div className="mb-10 max-w-2xl mx-auto px-4 relative overflow-hidden rounded-3xl bg-dark-400/20 py-8 border border-white/5">
              {/* Subtle Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                   style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', size: '20px 20px', backgroundSize: '40px 40px' }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8 px-2">
                  <div className="flex flex-col gap-0.5">
                    <div className="w-1 h-3 bg-gold/40 rounded-full" />
                    <div className="w-1 h-5 bg-gold rounded-full" />
                    <div className="w-1 h-2 bg-gold/60 rounded-full" />
                  </div>
                  <h3 className="text-[10px] sm:text-[11px] font-black text-silver-200 uppercase tracking-[0.3em] flex items-center gap-2">
                    Number of Questions: <span className="text-gold text-base sm:text-lg ml-1 font-[var(--font-display)]">{questionCount}</span>
                  </h3>
                </div>
                
                <div className="relative h-14 flex items-center px-2 group/slider">
                  {/* Track Background (Inactive) */}
                  <div className="absolute left-2 right-2 h-1 bg-white/10 rounded-full" />
                  
                  {/* Active Progress with Glow */}
                  <div 
                    className="absolute left-2 h-1 bg-gold rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(201,168,76,0.6)]"
                    style={{ width: `calc(${((questionCount - 5) / 20) * 100}% - 8px)` }}
                  />
                  
                  {/* The actual input — Custom styling for mobile grab */}
                  <input 
                    type="range" min="5" max="25" step="1"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                    className="absolute inset-0 w-full h-full appearance-none bg-transparent cursor-pointer z-20 
                               [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-10 sm:[&::-webkit-slider-thumb]:w-8 sm:[&::-webkit-slider-thumb]:h-8 
                               [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold [&::-webkit-slider-thumb]:border-[5px] 
                               [&::-webkit-slider-thumb]:border-dark-100 [&::-webkit-slider-thumb]:shadow-[0_0_20px_rgba(201,168,76,0.8)]
                               [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110
                               [&::-webkit-slider-runnable-track]:appearance-none
                               touch-none"
                  />

                  {/* Marker Ticks (Optional but adds to "instrument" look) */}
                  <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none px-0.5">
                    {[5, 10, 15, 20, 25].map(v => (
                      <div key={v} className={`w-0.5 h-1.5 rounded-full ${questionCount >= v ? 'bg-gold/40' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-between mt-4 px-2 text-[10px] font-bold text-silver-200/30 uppercase tracking-widest font-mono">
                  <span>5</span>
                  <span className="opacity-60">15</span>
                  <span>25</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6 px-4">
              <Layers size={18} className="text-gold" />
              <h3 className="text-[10px] sm:text-[11px] font-black text-silver-200 uppercase tracking-[0.3em]">Choose Difficulty</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 max-w-3xl mx-auto px-1 mb-8">
              {DIFFICULTIES.map((d, i) => {
                const DI = d.icon;
                return (
                  <motion.button key={d.value}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={() => selectDifficulty(d.value)}
                    className="glass-card p-4 sm:p-6 group cursor-pointer border border-transparent hover:border-gold/30 transition-all flex sm:flex-col items-center gap-4 sm:gap-0 text-left sm:text-center"
                    id={`diff-${d.value}`}>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 sm:mx-auto rounded-2xl flex items-center justify-center shrink-0 sm:mb-4 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${d.color}18` }}>
                      <DI size={22} style={{ color: d.color }} />
                    </div>
                    <div className="flex-1 sm:flex-none">
                      <h3 className="text-sm sm:text-lg font-bold text-silk font-[var(--font-display)] group-hover:text-gold transition-colors sm:mb-1.5">
                        {d.label}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-silver-200/70 leading-relaxed">{d.desc}</p>
                    </div>
                    <ChevronRight size={16} className="text-silver-200/20 group-hover:text-gold sm:hidden shrink-0" />
                    <div className="mt-4 py-2 rounded-lg bg-dark-300 group-hover:bg-gold group-hover:text-dark transition-all w-full hidden sm:block">
                      <span className="text-sm font-semibold">Generate Quiz</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            5 — Practice & Solution Upload
        ════════════════════════════════════════════ */}
        {step === 5 && (
          <motion.div key="s5"
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}>

            {/* ── Generating spinner ── */}
            {generating && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 mb-6">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-t-2 border-r-2 border-gold/45"
                    style={{ borderLeftColor: 'transparent', borderBottomColor: 'transparent' }} />
                  <motion.div animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 rounded-full border-b-2 border-gold shadow-[0_0_20px_rgba(201,168,76,0.25)]"
                    style={{ borderTopColor: 'transparent', borderLeftColor: 'transparent', borderRightColor: 'transparent' }} />
                  <div className="absolute inset-0 rounded-full bg-dark-200 flex items-center justify-center">
                    <Sparkles size={28} className="text-gold animate-pulse" />
                  </div>
                </div>
                <div className="flex gap-2 mb-4 flex-wrap justify-center">
                  <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs font-bold text-gold truncate max-w-[200px]">{selectedTopic}</span>
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-silver-200 capitalize">{difficulty}</span>
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-silk mb-2 font-[var(--font-display)] animate-pulse">
                  Generating Questions…
                </h2>
                <p className="text-silver-200 text-xs sm:text-sm">
                  Preparing <span className="capitalize font-semibold text-silk">{difficulty}</span> level problems for{' '}
                  <strong className="text-gold">{selectedTopic}</strong>
                </p>
              </div>
            )}

            {/* ── Question picker ── */}
            {!generating && !solveMode && (
              <>
                <div className="text-center mb-6 sm:mb-8">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <CheckCircle size={15} className="text-success" />
                    <span className="text-[10px] sm:text-xs font-bold text-success uppercase tracking-widest">Questions Ready</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 mb-4">
                    <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs font-bold text-gold truncate max-w-[160px] sm:max-w-none">{selectedTopic}</span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/8 text-xs text-silver-200 capitalize">
                      {difficulty === 'easy' ? '🟢' : difficulty === 'intermediate' ? '🟡' : '🔴'}{' '}{difficulty}
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-1">Select a Question</h2>
                  <p className="text-silver-200 text-xs sm:text-sm">Pick one to start your timed practice session</p>
                </div>

                <div className="space-y-3 sm:space-y-4 mb-8">
                  {questions.map((q, i) => {
                    const qId = q._id || q.id;
                    const isSolved = solvedQIds.includes(qId);
                    const isBookmarked = bookmarks.includes(qId);
                    const isLocked = viewedSolutions.includes(qId);
                    
                    return (
                      <motion.div key={q.id}
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.09 }}
                        className={`glass-card p-4 sm:p-5 border transition-all group relative overflow-hidden
                          ${isLocked ? 'border-danger/20 bg-danger/5 opacity-80' : isSolved ? 'border-success/30 bg-success/5' : 'border-white/5 hover:border-gold/25'}`}>
                        
                        {isLocked ? (
                          <div className="absolute top-0 right-0">
                            <div className="bg-danger text-silk text-[8px] sm:text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                              <Shield size={10} strokeWidth={3} /> Locked (Solution Viewed)
                            </div>
                          </div>
                        ) : isSolved && (
                          <div className="absolute top-0 right-0">
                            <div className="bg-success text-dark text-[8px] sm:text-[10px] font-black px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                              <Check size={12} strokeWidth={3} /> Solved
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 sm:gap-3 mb-3">
                          <span className="text-[9px] sm:text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-bold uppercase tracking-widest capitalize">{difficulty}</span>
                          <span className="text-[9px] sm:text-[10px] text-silver-200 flex items-center gap-1 font-mono">
                            <Clock size={9} /> {q.time} mins
                          </span>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                          <p className={`text-sm sm:text-base font-medium leading-relaxed font-[var(--font-display)] flex-1
                            ${isLocked || isSolved ? 'text-silk/60' : 'text-silk'}`}>
                            {q.text}
                          </p>
                          
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                             <button
                               onClick={() => toggleBookmark(qId)}
                               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all border
                                 ${isBookmarked 
                                   ? 'bg-gold text-dark border-gold shadow-[0_0_15px_rgba(201,168,76,0.4)]' 
                                   : 'bg-white/5 text-silver-200/40 border-white/10 hover:border-gold/50 hover:text-gold'}`}
                               title={isBookmarked ? "Remove Bookmark" : "Bookmark Question"}>
                               <Star size={18} fill={isBookmarked ? "currentColor" : "none"} />
                             </button>

                             <button
                               onClick={() => { 
                                 if (isLocked) {
                                   alert("You have already viewed the solution for this question. It cannot be re-attempted for fair practice.");
                                   return;
                                 }
                                 setPickedQ(q); 
                                 setSolveMode(true); 
                                 setTimeLeft(q.time * 60); 
                               }}
                               disabled={isLocked}
                               className={`btn-gold px-4 sm:px-6 py-2.5 flex items-center justify-center gap-2 text-sm active:scale-95 transition-all
                                 ${isLocked ? 'opacity-30 grayscale cursor-not-allowed' : isSolved ? 'opacity-70 hover:opacity-100' : ''}`}>
                               {isLocked ? <Shield size={15} /> : <UploadCloud size={15} />} 
                               <span className="xs:inline">{isLocked ? 'Locked' : isSolved ? 'Solve Again' : 'Upload Solution'}</span>
                             </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <motion.button
                      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={loadMoreQuestions}
                      disabled={loadingMore}
                      className="flex-1 py-3.5 sm:py-4 rounded-2xl border-2 border-dashed border-gold/20 hover:border-gold/50 bg-gold/5 hover:bg-gold/10 transition-all flex items-center justify-center gap-3 group">
                      {loadingMore ? (
                        <>
                          <Loader2 size={18} className="animate-spin text-gold" />
                          <span className="text-xs sm:text-sm font-bold text-gold uppercase tracking-widest">Questions…</span>
                        </>
                      ) : (
                        <>
                          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center group-hover:bg-gold/20 transition-all">
                            <Plus size={18} className="text-gold" />
                          </div>
                           <span className="text-xs sm:text-sm font-bold text-gold uppercase tracking-widest">Add More Questions</span>
                        </>
                      )}
                    </motion.button>
 
                    {solvedQIds.length > 0 && (
                      <motion.button
                        whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                        onClick={async () => {
                          if (!sessionId) { 
                            setStep(7);
                            return; 
                          }
                          try {
                            const res = await sessionService.completeSession(sessionId);
                            setSessionData(res.data);
                            setStep(7);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          } catch (err) {
                            console.error("Finish failed", err);
                            setStep(7);
                          }
                        }}
                        className="flex-1 py-3.5 sm:py-4 rounded-2xl bg-gold text-dark border border-gold shadow-lg shadow-gold/20 flex items-center justify-center gap-2 group">
                        <Check size={18} strokeWidth={3} />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Finish Session</span>
                      </motion.button>
                    )}
                  </div>
                </div>

              </>
            )}

            {/* ── Solve mode ── */}
            {!generating && solveMode && pickedQ && (
              <motion.div key="solve" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}>

                {/* Header bar */}
                <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5 sm:mb-6">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <button
                      onClick={() => { setSolveMode(false); setPickedQ(null); clearInterval(timerRef.current); setTimeLeft(null); }}
                      className="p-1.5 sm:p-2 rounded-lg hover:bg-white/5 transition-colors text-silver-200 text-sm">
                      ←
                    </button>
                    <div>
                      <p className="text-[10px] sm:text-xs text-gold font-medium">
                        {selectedTopic} · <span className="capitalize">{difficulty}</span>
                      </p>
                      <p className="text-sm sm:text-base font-bold text-silk font-[var(--font-display)]">Practice Session</p>
                    </div>
                  </div>
                  {/* Timer */}
                  <div className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl self-start xs:self-auto
                    ${timeLeft <= 60 ? 'bg-danger/10 border border-danger/20' : 'glass-card'}`}>
                    <Clock size={15} className={timeLeft <= 60 ? 'text-danger' : 'text-gold'} />
                    <span className={`text-base sm:text-lg font-bold font-mono ${timeLeft <= 60 ? 'text-danger' : 'text-silk'}`}>
                      {fmt(timeLeft)}
                    </span>
                    <span className="text-[10px] text-silver-200/40 hidden sm:block">/ {pickedQ.time}:00</span>
                  </div>
                </div>

                {/* Question display */}
                <div className="glass-card p-4 sm:p-6 lg:p-8 mb-4 sm:mb-5 border border-white/8">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-[9px] sm:text-[10px] bg-gold/10 text-gold px-2 py-0.5 rounded border border-gold/20 font-bold uppercase tracking-widest capitalize">
                      {difficulty}
                    </span>
                    <span className="text-[10px] text-silver-200/50 flex items-center gap-1 font-mono">
                      <Clock size={9} /> {pickedQ.time} mins
                    </span>
                  </div>
                  <p className="text-silk text-sm sm:text-base lg:text-lg font-medium leading-relaxed font-[var(--font-display)]">
                    {pickedQ.text}
                  </p>
                </div>

                {/* Detect Lock State */}
                {(() => {
                  const qId = pickedQ._id || pickedQ.id;
                  const isLocked = viewedSolutions.includes(qId) || solvedQIds.includes(qId);
                  const lastAttempt = [...sessionSubmissions].reverse().find(sub => (sub.question?._id || sub.question) === qId);

                  return (
                    <div className="glass-card overflow-hidden border border-white/8 relative">
                      {/* Card header */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <span className="text-xs sm:text-sm font-semibold text-silk flex items-center gap-2">
                          <Award size={14} className="text-gold" /> 
                          {isLocked ? 'Solution Overview' : 'Submit Your Solution'}
                        </span>
                        {!isLocked && (
                          <div className="flex bg-dark-300 rounded-lg p-0.5 gap-0.5 border border-white/5 w-full sm:w-auto">
                            {[['upload','Upload File'],['text','Write Text']].map(([m, label]) => (
                              <button key={m} onClick={() => setInputMode(m)}
                                className={`flex-1 sm:flex-none px-2.5 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all
                                  ${inputMode === m ? 'bg-gold text-dark shadow' : 'text-silver-200 hover:text-silk'}`}>
                                {label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="p-4 sm:p-6 lg:p-8">
                        {/* Fair Attempt Warning (Only if NOT locked) */}
                        {!isLocked && (
                          <div className="mb-6 p-4 rounded-xl bg-gold/5 border border-gold/10 flex items-start gap-3">
                            <Shield size={16} className="text-gold shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-bold text-silk mb-1">Fair Attempt Policy</p>
                              <p className="text-[10px] sm:text-xs text-silver-200/70 leading-relaxed">
                                Once you view the AI solution, this question will be <span className="text-gold font-bold">permanently locked</span> for submission to ensure honest practice.
                              </p>
                              <button 
                                onClick={() => {
                                  if (window.confirm("Are you sure? Viewing the solution will permanently lock this question from further attempts.")) {
                                    handleViewSolution(pickedQ._id || pickedQ.id, pickedQ.correctAnswer);
                                  }
                                }}
                                className="mt-3 text-[10px] font-black text-gold uppercase tracking-widest hover:underline flex items-center gap-2">
                                <Brain size={12} /> View AI Solution Now
                              </button>
                            </div>
                          </div>
                        )}

                        {/* SOLUTION PREVIEW (LOCKED/REVEALED) */}
                        {(viewingSol?.id === qId || isLocked) && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-5">
                            
                            {/* Comparison Row (if attempt exists) */}
                            {lastAttempt && (
                              <div className="p-5 rounded-2xl bg-danger/5 border border-danger/10">
                                <div className="flex items-center gap-2 mb-3">
                                  <X size={14} className="text-danger" />
                                  <h5 className="text-[10px] font-black text-silver-200 uppercase tracking-widest">Your Previous Attempt</h5>
                                </div>
                                <p className="text-xs sm:text-sm text-silk/60 leading-relaxed italic bg-black/10 p-3 rounded-xl border border-white/5">
                                  {lastAttempt.userAnswer || "Visual/Image submission provided."}
                                </p>
                              </div>
                            )}

                            {/* Correct Solution */}
                            <div className="p-5 rounded-2xl bg-dark-400 border border-success/30 shadow-lg shadow-success/5">
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                  <CheckCircle size={14} className="text-success" />
                                  <h5 className="text-[10px] font-black text-silver-200 uppercase tracking-widest">AI Correct Solution (Locked)</h5>
                                </div>
                                <span className="text-[9px] text-success font-bold uppercase tracking-widest bg-success/10 px-2 py-0.5 rounded border border-success/20">Verified Truth</span>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="p-4 rounded-xl bg-black/20 border border-white/5">
                                  <p className="text-xs sm:text-sm font-bold text-success mb-2 uppercase tracking-tighter">Answer</p>
                                  <p className="text-sm sm:text-base text-silk font-bold leading-relaxed">{pickedQ.correctAnswer || viewingSol?.text}</p>
                                </div>
                                
                                <div className="p-4 rounded-xl bg-black/10 border border-white/5">
                                  <p className="text-xs sm:text-sm font-bold text-silver-500 mb-2 uppercase tracking-tighter">AI Strong Reasoning Explanation</p>
                                  <p className="text-sm text-silk/80 leading-relaxed whitespace-pre-wrap">{pickedQ.explanation || "Full logic and explanation analyzed for this question."}</p>
                                </div>
                              </div>

                              <p className="text-[9px] text-danger/60 mt-4 font-bold uppercase tracking-tighter text-center">
                                Note: This question is now locked. You cannot submit an answer for it.
                              </p>
                              <button 
                                onClick={() => { setSolveMode(false); setPickedQ(null); setViewingSol(null); }}
                                className="mt-5 w-full py-3 bg-white/5 hover:bg-white/10 text-silk text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/8 transition-all active:scale-[0.98]">
                                ← Back to Question List
                              </button>
                            </div>
                          </motion.div>
                        )}

                        {/* Submission Inputs (Only if NOT locked) */}
                        {!isLocked && !viewingSol && (
                          <>
                            {inputMode === 'upload' ? (
                              <div
                                onDrop={handleSolDrop}
                                onDragOver={e => { e.preventDefault(); setSolDrag(true); }}
                                onDragLeave={() => setSolDrag(false)}
                                className={`border-2 border-dashed rounded-2xl p-6 sm:p-10 lg:p-14 text-center transition-all
                                  ${solDrag ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-white/10 hover:border-gold/30 bg-dark-200/30'}`}>
                                {!solFile ? (
                                  <div className="flex flex-col items-center gap-3 sm:gap-4">
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-dark-300/80 flex items-center justify-center">
                                      <Upload size={22} className="text-silver-200 sm:hidden" />
                                      <Upload size={30} className="text-silver-200 hidden sm:block" />
                                    </div>
                                    <div>
                                      <p className="text-sm sm:text-base lg:text-lg text-silk font-medium mb-1">Drag & Drop Your Answer</p>
                                      <p className="text-[11px] sm:text-xs text-silver-200/50">Image, PDF, or Word document of your solution</p>
                                    </div>
                                    <button onClick={() => solFileRef.current?.click()}
                                      className="btn-outline-gold py-2 sm:py-2.5 px-5 sm:px-7 rounded-xl text-xs sm:text-sm">
                                      Choose File
                                    </button>
                                    <input type="file" ref={solFileRef}
                                      onChange={e => setSolFile(e.target.files[0])}
                                      className="hidden" accept="image/*,.pdf,.doc,.docx" />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-3 sm:gap-4 bg-dark-300 px-4 sm:px-5 py-3 sm:py-4 rounded-xl border border-white/10 max-w-sm mx-auto">
                                    <FileImage size={24} className="text-gold shrink-0" />
                                    <div className="flex-1 min-w-0 text-left">
                                      <p className="text-xs sm:text-sm font-semibold text-silk truncate">{solFile.name}</p>
                                      <p className="text-[10px] sm:text-xs text-silver-200/60">{(solFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={() => setSolFile(null)}
                                      className="p-1.5 hover:bg-danger/20 rounded-full text-silver-200/40 hover:text-danger transition-colors shrink-0">
                                      <X size={15} />
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="relative">
                                <textarea value={plainText} onChange={e => setPlainText(e.target.value)}
                                  onPaste={(e) => {
                                    e.preventDefault();
                                    alert("Pasting is disabled for this session to ensure honest practice. Please type your reasoning step-by-step.");
                                  }}
                                  placeholder="Write your step-by-step solution here…"
                                  className="w-full h-52 sm:h-64 lg:h-72 bg-dark-300 border border-white/10 rounded-2xl p-4 sm:p-6 text-silk text-sm font-light focus:outline-none focus:border-gold/30 transition-all resize-none placeholder-silver-200/25 leading-relaxed" />
                                <div className="absolute bottom-3 right-4 text-[10px] text-silver-200/40 font-mono">
                                  {plainText.length} chars
                                </div>
                              </div>
                            )}

                            {/* Submit button */}
                            <button onClick={handleSubmit}
                              disabled={(inputMode === 'upload' ? !solFile : !plainText.trim()) || submitting}
                              className={`w-full mt-5 sm:mt-6 py-3 sm:py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all flex items-center justify-center gap-2 sm:gap-3
                                ${(inputMode === 'upload' ? solFile : plainText.trim())
                                  ? 'btn-gold shadow-lg shadow-gold/20 active:scale-[0.98]'
                                  : 'bg-dark-300 text-silver-200/40 cursor-not-allowed border border-white/5'}`}>
                              {submitting
                                ? <><div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-dark border-t-transparent rounded-full animate-spin" /> Evaluating with AI…</>
                                : <><UploadCloud size={16} /> Submit Solution</>}
                            </button>

                            <div className="flex items-start gap-2.5 mt-4 sm:mt-5 px-1">
                              <div className="p-1 sm:p-1.5 bg-success/10 rounded-md shrink-0 mt-0.5">
                                <CheckCircle size={12} className="text-success" />
                              </div>
                              <p className="text-[10px] sm:text-xs text-silver-200/50 leading-relaxed">
                                By submitting, you confirm this is your own original solution and adheres to academic integrity policy.
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </motion.div>
            )}
          </motion.div>
            )}

        {/* ════════════════════════════════════════════
            6 — Results & Academic Readiness Output
        ════════════════════════════════════════════ */}
        {step === 6 && score !== null && (
          <motion.div key="s6"
            initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }} transition={{ duration: 0.35 }}
            className="max-w-3xl mx-auto">

            {/* Score hero card */}
            <div className="glass-card p-6 sm:p-8 lg:p-10 text-center mb-4 sm:mb-5 border border-white/10 bg-gradient-to-b from-dark-100 to-dark-200">
              <p className="text-[10px] sm:text-xs font-bold text-gold uppercase tracking-[0.2em] mb-4">
                Academic Risk &amp; Readiness Output
              </p>

              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                className="w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 mx-auto rounded-full flex items-center justify-center mb-4 sm:mb-5 shadow-[0_0_40px_rgba(0,0,0,0.3)]"
                style={{
                  background: score >= 80
                    ? 'linear-gradient(135deg,rgba(46,204,113,0.18),rgba(46,204,113,0.04))'
                    : score >= 60
                    ? 'linear-gradient(135deg,rgba(243,156,18,0.18),rgba(243,156,18,0.04))'
                    : 'linear-gradient(135deg,rgba(231,76,60,0.18),rgba(231,76,60,0.04))',
                  border: `2px solid ${score >= 80 ? '#2ECC71' : score >= 60 ? '#F39C12' : '#E74C3C'}50`,
                }}>
                <span className="text-2xl sm:text-4xl font-bold font-[var(--font-display)]"
                  style={{ color: score >= 80 ? '#2ECC71' : score >= 60 ? '#F39C12' : '#E74C3C' }}>
                  {score}%
                </span>
              </motion.div>

              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-silk font-[var(--font-display)] mb-2">
                {score >= 90 ? 'Perfect Mastery! Consistently Correct.' 
                 : score >= 80 ? 'Excellent Progress! Congratulation on your accuracy.' 
                 : score >= 60 ? 'Good Effort! Some concepts need refinement.'
                 : score >= 30 ? 'Focused Learning Required. Keep practicing.'
                 : 'Critical Review Needed. Let\'s strengthen your fundamentals.'}
              </h2>
              <p className="text-xs sm:text-sm text-silver-200 mb-5 sm:mb-6 leading-relaxed px-4">
                {score >= 80 
                  ? "You've demonstrated a deep understanding of this topic. Your reasoning aligns perfectly with academic standards." 
                  : score <= 35 
                  ? `Your performance in ${selectedTopic} shows significant gaps. We recommend reviewing core definitions and trying simpler examples first.`
                  : "You're on the right track. Pay close attention to the step-by-step analysis to catch minor logical slips."
                }
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 sm:h-2.5 bg-dark-300 rounded-full overflow-hidden mb-1 border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                  transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                  className="h-full rounded-full"
                  style={{
                    background: score >= 80
                      ? 'linear-gradient(90deg,#2ECC71,#27ae60)'
                      : score >= 60
                      ? 'linear-gradient(90deg,#F39C12,#e8850a)'
                      : 'linear-gradient(90deg,#E74C3C,#c0392b)',
                  }} />
              </div>
              <p className="text-[10px] sm:text-xs text-silver-200/50 text-right">{score}/100</p>
            </div>

            {/* AI Feedback Section — Strong Reasoning Analysis */}
            <div className="glass-card p-5 sm:p-7 mb-5 border border-gold/10 bg-gold/5 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-3 opacity-10">
                  <Brain size={60} className="text-gold" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles size={16} className="text-gold" />
                    <h4 className="text-[10px] sm:text-xs font-black text-silver-200 uppercase tracking-[0.2em]">AI Strong Reasoning Feedback</h4>
                  </div>
                  <p className={`text-sm sm:text-base leading-relaxed font-medium italic mb-6 
                    ${score >= 80 ? 'text-success/90' : score < 50 ? 'text-danger/90 underline decoration-danger/20 decoration-2 underline-offset-4' : 'text-silk/90'}`}>
                    "{pickedQ?.lastResult?.feedback || 'Analysis complete. Your logic was assessed for conceptual accuracy and formal rigor.'}"
                  </p>

                  {/* Step Analysis */}
                  {pickedQ?.lastResult?.stepAnalysis?.length > 0 && (
                    <div className="space-y-3 border-t border-white/5 pt-5">
                      <div className="flex items-center gap-2 mb-2">
                         <Layers size={14} className="text-gold/60" />
                         <span className="text-[10px] font-bold text-silver-200/40 uppercase tracking-widest">Logical Breakdown</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {pickedQ.lastResult.stepAnalysis.map((step, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * idx }}
                            className="flex items-start gap-3 p-3 rounded-xl bg-dark-300/40 border border-white/5"
                          >
                            <span className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-[10px] font-bold text-gold shrink-0 mt-0.5">{idx + 1}</span>
                            <p className="text-xs sm:text-sm text-silver-200/80 leading-relaxed">{step}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
               </div>
            </div>

            {/* Metric grid — 2 col on all, 4 col on sm+ */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-4 sm:mb-5">
              {[
                { icon: Target,    label: 'Accuracy',      val: `${score}%`,                                                                       color: '#C9A84C' },
                { icon: BarChart2, label: 'Concept Match', val: `${Math.min(score + 5, 100)}%`,                                                     color: '#3498DB' },
                { icon: Shield,    label: 'Readiness',     val: score >= 70 ? 'High' : score >= 50 ? 'Medium' : 'Low',                              color: score >= 70 ? '#2ECC71' : score >= 50 ? '#F39C12' : '#E74C3C' },
                { icon: Star,      label: 'Ranking',       val: score >= 85 ? 'Top 10%' : score >= 70 ? 'Top 25%' : 'Top 50%',                      color: '#C9A84C' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="glass-card p-3 sm:p-4 text-center">
                  <Icon size={16} className="mx-auto mb-1.5" style={{ color }} />
                  <p className="text-[10px] sm:text-xs text-silver-200/60 mb-1">{label}</p>
                  <p className="text-sm sm:text-base lg:text-lg font-bold font-[var(--font-display)]" style={{ color }}>{val}</p>
                </div>
              ))}
            </div>


            {/* Weak + Recommended */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
              <div className="glass-card p-4 sm:p-5">
                <h4 className="text-[10px] sm:text-xs font-bold text-danger/70 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <AlertTriangle size={12} /> Weak Areas
                </h4>
                <ul className="space-y-2">
                  {score < 80 ? (
                    ['Core fundamentals need review', 'Practice more examples', 'Formula application'].slice(0, score < 65 ? 3 : 2).map(t => (
                      <li key={t} className="text-[11px] sm:text-xs text-silver-200 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-danger mt-1 shrink-0" /> {t}
                      </li>
                    ))
                  ) : (
                    <li className="text-[11px] sm:text-xs text-success flex items-center gap-2">
                      <CheckCircle size={11} /> No major weak areas!
                    </li>
                  )}
                </ul>
              </div>
              <div className="glass-card p-4 sm:p-5">
                <h4 className="text-[10px] sm:text-xs font-bold text-gold/70 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} /> Recommended Next
                </h4>
                <ul className="space-y-2">
                  {[selectedTopic + ' (Advanced)', 'Related Applications', 'Mock Test'].map(t => (
                    <li key={t} className="text-[11px] sm:text-xs text-silver-200 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1 shrink-0" /> {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI Source Truth & Explanation */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.2 }}
               className="glass-card mb-5 border border-success/10 bg-success/5 relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-3 opacity-5">
                  <Shield size={60} className="text-success" />
               </div>
               <div className="p-5 sm:p-7 relative z-10 text-left">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle size={16} className="text-success" />
                    <h4 className="text-[10px] sm:text-xs font-black text-silver-200 uppercase tracking-[0.2em]">AI Correct Solution & Explanation</h4>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-[10px] text-dark-700 uppercase font-bold mb-2 tracking-widest">The Correct Answer</p>
                    <div className="p-4 rounded-xl bg-dark-400/60 border border-success/20">
                      <p className="text-sm sm:text-base font-bold text-success leading-relaxed">
                        {pickedQ?.correctAnswer || 'Not provided by AI generator.'}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-dark-700 uppercase font-bold mb-2 tracking-widest">Full Step-by-Step Explanation</p>
                    <div className="p-4 rounded-xl bg-dark-400/30 border border-white/5">
                      <p className="text-sm sm:text-base text-silk/90 leading-relaxed whitespace-pre-wrap">
                        {pickedQ?.explanation || 'Analysis complete. The underlying principles align with the provided answer.'}
                      </p>
                    </div>
                  </div>
               </div>
            </motion.div>

            {/* Progress tracking */}
            <div className="glass-card p-4 sm:p-5 mb-5 sm:mb-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3 text-gold">
                <TrendingUp size={15} />
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest">Progress Tracking</p>
              </div>
              <div className="w-full h-1.5 sm:h-2 bg-dark-300 rounded-full overflow-hidden border border-white/5 mb-2">
                <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }}
                  transition={{ duration: 1.6, ease: 'easeOut', delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-info/60 via-info to-gold rounded-full" />
              </div>
              <p className="text-[10px] sm:text-xs text-silver-200/50">Your learning journey continues…</p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              {questions.length > 0 && !questions.every(q => solvedQIds.includes(q.id || q._id)) ? (
                <button
                  onClick={() => { 
                    setPickedQ(null); 
                    setSolveMode(false); 
                    setScore(null); 
                    setSubmitting(false); 
                    setPlainText(''); 
                    setSolFile(null); 
                    setTimeLeft(null); 
                    setStep(5);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="btn-dark flex-1 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 transition-all border border-white/10 hover:border-gold/30">
                  <BookOpen size={14} /> Next Question
                </button>
              ) : (
                <button
                  onClick={loadMoreQuestions}
                  disabled={loadingMore}
                  className="btn-dark flex-1 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm active:scale-95 transition-all border border-gold/20 hover:border-gold/50 bg-gold/5 text-gold">
                  {loadingMore ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}                   Add More Questions
                </button>
              )}

              {sessionId && questions.every(q => solvedQIds.includes(q.id || q._id)) && (
                 <button
                   onClick={async () => {
                      try {
                        const res = await sessionService.completeSession(sessionId);
                        setSessionData(res.data);
                        setStep(7);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } catch (err) {
                        console.error("Failed to complete session", err);
                        setStep(7);
                      }
                   }}
                   className="btn-gold flex-1 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm shadow-xl shadow-gold/25 font-black uppercase tracking-widest active:scale-95 transition-all">
                   <Check size={16} /> Finish Session
                 </button>
              )}
              
              {sessionId && !questions.every(q => solvedQIds.includes(q.id || q._id)) && (
                 <button
                 onClick={() => navigate('/dashboard')}
                 className="btn-dark flex-1 py-3 sm:py-3.5 flex items-center justify-center gap-2 text-xs sm:text-sm border border-white/5 opacity-60 hover:opacity-100 transition-all">
                 Save & Exit
               </button>
              )}
            </div>

            <div className="mt-8 text-center">
              <Link to="/dashboard" className="text-xs text-silver-200/40 hover:text-gold transition-colors flex items-center justify-center gap-2">
                <LayoutDashboard size={12} /> Back to Dashboard
              </Link>
            </div>
          </motion.div>
        )}

        {/* ════════════════════════════════════════════
            7 — Final Session Mastery Analysis
        ════════════════════════════════════════════ */}
        {step === 7 && (
          <motion.div key="s7"
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto text-center">

            <div className="glass-card p-6 sm:p-10 border border-gold/20 bg-gradient-to-b from-gold/5 to-transparent relative overflow-hidden mb-6">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                 <Sparkles size={160} className="text-gold" />
               </div>

               <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold/20 shadow-lg shadow-gold/5">
                 <Award size={32} className="text-gold" />
               </div>

               <h2 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-2">
                 Session Completed!
               </h2>
               <p className="text-silver-200 text-[10px] sm:text-xs mb-8 uppercase tracking-[0.2em] font-medium opacity-60">
                 Final Mastery Analysis
               </p>

               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                 <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-silver-200 uppercase tracking-widest mb-1">Questions</p>
                    <p className="text-xl sm:text-2xl font-bold text-silk">
                      {sessionData?.solvedQuestions?.length || solvedQIds.length} / {sessionData?.totalQuestions || questions.length}
                    </p>
                 </div>
                 <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-silver-200 uppercase tracking-widest mb-1">Mastery Score</p>
                    <p className="text-xl sm:text-2xl font-bold text-gold">
                      {sessionData 
                        ? Math.round(((sessionData.solvedQuestions?.length || 0) / (sessionData.totalQuestions || 1)) * 100)
                        : Math.round((solvedQIds.length / (questions.length || 1)) * 100)}%
                    </p>
                 </div>
                 <div className="p-4 sm:p-5 rounded-2xl bg-white/5 border border-white/10">
                    <p className="text-[10px] text-silver-200 uppercase tracking-widest mb-1">Status</p>
                    <p className={`text-xl sm:text-2xl font-bold 
                      ${(sessionData?.solvedQuestions?.length === sessionData?.totalQuestions) ? 'text-success' : 'text-warning'}`}>
                      {(sessionData?.solvedQuestions?.length === sessionData?.totalQuestions) ? 'Mastered' : 'Ongoing'}
                    </p>
                 </div>
               </div>

               {/* AI Session Insight */}
               <div className="p-5 sm:p-6 rounded-2xl bg-dark-300 border border-white/5 text-left relative mb-2">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Brain size={32} className="text-silk" />
                 </div>
                 <h4 className="text-[10px] font-bold text-gold uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Sparkles size={12} /> AI Session Insight
                 </h4>
                 <p className="text-xs sm:text-sm text-silver-200 leading-relaxed font-light">
                    {sessionData 
                      ? (sessionData.submissions.filter(s => s.isCorrect).length / (sessionData.totalQuestions || 1) >= 0.8 
                        ? "Outstanding performance! You've demonstrated consistent accuracy across multiple questions in this session. your logical reasoning is sharp—you are well-prepared for an actual exam on this topic."
                        : sessionData.submissions.filter(s => s.isCorrect).length / (sessionData.totalQuestions || 1) >= 0.5 
                        ? "Good effort. You've conquered more than half the challenges. Focus on the questions you skipped or found difficult to reach 100% mastery."
                        : "A solid start, but significant practice is still required. Ensure you review the step-by-step AI solutions for the topics you found challenging to build your confidence.")
                      : "Analysis complete. Review your detailed answer breakdown below to identify areas for growth."}
                 </p>
               </div>
            </div>

            {/* Answer Summary Section */}
            {sessionData && sessionData.submissions && (
              <div className="glass-card p-5 sm:p-7 text-left mb-6 border border-white/5">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={16} className="text-gold" />
                  <h4 className="text-[10px] sm:text-xs font-black text-silver-200 uppercase tracking-[0.2em]">Detailed Answer Summary</h4>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {sessionData.submissions.map((sub, idx) => (
                    <div key={sub._id} className="p-4 rounded-2xl bg-white/2 border border-white/5 hover:bg-white/5 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <p className="text-xs sm:text-sm font-bold text-silk leading-relaxed flex-1">
                          <span className="text-gold/60 mr-2">Q{idx + 1}.</span>
                          {sub.question?.questionText || "Question text not available"}
                        </p>
                        <div className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-widest border shrink-0
                          ${sub.isCorrect ? 'bg-success/10 text-success border-success/20' : 'bg-danger/10 text-danger border-danger/20'}`}>
                          {sub.isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                      <div className="mt-2 pl-4 border-l border-gold/20">
                        <p className="text-[10px] sm:text-xs text-silver-200/50 leading-relaxed font-light">
                          {sub.feedback || "No specific feedback provided."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => navigate('/dashboard')}
              className="btn-gold w-full py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-2xl shadow-gold/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
              <LayoutDashboard size={18} /> Close & Back to Dashboard
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
