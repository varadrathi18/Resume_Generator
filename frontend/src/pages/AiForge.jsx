import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Form from '../components/Form';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AiForge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post('http://127.0.0.1:8080/api/generate', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}
    >
      {/* Page Header */}
      <header style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
          <span style={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'var(--color-accent)',
          }}>
            Resume Generator
          </span>
        </div>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          marginBottom: '0.375rem',
          letterSpacing: '-0.01em',
        }}>
          Forge Your Resume
        </h1>
        <p style={{
          fontSize: '0.9375rem',
          color: 'var(--color-text-secondary)',
          maxWidth: 600,
          lineHeight: 1.6,
        }}>
          AI-powered resume generation optimized for ATS algorithms and modern hiring standards.
        </p>
      </header>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginBottom: '1.5rem' }}
          >
            <div className="alert alert-error">
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>
                <div className="alert-title" style={{ marginBottom: 2 }}>Generation Failed</div>
                <span style={{ fontSize: '0.8125rem' }}>{error}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <Form onSubmit={handleSubmit} loading={loading} />
    </motion.div>
  );
}
