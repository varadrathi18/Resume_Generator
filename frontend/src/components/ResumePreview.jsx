import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Printer, RotateCcw } from 'lucide-react';
import { useState, useMemo } from 'react';

/**
 * Extract the inner body content from a full HTML document string.
 * The backend's to_html() returns a complete <!DOCTYPE html>…</html> document
 * with its own <style> block, <body>, etc.  When injected via dangerouslySetInnerHTML
 * inside an existing page, the nested <html>/<body> and conflicting styles
 * break the layout.  This helper strips everything down to the actual resume markup.
 */
function extractBodyContent(html) {
  if (!html) return '';

  // Try to extract content between <body> and </body>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) {
    return bodyMatch[1].trim();
  }

  // If no body tag found, strip any DOCTYPE / html / head / style tags
  let cleaned = html;
  cleaned = cleaned.replace(/<!DOCTYPE[^>]*>/gi, '');
  cleaned = cleaned.replace(/<\/?html[^>]*>/gi, '');
  cleaned = cleaned.replace(/<head[\s\S]*?<\/head>/gi, '');
  cleaned = cleaned.replace(/<\/?body[^>]*>/gi, '');
  return cleaned.trim();
}

export default function ResumePreview({ data }) {
  const { resume_html } = data;
  const [zoom, setZoom] = useState(1);

  // Extract just the resume body content, memoized to avoid re-parsing
  const cleanHtml = useMemo(() => extractBodyContent(resume_html), [resume_html]);

  if (!cleanHtml) {
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
        className="resume-paper-wrapper"
        style={{
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          backgroundColor: '#ffffff',
          overflow: 'auto',
        }}
      >
        <div
          id="printable-resume"
          className="resume-preview-panel"
          style={{
            zoom: zoom,
          }}
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      </div>
    </motion.div>
  );
}
