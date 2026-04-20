import React, { useEffect, useState } from 'react';
import api, { getBackendUrl } from '../api';
import { motion } from 'framer-motion';
import { FileText, Download, Clock, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import GlowCard from '../components/GlowCard';
import ScoreRing from '../components/ScoreRing';
import PageHeader from '../components/PageHeader';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/resumes');
        setResumes(res.data.resumes || []);
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  if (!loading && resumes.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={30} className="text-yellow-500" />
          </div>
          <h2 className="font-[var(--font-display)] text-xl font-bold text-white mb-2">No Resumes Forged</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Head over to the AI Forge to create your first optimized resume.
          </p>
          <button onClick={() => navigate('/ai-forge')}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] transition-all cursor-pointer">
            <Sparkles size={16} /> Open AI Forge
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-6xl mx-auto">
      <PageHeader title="Resume Library" subtitle="View, download, and track the performance of all your generated resumes." />

      {loading ? (
        <div className="py-12 text-center text-[var(--color-text-muted)]">Loading library...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {resumes.map((resume, i) => {
            const atsScore = parseInt(resume.ats_score) || 0;
            return (
              <motion.div key={resume._id} variants={item}>
                <GlowCard animate={false} className="flex flex-col h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <FileText size={15} className="text-[var(--color-accent)] shrink-0" />
                        <h3 className="text-sm font-bold text-white truncate">{resume.files?.pdf || 'Resume'}</h3>
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-[var(--color-bg-elevated)] rounded text-[0.625rem] font-semibold text-[var(--color-text-secondary)]">
                          {resume.domain}
                        </span>
                      </div>
                      <div className="text-[0.6875rem] text-[var(--color-text-muted)] flex items-center gap-1">
                        <Clock size={11} /> {new Date(resume.created_at).toLocaleString()}
                      </div>
                    </div>
                    <ScoreRing score={atsScore} size={48} strokeWidth={4} showPercent={false} delay={0.2 + i * 0.1} />
                  </div>

                  <div className="mt-auto flex gap-2 pt-3 border-t border-[var(--color-border)]">
                    {resume.files?.pdf && (
                      <a href={getBackendUrl(`/api/download/${resume.files.pdf}`)} download
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-xs font-semibold rounded-lg hover:bg-[var(--color-bg-hover)] transition-all">
                        <Download size={12} /> PDF
                      </a>
                    )}
                    {resume.files?.docx && (
                      <a href={getBackendUrl(`/api/download/${resume.files.docx}`)} download
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[var(--color-text-secondary)] text-xs font-semibold rounded-lg hover:bg-[var(--color-bg-hover)] transition-all">
                        <Download size={12} /> DOCX
                      </a>
                    )}
                  </div>
                </GlowCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
