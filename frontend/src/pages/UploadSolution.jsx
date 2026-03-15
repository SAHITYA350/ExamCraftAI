import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  UploadCloud, 
  CheckCircle, 
  Check,
  X, 
  Upload, 
  FileImage, 
  Leaf,
  ChevronRight,
  TrendingUp,
  Award,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

const defaultQuestions = [];

const UploadSolution = () => {
  const location = useLocation();
  const [step, setStep] = useState(1); // 1: Question, 2: Upload, 3: Feedback
  
  // Dynamic question state
  const [currentQuestion, setCurrentQuestion] = useState(() => {
    if (location.state?.question) {
      return {
        topic: location.state.topic || location.state.question.topic || "Practice",
        difficulty: location.state.difficulty || location.state.question.difficulty || "Custom",
        text: location.state.question.question_text || location.state.question.text,
        timeLimit: (location.state.question.time_limit || 30) * 60
      };
    }
    
    // Pick from default questions or use a fallback
    if (defaultQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * defaultQuestions.length);
      return defaultQuestions[randomIndex];
    }

    // Ultimate fallback if accessed directly and no data exists
    return {
      topic: "Practice",
      difficulty: "General",
      text: "Start a practice session from the dashboard to see questions here.",
      timeLimit: 30 * 60
    };
  });

  const [timeLeft, setTimeLeft] = useState(currentQuestion.timeLimit || 1800);
  
  // Input Mode State
  const [inputMode, setInputMode] = useState('upload'); // upload | text
  const [plainText, setPlainText] = useState('');
  
  // Upload State
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  // Mock evaluation state
  const isCorrect = Math.random() > 0.3; // 70% chance of being correct for demo purposes

  // Timer effect
  useEffect(() => {
    if (step === 1) {
      const timer = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
      return () => clearInterval(timer);
    }
  }, [step]);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    if (file) setSelectedFile(file);
  };

  const handleSubmitUpload = () => {
    const hasSolution = inputMode === 'upload' ? selectedFile : plainText.trim();
    if (!hasSolution) return;
    
    setIsUploading(true);
    // Simulate upload and AI evaluation delay
    setTimeout(() => {
      setIsUploading(false);
      setStep(3); // Go to evaluation feedback
    }, 2500);
  };

  return (
    <div className="page-container py-6">
      <AnimatePresence mode="wait">
        
        {/* STEP 1: Question View */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-5xl mx-auto"
          >
            <div className="glass-card p-6 sm:p-12 relative min-h-[60vh] flex flex-col justify-center">
              {/* Timer & Header info */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 flex flex-col gap-1">
                <span className="text-xs font-bold text-gold uppercase tracking-wider">{currentQuestion.topic}</span>
                <span className="text-xs text-silver-200">{currentQuestion.difficulty} Level</span>
              </div>
              <div className="absolute top-6 right-6 sm:top-8 sm:right-8 flex items-center gap-2 text-gold font-mono text-lg sm:text-2xl font-bold bg-dark-200/50 px-4 py-2 rounded-xl border border-white/5 shadow-inner">
                <Clock size={24} />
                {formatTime(timeLeft)}
              </div>
              
              <div className="mt-20 sm:mt-12 max-w-4xl mx-auto w-full">
                <h2 className="text-xl sm:text-2xl font-bold text-silk mb-6 font-[var(--font-display)] tracking-wider">
                  QUESTION:
                </h2>
                <div className="bg-dark-200/30 p-6 sm:p-10 rounded-2xl border border-white/5 shadow-inner leading-relaxed">
                  <p className="text-lg sm:text-2xl text-silver-100 font-light">
                    {currentQuestion.text}
                  </p>
                </div>
              </div>
              
              <div className="mt-16 sm:mt-24 text-center">
                <button 
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-gold to-gold-light text-dark font-bold text-lg rounded-xl hover:shadow-[0_0_40px_rgba(201,168,76,0.3)] transition-all flex items-center justify-center gap-4 mx-auto group"
                >
                  <UploadCloud size={28} className="group-hover:-translate-y-1 transition-transform" />
                  Upload Solution
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Upload Modal View */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="w-full max-w-3xl mx-auto pt-10"
          >
            <div className="glass-card overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              {/* Header banner */}
              <div className="bg-dark-300/80 px-6 sm:px-10 py-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-sm sm:text-base font-medium text-silver-200 uppercase tracking-wider flex items-center gap-2">
                  <Award size={16} className="text-gold" />
                  {currentQuestion.topic} - Practice Session
                </span>
                <button onClick={() => setStep(1)} className="text-xs text-silver hover:text-gold transition-colors underline underline-offset-4">
                  Back to Question
                </button>
              </div>
              
              <div className="p-6 sm:p-12 text-center">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)]">Submit Your Solution</h2>
                  <div className="flex bg-dark-300 rounded-xl p-1 border border-white/5">
                    <button 
                      onClick={() => setInputMode('upload')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${inputMode === 'upload' ? 'bg-gold text-dark shadow-lg shadow-gold/20' : 'text-silver-200 hover:text-silk'}`}
                    >
                      Upload File
                    </button>
                    <button 
                      onClick={() => setInputMode('text')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${inputMode === 'text' ? 'bg-gold text-dark shadow-lg shadow-gold/20' : 'text-silver-200 hover:text-silk'}`}
                    >
                      Write Text
                    </button>
                  </div>
                </div>
                
                {inputMode === 'upload' ? (
                  /* Drag & Drop Box */
                  <div 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed rounded-3xl p-10 sm:p-20 transition-all duration-300 ${
                      dragActive 
                        ? 'border-gold bg-gold/5 scale-[1.02]' 
                        : 'border-white/10 hover:border-gold/30 bg-dark-200/30'
                    }`}
                  >
                    {!selectedFile ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-dark-300/80 flex items-center justify-center shadow-inner">
                          <Upload size={40} className="text-silver-200 hover:text-gold transition-colors" />
                        </div>
                        <p className="text-xl sm:text-2xl text-silk font-medium font-[var(--font-display)]">Drag & Drop Files Here</p>
                        <button onClick={() => fileInputRef.current?.click()} className="btn-outline-gold py-3 px-8 rounded-xl text-base font-medium hover:bg-gold hover:text-dark transition-all">
                          Choose Files
                        </button>
                        <input type="file" ref={fileInputRef} onChange={(e) => handleFileSelect(e.target.files[0])} className="hidden" accept="image/*,.pdf" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-4 bg-dark-300 px-6 py-4 rounded-2xl border border-white/10 w-full max-w-md shadow-lg group">
                          <FileImage size={36} className="text-gold" />
                          <div className="flex-1 text-left truncate">
                            <p className="text-base font-semibold text-silk truncate">{selectedFile.name}</p>
                            <p className="text-sm text-silver-200">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <button onClick={() => setSelectedFile(null)} className="p-2 hover:bg-danger/20 rounded-full text-silver hover:text-danger transition-colors">
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Plain Text Area */
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <textarea
                        value={plainText}
                        onChange={(e) => setPlainText(e.target.value)}
                        placeholder="Write your step-by-step solution here..."
                        className="w-full h-80 bg-dark-300 border border-white/10 rounded-3xl p-6 sm:p-8 text-silk text-lg font-light focus:outline-none focus:border-gold/30 focus:shadow-[0_0_30px_rgba(201,168,76,0.05)] transition-all resize-none placeholder:text-silver-200/30 leading-relaxed"
                      />
                      <div className="absolute bottom-6 right-6 px-3 py-1 bg-dark-400 rounded-full border border-white/5 text-[10px] text-silver-200 font-mono">
                        {plainText.length} characters
                      </div>
                      <Sparkles size={16} className="absolute top-6 right-6 text-gold/20" />
                    </div>
                  </div>
                )}
                
                <div className="mt-10 flex justify-center">
                  <button 
                    onClick={handleSubmitUpload}
                    disabled={(inputMode === 'upload' ? !selectedFile : !plainText.trim()) || isUploading}
                    className={`px-12 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-3 ${
                      (inputMode === 'upload' ? selectedFile : plainText.trim()) 
                        ? 'btn-gold shadow-lg shadow-gold/20' 
                        : 'bg-dark-300 text-silver-200 opacity-50 cursor-not-allowed border border-white/5'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-dark border-t-transparent rounded-full animate-spin"></div>
                        Evaluating...
                      </>
                    ) : (
                      'Submit Solution'
                    )}
                  </button>
                </div>
              </div>
              
              {/* Footer notice */}
              <div className="bg-dark-200/50 px-6 sm:px-12 py-8 border-t border-white/5 mt-auto">
                <p className="text-sm text-silver-100 italic mb-3 font-medium">Upload disabled after viewing solution.</p>
                <div className="flex items-start sm:items-center gap-3">
                  <div className="mt-0.5 sm:mt-0 px-2 py-1 bg-success/10 rounded-md">
                    <Leaf size={16} className="text-success" />
                  </div>
                  <p className="text-sm text-silver-200 leading-relaxed">
                    By uploading, you confirm that these are your own original solutions and adhere to the academic integrity policy.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Feedback View */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mx-auto pt-8"
          >
            <div className="glass-card p-8 sm:p-14 text-center border border-white/10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] bg-gradient-to-b from-dark-100 to-dark-200">
              <h2 className="text-xl sm:text-2xl font-bold text-gold tracking-[0.2em] uppercase mb-12 font-[var(--font-display)]">
                Understanding Your Work
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                {/* Correct Card */}
                <div className={`flex-1 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 border-2 transition-all duration-500 ${
                  isCorrect 
                    ? 'bg-success/5 border-success/30 scale-105 shadow-[0_0_40px_rgba(46,204,113,0.1)]' 
                    : 'bg-dark-300/30 border-white/5 opacity-40 grayscale'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    isCorrect ? 'bg-success shadow-lg shadow-success/30' : 'bg-dark-400'
                  }`}>
                    <Check size={32} className={`font-bold ${isCorrect ? 'text-dark' : 'text-silver'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold uppercase tracking-wide ${isCorrect ? 'text-success' : 'text-silver'}`}>Correct</h3>
                  <p className={`text-base font-medium ${isCorrect ? 'text-success/80' : 'text-silver/50'}`}>Great job!</p>
                </div>
                
                {/* Incorrect Card */}
                <div className={`flex-1 rounded-3xl p-8 flex flex-col items-center justify-center gap-3 border-2 transition-all duration-500 ${
                  !isCorrect 
                    ? 'bg-danger/5 border-danger/30 scale-105 shadow-[0_0_40px_rgba(231,76,60,0.1)]' 
                    : 'bg-dark-300/30 border-white/5 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 cursor-pointer'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                    !isCorrect ? 'bg-danger shadow-lg shadow-danger/30' : 'bg-dark-400'
                  }`}>
                    <X size={32} className={`font-bold ${!isCorrect ? 'text-white' : 'text-silver'}`} />
                  </div>
                  <h3 className={`text-2xl font-bold uppercase tracking-wide ${!isCorrect ? 'text-danger' : 'text-silver'}`}>Incorrect</h3>
                  <p className={`text-base font-medium ${!isCorrect ? 'text-danger/80' : 'text-silver/50'}`}>Let's review together</p>
                </div>
              </div>
              
              <div className="border-t border-white/10 pt-10 mb-12 text-left bg-dark-300/20 -mx-8 sm:-mx-14 px-8 sm:px-14 pb-8">
                <h4 className="text-sm font-bold text-silver-100 mb-6 uppercase tracking-[0.15em]">Type of Error Analysis:</h4>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className={`flex-1 relative ${isCorrect ? 'opacity-50' : ''}`}>
                    <div className={`bg-success/10 border-2 border-success/40 rounded-full py-4 px-6 text-center text-success font-bold text-sm tracking-widest ${!isCorrect ? 'shadow-[0_0_20px_rgba(46,204,113,0.15)] ring-4 ring-success/10' : ''}`}>
                      CONCEPTUAL
                    </div>
                    {!isCorrect && (
                      <div className="absolute -top-3 right-4 bg-dark text-success border border-success/30 text-[10px] px-2 py-0.5 rounded-full font-bold">DETECTED</div>
                    )}
                  </div>
                  <div className="flex-1 bg-dark-300 border border-white/10 rounded-full py-4 px-6 text-center text-silver-200 font-bold text-sm tracking-widest">
                    FORMULA
                  </div>
                  <div className="flex-1 bg-dark-300 border border-white/10 rounded-full py-4 px-6 text-center text-silver-200 font-bold text-sm tracking-widest">
                    CALCULATION
                  </div>
                </div>
              </div>
              
              {/* Progress Bar styled as Journey Tracker */}
              <div className="px-4">
                <div className="w-full h-3 bg-dark-300 rounded-full overflow-hidden mb-8 shadow-inner border border-white/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: isCorrect ? '85%' : '65%' }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-info/50 via-info to-info-light rounded-full relative"
                  >
                    <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white/30 to-transparent"></div>
                  </motion.div>
                </div>
                
                <div className="flex items-center justify-center gap-3 text-gold">
                  <TrendingUp size={20} />
                  <p className="font-bold tracking-[0.2em] text-sm uppercase">
                    Your learning journey continues...
                  </p>
                </div>

                <div className="mt-12 flex justify-center gap-4">
                   <Link 
                     to="/practice" 
                     className="btn-dark py-3 px-8 text-sm"
                   >
                     More Practice
                   </Link>
                   <Link 
                     to="/analytics" 
                     className="btn-gold py-3 px-8 text-sm flex items-center gap-2 group"
                   >
                     View Dashboard <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                   </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadSolution;
