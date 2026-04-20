import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Sparkles, BarChart3, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const tabs = [
  { name: 'Home', path: '/', icon: LayoutDashboard },
  { name: 'Resumes', path: '/resumes', icon: FileText },
  { name: 'Forge', path: '/ai-forge', icon: Sparkles },
  { name: 'Analytics', path: '/impact-scores', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function BottomNav() {
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass background */}
      <div className="bg-[var(--color-bg-sidebar)]/95 backdrop-blur-xl border-t border-[var(--color-border)]">
        <div className="flex items-center justify-around px-2 py-1.5 max-w-lg mx-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.path}
                to={tab.path}
                className="relative flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-200"
              >
                {isActive && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute inset-0 bg-[var(--color-accent)]/10 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative z-10">
                  <Icon
                    size={20}
                    className={`transition-colors duration-200 ${
                      isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                    }`}
                  />
                  {isActive && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-[var(--color-accent)] rounded-full"
                    />
                  )}
                </div>
                <span
                  className={`relative z-10 text-[0.625rem] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      {/* Safe area spacer for iOS */}
      <div className="h-[env(safe-area-inset-bottom)] bg-[var(--color-bg-sidebar)]" />
    </nav>
  );
}
