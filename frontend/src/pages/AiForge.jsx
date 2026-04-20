import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Form from '../components/Form';
import Loader from '../components/Loader';
import { AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';

export default function AiForge() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/generate', formData);
      navigate('/result', { state: { result: res.data } });
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <Loader />}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-6xl mx-auto">
        <PageHeader
          icon={Sparkles}
          badge="Resume Generator"
          title="Forge Your Resume"
          subtitle="AI-powered resume generation optimized for ATS algorithms and modern hiring standards."
        />

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-400 mb-0.5">Generation Failed</p>
                  <p className="text-xs text-red-400/80">{error}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Form onSubmit={handleSubmit} loading={loading} />
      </motion.div>
    </>
  );
}
