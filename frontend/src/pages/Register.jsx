import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { isValidEmail } from '../utils/helpers';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  BookOpen,
  Target,
  ArrowRight,
  Loader2,
  Sparkles,
  ChevronDown,
  Home,
} from 'lucide-react';

const branches = [
  'Computer Science',
  'Electronics',
  'Mechanical',
  'Civil',
  'Electrical',
  'Information Technology',
  'Chemical',
  'Biotechnology',
  'Other',
];

const examTargets = [
  'GATE',
  'JEE',
  'NEET',
  'CAT',
  'University Exams',
  'Competitive Exams',
  'Other',
];

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    branch: '',
    exam_target: '',
    subjects: '',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return 'Name is required';
    if (!isValidEmail(formData.email)) return 'Valid email is required';
    if (formData.password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setError(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.branch) {
      setError('Please select your branch');
      return;
    }

    setLoading(true);
    try {
      if (rememberMe) {
        localStorage.setItem('examcraft_rem_email', formData.email);
        localStorage.setItem('examcraft_rem_pass', formData.password);
      } else {
        localStorage.removeItem('examcraft_rem_email');
        localStorage.removeItem('examcraft_rem_pass');
      }

      const payload = {
        ...formData,
        subjects: formData.subjects.split(',').map((s) => s.trim()).filter(Boolean),
      };
      await register(payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/4 w-72 h-72 bg-gold/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-silk hover:bg-white/10 hover:border-gold/30 transition-all group backdrop-blur-md"
      >
        <Home size={18} className="text-gold group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-sm font-medium hidden xs:block">Back to Home</span>
      </Link>

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12">
        <div className="relative z-10 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center shadow-lg shadow-gold/20">
                <GraduationCap size={28} className="text-dark" />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-[var(--font-display)] text-gradient-gold">
                  ExamCraftAI
                </h1>
                <p className="text-xs text-silver-200 tracking-wider uppercase">Smart Exam Preparation</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-silk leading-tight mb-4 font-[var(--font-display)]">
              Start Your Journey
              <br />
              <span className="text-gradient-gold">To Success</span>
            </h2>
            <p className="text-silver-200 leading-relaxed mb-8">
              Join thousands of students who are acing their exams with
              AI-powered preparation, personalized practice sessions, and
              intelligent performance tracking.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: '10K+', label: 'Students' },
                { value: '50K+', label: 'Questions' },
                { value: '95%', label: 'Success Rate' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.15 }}
                  className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/5"
                >
                  <p className="text-xl font-bold text-gradient-gold font-[var(--font-display)]">{stat.value}</p>
                  <p className="text-xs text-dark-700">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[440px]"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-6 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
              <GraduationCap size={22} className="text-dark" />
            </div>
            <span className="text-xl font-bold font-[var(--font-display)] text-gradient-gold">
              ExamCraftAI
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-silk mb-2 font-[var(--font-display)]">
            Create Account
          </h2>
          <p className="text-silver-200 text-sm mb-6">
            {step === 1 ? 'Enter your basic information' : 'Tell us about your studies'}
          </p>

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-6">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                  step >= s ? 'bg-gold text-dark' : 'bg-dark-300 text-dark-700'
                }`}>
                  {s}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${
                  step >= s ? 'text-gold' : 'text-dark-700'
                }`}>
                  {s === 1 ? 'Account' : 'Academic'}
                </span>
                {s === 1 && (
                  <div className={`flex-1 h-0.5 rounded-full transition-all ${
                    step >= 2 ? 'bg-gold' : 'bg-dark-400'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-name">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700" />
                    <input
                      type="text"
                      id="reg-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="input-dark pl-11"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-email">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700" />
                    <input
                      type="email"
                      id="reg-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="input-dark pl-11"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-password">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="reg-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 6 characters"
                      className="input-dark pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 hover:text-silk transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 px-1">
                  <input
                    type="checkbox"
                    id="reg-remember"
                    name="rememberMe"
                    checked={rememberMe}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-dark-500 bg-dark-300 text-gold focus:ring-gold/30 accent-[#C9A84C] cursor-pointer"
                  />
                  <label htmlFor="reg-remember" className="text-sm text-silver-200 cursor-pointer select-none">
                    Remember me
                  </label>
                </div>

                <motion.button
                  type="button"
                  onClick={handleNext}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-[15px] font-semibold mt-2"
                  id="register-next-btn"
                >
                  Next Step
                  <ArrowRight size={18} />
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-branch">
                    Branch / Department
                  </label>
                  <div className="relative">
                    <BookOpen size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700 pointer-events-none" />
                    <select
                      id="reg-branch"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="input-dark pl-11 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Select your branch</option>
                      {branches.map((b) => (
                        <option key={b} value={b} className="bg-dark-200">{b}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 pointer-events-none" />
                  </div>
                </div>

                {/* Exam Target */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-exam-target">
                    Exam Target
                  </label>
                  <div className="relative">
                    <Target size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700 pointer-events-none" />
                    <select
                      id="reg-exam-target"
                      name="exam_target"
                      value={formData.exam_target}
                      onChange={handleChange}
                      className="input-dark pl-11 pr-10 appearance-none cursor-pointer"
                    >
                      <option value="">Select exam target</option>
                      {examTargets.map((t) => (
                        <option key={t} value={t} className="bg-dark-200">{t}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 pointer-events-none" />
                  </div>
                </div>

                {/* Subjects */}
                <div>
                  <label className="block text-sm font-medium text-silver mb-2" htmlFor="reg-subjects">
                    Subjects (comma separated)
                  </label>
                  <input
                    type="text"
                    id="reg-subjects"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleChange}
                    placeholder="Mathematics, Physics, Data Structures"
                    className="input-dark"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-dark flex-1 py-3"
                    id="register-back-btn"
                  >
                    Back
                  </button>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="btn-gold flex-[2] py-3 flex items-center justify-center gap-2 text-[15px] font-semibold"
                    id="register-submit-btn"
                  >
                    {loading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <>
                        <Sparkles size={16} />
                        Create Account
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-silver-200 mt-8">
            Already have an account?{' '}
            <Link to="/login" className="text-gold font-semibold hover:text-gold-light transition-colors" id="go-to-login">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
