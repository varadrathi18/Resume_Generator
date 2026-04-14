import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Shield, Bell, Save, AlertCircle, CheckCircle } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState({ name: '', email: '', auth_provider: 'local', theme: 'dark', email_notifications: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.profile) {
          setProfile(res.data.profile);
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to load profile' });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/user/profile', {
        name: profile.name,
        theme: profile.theme,
        email_notifications: profile.email_notifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      // Update local storage name just in case it's used elsewhere for quick access
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
  };

  if (loading) {
    return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading settings...</div>;
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>
      <motion.header variants={itemVariants} style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
          Account Settings
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9375rem' }}>
          Manage your profile, preferences, and account security.
        </p>
      </motion.header>

      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', borderRadius: '10px', background: message.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)', border: `1px solid ${message.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`, color: message.type === 'error' ? 'var(--color-danger)' : 'var(--color-success)' }}>
              {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle size={18} />}
              <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{message.text}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={18} style={{ color: 'var(--color-accent)' }} /> Profile Information
        </h2>
        
        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Full Name</label>
          <input 
            type="text" 
            name="name" 
            value={profile.name} 
            onChange={handleChange} 
            className="form-input" 
            placeholder="John Doe"
          />
        </div>

        <div className="form-group" style={{ marginBottom: '1.25rem' }}>
          <label className="form-label">Email Address</label>
          <div className="form-input-wrapper">
            <Mail size={16} style={{ position: 'absolute', left: '1rem', color: 'var(--color-text-muted)' }} />
            <input 
              type="email" 
              value={profile.email} 
              readOnly 
              className="form-input with-icon" 
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>Email addresses cannot be changed directly.</span>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card" style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Shield size={18} style={{ color: 'var(--color-accent)' }} /> Security & Authentication
        </h2>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--color-bg-elevated)', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Authentication Method</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>How you log into Resume Forge</div>
          </div>
          <div style={{ padding: '0.25rem 0.75rem', borderRadius: '4px', background: 'var(--color-bg-card)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-text-primary)', border: '1px solid var(--color-border-light)' }}>
            {profile.auth_provider === 'google' ? 'Google OAuth' : 'Email/Password'}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={18} style={{ color: 'var(--color-accent)' }} /> Preferences
        </h2>
        
        <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.25rem' }}>
            <input 
              type="checkbox" 
              name="email_notifications" 
              checked={profile.email_notifications} 
              onChange={handleChange}
              style={{ width: 18, height: 18, cursor: 'pointer', accentColor: 'var(--color-accent)' }}
            />
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>Email Notifications</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.125rem' }}>Receive generated resumes directly to your inbox. Requires admin mailer config.</div>
          </div>
        </label>
      </motion.div>

      <motion.div variants={itemVariants} style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%', maxWidth: 200 }}>
          {saving ? 'Saving...' : <><Save size={16} /> Save Changes</>}
        </button>
      </motion.div>

    </motion.div>
  );
}
