// Format date to readable string
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Format time from seconds
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Calculate percentage
export const calcPercentage = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Get risk level label & color
export const getRiskLevel = (score) => {
  if (score >= 70) return { label: 'Low Risk', color: 'success', className: 'badge-low' };
  if (score >= 40) return { label: 'Medium Risk', color: 'warning', className: 'badge-medium' };
  return { label: 'High Risk', color: 'danger', className: 'badge-high' };
};

// Get difficulty color
export const getDifficultyColor = (difficulty) => {
  const colors = {
    easy: '#2ECC71',
    basic: '#2ECC71',
    intermediate: '#F39C12',
    medium: '#F39C12',
    hard: '#E74C3C',
    advanced: '#E74C3C',
  };
  return colors[difficulty?.toLowerCase()] || '#C9A84C';
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

// Validate email
export const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
