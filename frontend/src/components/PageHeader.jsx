import { motion } from 'framer-motion';

export default function PageHeader({ icon: Icon, badge, title, subtitle, children }) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8"
    >
      {badge && (
        <div className="flex items-center gap-2 mb-2">
          {Icon && <Icon size={16} className="text-[var(--color-accent)]" />}
          <span className="text-[0.6875rem] font-bold tracking-[0.12em] uppercase text-[var(--color-accent)]">
            {badge}
          </span>
        </div>
      )}
      <h1 className="font-[var(--font-display)] text-3xl md:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight mb-1">
        {title}
      </h1>
      {subtitle && (
        <p className="text-[var(--color-text-secondary)] text-sm md:text-base max-w-xl leading-relaxed">
          {subtitle}
        </p>
      )}
      {children}
    </motion.header>
  );
}
