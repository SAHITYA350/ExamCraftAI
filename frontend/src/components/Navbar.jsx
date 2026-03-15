import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { getInitials } from '../utils/helpers';
import {
  Menu,
  X,
  Search,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
  GraduationCap,
  Clock
} from 'lucide-react';

const Navbar = ({ onToggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [clockOpen, setClockOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const paths = {
      '/dashboard': 'Dashboard',
      '/practice': 'Practice',
      '/practice/session': 'Practice Session',
      '/upload-solution': 'Upload Solution',
      '/analytics': 'Analytics',
      '/profile': 'Profile',
      '/upload-material': 'Upload Materials',
    };
    return paths[location.pathname] || 'ExamCraftAI';
  };

  const formatDateTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-dark-100/80 backdrop-blur-xl border-b border-white/5">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors lg:hidden active:scale-95"
            id="sidebar-toggle"
            aria-label="Toggle Sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link to="/dashboard" className="flex items-center gap-2.5 transition-transform active:scale-95">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/10">
              <GraduationCap size={20} className="text-dark" />
            </div>
            <span className="text-lg font-bold font-[var(--font-display)] text-gradient-gold hidden sm:block">
              ExamCraftAI
            </span>
          </Link>

          <div className="hidden md:block ml-2">
            <h1 className="text-sm font-medium text-silver-100 border-l border-white/10 pl-4">{getPageTitle()}</h1>
          </div>
        </div>

        {/* Center / Date Time Section - Desktop only in center */}
        <div className="absolute left-1/2 -translate-x-1/2 hidden md:block">
          <button 
            onClick={() => setClockOpen(!clockOpen)}
            className="flex items-center gap-2 text-silver-200 text-sm bg-white/5 hover:bg-white/10 py-1.5 px-3.5 rounded-full border border-white/5 transition-all hover:border-gold/30 group"
          >
            <Clock size={14} className="text-gold shrink-0 group-hover:scale-110 transition-transform" />
            <span className="font-medium whitespace-nowrap">
              {formatDateTime(currentTime)}
            </span>
          </button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Mobile Clock */}
          <button 
            onClick={() => setClockOpen(!clockOpen)}
            className="p-2 rounded-xl hover:bg-white/5 transition-all flex md:hidden items-center relative active:scale-95"
            id="clock-btn-mobile"
            aria-label="Toggle Time"
          >
            <Clock size={20} className="text-gold" />
            {clockOpen && (
              <div className="absolute inset-0 bg-gold/5 rounded-xl animate-pulse" />
            )}
          </button>

          {/* Search Toggle Mobile */}
          <button 
            onClick={() => setSearchOpen(!searchOpen)}
            className="p-2 rounded-xl hover:bg-white/5 transition-all flex md:hidden items-center active:scale-95" 
            id="search-btn-mobile"
            aria-label="Open Search"
          >
            <Search size={22} className="text-silver-200" />
          </button>

          {/* Search Bar Desktop */}
          <div className="relative hidden md:flex items-center group">
            <Search size={16} className="absolute left-3.5 text-silver-200 z-10 pointer-events-none group-focus-within:text-gold transition-colors" />
            <input 
              type="text" 
              placeholder="Search everything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm text-silk focus:outline-none focus:border-gold/30 focus:bg-white/[0.08] focus:ring-4 focus:ring-gold/5 transition-all w-48 lg:w-72 placeholder:text-silver-300" 
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-silver-300 hover:text-gold transition-colors"
                aria-label="Clear Search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Notifications */}
          <button 
            className="p-2 rounded-xl hover:bg-white/5 transition-all relative active:scale-95" 
            id="notifications-btn"
            aria-label="View Notifications"
          >
            <Bell size={22} className="text-silver-200" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-gold rounded-full border-2 border-dark-100 shadow-[0_0_8px_rgba(201,168,76,0.5)]"></span>
          </button>

          {/* Clock Popover for Mobile */}
          <AnimatePresence>
            {clockOpen && (
              <>
                <div className="fixed inset-0 z-[60]" onClick={() => setClockOpen(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute top-full right-4 mt-2 px-4 py-2.5 bg-dark-200/95 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] rounded-2xl z-[70] flex items-center gap-3 md:hidden"
                >
                  <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                    <Clock size={16} className="text-gold" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-silver-200 font-bold">Current Time</span>
                    <span className="text-sm font-semibold text-silk whitespace-nowrap leading-tight">
                      {formatDateTime(currentTime)}
                    </span>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2.5 p-1.5 md:pl-2 md:pr-3 rounded-xl hover:bg-white/5 transition-colors active:scale-95"
              id="profile-dropdown-trigger"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark text-xs font-bold">
                {getInitials(user?.name)}
              </div>
              <span className="text-sm font-medium text-silk hidden md:block max-w-[120px] truncate">
                {user?.name || 'Student'}
              </span>
              <ChevronDown size={14} className="text-silver-200 hidden md:block" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-dark-100/95 sm:bg-dark-100/80 backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] rounded-2xl z-50 overflow-hidden"
                  >
                    <div className="p-3 border-b border-white/5">
                      <p className="text-sm font-semibold text-silk">{user?.name}</p>
                      <p className="text-xs text-silver-200 truncate">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-silver hover:bg-white/5 hover:text-silk transition-colors"
                        id="nav-profile-link"
                      >
                        <User size={16} />
                        My Profile
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-silver hover:bg-white/5 hover:text-silk transition-colors"
                        id="nav-settings-link"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setProfileOpen(false);
                        }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-danger hover:bg-danger/10 transition-colors w-full text-left"
                        id="nav-logout-btn"
                      >
                        <LogOut size={16} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Search Dropdown */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden absolute top-full left-0 right-0 bg-dark-100/95 backdrop-blur-xl border-b border-white/5 p-3 overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-40"
          >
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-silver-200 z-10 pointer-events-none" />
              <input 
                autoFocus
                type="text" 
                placeholder="Search user, details, everything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-10 text-sm text-silk focus:outline-none focus:border-gold/50 focus:bg-white/10 transition-all placeholder:text-silver-200" 
              />
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSearchOpen(false);
                }}
                className="absolute right-2 p-1.5 rounded-full hover:bg-white/10 text-silver-200 transition-colors"
                id="search-mobile-close"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
