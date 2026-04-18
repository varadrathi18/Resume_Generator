import { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Flame } from 'lucide-react';
import Sidebar from './components/Sidebar';
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
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PageTransition = ({ children }) => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{ width: '100%', height: '100%' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

const DashboardLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <div className="sidebar-logo-icon" style={{ width: 36, height: 36 }}>
          <Flame size={20} color="white" />
        </div>
        <div className="sidebar-brand-name" style={{ flex: 1, marginLeft: 12 }}>
          ResumeForge
        </div>
        <button 
          className="mobile-menu-btn" 
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      <div className="main-area">
        <div className="main-content">
          <PageTransition>{children}</PageTransition>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout><Dashboard /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/ai-forge" 
          element={
            <ProtectedRoute>
              <DashboardLayout><AiForge /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/resumes" 
          element={
            <ProtectedRoute>
              <DashboardLayout><Resumes /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/impact-scores" 
          element={
            <ProtectedRoute>
              <DashboardLayout><ImpactScores /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <DashboardLayout><Settings /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/result" 
          element={
            <ProtectedRoute>
              <DashboardLayout><Result /></DashboardLayout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </GoogleOAuthProvider>
  );
}

export default App;
