import React from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Shield, LogIn, Mail, RefreshCw } from 'lucide-react';

const G = {
  bg: '#080A12', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

export default function UserNotRegisteredError() {
  return (
    <div style={{
      minHeight: '100vh', background: G.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
    }}>
      {/* Ambient glow */}
      <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,109,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{
        maxWidth: 460, width: '100%', textAlign: 'center',
        background: G.surface, border: `1px solid ${G.border}`,
        borderRadius: 28, padding: '52px 40px',
        backdropFilter: 'blur(24px)', position: 'relative', zIndex: 1,
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: `${G.rose}15`, border: `1px solid ${G.rose}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          boxShadow: `0 0 40px ${G.rose}20`,
        }}>
          <Shield size={36} style={{ color: G.rose }} />
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 900, color: G.text,
          marginBottom: 12, letterSpacing: '-0.03em',
        }}>
          Access Restricted
        </h1>
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.8, marginBottom: 32 }}>
          Your account hasn't been registered for this platform. Please contact the administrator to request access.
        </p>

        <div style={{
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${G.border}`,
          borderRadius: 16, padding: '20px', marginBottom: 32, textAlign: 'left',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: G.faint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14 }}>What you can do</p>
          {[
            { icon: Mail, text: 'Contact the app administrator for access', c: G.amber },
            { icon: RefreshCw, text: 'Verify you\'re logged in with the correct account', c: G.green },
            { icon: LogIn, text: 'Try signing out and back in again', c: G.rose },
          ].map(({ icon: Icon, text, c }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: `${c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={13} style={{ color: c }} />
              </div>
              <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => auth.logout('/')}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '11px 22px', borderRadius: 12,
              background: G.grad, border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,77,109,0.35)',
            }}
          >
            <LogIn size={15} /> Sign in with another account
          </button>
        </div>
      </div>
    </div>
  );
}