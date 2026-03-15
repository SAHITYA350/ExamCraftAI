import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/helpers';
import {
  User,
  Mail,
  BookOpen,
  Target,
  GraduationCap,
  Calendar,
  Award,
  ArrowLeft,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();

  const profileStats = [
    { label: 'Questions Solved', value: '0', icon: BookOpen },
    { label: 'Average Score', value: '0%', icon: Target },
    { label: 'Days Active', value: '1', icon: Calendar },
    { label: 'Achievements', value: '0', icon: Award },
  ];

  return (
    <div className="page-container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-silver-200 hover:text-gold transition-all mb-6 group px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-gold/30"
          id="back-to-home-profile"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-semibold uppercase tracking-wider">Back to Home</span>
        </Link>

        {/* Profile Header Card */}
        <div className="glass-card p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-gold/10 via-gold/5 to-transparent" />
          <div className="absolute top-10 right-10 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gold to-gold-dark flex items-center justify-center text-dark text-3xl sm:text-4xl font-bold font-[var(--font-display)] shadow-lg shadow-gold/20">
              {getInitials(user?.name)}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold text-silk font-[var(--font-display)] mb-1">
                {user?.name}
              </h1>
              <p className="text-sm text-silver-200 mb-1">{user?.email}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20">
                  <GraduationCap size={10} className="inline mr-1" />
                  {user?.branch}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-info/10 text-info border border-info/20">
                  <Target size={10} className="inline mr-1" />
                  {user?.exam_target}
                </span>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 relative">
            {profileStats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="text-center p-3 rounded-xl bg-dark-200/50 border border-white/5"
                >
                  <Icon size={18} className="text-gold mx-auto mb-1.5" />
                  <p className="text-lg font-bold text-silk font-[var(--font-display)]">{stat.value}</p>
                  <p className="text-[11px] text-dark-700 font-medium uppercase truncate">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Profile Details — Read Only */}
        <div className="glass-card p-6 sm:p-8">
          <h2 className="text-xl font-bold text-silk font-[var(--font-display)] mb-8 flex items-center gap-2 border-b border-white/5 pb-4">
            <User size={22} className="text-gold" />
            Overview
          </h2>
          
          <div className="space-y-8">
            {/* Academic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                   <h3 className="text-sm font-semibold text-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Briefcase size={14} />
                        Academic Branch
                    </h3>
                    <p className="text-silk font-medium pl-1">{user?.branch || "N/A"}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Target size={14} />
                        Active Goal
                    </h3>
                    <p className="text-silk font-medium pl-1">{user?.exam_target || "N/A"}</p>
                </div>
            </div>

            {/* Subjects Section */}
            <div>
                <h3 className="text-sm font-semibold text-gold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Layers size={14} />
                    Enrolled Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                    {user?.subjects && user.subjects.length > 0 ? (
                        user.subjects.map((subject, index) => (
                            <motion.span
                                key={index}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-silk text-sm font-medium hover:border-gold/30 hover:bg-white/10 transition-all"
                            >
                                {subject}
                            </motion.span>
                        ))
                    ) : (
                        <p className="text-dark-700 italic">No subjects listed.</p>
                    )}
                </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
