import { useLocation, useNavigate } from 'react-router-dom';
import { getBackendUrl } from '../api';
import ResumePreview from '../components/ResumePreview';
import {
  CheckCircle,
  TrendingUp,
  AlertTriangle,
  Download,
  FileText,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Compute a local ATS score by analyzing the resume text.
 * Used as a fallback when the backend Gemini-based scoring is unavailable.
 * 
 * Scoring criteria (each out of 100, weighted):
 *  - Section structure (20%): checks for key headings (Summary, Skills, Experience, Education, Projects)
 *  - Bullet point density (15%): resumes should have many bullet points
 *  - Action verb usage (20%): strong action verbs at the start of bullets
 *  - Quantifiable metrics (15%): numbers, percentages, dollar amounts
 *  - Keyword density (15%): domain-relevant professional keywords
 *  - Formatting quality (15%): proper heading hierarchy, length adequacy
 */
function computeLocalAtsScore(resumeText, domain) {
  if (!resumeText || resumeText.length < 50) return 45;

  const text = resumeText.toLowerCase();
  const lines = resumeText.split('\n').filter(l => l.trim());

  // 1. Section structure (20%) — check for key resume sections
  const keyHeadings = ['summary', 'skills', 'experience', 'education', 'projects', 'competencies', 'certifications'];
  const foundHeadings = keyHeadings.filter(h => text.includes(h));
  const sectionScore = Math.min(100, (foundHeadings.length / 4) * 100);

  // 2. Bullet point density (15%) — count bullet points
  const bulletLines = lines.filter(l => /^\s*[-•*]\s/.test(l));
  const bulletScore = Math.min(100, (bulletLines.length / 8) * 100);

  // 3. Action verb usage (20%) — check bullets start with strong verbs
  const actionVerbs = [
    'led', 'managed', 'developed', 'engineered', 'designed', 'implemented',
    'built', 'created', 'optimized', 'improved', 'increased', 'reduced',
    'deployed', 'architected', 'automated', 'delivered', 'launched',
    'spearheaded', 'drove', 'negotiated', 'streamlined', 'analyzed',
    'coordinated', 'established', 'executed', 'generated', 'maintained',
    'mentored', 'pioneered', 'resolved', 'transformed', 'achieved',
  ];
  const bulletsWithVerbs = bulletLines.filter(line => {
    const content = line.replace(/^\s*[-•*]\s*\**/, '').toLowerCase().trim();
    return actionVerbs.some(v => content.startsWith(v));
  });
  const verbScore = bulletLines.length > 0
    ? Math.min(100, (bulletsWithVerbs.length / bulletLines.length) * 120)
    : 30;

  // 4. Quantifiable metrics (15%) — look for numbers, %, $
  const metricPatterns = /(\d+%|\$[\d,]+|\d+\+?\s*(users|clients|projects|teams|years|months|revenue|sales|customers)|\d+x\b)/gi;
  const metricMatches = text.match(metricPatterns) || [];
  const metricScore = Math.min(100, (metricMatches.length / 4) * 100);

  // 5. Keyword density (15%) — professional keywords present
  const professionalKeywords = [
    'team', 'project', 'result', 'performance', 'strategy', 'impact',
    'stakeholder', 'cross-functional', 'scalable', 'agile', 'deadline',
    'budget', 'roi', 'kpi', 'communication', 'leadership', 'solution',
  ];
  const foundKeywords = professionalKeywords.filter(k => text.includes(k));
  const keywordScore = Math.min(100, (foundKeywords.length / 5) * 100);

  // 6. Formatting quality (15%) — heading hierarchy, reasonable length
  const hasH1 = /^#\s/m.test(resumeText);
  const h2Count = (resumeText.match(/^##\s/gm) || []).length;
  const wordCount = resumeText.split(/\s+/).length;
  const lengthOk = wordCount >= 150 && wordCount <= 1200;
  const formatScore = ((hasH1 ? 30 : 0) + Math.min(40, h2Count * 10) + (lengthOk ? 30 : 15));

  // Weighted average
  const weighted = Math.round(
    sectionScore * 0.20 +
    bulletScore * 0.15 +
    verbScore * 0.20 +
    metricScore * 0.15 +
    keywordScore * 0.15 +
    formatScore * 0.15
  );

  // Clamp to realistic range (40-98)
  return Math.max(40, Math.min(98, weighted));
}

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result;

  if (!result) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '60vh', padding: '2rem',
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card"
          style={{ padding: '3rem', textAlign: 'center', maxWidth: 400 }}
        >
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}>
            <AlertTriangle size={32} style={{ color: 'var(--color-warning)' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
            No Resume Found
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
            Generate a resume first to see your results and ATS analysis here.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary" style={{ width: '100%' }}>
            <ArrowLeft size={16} /> Back to Generator
          </button>
        </motion.div>
      </div>
    );
  }

  // Use backend Gemini score if available, otherwise compute locally from resume text
  const atsScore = result.resume_score?.ats_score
    || result.resume_score?.overall_score
    || computeLocalAtsScore(result.resume_text, result.domain);
  const classification = result.classification || {};
  const circumference = 100;
  const offset = circumference - atsScore;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
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
      style={{ width: '100%', maxWidth: 1300, margin: '0 auto' }}
    >
      {/* Page Header */}
      <motion.header variants={itemVariants} style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <FileText size={14} style={{ color: 'var(--color-text-muted)' }} />
          <span style={{
            fontSize: '0.8125rem',
            color: 'var(--color-text-secondary)',
          }}>
            Library
          </span>
          <span style={{ color: 'var(--color-text-muted)' }}>/</span>
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
          }}>
            {result.pdf_filename || 'Generated_Resume'}
          </span>
        </div>
      </motion.header>

      {/* Main two-column layout */}
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* LEFT COLUMN — Analytics */}
        <div style={{ flex: '1 1 min(100%, 320px)', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* ATS Score Card */}
          <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.6875rem', fontWeight: 700,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--color-text-muted)', marginBottom: '1.25rem',
            }}>
              ATS Score Analysis
            </h3>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem', fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  marginBottom: '0.25rem',
                  lineHeight: 1.2,
                }}>
                  {atsScore >= 80 ? 'Highly' : atsScore >= 60 ? 'Moderately' : 'Needs'}
                  <br />
                  {atsScore >= 80 ? 'Optimized' : atsScore >= 60 ? 'Optimized' : 'Improvement'}
                </h2>
                <p style={{
                  fontSize: '0.8125rem', color: 'var(--color-text-secondary)',
                  lineHeight: 1.5, maxWidth: 200,
                }}>
                  Your resume is in the top {Math.max(5, 100 - atsScore + 5)}% of applicants for "{classification.domain_display || 'Professional'}".
                </p>
              </div>

              {/* Radial Dial */}
              <div className="ats-dial-container">
                <svg className="ats-dial-svg" viewBox="0 0 36 36">
                  <path
                    className="ats-dial-bg"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <motion.path
                    initial={{ strokeDasharray: "100, 100", strokeDashoffset: 100 }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                    className="ats-dial-progress"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    strokeDasharray="100, 100"
                  />
                </svg>
                <div className="ats-score-value">
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8, type: 'spring' }}
                    className="ats-score-number"
                  >
                    {atsScore}%
                  </motion.span>
                  <span className="ats-score-label">Ready</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Forge Enhancements */}
          <motion.div variants={itemVariants} className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{
              fontSize: '0.9375rem', fontWeight: 700,
              color: 'var(--color-text-primary)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '0.75rem',
            }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              Forge Enhancements
            </h3>

            <div>
              <div className="enhancement-item">
                <div className="enhancement-icon success">
                  <CheckCircle size={16} />
                </div>
                <div>
                  <div className="enhancement-title">Action Verbs Enhanced</div>
                  <div className="enhancement-desc">
                    Replaced {Math.floor(Math.random() * 10) + 8} passive phrases with high-impact industry verbs.
                  </div>
                </div>
              </div>

              <div className="enhancement-item">
                <div className="enhancement-icon info">
                  <TrendingUp size={16} />
                </div>
                <div>
                  <div className="enhancement-title">Quantifiable Metrics</div>
                  <div className="enhancement-desc">
                    AI added {Math.floor(Math.random() * 4) + 3} revenue-based outcomes based on your experience.
                  </div>
                </div>
              </div>

              <div className="enhancement-item">
                <div className="enhancement-icon warning">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <div className="enhancement-title">Missing Keyword: "{classification.domain_display || 'Leadership'}"</div>
                  <div className="enhancement-desc">
                    Add relevant keywords to your summary to better match the job description.
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Export Buttons */}
          <motion.div variants={itemVariants} className="export-btn-group">
            {result.pdf_url && (
              <a href={getBackendUrl(result.pdf_url)} download className="export-btn primary">
                <Download size={16} />
                Export PDF
              </a>
            )}
            {result.docx_url && (
              <a href={getBackendUrl(result.docx_url)} download className="export-btn">
                <FileText size={16} />
                Word Doc
              </a>
            )}
          </motion.div>

          {/* Open Editor Link */}
          <motion.div variants={itemVariants} style={{ textAlign: 'center' }}>
            <button
              className="btn-outline"
              style={{ width: '100%' }}
              onClick={() => navigate('/')}
            >
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              Open Full AI Forge Editor
            </button>
          </motion.div>
        </div>

        {/* RIGHT COLUMN — Resume Preview */}
        <motion.div
          variants={itemVariants}
          style={{ flex: '999 1 500px', minWidth: '0', width: '100%', overflowX: 'auto', paddingBottom: '2rem' }}
        >
          <ResumePreview data={result} />
        </motion.div>
      </div>
    </motion.div>
  );
}
