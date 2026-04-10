export default function Footer() {
  return (
    <footer className="footer">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
        <p className="text-sm text-text-muted">
          Built with <span className="font-semibold text-text-secondary">DistilBERT + Gemini AI</span>
        </p>
        <p className="text-xs text-text-muted">
          AI-Powered Domain-Aware Resume Generator
        </p>
      </div>
    </footer>
  )
}
