import { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VoiceInput = ({ onResult, disabled = false, className = '', size = 18 }) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const toggleListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      // Logic to stop if it were continuous, but here we handle via onend
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        setError('Permission denied');
      } else {
        setError(event.error);
      }
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      if (event.results[0].isFinal) {
        onResult(transcript);
      }
    };

    try {
      recognition.start();
    } catch (e) {
      console.error('Recognition start failed', e);
      setIsListening(false);
    }
  }, [isListening, onResult]);

  if (!isSupported) return null;

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleListening}
        disabled={disabled}
        className={`p-2 rounded-xl border transition-all flex items-center justify-center
          ${isListening 
            ? 'bg-danger/20 border-danger/50 text-danger shadow-[0_0_20px_rgba(231,76,60,0.4)]' 
            : 'bg-gold/10 border-gold/20 text-gold hover:bg-gold/20 hover:border-gold/40'}`}
        id="voice-mic-btn"
        title={isListening ? 'Listening...' : error ? `Error: ${error}` : 'Start Voice Input'}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative flex items-center justify-center"
            >
              <Mic size={size} className="relative z-10" />
              <motion.div 
                className="absolute inset-0 bg-danger/30 rounded-full -z-0"
                animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="mic"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {error ? <AlertCircle size={size} className="text-warning" /> : <Mic size={size} />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
      
      {/* Tooltip for status */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-1.5 bg-danger text-white text-[10px] font-black uppercase tracking-widest rounded-lg whitespace-nowrap shadow-xl z-50 flex items-center gap-2 border border-white/20"
          >
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            Listening...
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceInput;
