import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Flame } from 'lucide-react';

import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AiForge from './pages/AiForge';
import Resumes from './pages/Resumes';
import ImpactScores from './pages/ImpactScores';
import Settings from './pages/Settings';
import Result from './pages/Result';
import Login from './pages/Login';
import Signup from './pages/Signup';

const GOOGLE_CLIENT_ID = "387539609566-1k1rqia6rhi0ensgnjcuamf9823nfiqr.apps.googleusercontent.com";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      {/* Mobile top header — shows only below md */}
      <div className="fixed top-0 left-0 right-0 z-40 md:hidden flex items-center justify-between px-4 py-3 bg-[var(--color-bg-sidebar)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] shadow-md">
            <Flame size={16} color="white" />
          </div>
          <span className="font-[var(--font-display)] text-base font-bold text-[var(--color-text-primary)]">
            ResumeForge
          </span>
        </div>
        <button
          className="p-2 rounded-lg text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile, visible on md+ */}
      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* Main content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <div className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6 md:px-8 md:py-8 mt-14 md:mt-0 mb-20 md:mb-0">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav />
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<ProtectedRoute><DashboardLayout><Dashboard /></DashboardLayout></ProtectedRoute>} />
        <Route path="/ai-forge" element={<ProtectedRoute><DashboardLayout><AiForge /></DashboardLayout></ProtectedRoute>} />
        <Route path="/resumes" element={<ProtectedRoute><DashboardLayout><Resumes /></DashboardLayout></ProtectedRoute>} />
        <Route path="/impact-scores" element={<ProtectedRoute><DashboardLayout><ImpactScores /></DashboardLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><DashboardLayout><Settings /></DashboardLayout></ProtectedRoute>} />
        <Route path="/result" element={<ProtectedRoute><DashboardLayout><Result /></DashboardLayout></ProtectedRoute>} />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
