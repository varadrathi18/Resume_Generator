import React, { useEffect, useState } from 'react';
import api, { getBackendUrl } from '../api';
import { motion } from 'framer-motion';
import { FileText, Download, Clock, Star, AlertTriangle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const res = await api.get('/api/resumes');
        setResumes(res.data.resumes || []);
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  if (!loading && resumes.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '2rem' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card" style={{ padding: '3rem', textAlign: 'center', maxWidth: 400 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
            <AlertTriangle size={32} style={{ color: 'var(--color-warning)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>No Resumes Forged</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            You haven't generated any resumes yet. Head over to the AI Forge to create your first optimized resume.
          </p>
          <button onClick={() => navigate('/ai-forge')} className="btn-primary" style={{ width: '100%' }}>
            <Sparkles size={16} /> Open AI Forge
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>
      <motion.header variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
          Resume Library
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
          View, download, and track the performance of all your generated resumes.
        </p>
      </motion.header>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading library...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {resumes.map((resume) => {
            const atsScore = parseInt(resume.ats_score) || 0;
            const offset = 100 - atsScore;
            
            return (
              <motion.div key={resume._id} variants={itemVariants} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                      <FileText size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
                      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {resume.files?.pdf || 'Resume'}
                      </h3>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge" style={{ background: 'var(--color-bg-elevated)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.6875rem', fontWeight: 600 }}>
                        {resume.domain}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={12} /> {new Date(resume.created_at).toLocaleString()}
                    </div>
                  </div>

                  {/* Tiny ATS Dial */}
                  <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                    <svg viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                      <path fill="none" stroke="var(--color-bg-elevated)" strokeWidth="4" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path fill="none" stroke={atsScore >= 80 ? 'var(--color-success)' : atsScore >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'} strokeWidth="4" strokeLinecap="round" strokeDasharray="100, 100" strokeDashoffset={offset} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      {atsScore}
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--color-border)' }}>
                  {resume.files?.pdf && (
                    <a href={getBackendUrl(`/api/download/${resume.files.pdf}`)} download className="btn-secondary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}>
                      <Download size={14} /> PDF
                    </a>
                  )}
                  {resume.files?.docx && (
                    <a href={getBackendUrl(`/api/download/${resume.files.docx}`)} download className="btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}>
                      <Download size={14} /> DOCX
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
