import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Menu, X } from 'lucide-react';

const L = {
  bg: '#ffffff',
  bg3: '#f0efed',
  text: '#111111',
  text2: '#555555',
  border: '#e2e0dc',
};

export default function MobileMenuButton() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button onClick={() => setMobileOpen(!mobileOpen)}
        style={{ background: L.bg3, border: `1px solid ${L.border}`, borderRadius: 10, width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', color: L.text, cursor: 'pointer' }}>
        {mobileOpen ? <X size={17} /> : <Menu size={17} />}
      </button>

      {mobileOpen && (
        <div style={{ background: '#fff', borderTop: `1px solid ${L.border}`, padding: '10px 16px 16px', display: 'flex', flexDirection: 'column', gap: 2, position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50 }}>
          {[
            { label: 'Services', page: 'Browse' },
            { label: 'Voice Match', page: 'VoiceRequest' },
            { label: 'For Providers', page: 'ProviderSignup' },
            { label: 'Support', page: 'Support' },
            { label: 'Blog', href: '/blog' },
          ].map(item => (
            item.href ? (
              <a key={item.label} href={item.href} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: L.text2, textDecoration: 'none', fontSize: 14, fontWeight: 400, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.background = L.bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.background = 'transparent'; }}>
                {item.label}
              </a>
            ) : (
              <Link key={item.page} to={createPageUrl(item.page)} onClick={() => setMobileOpen(false)}
                style={{ display: 'block', padding: '10px 12px', borderRadius: 10, color: L.text2, textDecoration: 'none', fontSize: 14, fontWeight: 400, transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.background = L.bg3; }}
                onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.background = 'transparent'; }}>
                {item.label}
              </Link>
            )
          ))}
          <div style={{ borderTop: `1px solid ${L.border}`, marginTop: 10, paddingTop: 10 }}>
            <button onClick={() => { auth.redirectToLogin(); setMobileOpen(false); }}
              style={{ width: '100%', padding: '12px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Sign In
            </button>
            <Link to={createPageUrl('Browse')} onClick={() => setMobileOpen(false)}>
              <button style={{ width: '100%', padding: '12px', borderRadius: 100, background: 'rgba(0, 0, 0, 0.08)', border: 'none', color: L.text, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 8 }}>
                Book now
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
}