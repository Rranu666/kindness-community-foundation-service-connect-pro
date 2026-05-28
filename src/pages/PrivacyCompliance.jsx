import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile, callFunction } from '@/api/db';
import { AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

export default function PrivacyCompliance() {
  const [user, setUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const handleRequestDataExport = async () => {
    try {
      const response = await callFunction('exportUserData', {
        email: user.email
      });
      
      // Trigger download
      const url = window.URL.createObjectURL(new Blob([JSON.stringify(response.data, null, 2)]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      
      setMessage('✓ Data export downloaded successfully');
    } catch (error) {
      setMessage('✗ Failed to export data: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleting(true);
    try {
      await callFunction('deleteUserAccount', {
        email: user.email
      });
      
      setMessage('✓ Your account and all data have been deleted. Redirecting...');
      setTimeout(() => {
        auth.logout('/');
      }, 2000);
    } catch (error) {
      setMessage('✗ Failed to delete account: ' + error.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: L.bg, padding: '40px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Lock size={32} style={{ color: L.accent }} />
            <h1 style={{ fontSize: 32, fontWeight: 700, color: L.text }}>Privacy & Data Control</h1>
          </div>
          <p style={{ fontSize: 15, color: L.text2, lineHeight: 1.7 }}>
            In compliance with the California Consumer Privacy Act (CCPA), you have the right to know, delete, and opt-out. This page lets you exercise those rights.
          </p>
        </div>

        {message && (
          <div style={{ padding: 16, background: message.startsWith('✓') ? '#f0fdf4' : '#fef2f2', border: `1px solid ${message.startsWith('✓') ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12, marginBottom: 24, color: message.startsWith('✓') ? '#166534' : '#991b1b' }}>
            {message}
          </div>
        )}

        {user && (
          <>
            {/* Data Requests */}
            <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: L.text, marginBottom: 12 }}>1. Your Right to Know</h2>
              <p style={{ fontSize: 14, color: L.text2, marginBottom: 16, lineHeight: 1.6 }}>
                You have the right to request what personal information we collect, use, and share about you.
              </p>
              <button onClick={handleRequestDataExport}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                <CheckCircle size={16} /> Export My Data
              </button>
              <p style={{ fontSize: 12, color: L.text3, marginTop: 12 }}>Your data will be downloaded as JSON. Processing time: immediate.</p>
            </div>

            {/* Delete Account */}
            <div style={{ background: '#fef2f2', border: `1px solid #fecaca`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                <AlertCircle size={24} style={{ color: L.accent, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: L.text, marginBottom: 12 }}>2. Your Right to Delete</h2>
                  <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6 }}>
                    You can request deletion of your account and all personal data. This action is permanent and cannot be undone.
                  </p>
                </div>
              </div>

              {deleteConfirm && (
                <div style={{ background: '#fff', border: `1px solid #fecaca`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: L.text, fontWeight: 600, marginBottom: 12 }}>Are you sure? This will:</p>
                  <ul style={{ fontSize: 13, color: L.text2, lineHeight: 1.8, marginLeft: 20, marginBottom: 16 }}>
                    <li>Delete your account permanently</li>
                    <li>Remove all personal data (profile, orders, messages)</li>
                    <li>Remove payment methods and transaction history</li>
                    <li>This cannot be reversed</li>
                  </ul>
                </div>
              )}

              <button onClick={handleDeleteAccount} disabled={deleting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: L.accent, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer', opacity: deleting ? 0.6 : 1, transition: 'all 0.2s' }}
                onMouseEnter={e => !deleting && (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={e => !deleting && (e.currentTarget.style.opacity = '1')}>
                {deleteConfirm ? '⚠️ Confirm Delete' : '🗑️ Request Account Deletion'}
              </button>

              <p style={{ fontSize: 12, color: L.text3, marginTop: 12 }}>Processing time: 24-48 hours. You'll receive email confirmation.</p>
            </div>

            {/* CCPA Info */}
            <div style={{ background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: L.text, marginBottom: 16 }}>3. CCPA Rights Summary</h2>
              <div style={{ display: 'grid', gap: 12 }}>
                {[
                  { title: 'Right to Know', desc: 'Know what data we collect and how we use it' },
                  { title: 'Right to Delete', desc: 'Request deletion of your personal information' },
                  { title: 'Right to Opt-Out', desc: 'Opt-out of personal data sales' },
                  { title: 'Right to Correct', desc: 'Request correction of inaccurate data' },
                ].map((item, i) => (
                  <div key={i} style={{ padding: 12, background: L.bg2, borderRadius: 8, border: `1px solid ${L.border}` }}>
                    <div style={{ fontWeight: 600, color: L.text, marginBottom: 4 }}>{item.title}</div>
                    <div style={{ fontSize: 13, color: L.text3 }}>{item.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 24, paddingTop: 24, borderTop: `1px solid ${L.border}` }}>
                <p style={{ fontSize: 13, color: L.text2, marginBottom: 12 }}>
                  <strong>Questions?</strong> Contact us at privacy@serviceconnectpro.com or (949) 996-3051
                </p>
                <p style={{ fontSize: 12, color: L.text3 }}>
                  Last updated: April 2026 | Compliant with CCPA, CPRA, and GDPR
                </p>
              </div>
            </div>
          </>
        )}

        {!user && (
          <div style={{ padding: 32, background: L.bg2, borderRadius: 16, textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: L.text2, marginBottom: 20 }}>Sign in to access your privacy controls</p>
            <button onClick={() => auth.redirectToLogin()}
              style={{ padding: '12px 28px', background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, cursor: 'pointer' }}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}