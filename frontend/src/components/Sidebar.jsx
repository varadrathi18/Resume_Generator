import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  Sparkles,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  Zap,
  Flame,
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Resumes', path: '/resumes', icon: FileText },
    { name: 'AI Forge', path: '/ai-forge', icon: Sparkles },
    { name: 'Impact Scores', path: '/impact-scores', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -260, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', damping: 25, stiffness: 120 }}
      className="sidebar"
    >
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Flame size={20} color="white" />
        </div>
        <div className="sidebar-brand">
          <span className="sidebar-brand-name">ResumeForge</span>
          <span className="sidebar-brand-sub">AI Engine v2.4</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, index) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <motion.div
              key={item.name}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 + 0.15 }}
            >
              <Link
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={20} className="sidebar-nav-icon" />
                <span>{item.name}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>

      {/* CTA Button */}
      <div style={{ padding: '0 0.75rem', marginBottom: '0.5rem' }}>
        <button className="sidebar-cta" onClick={() => navigate('/ai-forge')}>
          <Zap size={16} />
          Instant Forge
        </button>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="sidebar-footer-item">
          <HelpCircle size={16} />
          <span>Support</span>
        </button>
        <button className="sidebar-footer-item danger" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </motion.aside>
  );
}
