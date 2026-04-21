import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Printer, RotateCcw } from 'lucide-react';
import { useState } from 'react';

export default function ResumePreview({ data }) {
  const { resume_html } = data;
  const [zoom, setZoom] = useState(0.75); // Start at 75% for desktop readability

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      style={{ width: '100%' }}
    >
      {/* Controls bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '0.5rem',
          marginBottom: '0.75rem',
        }}
      >
        <button
          onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(1)))}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-medium text-[var(--color-text-muted)] min-w-[3rem] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(1.5, +(z + 0.1).toFixed(1)))}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom(0.75)}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <RotateCcw size={14} />
        </button>
        <button
          onClick={() => window.print()}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <Printer size={14} />
        </button>
      </div>

      {/* Resume paper — no transform scaling, just use CSS zoom for reliability */}
      <div
        style={{
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <div
          id="printable-resume"
          className="resume-preview-panel"
          style={{ zoom: zoom }}
          dangerouslySetInnerHTML={{ __html: resume_html }}
        />
      </div>
    </motion.div>
  );
}
