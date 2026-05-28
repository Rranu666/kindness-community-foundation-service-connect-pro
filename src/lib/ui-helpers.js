// ─── SHARED UI HELPER STYLES ───────────────────────────────────────────
// Consolidates repeated inline style patterns for consistency and DRY principle

import { THEME as L } from './theme';

export const hoverLinkStyle = {
  base: { textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' },
  onEnter: (e) => { e.currentTarget.style.color = L.text; },
  onLeave: (e) => { e.currentTarget.style.color = L.text3; },
};

export const navLinkStyle = (isActive) => ({
  display: 'block',
  padding: 'clamp(6px 10px, 1vw, 8px 16px)',
  borderRadius: 10,
  fontSize: 'clamp(12px, 1.8vw, 14px)',
  fontWeight: isActive ? 600 : 400,
  color: isActive ? L.text : L.text2,
  background: isActive ? L.bg3 : 'transparent',
  border: `1px solid ${isActive ? L.border2 : 'transparent'}`,
  transition: 'all 0.2s',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
});

export const primaryButtonStyle = {
  base: {
    background: L.text,
    color: '#fff',
    border: 'none',
    borderRadius: 100,
    fontWeight: 600,
    fontSize: '14px',
    padding: '8px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'inline-block',
  },
  onEnter: (e) => {
    e.currentTarget.style.background = '#222';
    e.currentTarget.style.transform = 'translateY(-1px)';
  },
  onLeave: (e) => {
    e.currentTarget.style.background = L.text;
    e.currentTarget.style.transform = 'none';
  },
};

export const secondaryButtonStyle = {
  base: {
    padding: '8px 16px',
    borderRadius: 100,
    background: 'none',
    border: `1px solid ${L.border2}`,
    color: L.text2,
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  onEnter: (e) => {
    e.currentTarget.style.color = L.text;
    e.currentTarget.style.borderColor = L.text;
  },
  onLeave: (e) => {
    e.currentTarget.style.color = L.text2;
    e.currentTarget.style.borderColor = L.border2;
  },
};

export const hoverableCardStyle = (isHovered) => ({
  transition: 'all 0.2s',
  background: isHovered ? L.bg3 : 'transparent',
  borderColor: isHovered ? L.border2 : 'transparent',
});

export const linkHoverStyle = (isActive) => ({
  color: isActive ? L.text : L.text2,
  display: 'block',
  textDecoration: 'none',
  fontSize: 14,
  marginBottom: 10,
  fontWeight: 300,
  transition: 'color 0.2s',
});