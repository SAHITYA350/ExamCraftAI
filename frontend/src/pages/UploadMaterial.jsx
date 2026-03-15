import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  FileText,
  File,
  X,
  CheckCircle,
  Loader2,
  BookOpen,
  FileUp,
  Layers,
  Sparkles,
  Type,
} from 'lucide-react';

const UploadMaterial = () => {
  const [inputType, setInputType] = useState('file'); // 'file' | 'text'
  const [textInput, setTextInput] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [detectedTopics, setDetectedTopics] = useState([]);
  const fileInputRef = useRef(null);

  const handleFiles = (newFiles) => {
    const fileList = Array.from(newFiles).map((file) => ({
      file,
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
    }));
    setFiles((prev) => [...prev, ...fileList]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (id) => {
    setFiles(files.filter((f) => f.id !== id));
  };

  const handleUpload = async () => {
    setUploading(true);
    try {
      // Prepared for actual API call
      // const response = await api.post('/materials/upload', formData);
      // setDetectedTopics(response.data.topics);
      
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setDetectedTopics([]); // Reset to empty initially
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(false);
      setUploadComplete(true);
    }
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return <FileText size={20} className="text-danger" />;
    return <File size={20} className="text-info" />;
  };

  return (
    <div className="page-container max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-silk font-[var(--font-display)] mb-2">
            Upload Study Materials
          </h1>
          <p className="text-silver-200 text-sm">
            Upload your PDFs, notes, or syllabus. Our AI will detect topics automatically.
          </p>
        </div>

        {!uploadComplete ? (
          <>
            {/* Input Type Switcher */}
            <div className="flex gap-2 mb-6 p-1 bg-dark-200 rounded-xl max-w-sm mx-auto">
              <button
                onClick={() => setInputType('file')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inputType === 'file'
                    ? 'bg-gold text-dark shadow-lg'
                    : 'text-silver-200 hover:text-silk hover:bg-white/5'
                }`}
              >
                <FileUp size={16} />
                Documents
              </button>
              <button
                onClick={() => setInputType('text')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  inputType === 'text'
                    ? 'bg-gold text-dark shadow-lg'
                    : 'text-silver-200 hover:text-silk hover:bg-white/5'
                }`}
              >
                <Type size={16} />
                Plain Text
              </button>
            </div>

            <AnimatePresence mode="wait">
              {inputType === 'file' ? (
                <motion.div
                  key="file-upload"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                >
                  {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`
                glass-card p-10 text-center cursor-pointer mb-6 border-2 border-dashed transition-all
                ${dragActive ? 'border-gold bg-gold/5 scale-[1.01]' : 'border-dark-500 hover:border-gold/40'}
              `}
              id="material-dropzone"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                multiple
                onChange={(e) => handleFiles(e.target.files)}
                className="hidden"
                id="material-file-input"
              />

              <div className="w-16 h-16 mx-auto rounded-2xl bg-gold/10 flex items-center justify-center mb-4">
                <FileUp size={28} className="text-gold" />
              </div>
              <p className="text-base font-medium text-silk mb-1">
                Drop your files here or <span className="text-gold">browse</span>
              </p>
              <p className="text-xs text-dark-700">
                PDF, DOC, TXT, Images — Multiple files supported
              </p>
            </div>

                  {/* File List */}
                  <AnimatePresence>
                    {files.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2 mb-6"
                      >
                        {files.map((f) => (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="glass-card p-3 flex items-center gap-3"
                          >
                            {getFileIcon(f.type)}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm text-silk truncate">{f.name}</p>
                              <p className="text-xs text-dark-700">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); removeFile(f.id); }}
                              className="p-1.5 rounded-lg hover:bg-danger/10 text-dark-700 hover:text-danger transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="text-upload"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="mb-6"
                >
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Type or paste your study notes, syllabus, or topics here in plain English..."
                    className="input-dark min-h-[250px] resize-y w-full leading-relaxed p-6"
                  />
                  <p className="text-right text-xs text-dark-700 mt-2">
                    {textInput.length} characters
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Upload Button */}
            {((inputType === 'file' && files.length > 0) || (inputType === 'text' && textInput.trim().length > 0)) && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleUpload}
                disabled={uploading}
                className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-[15px]"
                id="upload-materials-btn"
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing & Detecting Topics...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    {inputType === 'file' 
                      ? `Upload & Analyze ${files.length} File${files.length > 1 ? 's' : ''}` 
                      : 'Analyze Plain Text'}
                  </>
                )}
              </motion.button>
            )}
          </>
        ) : (
          /* Success State */
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="glass-card p-8 text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-20 h-20 mx-auto rounded-full bg-success/10 flex items-center justify-center mb-4"
              >
                <CheckCircle size={40} className="text-success" />
              </motion.div>
              <h2 className="text-xl font-bold text-silk font-[var(--font-display)] mb-2">
                Materials Processed!
              </h2>
              <p className="text-sm text-silver-200">
                {files.length} file{files.length > 1 ? 's' : ''} uploaded and analyzed successfully
              </p>
            </div>

            {/* Detected Topics */}
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-gold" />
                <h3 className="text-base font-semibold text-silk font-[var(--font-display)]">
                  AI Detected Topics
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {detectedTopics.map((topic, i) => (
                  <motion.span
                    key={topic}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="px-3 py-2 rounded-xl bg-gold/10 text-gold text-sm border border-gold/20 flex items-center gap-2"
                  >
                    <Layers size={14} />
                    {topic}
                  </motion.span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  setFiles([]);
                  setTextInput('');
                  setUploadComplete(false);
                  setDetectedTopics([]);
                }}
                className="btn-dark flex-1 py-3"
              >
                Upload More
              </button>
              <button
                onClick={() => window.location.href = '/practice'}
                className="btn-gold flex-1 py-3 flex items-center justify-center gap-2"
              >
                <BookOpen size={16} />
                Start Practicing
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default UploadMaterial;
