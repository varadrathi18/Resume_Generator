const DOMAIN_COLORS = {
  TECH: { bg: '#eef2ff', text: '#4f46e5', border: '#c7d2fe' },
  BUSINESS: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
  CREATIVE: { bg: '#fdf2f8', text: '#db2777', border: '#fbcfe8' },
  HEALTH: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
  LEGAL_ADMIN: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
  EDUCATION: { bg: '#f5f3ff', text: '#7c3aed', border: '#ddd6fe' },
  OTHER: { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' },
}

const DOMAIN_ICONS = {
  TECH: '💻', BUSINESS: '📊', CREATIVE: '🎨',
  HEALTH: '🏥', LEGAL_ADMIN: '⚖️', EDUCATION: '🎓', OTHER: '🌐',
}

export default function ResumePreview({ data }) {
  const { domain, resume_html, pdf_url, docx_url, classification, quality_scores, resume_score } = data
  const colors = DOMAIN_COLORS[domain] || DOMAIN_COLORS.OTHER
  const icon = DOMAIN_ICONS[domain] || '🌐'

  const confidence = classification?.confidence
  const confidencePct = confidence ? Math.round(confidence * 100) : null
  const modelUsed = classification?.model_used || 'unknown'
  const qualityGrade = quality_scores?.grade || '—'

  const handlePrint = () => window.print()

  const modelLabel = modelUsed === 'ensemble' ? 'Ensemble' :
    modelUsed.includes('distilbert') ? 'DistilBERT' :
    modelUsed.includes('tfidf') ? 'TF-IDF' : '—'

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 card p-4 no-print">
        {/* Domain Badge */}
        <div
          className="inline-flex items-center gap-2.5 px-4 py-2 rounded-lg font-semibold text-sm"
          style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
        >
          <span className="text-lg">{icon}</span>
          <span>{classification?.domain_display || domain}</span>
          {confidencePct !== null && (
            <span className="text-xs opacity-70 font-mono ml-1">{confidencePct}%</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button onClick={handlePrint} className="btn-secondary text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          {pdf_url && (
            <a href={pdf_url} download className="btn-download pdf">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              PDF
            </a>
          )}
          {docx_url && (
            <a href={docx_url} download className="btn-download docx">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              DOCX
            </a>
          )}
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 no-print">
        <div className="stat-card">
          <div className="stat-value text-primary">
            {confidencePct !== null ? `${confidencePct}%` : '—'}
          </div>
          <div className="stat-label">ML Confidence</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-accent">{modelLabel}</div>
          <div className="stat-label">Model</div>
        </div>
        <div className="stat-card">
          <div className={`stat-value ${
            qualityGrade === 'A' ? 'text-success' :
            qualityGrade === 'B' ? 'text-primary' :
            qualityGrade === 'C' ? 'text-warning' : 'text-danger'
          }`}>
            {qualityGrade}
          </div>
          <div className="stat-label">Input Quality</div>
        </div>
        <div className="stat-card">
          <div className="stat-value text-success">
            {resume_score?.ats_score || resume_score?.overall_score || '—'}
          </div>
          <div className="stat-label">ATS Score</div>
        </div>
      </div>

      {/* Resume Document */}
      <div className="resume-container">
        <div className="gradient-bar" />
        <div
          id="printable-resume"
          className="resume-html-container"
          dangerouslySetInnerHTML={{ __html: resume_html }}
        />
      </div>
    </div>
  )
}
