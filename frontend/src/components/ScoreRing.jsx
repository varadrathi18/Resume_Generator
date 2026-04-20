import { motion } from 'framer-motion';

export default function ScoreRing({
  score = 0,
  size = 120,
  strokeWidth = 8,
  label = '',
  showPercent = true,
  className = '',
  delay = 0.3,
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 80) return 'var(--color-success)';
    if (s >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  const color = getColor(score);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-elevated)"
          strokeWidth={strokeWidth}
        />
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay }}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: delay + 0.5, type: 'spring', stiffness: 200 }}
          className="font-[var(--font-display)] font-extrabold text-white leading-none"
          style={{ fontSize: size * 0.22 }}
        >
          {score}{showPercent && '%'}
        </motion.span>
        {label && (
          <span
            className="text-[var(--color-text-muted)] font-semibold uppercase tracking-wider mt-1"
            style={{ fontSize: size * 0.08 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
