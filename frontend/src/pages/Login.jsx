import { useState, useEffect } from 'react';
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
  ArrowRight,
  Loader2,
  Sparkles,
  Home,
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('examcraft_rem_email');
    const rememberedPassword = localStorage.getItem('examcraft_rem_pass');
    if (rememberedEmail) {
      setFormData({ 
        email: rememberedEmail, 
        password: rememberedPassword || '' 
      });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setRememberMe(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
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

      await login(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gold/3 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-silk hover:bg-white/10 hover:border-gold/30 transition-all group backdrop-blur-md"
      >
        <Home size={18} className="text-gold group-hover:-translate-y-0.5 transition-transform" />
        <span className="text-sm font-medium hidden xs:block">Back to Home</span>
      </Link>

      {/* Left Panel — Branding (hidden on mobile) */}
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
              Master Your Exams
              <br />
              <span className="text-gradient-gold">With AI Power</span>
            </h2>
            <p className="text-silver-200 leading-relaxed mb-8">
              Upload study materials, practice with AI-generated questions,
              get instant answer evaluation, and track your progress with
              intelligent risk analysis.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {['AI Evaluation', 'Smart Practice', 'Risk Analysis', 'Weak Topic Detection'].map((f, i) => (
                <motion.span
                  key={f}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-gold/10 text-gold border border-gold/20"
                >
                  <Sparkles size={10} className="inline mr-1" />
                  {f}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-64 h-64 border border-gold/5 rounded-full" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 border border-gold/5 rounded-full" />
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[420px]"
        >
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold to-gold-light flex items-center justify-center">
              <GraduationCap size={22} className="text-dark" />
            </div>
            <span className="text-xl font-bold font-[var(--font-display)] text-gradient-gold">
              ExamCraftAI
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-silk mb-2 font-[var(--font-display)]">
            Welcome Back
          </h2>
          <p className="text-silver-200 text-sm mb-8">
            Sign in to continue your exam preparation journey
          </p>

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

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-silver mb-2" htmlFor="login-email">
                Email Address
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700" />
                <input
                  type="email"
                  id="login-email"
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
              <label className="block text-sm font-medium text-silver mb-2" htmlFor="login-password">
                Password
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-700" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-dark pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-700 hover:text-silk transition-colors"
                  id="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-silver-200 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-dark-500 bg-dark-300 text-gold focus:ring-gold/30 accent-[#C9A84C]"
                />
                Remember me
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-gold w-full py-3.5 flex items-center justify-center gap-2 text-[15px] font-semibold"
              id="login-submit-btn"
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <p className="text-center text-sm text-silver-200 mt-8">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-gold font-semibold hover:text-gold-light transition-colors" id="go-to-register">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
