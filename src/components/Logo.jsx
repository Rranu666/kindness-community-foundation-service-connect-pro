import React from 'react';

export default function Logo({ size = 'md', dark = false }) {
  const scales = {
    sm: { icon: 28, title: 12, sub: 8, gap: 10 },
    md: { icon: 36, title: 16, sub: 9, gap: 12 },
    lg: { icon: 48, title: 20, sub: 10, gap: 14 },
    xl: { icon: 64, title: 28, sub: 12, gap: 16 },
  };
  const s = scales[size] || scales.md;

  const textColor = dark ? 'rgba(240,242,255,0.95)' : '#1a202c';
  const subColor = dark ? 'rgba(255,255,255,0.6)' : '#9ca3af';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: s.gap, textDecoration: 'none', userSelect: 'none' }}>
      {/* Icon */}
      <div style={{
        width: s.icon,
        height: s.icon,
        borderRadius: s.icon * 0.25,
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
      }}>
        <svg
          width={s.icon * 0.65}
          height={s.icon * 0.65}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* House roof */}
          <path d="M4 12L12 4L20 12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* House body */}
          <path d="M6 12V19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V12" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          {/* Vertical bars inside */}
          <line x1="10" y1="15" x2="10" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <line x1="14" y1="15" x2="14" y2="21" stroke="white" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{
          fontSize: s.title,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontFamily: "'Inter', system-ui, sans-serif",
          color: textColor,
          marginBottom: 2,
        }}>
          Service<br />Connect Pro
        </span>
        <span style={{
          fontSize: s.sub,
          fontWeight: 500,
          letterSpacing: '0.06em',
          fontFamily: "'Inter', system-ui, sans-serif",
          color: subColor,
          textTransform: 'uppercase',
        }}>
          BY KCF LLC
        </span>
      </div>
    </div>
  );
}