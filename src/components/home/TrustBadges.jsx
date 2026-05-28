import React from 'react';
import { Lock, CheckCircle2, Zap, MessageCircle } from 'lucide-react';

export default function TrustBadges() {
  const BADGES = [
    {
      icon: '🔒',
      title: 'Secure Escrow',
      desc: 'All payments protected in escrow until delivery',
    },
    {
      icon: '✓',
      title: 'Verified Providers',
      desc: 'All backgrounds checked & credentials verified',
    },
    {
      icon: '⚡',
      title: 'Instant Payouts',
      desc: 'Bank transfer or crypto within 24 hours',
    },
    {
      icon: '📱',
      title: '24/7 Support',
      desc: 'Live chat, Discord community, email support',
    },
  ];

  return (
    <section style={{
      padding: '60px 40px',
      borderTop: '1px solid #1e2d4a',
      borderBottom: '1px solid #1e2d4a',
      position: 'relative',
      zIndex: 1,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '32px',
        textAlign: 'center',
      }}>
        {BADGES.map((badge, idx) => (
          <div key={idx}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{badge.icon}</div>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px', fontFamily: 'Inter' }}>
              {badge.title}
            </p>
            <p style={{ fontSize: '12px', color: '#8899bb', fontFamily: 'Inter' }}>
              {badge.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}