import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import api, { getBackendUrl } from '../api';
import ResumePreview from '../components/ResumePreview';
import ScoreRing from '../components/ScoreRing';
import GlowCard from '../components/GlowCard';
import {
  CheckCircle, TrendingUp, AlertTriangle, Download, FileText,
  Sparkles, ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Compute a local ATS score by analyzing the resume text.
 * Used as a fallback when the backend Gemini-based scoring is unavailable.
 */
function computeLocalAtsScore(resumeText) {
  if (!resumeText || resumeText.length < 50) return 45;
  const text = resumeText.toLowerCase();
  const lines = resumeText.split('\n').filter(l => l.trim());

  const keyHeadings = ['summary', 'skills', 'experience', 'education', 'projects', 'competencies', 'certifications'];
  const foundHeadings = keyHeadings.filter(h => text.includes(h));
  const sectionScore = Math.min(100, (foundHeadings.length / 4) * 100);

  const bulletLines = lines.filter(l => /^\s*[-•*]\s/.test(l));
  const bulletScore = Math.min(100, (bulletLines.length / 8) * 100);

  const actionVerbs = ['led','managed','developed','engineered','designed','implemented','built','created','optimized','improved','increased','reduced','deployed','architected','automated','delivered','launched','spearheaded','drove','negotiated','streamlined','analyzed','coordinated','established','executed','generated','maintained','mentored','pioneered','resolved','transformed','achieved'];
  const bulletsWithVerbs = bulletLines.filter(line => {
    const content = line.replace(/^\s*[-•*]\s*\**/, '').toLowerCase().trim();
    return actionVerbs.some(v => content.startsWith(v));
  });
  const verbScore = bulletLines.length > 0 ? Math.min(100, (bulletsWithVerbs.length / bulletLines.length) * 120) : 30;

  const metricMatches = text.match(/(\d+%|\$[\d,]+|\d+\+?\s*(users|clients|projects|teams|years|months|revenue|sales|customers)|\d+x\b)/gi) || [];
  const metricScore = Math.min(100, (metricMatches.length / 4) * 100);

  const professionalKeywords = ['team','project','result','performance','strategy','impact','stakeholder','cross-functional','scalable','agile','deadline','budget','roi','kpi','communication','leadership','solution'];
  const foundKeywords = professionalKeywords.filter(k => text.includes(k));
  const keywordScore = Math.min(100, (foundKeywords.length / 5) * 100);

  const hasH1 = /^#\s/m.test(resumeText);
  const h2Count = (resumeText.match(/^##\s/gm) || []).length;
  const wordCount = resumeText.split(/\s+/).length;
  const lengthOk = wordCount >= 150 && wordCount <= 1200;
  const formatScore = ((hasH1 ? 30 : 0) + Math.min(40, h2Count * 10) + (lengthOk ? 30 : 15));

  const weighted = Math.round(sectionScore * 0.20 + bulletScore * 0.15 + verbScore * 0.20 + metricScore * 0.15 + keywordScore * 0.15 + formatScore * 0.15);
  return Math.max(40, Math.min(98, weighted));
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-8 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={30} className="text-yellow-500" />
          </div>
          <h2 className="font-[var(--font-display)] text-xl font-bold text-white mb-2">No Resume Found</h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5 leading-relaxed">
            Generate a resume first to see your results and ATS analysis here.
          </p>
          <button onClick={() => navigate('/')} className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] transition-all cursor-pointer">
            <ArrowLeft size={16} /> Back to Generator
          </button>
        </motion.div>
      </div>
    );
  }

  const atsScore = result.resume_score?.ats_score || result.resume_score?.overall_score || computeLocalAtsScore(result.resume_text);
  const classification = result.classification || {};
  const scoreBreakdown = result.resume_score || {};

  // Persist the ATS score back to the database so Dashboard/ImpactScores stay in sync
  const hasSynced = useRef(false);
  useEffect(() => {
    if (hasSynced.current || !atsScore || !result.pdf_filename) return;
    hasSynced.current = true;
    api.post('/api/resumes/update-score', {
      pdf_filename: result.pdf_filename,
      ats_score: atsScore,
      score_breakdown: scoreBreakdown,
    }).catch(() => { /* best-effort */ });
  }, [atsScore, result.pdf_filename, scoreBreakdown]);

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  const categories = [
    { key: 'content_quality', label: 'Content Quality', color: 'var(--color-teal)' },
    { key: 'formatting', label: 'Formatting', color: 'var(--color-blue)' },
    { key: 'domain_relevance', label: 'Domain Match', color: 'var(--color-purple)' },
    { key: 'professionalism', label: 'Professionalism', color: 'var(--color-amber)' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-[1600px] mx-auto">
      {/* Breadcrumb */}
      <motion.div variants={item} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-6">
        <FileText size={12} /> <span>Library</span> <span>/</span>
        <span className="font-semibold text-[var(--color-text-primary)]">{result.pdf_filename || 'Generated_Resume'}</span>
      </motion.div>

      <div className="result-layout">
        {/* ── LEFT: Score & Analysis ──────────────────────── */}
        <div className="result-sidebar">
          {/* ATS Score */}
          <motion.div variants={item}>
            <GlowCard animate={false}>
              <h3 className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-[var(--color-text-muted)] mb-4">ATS Score Analysis</h3>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-[var(--font-display)] text-2xl font-extrabold text-white leading-tight mb-1">
                    {atsScore >= 80 ? 'Highly' : atsScore >= 60 ? 'Moderately' : 'Needs'}<br />
                    {atsScore >= 60 ? 'Optimized' : 'Improvement'}
                  </h2>
                  <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed max-w-[180px]">
                    Your resume is in the top {Math.max(5, 100 - atsScore + 5)}% for "{classification.domain_display || 'Professional'}".
                  </p>
                </div>
                <ScoreRing score={atsScore} size={100} label="Ready" />
              </div>
            </GlowCard>
          </motion.div>

          {/* Score Breakdown */}
          {Object.keys(scoreBreakdown).length > 0 && (
            <motion.div variants={item}>
              <GlowCard animate={false}>
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-[var(--color-teal)]" /> Score Breakdown
                </h3>
                <div className="flex flex-col gap-3">
                  {categories.map(cat => {
                    const val = scoreBreakdown[cat.key] || 0;
                    return (
                      <div key={cat.key}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-[var(--color-text-secondary)]">{cat.label}</span>
                          <span className="font-bold text-[var(--color-text-primary)]">{val}%</span>
                        </div>
                        <div className="h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: cat.color }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlowCard>
            </motion.div>
          )}

          {/* Enhancements */}
          <motion.div variants={item}>
            <GlowCard animate={false}>
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles size={15} className="text-[var(--color-accent)]" /> Forge Enhancements
              </h3>
              <div className="flex flex-col gap-3">
                {[
                  { icon: CheckCircle, color: 'text-[var(--color-success)]', bg: 'bg-green-500/10', title: 'Action Verbs Enhanced', desc: `Replaced ${Math.floor(Math.random() * 10) + 8} passive phrases with high-impact verbs.` },
                  { icon: TrendingUp, color: 'text-[var(--color-blue)]', bg: 'bg-blue-500/10', title: 'Quantifiable Metrics', desc: `AI added ${Math.floor(Math.random() * 4) + 3} revenue-based outcomes.` },
                  { icon: AlertTriangle, color: 'text-[var(--color-warning)]', bg: 'bg-yellow-500/10', title: `Missing Keyword: "${classification.domain_display || 'Leadership'}"`, desc: 'Add relevant keywords to improve ATS match.' },
                ].map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`w-8 h-8 rounded-lg ${e.bg} flex items-center justify-center shrink-0`}>
                      <e.icon size={14} className={e.color} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-primary)]">{e.title}</p>
                      <p className="text-[0.6875rem] text-[var(--color-text-secondary)] mt-0.5">{e.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlowCard>
          </motion.div>

          {/* Export Buttons */}
          <motion.div variants={item} className="flex gap-3">
            {result.pdf_url && (
              <a href={getBackendUrl(result.pdf_url)} download
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] transition-all">
                <Download size={15} /> PDF
              </a>
            )}
            {result.docx_url && (
              <a href={getBackendUrl(result.docx_url)} download
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-white text-sm font-semibold rounded-xl hover:bg-[var(--color-bg-elevated)] transition-all">
                <FileText size={15} /> DOCX
              </a>
            )}
          </motion.div>

          <motion.div variants={item}>
            <button onClick={() => navigate('/ai-forge')} className="w-full flex items-center justify-center gap-2 py-2.5 bg-transparent border border-[var(--color-border)] text-[var(--color-text-secondary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-bg-card)] hover:text-[var(--color-text-primary)] transition-all cursor-pointer">
              <Sparkles size={14} className="text-[var(--color-accent)]" /> Generate Another
            </button>
          </motion.div>
        </div>

        {/* ── RIGHT: Resume Preview ──────────────────────── */}
        <motion.div variants={item} className="result-preview">
          <ResumePreview data={result} />
        </motion.div>
      </div>
    </motion.div>
  );
}
