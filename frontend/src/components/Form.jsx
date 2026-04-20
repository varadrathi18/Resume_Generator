import { useState } from 'react';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, User, Briefcase, CheckCircle2,
  LoaderCircle, Sparkles, GraduationCap, Code,
} from 'lucide-react';

const INITIAL = {
  name: '', email: '', phone: '', role: '',
  education: '', skills: '', projects: '', experience: '',
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

  const update = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };
  const nextStep = () => { if (step < 3) setStep(step + 1); };
  const prevStep = () => { if (step > 1) setStep(step - 1); };

  const slideVariants = {
    enter: { x: 40, opacity: 0 },
    center: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { x: -40, opacity: 0, transition: { duration: 0.2 } },
  };

  const inputClass = "w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-[var(--color-bg)] placeholder:text-[var(--color-text-muted)]";
  const textareaClass = `${inputClass} resize-y leading-relaxed`;
  const labelClass = "text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide flex items-center gap-1.5";

  return (
    <form onSubmit={handleSubmit} className="w-full">
      {/* ── Step Progress Bar ────────────────────────────────── */}
      <div className="flex items-center justify-center max-w-lg mx-auto mb-8">
        {STEPS.map((s, i) => {
          const isActive = s.id === step;
          const isCompleted = s.id < step;
          return (
            <React.Fragment key={s.id}>
              {i > 0 && (
                <div className={`flex-1 h-0.5 mx-1 rounded-full transition-colors duration-500 ${isCompleted ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-light)]'}`} />
              )}
              <div className="flex flex-col items-center gap-1.5 relative z-10 flex-shrink-0">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-400 relative
                  ${isActive ? 'bg-[var(--color-accent)] text-white shadow-lg shadow-[var(--color-accent)]/30 ring-4 ring-[var(--color-accent)]/15' : ''}
                  ${isCompleted ? 'bg-[var(--color-success)]/10 text-[var(--color-success)] border-2 border-[var(--color-success)]' : ''}
                  ${!isActive && !isCompleted ? 'bg-[var(--color-bg)] text-[var(--color-text-muted)] border-2 border-[var(--color-border-light)]' : ''}
                `}>
                  {isCompleted ? <CheckCircle2 size={18} /> : s.id}
                </div>
                <span className={`text-[0.625rem] font-bold uppercase tracking-[0.1em] transition-colors ${
                  isActive ? 'text-[var(--color-text-primary)]' : isCompleted ? 'text-[var(--color-success)]' : 'text-[var(--color-text-muted)]'
                }`}>{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ── Step Content ──────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* STEP 1: Personal Info */}
        {step === 1 && (
          <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 flex items-center justify-center">
                  <User size={20} className="text-[var(--color-accent)]" />
                </div>
                <div>
                  <h2 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-text-primary)]">Personal Information</h2>
                  <p className="text-xs text-[var(--color-text-secondary)]">Enter your basic contact details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Full Name <span className="text-[var(--color-accent)]">*</span></label>
                  <input type="text" required className={inputClass} placeholder="e.g. Jane Doe" value={form.name} onChange={e => update('name', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Target Role</label>
                  <input type="text" className={inputClass} placeholder="e.g. Senior Product Designer" value={form.role} onChange={e => update('role', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Email Address</label>
                  <input type="email" className={inputClass} placeholder="e.g. jane@company.com" value={form.email} onChange={e => update('email', e.target.value)} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className={labelClass}>Phone Number</label>
                  <input type="text" className={inputClass} placeholder="+1 (555) 000-1234" value={form.phone} onChange={e => update('phone', e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button type="button" onClick={nextStep} disabled={!form.name} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                  Continue <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: Professional */}
        {step === 2 && (
          <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit">
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              {/* Side panel */}
              <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0 order-2 lg:order-1">
                {/* Experience Level Toggle */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-5">
                  <h3 className="text-[0.6875rem] font-bold tracking-[0.1em] uppercase text-[var(--color-text-muted)] mb-3">Experience Level</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { val: 'fresher', label: 'Entry Level (0–2 Yrs)' },
                      { val: 'experienced', label: 'Experienced (3+ Yrs)' },
                    ].map(opt => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => update('type', opt.val)}
                        className={`
                          w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer
                          ${form.type === opt.val
                            ? 'bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 text-[var(--color-accent)]'
                            : 'bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-light)]'
                          }
                        `}
                      >
                        <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          form.type === opt.val ? 'border-[var(--color-accent)]' : 'border-[var(--color-text-muted)]'
                        }`}>
                          {form.type === opt.val && <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)]" />}
                        </div>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Tip */}
                <div className="bg-[var(--color-bg-card)] border border-[var(--color-accent)]/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={14} className="text-[var(--color-accent)]" />
                    <span className="text-xs font-semibold text-[var(--color-text-primary)]">AI Optimization</span>
                  </div>
                  <p className="text-[0.6875rem] text-[var(--color-text-secondary)] leading-relaxed">
                    Our engine analyzes your skills and experience to generate ATS-optimized content tailored to your target role.
                  </p>
                </div>
              </div>

              {/* Main form */}
              <div className="flex-1 min-w-0 bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 order-1 lg:order-2">
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}><Code size={13} className="text-[var(--color-teal)]" /> Skills <span className="text-[var(--color-accent)]">*</span></label>
                    <textarea className={textareaClass} style={{ minHeight: 90 }} placeholder="React, Node.js, Python, Systems Design, Machine Learning..." value={form.skills} onChange={e => update('skills', e.target.value)} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClass}><Briefcase size={13} className="text-[var(--color-accent)]" /> Work Experience</label>
                    <textarea className={textareaClass} style={{ minHeight: 120 }} placeholder="Describe your roles, responsibilities, and key achievements..." value={form.experience} onChange={e => update('experience', e.target.value)} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}><GraduationCap size={13} className="text-[var(--color-purple)]" /> Education <span className="text-[var(--color-accent)]">*</span></label>
                      <textarea className={textareaClass} style={{ minHeight: 90 }} placeholder="B.S. Computer Science, MIT" value={form.education} onChange={e => update('education', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelClass}>Projects</label>
                      <textarea className={textareaClass} style={{ minHeight: 90 }} placeholder="Built an AI resume generator..." value={form.projects} onChange={e => update('projects', e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-5 border-t border-[var(--color-border)]">
                  <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer">
                    <ArrowLeft size={16} /> Back
                  </button>
                  <button type="button" onClick={nextStep} disabled={!form.skills || !form.education} className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer">
                    Review <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <motion.div key="step3" variants={slideVariants} initial="enter" animate="center" exit="exit">
            <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
              <div className="text-center mb-6">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.4 }}
                  className="w-14 h-14 rounded-full bg-[var(--color-success)]/10 border border-[var(--color-success)]/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={26} className="text-[var(--color-success)]" />
                </motion.div>
                <h2 className="font-[var(--font-display)] text-xl font-bold text-[var(--color-text-primary)] mb-1">Ready to Generate</h2>
                <p className="text-sm text-[var(--color-text-secondary)]">Review your information before generating</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Target Role', value: form.role || 'Not specified', color: 'var(--color-accent)' },
                  { label: 'Profile Level', value: form.type, color: 'var(--color-teal)' },
                ].map(item => (
                  <div key={item.label} className="bg-[var(--color-bg-elevated)] rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: item.color }} />
                      {item.label}
                    </div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)] capitalize">{item.value}</p>
                  </div>
                ))}
                <div className="sm:col-span-2 bg-[var(--color-bg-elevated)] rounded-xl px-4 py-3">
                  <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Skills</p>
                  <p className="text-sm text-[var(--color-text-primary)]">{form.skills}</p>
                </div>
                {form.experience && (
                  <div className="sm:col-span-2 bg-[var(--color-bg-elevated)] rounded-xl px-4 py-3">
                    <p className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Experience</p>
                    <p className="text-sm text-[var(--color-text-primary)]">{form.experience}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-[var(--color-border)]">
                <button type="button" onClick={prevStep} className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-primary)] text-sm font-semibold rounded-xl hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer">
                  <ArrowLeft size={16} /> Edit
                </button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white text-base font-semibold rounded-xl shadow-lg shadow-[var(--color-accent)]/30 hover:bg-[var(--color-accent-light)] hover:shadow-xl hover:shadow-[var(--color-accent)]/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer">
                  {loading ? (
                    <><LoaderCircle className="animate-spin" size={20} /> Generating...</>
                  ) : (
                    <><Sparkles size={18} /> Generate Resume</>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
