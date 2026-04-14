import { motion } from 'framer-motion';

export default function ResumePreview({ data }) {
  const { resume_html } = data;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      style={{ width: '100%' }}
    >
      <div className="resume-preview-panel">
        <div
          id="printable-resume"
          className="resume-html-core"
          dangerouslySetInnerHTML={{ __html: resume_html }}
        />
      </div>
    </motion.div>
  );
}
