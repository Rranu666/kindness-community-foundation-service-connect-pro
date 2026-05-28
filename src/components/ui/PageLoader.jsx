import React from 'react';

const G = {
  bg: '#080A12', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.07)',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  muted: 'rgba(240,242,255,0.08)',
};

// Skeleton shimmer for cards
export function SkeletonCard({ height = 200, className = '' }) {
  return (
    <div className={className} style={{
      height, borderRadius: 20, overflow: 'hidden',
      background: G.surface, border: `1px solid ${G.border}`,
      position: 'relative',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }} />
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// Skeleton line for text
export function SkeletonLine({ width = '100%', height = 14, className = '' }) {
  return (
    <div className={className} style={{
      width, height, borderRadius: 100,
      background: G.muted, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s ease-in-out infinite',
      }} />
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </div>
  );
}

// Page-level spinner for lazy routes
export function PageLoader() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.06)',
        borderTopColor: '#FF4D6D',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default PageLoader;