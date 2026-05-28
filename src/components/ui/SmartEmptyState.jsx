import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SearchX, Inbox, WifiOff, AlertCircle, PackageSearch } from 'lucide-react';

const G = {
  bg: '#080A12', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

const PRESETS = {
  noResults: { icon: SearchX, title: 'No results found', body: 'Try adjusting your search or filters.', color: G.rose },
  empty: { icon: Inbox, title: 'Nothing here yet', body: 'Get started by creating your first item.', color: G.blue },
  offline: { icon: WifiOff, title: 'You\'re offline', body: 'Check your connection and try again.', color: G.amber },
  error: { icon: AlertCircle, title: 'Something went wrong', body: 'We couldn\'t load this content. Please try again.', color: G.rose },
  noOrders: { icon: PackageSearch, title: 'No orders yet', body: 'Book a service to get started.', color: G.amber },
};

/**
 * SmartEmptyState - reusable across all pages
 * Props: preset, icon, title, body, cta { label, to, onClick }, color
 */
export default function SmartEmptyState({
  preset,
  icon: CustomIcon,
  title,
  body,
  cta,
  color,
  style = {},
}) {
  const config = preset ? PRESETS[preset] : {};
  const Icon = CustomIcon || config.icon || Inbox;
  const displayTitle = title || config.title || 'Nothing here';
  const displayBody = body || config.body || '';
  const displayColor = color || config.color || G.rose;

  return (
    <div style={{
      textAlign: 'center', padding: '64px 24px',
      background: G.surface, border: `1px dashed ${displayColor}30`,
      borderRadius: 24, ...style,
    }}>
      <div style={{
        width: 72, height: 72, borderRadius: '50%',
        background: `${displayColor}12`, border: `1px solid ${displayColor}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Icon size={30} style={{ color: displayColor }} />
      </div>

      <h3 style={{ fontWeight: 800, fontSize: 18, color: G.text, marginBottom: 8, letterSpacing: '-0.02em' }}>
        {displayTitle}
      </h3>
      <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 24px' }}>
        {displayBody}
      </p>

      {cta && (
        cta.to ? (
          <Link to={cta.to} style={{ textDecoration: 'none' }}>
            <button style={{
              padding: '11px 24px', borderRadius: 12,
              background: G.grad, border: 'none', color: '#fff',
              fontWeight: 700, fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255,77,109,0.3)',
            }}>
              {cta.label}
            </button>
          </Link>
        ) : (
          <button onClick={cta.onClick} style={{
            padding: '11px 24px', borderRadius: 12,
            background: G.grad, border: 'none', color: '#fff',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(255,77,109,0.3)',
          }}>
            {cta.label}
          </button>
        )
      )}
    </div>
  );
}