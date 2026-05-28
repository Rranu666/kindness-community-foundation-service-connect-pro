import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Compass, Home, ArrowLeft, Search } from 'lucide-react';

const G = {
  bg: '#080A12', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ['user-404'],
    queryFn: async () => {
      try {
        const user = await auth.me();
        return { user, isAuthenticated: true };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div style={{
      minHeight: '100vh', background: G.bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif", padding: 24,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Ambient */}
      <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '60vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,77,109,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', position: 'relative', zIndex: 1 }}>

        {/* Giant 404 */}
        <div style={{
          fontSize: 'clamp(6rem, 20vw, 10rem)', fontWeight: 900,
          lineHeight: 1, letterSpacing: '-0.06em',
          background: G.grad, WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          marginBottom: 8, userSelect: 'none',
        }}>
          404
        </div>

        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: `${G.rose}12`, border: `1px solid ${G.rose}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
        }}>
          <Compass size={32} style={{ color: G.rose }} />
        </div>

        <h2 style={{ fontSize: 26, fontWeight: 900, color: G.text, marginBottom: 12, letterSpacing: '-0.03em' }}>
          Page not found
        </h2>
        <p style={{ fontSize: 15, color: G.muted, lineHeight: 1.7, marginBottom: 8 }}>
          The page{pageName ? ` "${pageName}"` : ''} doesn't exist or has been moved.
        </p>

        {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
          <div style={{
            margin: '20px 0', padding: '14px 18px',
            borderRadius: 14, background: `${G.amber}10`,
            border: `1px solid ${G.amber}25`, textAlign: 'left',
          }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: G.amber, marginBottom: 4 }}>Admin Note</p>
            <p style={{ fontSize: 12, color: G.muted, lineHeight: 1.6 }}>
              This page may not be implemented yet. Ask AI to build it in the chat.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 28, flexWrap: 'wrap' }}>
          <a href="/" style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 22px', borderRadius: 12,
            background: G.grad, border: 'none', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            textDecoration: 'none', boxShadow: '0 4px 16px rgba(255,77,109,0.35)',
          }}>
            <Home size={15} /> Go Home
          </a>
          <Link to={createPageUrl('Browse')} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '11px 22px', borderRadius: 12,
            background: G.surface, border: `1px solid ${G.border}`,
            color: G.muted, fontWeight: 600, fontSize: 14,
            cursor: 'pointer', textDecoration: 'none',
          }}>
            <Search size={15} /> Browse Services
          </Link>
        </div>
      </div>
    </div>
  );
}