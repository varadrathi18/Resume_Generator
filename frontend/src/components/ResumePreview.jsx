import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Printer } from 'lucide-react';
import { useState } from 'react';

export default function ResumePreview({ data }) {
  const { resume_html } = data;
  const [zoom, setZoom] = useState(100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className="w-full"
    >
      {/* Controls */}
      <div className="flex items-center justify-end gap-2 mb-3">
        <button
          onClick={() => setZoom(z => Math.max(60, z - 10))}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <ZoomOut size={14} />
        </button>
        <span className="text-xs font-medium text-[var(--color-text-muted)] min-w-[3rem] text-center">{zoom}%</span>
        <button
          onClick={() => setZoom(z => Math.min(150, z + 10))}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => window.print()}
          className="p-1.5 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-all cursor-pointer"
        >
          <Printer size={14} />
        </button>
      </div>

      {/* Preview panel */}
      <div className="overflow-auto rounded-2xl border border-[var(--color-border)] shadow-xl shadow-black/20 bg-white">
        <div
          id="printable-resume"
          className="resume-preview-panel"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left', width: `${10000 / zoom}%` }}
          dangerouslySetInnerHTML={{ __html: resume_html }}
        />
      </div>
    </motion.div>
  );
}
