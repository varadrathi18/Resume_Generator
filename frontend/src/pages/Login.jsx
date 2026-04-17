import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';
import { Mail, Lock, LoaderCircle, AlertCircle, Flame } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const res = await api.post('/api/auth/google', {
        token: credentialResponse.credential
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google Sign-In failed');
    }
  };

  return (
    <div className="auth-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="auth-card"
      >
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Flame size={22} color="white" />
          </div>
          <span className="auth-logo-text">
            Resume<span style={{ color: 'var(--color-accent)' }}>Forge</span>
          </span>
        </div>

        {/* Heading */}
        <div className="auth-heading">
          <h2>Welcome back</h2>
          <p>Sign in to your account to continue</p>
        </div>

        {/* Form Card */}
        <div className="auth-form-card">
          {/* Google Login */}
          <div className="auth-google-wrapper">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('Google Sign-In failed')}
              theme="filled_black"
              shape="rectangular"
              size="large"
            />
          </div>

          {/* Divider */}
          <div className="auth-divider">
            <span>or continue with email</span>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="alert alert-error"
              style={{ marginBottom: '1rem' }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <Mail size={18} style={{ position: 'absolute', left: 12, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  type="email"
                  required
                  className="form-input with-icon"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="form-input-wrapper">
                <Lock size={18} style={{ position: 'absolute', left: 12, color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                <input
                  type="password"
                  required
                  className="form-input with-icon"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', marginTop: '0.5rem', padding: '0.875rem' }}
            >
              {loading ? (
                <LoaderCircle className="animate-spin" size={20} />
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup">Create one</Link>
        </div>
      </motion.div>
    </div>
  );
}
