import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileImage, FileText, X, Camera, Type, Send, Loader2 } from 'lucide-react';

const UploadAnswer = ({ questionId, onSubmit, loading }) => {
  const [mode, setMode] = useState('text'); // 'text' | 'file'
  const [textAnswer, setTextAnswer] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleSubmit = () => {
    if (mode === 'text') {
      onSubmit?.({ type: 'text', answer: textAnswer, questionId });
    } else {
      const formData = new FormData();
      formData.append('answer', selectedFile);
      formData.append('questionId', questionId);
      onSubmit?.({ type: 'file', formData, questionId });
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canSubmit = mode === 'text' ? textAnswer.trim().length > 0 : !!selectedFile;

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-silk mb-4 font-[var(--font-display)]">
        Submit Your Answer
      </h3>

      {/* Mode Switcher */}
      <div className="flex gap-2 mb-5 p-1 bg-dark-200 rounded-xl">
        <button
          onClick={() => setMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'text'
              ? 'bg-gold text-dark shadow-lg'
              : 'text-silver-200 hover:text-silk hover:bg-white/5'
          }`}
          id="answer-mode-text"
        >
          <Type size={16} />
          Text Answer
        </button>
        <button
          onClick={() => setMode('file')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
            mode === 'file'
              ? 'bg-gold text-dark shadow-lg'
              : 'text-silver-200 hover:text-silk hover:bg-white/5'
          }`}
          id="answer-mode-file"
        >
          <Camera size={16} />
          Upload Image/PDF
        </button>
      </div>

      {/* Text Input Mode */}
      <AnimatePresence mode="wait">
        {mode === 'text' ? (
          <motion.div
            key="text"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <textarea
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Type your answer here... Include all steps and working."
              className="input-dark min-h-[200px] resize-y"
              id="answer-text-input"
            />
            <p className="text-xs text-dark-700 mt-2">{textAnswer.length} characters</p>
          </motion.div>
        ) : (
          <motion.div
            key="file"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`
                relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-all duration-300
                ${dragActive
                  ? 'border-gold bg-gold/5 scale-[1.01]'
                  : 'border-dark-500 hover:border-gold/50 hover:bg-white/[0.02]'
                }
              `}
              id="answer-dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
                id="answer-file-input"
              />

              {!selectedFile ? (
                <div className="space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-dark-300 flex items-center justify-center">
                    <Upload size={24} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-silk">
                      Drop your answer here or <span className="text-gold">browse</span>
                    </p>
                    <p className="text-xs text-dark-700 mt-1">
                      Supports: JPG, PNG, PDF — Max 10MB
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs text-dark-700">
                      <FileImage size={14} />
                      Images
                    </div>
                    <div className="w-1 h-1 rounded-full bg-dark-600" />
                    <div className="flex items-center gap-1.5 text-xs text-dark-700">
                      <FileText size={14} />
                      PDF
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {preview && (
                    <img
                      src={preview}
                      alt="Answer preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                  )}
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-silk">{selectedFile.name}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        clearFile();
                      }}
                      className="p-1 rounded-full hover:bg-danger/20 text-danger transition-colors"
                      id="clear-file-btn"
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-dark-700">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: canSubmit ? 1.02 : 1 }}
        whileTap={{ scale: canSubmit ? 0.98 : 1 }}
        onClick={handleSubmit}
        disabled={!canSubmit || loading}
        className="btn-gold w-full mt-5 flex items-center justify-center gap-2 py-3 text-sm"
        id="submit-answer-btn"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <Send size={16} />
            Submit Answer
          </>
        )}
      </motion.button>
    </div>
  );
};

export default UploadAnswer;
