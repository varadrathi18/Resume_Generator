import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, FileText, Sparkles, BarChart3, Settings,
  LogOut, HelpCircle, Zap, Flame, X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Resumes', path: '/resumes', icon: FileText },
  { name: 'AI Forge', path: '/ai-forge', icon: Sparkles },
  { name: 'Impact Scores', path: '/impact-scores', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <motion.aside
      initial={{ x: -280, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className={`
        hidden md:flex flex-col w-[260px] min-w-[260px] h-dvh
        bg-[var(--color-bg-sidebar)] border-r border-[var(--color-border)]
        sticky top-0 z-40 overflow-y-auto overflow-x-hidden overscroll-contain
        max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[60]
        max-md:transition-transform max-md:duration-300 max-md:ease-[cubic-bezier(0.4,0,0.2,1)]
        ${isOpen ? 'max-md:!flex max-md:translate-x-0 max-md:shadow-2xl' : 'max-md:-translate-x-full'}
      `}
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)] shrink-0">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] shadow-lg shadow-[var(--color-accent)]/30">
          <Flame size={20} color="white" />
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <span className="font-[var(--font-display)] text-lg font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
            ResumeForge
          </span>
          <span className="text-[0.6rem] font-semibold tracking-[0.12em] uppercase text-[var(--color-teal)]">
            AI Engine v2.4
          </span>
        </div>
        {/* Mobile close */}
        <button
          className="md:hidden p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-all"
          onClick={() => setIsOpen?.(false)}
        >
          <X size={18} />
        </button>
      </div>

      {/* ── Navigation ─────────────────────────────────────── */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
        {navItems.map((item, i) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.05 + 0.15 }}
            >
              <Link
                to={item.path}
                onClick={() => setIsOpen?.(false)}
                className={`
                  group relative flex items-center gap-3 px-4 py-2.5 rounded-xl
                  text-sm font-medium transition-all duration-200
                  ${isActive
                    ? 'bg-[var(--color-accent)] text-white font-semibold shadow-md shadow-[var(--color-accent)]/25'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]'
                  }
                `}
              >
                <Icon size={19} className={`shrink-0 transition-transform duration-200 ${!isActive ? 'group-hover:scale-110' : ''}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveIndicator"
                    className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* ── CTA Button ─────────────────────────────────────── */}
      <div className="px-3 mb-2">
        <button
          onClick={() => { navigate('/ai-forge'); setIsOpen?.(false); }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                     bg-[var(--color-accent)] text-white text-sm font-semibold
                     shadow-md shadow-[var(--color-accent)]/30
                     hover:bg-[var(--color-accent-light)] hover:-translate-y-0.5
                     hover:shadow-lg hover:shadow-[var(--color-accent)]/40
                     transition-all duration-200 cursor-pointer"
        >
          <Zap size={16} />
          Instant Forge
        </button>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <div className="px-3 py-3 border-t border-[var(--color-border)] flex flex-col gap-0.5">
        <button className="flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--color-text-secondary)] text-[0.8125rem] font-medium hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-all w-full text-left cursor-pointer">
          <HelpCircle size={16} /> Support
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 rounded-lg text-[var(--color-text-secondary)] text-[0.8125rem] font-medium hover:text-[var(--color-danger)] hover:bg-[var(--color-bg-hover)] transition-all w-full text-left cursor-pointer"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </motion.aside>
  );
}
