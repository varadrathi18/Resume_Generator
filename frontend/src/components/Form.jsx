import { useState } from 'react'

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  role: '',
  education: '',
  skills: '',
  projects: '',
  experience: '',
  type: 'fresher',
}

const STEPS = [
  {
    title: 'Personal Info',
    description: 'Basic contact information',
    fields: [
      { key: 'name', label: 'Full Name', type: 'text', placeholder: 'e.g. Jane Doe', icon: '👤', hint: 'Your formal name as it appears on your resume.', required: true },
      { key: 'email', label: 'Email Address', type: 'text', placeholder: 'e.g. jane@example.com', icon: '✉️', hint: 'Optional — we can email your resume here.', required: false },
      { key: 'phone', label: 'Phone Number', type: 'text', placeholder: 'e.g. +91 9876543210', icon: '📱', hint: 'Optional — included in the resume header.', required: false },
      { key: 'role', label: 'Target Role', type: 'text', placeholder: 'e.g. Software Engineer, Data Analyst', icon: '🎯', hint: 'What position are you applying for?', required: false },
    ],
  },
  {
    title: 'Professional Details',
    description: 'Education, skills & experience',
    fields: [
      { key: 'education', label: 'Education', type: 'textarea', rows: 3, placeholder: 'e.g. B.Tech in Computer Science, XYZ University, 2024\nGPA: 3.8/4.0', icon: '🎓', hint: 'Include degree, institution, year, GPA.', required: true },
      { key: 'skills', label: 'Skills', type: 'textarea', rows: 3, placeholder: 'e.g. Python, React, Machine Learning, SQL, Docker, Leadership', icon: '⚡', hint: 'Both technical and soft skills.', required: true },
      { key: 'projects', label: 'Projects', type: 'textarea', rows: 3, placeholder: 'e.g. AI Resume Generator — Built a full-stack app using React, Flask, and Gemini API...', icon: '🚀', hint: 'Describe your role, tools, and impact.', required: false },
      { key: 'experience', label: 'Experience', type: 'textarea', rows: 4, placeholder: 'e.g. Software Intern at ABC Corp (Jun 2023 – Aug 2023)\n- Built REST APIs serving 10K+ requests/day\n- Reduced response time by 40%', icon: '💼', hint: 'Use bullet points with quantifiable results.', required: false },
    ],
  },
  {
    title: 'Review & Generate',
    description: 'Confirm your details',
    fields: [],
  },
]

export default function Form({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL)
  const [step, setStep] = useState(0)

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  const canProceed = () => {
    if (step === 0) return form.name.trim().length > 0
    if (step === 1) return form.education.trim().length > 0 && form.skills.trim().length > 0
    return true
  }

  const nextStep = () => {
    if (step < STEPS.length - 1 && canProceed()) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 0) setStep(step - 1)
  }

  const filledFields = Object.entries(form).filter(
    ([k, v]) => v.trim() && k !== 'type'
  )

  const renderReviewItem = (label, value) => {
    if (!value || !value.trim()) return null
    return (
      <div key={label} className="mb-3">
        <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">{label}</div>
        <div className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">{value}</div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((s, i) => (
          <div key={i} className="step-item">
            <div className="flex flex-col items-center">
              <div className={`step-circle ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
                {i < step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span className={`step-label ${i < step ? 'completed' : i === step ? 'active' : ''}`}>
                {s.title}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`step-line mx-2 mb-4 ${i < step ? 'completed' : ''}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[320px]">
        {/* Step 0 & 1: Form Fields */}
        {step < 2 && (
          <div className="space-y-5 animate-fade-in" key={step}>
            {STEPS[step].fields.map(({ key, label, type, placeholder, icon, hint, required, rows }) => (
              <div key={key} className="form-group">
                <label htmlFor={`field-${key}`} className="form-label">
                  <span>{icon}</span>
                  {label}
                  {required && <span className="required">*</span>}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    id={`field-${key}`}
                    value={form[key]}
                    onChange={e => update(key, e.target.value)}
                    rows={rows || 3}
                    placeholder={placeholder}
                    className="form-textarea"
                  />
                ) : (
                  <input
                    id={`field-${key}`}
                    type="text"
                    value={form[key]}
                    onChange={e => update(key, e.target.value)}
                    placeholder={placeholder}
                    className="form-input"
                  />
                )}
                {hint && <p className="form-hint">💡 {hint}</p>}
              </div>
            ))}

            {/* Experience Level (on step 1) */}
            {step === 1 && (
              <div className="form-group pt-1">
                <label className="form-label">Professional Level</label>
                <div className="flex gap-3">
                  {[
                    { id: 'fresher', label: 'Fresher', desc: '0–2 years', icon: '🌱' },
                    { id: 'experienced', label: 'Experienced', desc: '3+ years', icon: '⭐' },
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => update('type', t.id)}
                      className={`type-option ${form.type === t.id ? 'selected' : ''}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{t.icon}</span>
                        <div>
                          <div className="font-semibold text-sm">{t.label}</div>
                          <div className="text-xs text-text-muted">{t.desc}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="animate-fade-in">
            <div className="bg-surface-50 rounded-xl p-5 border border-surface-200 space-y-1">
              <h3 className="text-sm font-bold text-text mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Review Your Information
              </h3>
              {renderReviewItem('Name', form.name)}
              {renderReviewItem('Email', form.email)}
              {renderReviewItem('Phone', form.phone)}
              {renderReviewItem('Target Role', form.role)}
              {renderReviewItem('Education', form.education)}
              {renderReviewItem('Skills', form.skills)}
              {renderReviewItem('Projects', form.projects)}
              {renderReviewItem('Experience', form.experience)}
              <div className="pt-2 border-t border-surface-200 mt-3">
                <span className="badge badge-primary">
                  {form.type === 'fresher' ? '🌱 Fresher' : '⭐ Experienced'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 mt-6 border-t border-surface-200">
        {step > 0 ? (
          <button type="button" onClick={prevStep} className="btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="btn-primary"
          >
            Next
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ padding: '0.875rem 2rem' }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </span>
            ) : (
              <>
                ✨ Generate Resume
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </form>
  )
}
