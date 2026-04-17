import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  CheckCircle2,
  LoaderCircle,
  Sparkles,
  GraduationCap,
  Code,
} from 'lucide-react';

const INITIAL = {
  name: '',
  email: '',
  phone: '',
  role: '',
  education: '',
  skills: '',
  projects: '',
  experience: '',
  type: 'experienced',
};

const STEPS = [
  { id: 1, label: 'Personal Info' },
  { id: 2, label: 'Professional' },
  { id: 3, label: 'Review' },
];

export default function Form({ onSubmit, loading }) {
  const [form, setForm] = useState(INITIAL);
  const [step, setStep] = useState(1);

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  const nextStep = () => { if (step < 3) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const slideVariants = {
    enter: { x: 30, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { x: -30, opacity: 0, transition: { duration: 0.2 } },
  };

  const renderStepOne = () => (
    <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit">
      <div className="card" style={{ padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'rgba(232, 80, 58, 0.1)', border: '1px solid rgba(232, 80, 58, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <User size={22} style={{ color: 'var(--color-accent)' }} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 2 }}>
              Personal Information
            </h2>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Enter your basic contact details
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="responsive-grid-2">
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="e.g. Jane Doe"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Target Role</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Senior Product Designer"
              value={form.role}
              onChange={(e) => update('role', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="e.g. jane@company.com"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="text"
              className="form-input"
              placeholder="+1 (555) 000-1234"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
            />
          </div>
        </div>

        {/* Next Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="button" onClick={nextStep} disabled={!form.name} className="btn-primary">
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStepTwo = () => (
    <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit">
      <div className="mobile-stack-order" style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>

        {/* Left sidebar panel */}
        <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}>
          {/* Experience Level */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.875rem' }}>
              Experience Level
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label className={`radio-card ${form.type === 'fresher' ? 'selected' : ''}`}>
                <input type="radio" name="type" checked={form.type === 'fresher'} onChange={() => update('type', 'fresher')} style={{ display: 'none' }} />
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                <span className="radio-label">Entry Level (0–2 Yrs)</span>
              </label>
              <label className={`radio-card ${form.type === 'experienced' ? 'selected' : ''}`}>
                <input type="radio" name="type" checked={form.type === 'experienced'} onChange={() => update('type', 'experienced')} style={{ display: 'none' }} />
                <div className="radio-dot"><div className="radio-dot-inner" /></div>
                <span className="radio-label">Experienced (3+ Yrs)</span>
              </label>
            </div>
          </div>

          {/* AI Tip */}
          <div className="card" style={{ padding: '1.25rem', borderColor: 'rgba(232, 80, 58, 0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>AI Optimization</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              Our engine analyzes your skills and experience to generate ATS-optimized content tailored to your target role.
            </p>
          </div>
        </div>

        {/* Main form area */}
        <div className="card" style={{ flex: 1, minWidth: 0, padding: '2rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Skills */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Code size={14} style={{ color: 'var(--color-teal)' }} />
                Skills <span className="required">*</span>
              </label>
              <textarea
                className="form-textarea"
                placeholder="React, Node.js, Python, Systems Design, Machine Learning..."
                value={form.skills}
                onChange={(e) => update('skills', e.target.value)}
                style={{ minHeight: 100 }}
              />
            </div>

            {/* Experience */}
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Briefcase size={14} style={{ color: 'var(--color-accent)' }} />
                Work Experience
              </label>
              <textarea
                className="form-textarea"
                placeholder="Describe your roles, responsibilities, and key achievements..."
                value={form.experience}
                onChange={(e) => update('experience', e.target.value)}
                style={{ minHeight: 130 }}
              />
            </div>

            {/* Education + Projects side by side */}
            <div className="responsive-grid-2">
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <GraduationCap size={14} style={{ color: 'var(--color-purple)' }} />
                  Education <span className="required">*</span>
                </label>
                <textarea
                  className="form-textarea"
                  placeholder="B.S. Computer Science, MIT"
                  value={form.education}
                  onChange={(e) => update('education', e.target.value)}
                  style={{ minHeight: 100 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Projects</label>
                <textarea
                  className="form-textarea"
                  placeholder="Built an AI resume generator..."
                  value={form.projects}
                  onChange={(e) => update('projects', e.target.value)}
                  style={{ minHeight: 100 }}
                />
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
            <button type="button" onClick={prevStep} className="btn-secondary">
              <ArrowLeft size={16} /> Back
            </button>
            <button type="button" onClick={nextStep} disabled={!form.skills || !form.education} className="btn-primary">
              Review <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderStepThree = () => (
    <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit">
      <div className="card" style={{ padding: '2rem', maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1rem',
            }}
          >
            <CheckCircle2 size={28} style={{ color: 'var(--color-success)' }} />
          </motion.div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.375rem' }}>
            Ready to Generate
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Review your information before generating your resume
          </p>
        </div>

        {/* Review Grid */}
        <div className="review-grid" style={{ marginBottom: '2rem' }}>
          <div className="review-item">
            <div className="review-item-label">
              <div className="dot" style={{ background: 'var(--color-accent)' }} /> Target Role
            </div>
            <div className="review-item-value">{form.role || 'Not specified'}</div>
          </div>
          <div className="review-item">
            <div className="review-item-label">
              <div className="dot" style={{ background: 'var(--color-teal)' }} /> Profile Level
            </div>
            <div className="review-item-value" style={{ textTransform: 'capitalize' }}>{form.type}</div>
          </div>
          <div className="review-item full-width">
            <div className="review-item-label">Skills</div>
            <div className="review-item-value">{form.skills}</div>
          </div>
          <div className="review-item full-width">
            <div className="review-item-label">Experience</div>
            <div className="review-item-value">{form.experience || 'Not specified'}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem', borderTop: '1px solid var(--color-border)' }}>
          <button type="button" onClick={prevStep} className="btn-secondary">
            <ArrowLeft size={16} /> Edit
          </button>
          <button type="submit" disabled={loading} className="btn-primary btn-lg">
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <LoaderCircle className="animate-spin" size={20} />
                Generating...
              </span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} />
                Generate Resume
              </span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      {/* Step Progress */}
      <div className="progress-steps">
        {STEPS.map((s, i) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          return (
            <React.Fragment key={s.id}>
              {i > 0 && (
                <div className={`step-connector ${isCompleted ? 'completed' : ''}`} />
              )}
              <div className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                <div className="step-circle">
                  {isCompleted ? <CheckCircle2 size={20} /> : s.id}
                </div>
                <div className="step-label">{s.label}</div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {step === 1 && renderStepOne()}
        {step === 2 && renderStepTwo()}
        {step === 3 && renderStepThree()}
      </AnimatePresence>
    </form>
  );
}

// Need React import for React.Fragment usage in older JSX transforms
import React from 'react';
