import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import Form from '../components/Form'
import Loader from '../components/Loader'

export default function Home() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const res = await axios.post('http://127.0.0.1:8080/api/generate', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      navigate('/result', { state: { result: res.data } })
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Something went wrong'
      setError(msg)
      setLoading(false)
    }
  }

  const FEATURES = [
    {
      icon: '🧠',
      title: 'Smart Domain Classification',
      desc: 'ML-powered DistilBERT + TF-IDF ensemble identifies your professional domain automatically.',
      color: '#eef2ff',
    },
    {
      icon: '✨',
      title: 'ATS-Optimized Output',
      desc: 'Every bullet point is tuned with domain-specific keywords to pass automated scanners.',
      color: '#ecfdf5',
    },
    {
      icon: '⚡',
      title: 'Instant PDF & DOCX',
      desc: 'Download professionally formatted documents ready to submit to any job portal.',
      color: '#fef3c7',
    },
  ]

  return (
    <div className="flex-1 relative z-10">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-6">
        <div className="flex flex-col lg:flex-row items-start gap-12 lg:gap-16">

          {/* Left: Hero Content */}
          <div className="lg:w-5/12 flex flex-col pt-4 animate-fade-in-up">
            <span className="badge badge-primary mb-5 self-start">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" style={{ animation: 'pulse-soft 2s infinite' }} />
              Powered by Gemini AI + ML Classification
            </span>

            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.15] mb-5">
              Build Your{' '}
              <span className="gradient-text">Perfect Resume</span>{' '}
              in Seconds
            </h1>

            <p className="text-text-secondary text-base leading-relaxed mb-10 max-w-md">
              Stop guessing what employers want. Our AI analyzes your domain,
              optimizes for ATS, and delivers a professional resume — instantly.
            </p>

            {/* Feature Cards */}
            <div className="space-y-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="feature-card flex items-start gap-3.5" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className="feature-icon flex-shrink-0" style={{ background: f.color }}>
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-text mb-0.5">{f.title}</h3>
                    <p className="text-xs text-text-muted leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form Card */}
          <div className="lg:w-7/12 w-full animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
            <div className="card-elevated gradient-border p-6 sm:p-8">
              {/* Card Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-text flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: '#eef2ff' }}>
                    📝
                  </span>
                  Enter Your Details
                </h2>
                <p className="text-sm text-text-muted mt-1 ml-[2.625rem]">
                  Fill in your information and let AI do the rest
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="mb-6 p-3.5 rounded-lg flex items-start gap-3 text-sm animate-scale-in"
                     style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <span className="font-semibold">Generation failed: </span>
                    {error}
                  </div>
                </div>
              )}

              {/* Form or Loader */}
              {loading ? <Loader /> : <Form onSubmit={handleSubmit} loading={loading} />}
            </div>

            {/* Privacy Note */}
            <div className="text-center mt-4 flex items-center justify-center gap-1.5 text-xs text-text-muted font-medium">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Your data is processed in real-time and never stored
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
