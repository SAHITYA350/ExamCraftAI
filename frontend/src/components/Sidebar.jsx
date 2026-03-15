import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  BarChart3,
  User,
  FileUp,
  ChevronLeft,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & stats',
  },
  {
    label: 'Practice',
    path: '/practice',
    icon: BookOpen,
    description: 'Start practicing',
  },
  {
    label: 'Upload Materials',
    path: '/upload-material',
    icon: FileUp,
    description: 'PDFs & notes',
  },
  {
    label: 'Submit Solution',
    path: '/upload-solution',
    icon: Upload,
    description: 'Upload answers',
  },
  {
    label: 'Analytics',
    path: '/analytics',
    icon: BarChart3,
    description: 'Performance data',
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: User,
    description: 'Account settings',
  },
];

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();

  const sidebarVariants = {
    open: { width: 260, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
    closed: { width: 72, transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        animate={isOpen ? 'open' : 'closed'}
        className={`
          fixed top-16 left-0 bottom-0 z-40
          bg-dark-100/95 backdrop-blur-xl
          border-r border-white/5
          flex flex-col
          overflow-hidden
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          transition-transform lg:transition-none
        `}
        style={{ width: isOpen ? 260 : 72 }}
      >
        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 1024) onToggle();
                }}
                id={`sidebar-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`
                  group flex items-center gap-3 px-3 py-2.5 rounded-xl
                  transition-all duration-200 relative
                  ${isActive
                    ? 'bg-gradient-to-r from-gold/15 to-transparent text-gold'
                    : 'text-silver-200 hover:bg-white/5 hover:text-silk'
                  }
                `}
              >
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-gold rounded-r-full"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}

                <div className={`
                  flex items-center justify-center w-9 h-9 rounded-lg shrink-0
                  transition-colors duration-200
                  ${isActive ? 'bg-gold/10' : 'group-hover:bg-white/5'}
                `}>
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                      className="min-w-0"
                    >
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-gold' : ''}`}>
                        {item.label}
                      </p>
                      <p className="text-[11px] text-dark-700 truncate">
                        {item.description}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={onToggle}
            className="hidden lg:flex items-center justify-center w-full p-2 rounded-lg hover:bg-white/5 transition-colors text-silver-200"
            id="sidebar-collapse-btn"
          >
            <motion.div
              animate={{ rotate: isOpen ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronLeft size={18} />
            </motion.div>
            <AnimatePresence>
              {isOpen && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-xs ml-2"
                >
                  Collapse
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

        {/* Decorative glow */}
        {isOpen && (
          <div className="absolute top-20 -left-20 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
