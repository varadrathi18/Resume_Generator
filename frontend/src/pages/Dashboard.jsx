import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Sparkles, TrendingUp, Zap, Clock, Star } from 'lucide-react';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = JSON.parse(localStorage.getItem('user'))?.name || 'User';

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://127.0.0.1:8080/api/resumes', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResumes(res.data.resumes || []);
      } catch (err) {
        console.error("Failed to fetch resumes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumes();
  }, []);

  const totalResumes = resumes.length;
  // Calculate average ATS score
  const avgAts = totalResumes > 0 
    ? Math.round(resumes.reduce((acc, r) => acc + (parseInt(r.ats_score) || 0), 0) / totalResumes) 
    : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}
    >
      <motion.header variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2rem', fontWeight: 800,
          color: 'var(--color-text-primary)', marginBottom: '0.5rem',
          letterSpacing: '-0.01em',
        }}>
          Welcome back, {userName.split(' ')[0]}
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
          Here is what's happening with your AI-optimized resumes today.
        </p>
      </motion.header>

      {/* Top Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(232, 80, 58, 0.1)', color: 'var(--color-accent)', padding: '1rem', borderRadius: '12px' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Resumes</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {loading ? '-' : totalResumes}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ background: 'rgba(45, 212, 168, 0.1)', color: 'var(--color-teal)', padding: '1rem', borderRadius: '12px' }}>
            <TrendingUp size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg ATS Score</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              {loading ? '-' : `${avgAts}%`}
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', background: 'linear-gradient(135deg, rgba(232, 80, 58, 0.15), rgba(200, 62, 42, 0.05))', cursor: 'pointer', border: '1px solid rgba(232, 80, 58, 0.2)' }} onClick={() => navigate('/ai-forge')}>
          <div style={{ background: 'var(--color-accent)', color: 'white', padding: '1rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(232, 80, 58, 0.3)' }}>
            <Zap size={24} fill="currentColor" />
          </div>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-accent-light)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instant Forge</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-primary)', marginTop: '0.25rem' }}>
              Generate new resume
            </div>
          </div>
        </motion.div>

      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>Recent Generations</h2>
          <button className="btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }} onClick={() => navigate('/resumes')}>
            View All
          </button>
        </div>

        <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading history...</div>
          ) : resumes.length === 0 ? (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
              <Sparkles size={32} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
              <p>No resumes forged yet.</p>
              <button className="btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/ai-forge')}>
                Start First Forge
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {resumes.slice(0, 4).map((resume, idx) => (
                 <div key={resume._id} style={{ 
                   display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '1rem',
                   alignItems: 'center', padding: '1.25rem 1.5rem',
                   borderBottom: idx < resumes.slice(0, 4).length - 1 ? '1px solid var(--color-border)' : 'none',
                   transition: 'background 0.2s',
                  }}
                  className="hover-row"
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-hover)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                 >
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                     <div style={{ width: 40, height: 40, borderRadius: '10px', background: 'var(--color-bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)' }}>
                       <FileText size={18} />
                     </div>
                     <div>
                       <div style={{ fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                         {resume.files?.pdf || 'Unnamed Resume'}
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                         <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <Star size={12} style={{ color: 'var(--color-warning)' }} /> ATS: {resume.ats_score}%
                         </span>
                         <span>•</span>
                         <span>{resume.domain}</span>
                       </div>
                     </div>
                   </div>
                   <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Clock size={14} />
                     {new Date(resume.created_at).toLocaleDateString()}
                   </div>
                 </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
