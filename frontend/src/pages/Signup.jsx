import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';
import { User, Mail, Lock, LoaderCircle, AlertCircle, Flame, Sparkles, ArrowRight } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/api/auth/google', { token: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google Sign-In failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-bg)]">
      {/* Left side gradient artwork */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center bg-gradient-to-br from-[#0d1117] via-[#151a27] to-[#1c1028]">
        <div className="absolute top-20 right-20 w-80 h-80 bg-[var(--color-accent)]/20 rounded-full blur-[100px] animate-glow" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-[var(--color-teal)]/15 rounded-full blur-[120px] animate-glow" style={{ animationDelay: '2s' }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative z-10 max-w-md px-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] shadow-xl shadow-[var(--color-accent)]/30">
              <Flame size={24} color="white" />
            </div>
            <span className="font-[var(--font-display)] text-2xl font-extrabold text-white">
              Resume<span className="text-[var(--color-accent)]">Forge</span>
            </span>
          </div>
          <h2 className="font-[var(--font-display)] text-4xl font-extrabold text-white leading-tight mb-4">
            Start building your <span className="text-[var(--color-teal)]">career today</span>
          </h2>
          <p className="text-[var(--color-text-secondary)] text-base leading-relaxed mb-8">
            Join thousands of professionals who use AI to create stunning, ATS-optimized resumes in seconds.
          </p>
          <div className="flex flex-wrap gap-2">
            {['Free to Start', 'AI-Powered', 'Instant Downloads', 'Domain Smart'].map((f) => (
              <span key={f} className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-[var(--color-text-secondary)]">
                <Sparkles size={10} className="inline mr-1 text-[var(--color-teal)]" />{f}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right side form */}
      <div className="flex-1 lg:max-w-xl flex items-center justify-center p-6 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] shadow-lg">
              <Flame size={20} color="white" />
            </div>
            <span className="font-[var(--font-display)] text-xl font-bold text-white">Resume<span className="text-[var(--color-accent)]">Forge</span></span>
          </div>

          <h2 className="font-[var(--font-display)] text-2xl sm:text-3xl font-extrabold text-white mb-1.5">Create your account</h2>
          <p className="text-[var(--color-text-secondary)] text-sm mb-8">Start building professional resumes with AI</p>

          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/10">
            <div className="flex justify-center mb-5">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => setError('Google Sign-In failed')} theme="filled_black" shape="rectangular" size="large" />
            </div>

            <div className="relative flex items-center my-6">
              <div className="flex-1 h-px bg-[var(--color-border)]" />
              <span className="px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">or continue with email</span>
              <div className="flex-1 h-px bg-[var(--color-border)]" />
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2.5 p-3 mb-5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={16} className="shrink-0" /><span>{error}</span>
              </motion.div>
            )}

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="text" required className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-[var(--color-bg)] placeholder:text-[var(--color-text-muted)]" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="email" required className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-[var(--color-bg)] placeholder:text-[var(--color-text-muted)]" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                  <input type="password" required className="w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-[var(--color-bg)] placeholder:text-[var(--color-text-muted)]" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[var(--color-accent)] text-white font-semibold py-3 rounded-xl mt-2 shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] hover:shadow-lg hover:shadow-[var(--color-accent)]/35 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer">
                {loading ? <LoaderCircle className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={16} /></>}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-[var(--color-text-secondary)] mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-[var(--color-accent)] font-semibold hover:text-[var(--color-accent-light)] transition-colors">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
