import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LOADING_STEPS = [
  { msg: 'Analyzing your profile...', detail: 'Reading education, skills, and experience', icon: '🔍' },
  { msg: 'Classifying domain with ML...', detail: 'Running DistilBERT + TF-IDF classification', icon: '🧠' },
  { msg: 'Generating optimized content...', detail: 'Gemini AI is crafting your resume', icon: '✨' },
  { msg: 'Formatting documents...', detail: 'Creating PDF and DOCX files', icon: '📄' },
];

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const progress = ((stepIndex + 1) / LOADING_STEPS.length) * 100;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-bg)]/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center max-w-sm mx-auto px-6 text-center"
      >
        {/* Animated orb */}
        <div className="relative w-28 h-28 mb-8">
          {/* Pulse rings */}
          <div className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20" style={{ animation: 'pulse-ring 2s ease-out infinite' }} />
          <div className="absolute inset-2 rounded-full bg-[var(--color-accent)]/15" style={{ animation: 'pulse-ring 2s ease-out infinite 0.5s' }} />
          {/* Core */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center shadow-xl shadow-[var(--color-accent)]/40">
            <AnimatePresence mode="wait">
              <motion.span
                key={stepIndex}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="text-3xl"
              >
                {LOADING_STEPS[stepIndex].icon}
              </motion.span>
            </AnimatePresence>
          </div>
          {/* Orbiting dot */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-[var(--color-teal)] shadow-lg shadow-[var(--color-teal)]/50" />
          </div>
        </div>

        {/* Step text */}
        <AnimatePresence mode="wait">
          <motion.div
            key={stepIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-[var(--font-display)] text-lg font-bold text-[var(--color-text-primary)] mb-1">
              {LOADING_STEPS[stepIndex].msg}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {LOADING_STEPS[stepIndex].detail}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="w-full mt-8 h-1.5 bg-[var(--color-bg-elevated)] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-light)]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-2 mt-4">
          {LOADING_STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i <= stepIndex
                  ? 'bg-[var(--color-accent)] scale-100'
                  : 'bg-[var(--color-bg-elevated)] scale-75'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
