import React from 'react';
import Logo from '@/components/Logo';

const G = {
  bg: '#080A12', rose: '#FF4D6D', amber: '#FF8C42',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  muted: 'rgba(240,242,255,0.4)',
};

export default function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: G.bg,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', system-ui, sans-serif",
      zIndex: 9999,
    }}>
      {/* Ambient orb */}
      <div style={{
        position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '50vw', height: '50vw', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,77,109,0.08) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', marginBottom: 32 }}>
        <Logo size="md" />
      </div>

      {/* Animated gradient bar */}
      <div style={{ width: 200, height: 3, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 16 }}>
        <div style={{
          height: '100%', background: G.grad, borderRadius: 100,
          animation: 'slide 1.6s ease-in-out infinite',
          width: '40%',
        }} />
      </div>

      <p style={{ fontSize: 13, color: G.muted }}>{message}</p>

      <style>{`
        @keyframes slide {
          0% { transform: translateX(-250%); }
          100% { transform: translateX(600%); }
        }
      `}</style>
    </div>
  );
}