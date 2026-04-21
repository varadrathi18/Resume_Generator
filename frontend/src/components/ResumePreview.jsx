import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Printer, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function ResumePreview({ data }) {
  const { resume_html } = data;
  const [zoom, setZoom] = useState(1);
  const innerRef = useRef(null);
  const [innerHeight, setInnerHeight] = useState('auto');

  // Measure the natural height of the resume content and scale the wrapper
  useEffect(() => {
    if (!innerRef.current) return;
    const measure = () => {
      const natural = innerRef.current.scrollHeight;
      setInnerHeight(natural * zoom);
    };
    measure();
    // Re-measure when zoom changes or content loads
    const observer = new ResizeObserver(measure);
    observer.observe(innerRef.current);
    return () => observer.disconnect();
  }, [zoom, resume_html]);

  if (!resume_html) {
    return (
      <div
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          background: 'var(--color-bg-card)',
          borderRadius: '1rem',
          border: '1px solid var(--color-border)',
        }}
      >
        No resume preview available. The resume may still be generating.
      </div>
    );
  }

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
          onClick={() => setZoom(1)}
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

      {/* Resume paper */}
      <div
        style={{
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          backgroundColor: '#ffffff',
          overflow: 'visible',
          position: 'relative',
          height: typeof innerHeight === 'number' ? `${innerHeight}px` : 'auto',
        }}
      >
        <div
          ref={innerRef}
          id="printable-resume"
          className="resume-preview-panel"
          style={{
            transformOrigin: 'top left',
            transform: `scale(${zoom})`,
            width: `${100 / zoom}%`,
          }}
          dangerouslySetInnerHTML={{ __html: resume_html }}
        />
      </div>
    </motion.div>
  );
}
