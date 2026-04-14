import { useState, useEffect } from 'react';

const LOADING_STEPS = [
  { msg: 'Analyzing your profile...', detail: 'Reading education, skills, and experience' },
  { msg: 'Classifying domain with ML...', detail: 'Running DistilBERT + TF-IDF classification' },
  { msg: 'Generating optimized content...', detail: 'Gemini AI is crafting your resume' },
  { msg: 'Formatting documents...', detail: 'Creating PDF and DOCX files' },
];

export default function Loader() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, LOADING_STEPS.length - 1));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const progress = ((stepIndex + 1) / LOADING_STEPS.length) * 100;

  return (
    <div className="loader-container">
      <div className="loader-spinner" />

      <div className="loader-text">{LOADING_STEPS[stepIndex].msg}</div>
      <div className="loader-detail">{LOADING_STEPS[stepIndex].detail}</div>

      <div className="loader-progress">
        <div className="loader-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="loader-dots">
        {LOADING_STEPS.map((_, i) => (
          <div
            key={i}
            className={`loader-dot ${i <= stepIndex ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}
