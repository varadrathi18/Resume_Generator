import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { motion } from 'framer-motion';
import { FileText, Sparkles, TrendingUp, Zap, Clock, Star, ArrowRight } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import GlowCard from '../components/GlowCard';
import AnimatedCounter from '../components/AnimatedCounter';
import ScoreRing from '../components/ScoreRing';
import PageHeader from '../components/PageHeader';

export default function Dashboard() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userName = JSON.parse(localStorage.getItem('user'))?.name || 'User';

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

  const totalResumes = resumes.length;
  const avgAts = totalResumes > 0
    ? Math.round(resumes.reduce((acc, r) => acc + (parseInt(r.ats_score) || 0), 0) / totalResumes)
    : 0;
  const latestDomain = resumes[0]?.domain || '—';

  // Build trend data for mini chart
  const trendData = resumes.slice(0, 10).reverse().map((r, i) => ({
    name: `R${i + 1}`,
    score: parseInt(r.ats_score) || 0,
  }));

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '☀️ Good morning';
    if (h < 18) return '🌤 Good afternoon';
    return '🌙 Good evening';
  };

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-6xl mx-auto">
      <PageHeader
        title={`${getGreeting()}, ${userName.split(' ')[0]}`}
        subtitle="Here's what's happening with your AI-optimized resumes today."
      />

      {/* ── Stat Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Total Resumes */}
        <motion.div variants={item}>
          <GlowCard animate={false}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Total Resumes</p>
                <div className="font-[var(--font-display)] text-3xl font-extrabold text-white">
                  {loading ? <span className="text-[var(--color-text-muted)]">—</span> : <AnimatedCounter value={totalResumes} />}
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Avg ATS */}
        <motion.div variants={item}>
          <GlowCard animate={false}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-teal)]/10 text-[var(--color-teal)]">
                <TrendingUp size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Avg ATS Score</p>
                <div className="font-[var(--font-display)] text-3xl font-extrabold text-white">
                  {loading ? <span className="text-[var(--color-text-muted)]">—</span> : <AnimatedCounter value={avgAts} suffix="%" />}
                </div>
              </div>
            </div>
          </GlowCard>
        </motion.div>

        {/* Quick Action */}
        <motion.div variants={item}>
          <GlowCard
            animate={false}
            onClick={() => navigate('/ai-forge')}
            glowColor="rgba(232, 80, 58, 0.25)"
            className="bg-gradient-to-br from-[var(--color-accent)]/15 to-[var(--color-accent-dark)]/5 border-[var(--color-accent)]/20"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/30">
                <Zap size={22} fill="currentColor" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-[var(--color-accent-light)] uppercase tracking-wider">Instant Forge</p>
                <p className="text-sm text-[var(--color-text-primary)] mt-0.5 flex items-center gap-1">
                  Generate new resume <ArrowRight size={14} />
                </p>
              </div>
            </div>
          </GlowCard>
        </motion.div>
      </div>

      {/* ── ATS Trend Chart + Recent Activity ──────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        {/* Trend Chart */}
        {trendData.length > 1 && (
          <motion.div variants={item} className="lg:col-span-2">
            <GlowCard animate={false} className="h-full">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--color-teal)]" /> ATS Score Trend
              </h3>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="atsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" hide />
                    <Tooltip
                      contentStyle={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }}
                      labelStyle={{ color: 'var(--color-text-muted)' }}
                      itemStyle={{ color: 'var(--color-accent)' }}
                    />
                    <Area type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2.5} fill="url(#atsGradient)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </GlowCard>
          </motion.div>
        )}

        {/* Recent Generations */}
        <motion.div variants={item} className={trendData.length > 1 ? 'lg:col-span-3' : 'lg:col-span-5'}>
          <GlowCard animate={false} className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">Recent Generations</h3>
              <button
                className="text-xs font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-light)] transition-colors cursor-pointer"
                onClick={() => navigate('/resumes')}
              >
                View All →
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-[var(--color-text-muted)] text-sm">Loading...</div>
            ) : resumes.length === 0 ? (
              <div className="py-10 text-center">
                <Sparkles size={32} className="mx-auto mb-3 text-[var(--color-text-muted)] opacity-40" />
                <p className="text-[var(--color-text-secondary)] text-sm mb-3">No resumes forged yet.</p>
                <button
                  className="px-5 py-2 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] transition-all cursor-pointer"
                  onClick={() => navigate('/ai-forge')}
                >
                  Start First Forge
                </button>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--color-border)]">
                {resumes.slice(0, 5).map((resume) => (
                  <div
                    key={resume._id}
                    className="flex items-center gap-3 py-3 px-2 -mx-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-muted)] shrink-0 group-hover:text-[var(--color-accent)] transition-colors">
                      <FileText size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                        {resume.files?.pdf || 'Unnamed Resume'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mt-0.5">
                        <span className="flex items-center gap-1">
                          <Star size={10} className="text-[var(--color-warning)]" /> {resume.ats_score}%
                        </span>
                        <span>•</span>
                        <span>{resume.domain}</span>
                      </div>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] hidden sm:flex items-center gap-1 shrink-0">
                      <Clock size={12} />
                      {new Date(resume.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </GlowCard>
        </motion.div>
      </div>
    </motion.div>
  );
}
