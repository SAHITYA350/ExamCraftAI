import { motion } from 'framer-motion';
import { Clock, Zap, BookOpen, ChevronRight, CheckCircle } from 'lucide-react';
import { getDifficultyColor } from '../utils/helpers';

const QuestionCard = ({ question, index, onSelect, isCompleted, showAnswer }) => {
  const diffColor = getDifficultyColor(question.difficulty);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="glass-card glass-card-hover p-5 cursor-pointer group relative overflow-hidden"
      onClick={() => onSelect?.(question)}
      id={`question-card-${question._id || index}`}
    >
      {/* Completion indicator */}
      {isCompleted && (
        <div className="absolute top-3 right-3">
          <CheckCircle size={20} className="text-success" />
        </div>
      )}

      {/* Difficulty badge */}
      <div className="flex items-center gap-2 mb-3">
        <span
          className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
          style={{
            backgroundColor: `${diffColor}18`,
            color: diffColor,
            border: `1px solid ${diffColor}30`,
          }}
        >
          {question.difficulty || 'Medium'}
        </span>
        <span className="text-xs text-dark-700">
          <BookOpen size={12} className="inline mr-1" />
          {question.topic || 'General'}
        </span>
      </div>

      {/* Question text */}
      <h3 className="text-[15px] font-medium text-silk leading-relaxed mb-4 line-clamp-3 group-hover:text-gold transition-colors">
        {question.question_text || question.text || `Question ${index + 1}`}
      </h3>

      {/* Show answer if evaluated */}
      {showAnswer && question.expected_solution && (
        <div className="mb-4 p-3 rounded-lg bg-dark-200 border border-white/5">
          <p className="text-xs text-gold mb-1 font-semibold">Expected Solution:</p>
          <p className="text-sm text-silver-100 line-clamp-2">{question.expected_solution}</p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <div className="flex items-center gap-3">
          {question.time_limit && (
            <span className="flex items-center gap-1 text-xs text-dark-700">
              <Clock size={12} />
              {question.time_limit}m
            </span>
          )}
          {question.marks && (
            <span className="flex items-center gap-1 text-xs text-dark-700">
              <Zap size={12} />
              {question.marks} marks
            </span>
          )}
        </div>
        <ChevronRight size={16} className="text-dark-700 group-hover:text-gold group-hover:translate-x-1 transition-all" />
      </div>

      {/* Hover glow */}
      <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gold/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  );
};

export default QuestionCard;
