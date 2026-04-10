import { useState, useEffect } from 'react'

const LOADING_STEPS = [
  { msg: 'Analyzing your profile...', icon: '🔍', detail: 'Reading your education, skills, and experience' },
  { msg: 'Classifying domain with ML...', icon: '🧠', detail: 'DistilBERT + TF-IDF ensemble classification' },
  { msg: 'Generating ATS-optimized content...', icon: '✨', detail: 'Gemini AI is crafting your resume' },
  { msg: 'Formatting final documents...', icon: '📄', detail: 'Creating PDF and DOCX files' },
]

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(prev => Math.min(prev + 1, LOADING_STEPS.length - 1))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const progress = ((stepIndex + 1) / LOADING_STEPS.length) * 100

  return (
    <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
      {/* Dual ring spinner */}
      <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
        <div className="absolute inset-0 loader-ring" />
        <div className="absolute loader-ring-inner" />
        <span className="text-2xl relative z-10" style={{ animation: 'pulse-soft 2s infinite' }}>
          {LOADING_STEPS[stepIndex].icon}
        </span>
      </div>

      {/* Status text */}
      <h3 className="text-lg font-bold text-text mb-1">
        {LOADING_STEPS[stepIndex].msg}
      </h3>
      <p className="text-sm text-text-muted mb-8">
        {LOADING_STEPS[stepIndex].detail}
      </p>

      {/* Progress bar */}
      <div className="w-72 progress-bar">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 mt-5">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i <= stepIndex ? '#6366f1' : '#e2e8f0',
              transform: i === stepIndex ? 'scale(1.4)' : 'scale(1)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
