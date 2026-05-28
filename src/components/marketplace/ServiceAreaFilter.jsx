import React from 'react';
import { MapPin } from 'lucide-react';

const G = {
  surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', blue: '#4361EE',
};

export default function ServiceAreaFilter({ location, onChange }) {
  return (
    <div style={{ padding: '16px', borderTop: `1px solid ${G.border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <MapPin size={14} style={{ color: G.rose }} />
        <p style={{ fontWeight: 700, fontSize: 13, color: G.text, margin: 0 }}>
          Service Area
        </p>
      </div>
      <p style={{ fontSize: 12, color: G.muted, marginBottom: 12, margin: 0 }}>
        {location
          ? `Showing pros serving ${location}`
          : 'No location selected'}
      </p>
      <button
        onClick={() => onChange('')}
        style={{
          padding: '8px 12px',
          borderRadius: 8,
          border: `1px solid ${G.border}`,
          background: 'transparent',
          color: G.muted,
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = G.rose;
          e.currentTarget.style.color = G.rose;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = G.border;
          e.currentTarget.style.color = G.muted;
        }}>
        Clear Location
      </button>
    </div>
  );
}