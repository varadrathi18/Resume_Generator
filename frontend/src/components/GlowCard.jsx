import { motion } from 'framer-motion';

export default function GlowCard({
  children,
  className = '',
  glowColor = 'rgba(232, 80, 58, 0.15)',
  hoverGlow = true,
  animate = true,
  delay = 0,
  onClick,
  ...props
}) {
  const baseClasses = `
    relative overflow-hidden rounded-2xl
    bg-[var(--color-bg-card)] border border-[var(--color-border)]
    p-6 transition-all duration-300
    ${hoverGlow ? 'hover:border-[var(--color-border-light)] hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5' : ''}
    ${onClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim();

  const content = (
    <div className={baseClasses} onClick={onClick} {...props}>
      {/* Subtle gradient glow on hover */}
      {hoverGlow && (
        <div
          className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
          style={{
            background: `radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${glowColor}, transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );

  if (!animate) return content;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
    >
      {content}
    </motion.div>
  );
}
