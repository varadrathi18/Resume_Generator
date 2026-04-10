import { useLocation, useNavigate } from 'react-router-dom'
import ResumePreview from '../components/ResumePreview'

export default function Result() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="card-elevated p-10 text-center max-w-md animate-fade-in-up">
          <div className="text-5xl mb-5">🤷</div>
          <h2 className="text-xl font-bold text-text mb-2">No Resume Found</h2>
          <p className="text-text-muted text-sm mb-6 leading-relaxed">
            It looks like you haven't generated a resume yet. Head back to create one.
          </p>
          <button onClick={() => navigate('/')} className="btn-primary w-full">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Generator
          </button>
        </div>
      </div>
    )
  }

  const classification = result.classification || {}
  const qualityFeedback = result.quality_scores?.feedback || ''

  return (
    <div className="flex-1 relative z-10">
      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Success Banner */}
        <div className="card p-5 mb-6 animate-fade-in-up" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                 style={{ background: '#ecfdf5' }}>
              <svg className="w-6 h-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-text mb-0.5">Resume Generated Successfully!</h1>
              <p className="text-sm text-text-muted">
                Domain classified as{' '}
                <span className="badge badge-primary ml-1">
                  {classification.domain_display || result.domain}
                </span>
                {classification.confidence && (
                  <span className="text-xs text-text-muted ml-2">
                    ({Math.round(classification.confidence * 100)}% confidence)
                  </span>
                )}
              </p>
              {qualityFeedback && (
                <p className="text-xs text-text-muted mt-1.5 italic">📊 {qualityFeedback}</p>
              )}
            </div>
            <button onClick={() => navigate('/')} className="btn-primary text-sm flex-shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Another
            </button>
          </div>
        </div>

        {/* Email Status */}
        {result.email_status && (
          <div className={`card p-3.5 mb-6 flex items-center gap-3 text-sm animate-fade-in ${
            result.email_status.success
              ? 'border-l-4 border-l-success'
              : 'border-l-4 border-l-warning'
          }`}>
            <span className="text-lg">{result.email_status.success ? '📧' : '⚠️'}</span>
            <span className="text-text-secondary">{result.email_status.message}</span>
          </div>
        )}

        {/* Resume Preview */}
        <ResumePreview data={result} />
      </main>
    </div>
  )
}
