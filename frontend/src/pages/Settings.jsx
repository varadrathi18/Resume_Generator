import React, { useState, useEffect } from 'react';
import api from '../api';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Bell, Save, AlertCircle, CheckCircle } from 'lucide-react';
import GlowCard from '../components/GlowCard';
import PageHeader from '../components/PageHeader';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', auth_provider: 'local', theme: 'dark', email_notifications: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/user/profile');
        if (res.data.profile) setProfile(res.data.profile);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.put('/api/user/profile', {
        name: profile.name,
        theme: profile.theme,
        email_notifications: profile.email_notifications,
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser) {
        localUser.name = profile.name;
        localStorage.setItem('user', JSON.stringify(localUser));
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-[var(--color-bg-input)] border border-[var(--color-border)] text-[var(--color-text-primary)] px-4 py-3 rounded-xl text-sm outline-none transition-all duration-200 focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/20 focus:bg-[var(--color-bg)] placeholder:text-[var(--color-text-muted)]";

  if (loading) {
    return <div className="py-12 text-center text-[var(--color-text-muted)]">Loading settings...</div>;
  }

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="w-full max-w-3xl mx-auto">
      <PageHeader title="Account Settings" subtitle="Manage your profile, preferences, and account security." />

      {/* Status Message */}
      <AnimatePresence>
        {message.text && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className={`flex items-center gap-3 p-4 rounded-xl border ${
              message.type === 'error'
                ? 'bg-red-500/10 border-red-500/20 text-red-400'
                : 'bg-green-500/10 border-green-500/20 text-green-400'
            }`}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile */}
      <motion.div variants={item} className="mb-4">
        <GlowCard animate={false}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <User size={18} className="text-[var(--color-accent)]" /> Profile Information
          </h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-accent-dark)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[var(--color-accent)]/30">
              {profile.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-semibold text-white">{profile.name || 'User'}</p>
              <p className="text-xs text-[var(--color-text-muted)]">{profile.email}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Full Name</label>
              <input type="text" name="name" value={profile.name} onChange={handleChange} className={inputClass} placeholder="John Doe" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)] tracking-wide">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
                <input type="email" value={profile.email} readOnly className={`${inputClass} pl-10 opacity-60 cursor-not-allowed`} />
              </div>
              <span className="text-[0.6875rem] text-[var(--color-text-muted)]">Email cannot be changed directly.</span>
            </div>
          </div>
        </GlowCard>
      </motion.div>

      {/* Security */}
      <motion.div variants={item} className="mb-4">
        <GlowCard animate={false}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Shield size={18} className="text-[var(--color-accent)]" /> Security & Authentication
          </h2>
          <div className="flex items-center justify-between p-4 bg-[var(--color-bg-elevated)] rounded-xl border border-[var(--color-border)]">
            <div>
              <p className="text-sm font-semibold text-white">Authentication Method</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">How you log into ResumeForge</p>
            </div>
            <span className="px-3 py-1 bg-[var(--color-bg-card)] border border-[var(--color-border-light)] rounded text-[0.6875rem] font-bold uppercase tracking-wider text-white">
              {profile.auth_provider === 'google' ? 'Google OAuth' : 'Email/Password'}
            </span>
          </div>
        </GlowCard>
      </motion.div>

      {/* Preferences */}
      <motion.div variants={item} className="mb-6">
        <GlowCard animate={false}>
          <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
            <Bell size={18} className="text-[var(--color-accent)]" /> Preferences
          </h2>
          <label className="flex items-start gap-4 cursor-pointer group">
            {/* Custom toggle */}
            <div className="relative mt-0.5">
              <input type="checkbox" name="email_notifications" checked={profile.email_notifications} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-full peer-checked:bg-[var(--color-accent)] transition-colors cursor-pointer" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white group-hover:text-[var(--color-accent)] transition-colors">Email Notifications</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Receive generated resumes directly to your inbox.</p>
            </div>
          </label>
        </GlowCard>
      </motion.div>

      {/* Save */}
      <motion.div variants={item} className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-[var(--color-accent)] text-white text-sm font-semibold rounded-xl shadow-md shadow-[var(--color-accent)]/25 hover:bg-[var(--color-accent-light)] hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </motion.div>
    </motion.div>
  );
}
