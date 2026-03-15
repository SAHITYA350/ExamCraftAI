import { motion } from 'framer-motion';
import { GraduationCap } from 'lucide-react';

const Loader = ({ fullScreen = true, message = "Loading ExamCraft..." }) => {
  const containerClass = fullScreen
    ? "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-dark-100/80 backdrop-blur-2xl"
    : "w-full h-full min-h-[300px] flex flex-col items-center justify-center";

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={containerClass}
    >
      <div className="relative flex flex-col items-center justify-center">
        {/* Animated Glow Behind Icon */}
        <motion.div
          className="absolute inset-0 bg-gold/20 rounded-full blur-2xl"
          animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Premium Hexagon/Box Loader */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <motion.div
            className="absolute inset-0 rounded-2xl border border-gold/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute inset-2 rounded-2xl border border-white/10 bg-dark-200/50 backdrop-blur-sm flex items-center justify-center shadow-[0_0_30px_rgba(201,168,76,0.15)]"
            animate={{ rotate: -360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          >
            <motion.div
              animate={{ rotate: 360 }} // Counter rotations so the icon stays upward
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            >
              <GraduationCap size={28} className="text-gold" />
            </motion.div>
          </motion.div>
        </div>

        {/* Text */}
        <div className="flex flex-col items-center">
          <motion.h2 
            className="text-lg font-bold text-silk font-[var(--font-display)] tracking-wider uppercase mb-1"
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            ExamCraft AI
          </motion.h2>
          <p className="text-xs text-silver-200 font-medium tracking-[0.2em] uppercase">
            {message}
          </p>
        </div>
        
        {/* Progress Line */}
        <div className="w-32 h-[2px] bg-dark-300 mt-6 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-gold/20 via-gold to-gold/20"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '50%' }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
