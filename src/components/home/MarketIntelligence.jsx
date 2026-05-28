import React from 'react';
import { TrendingUp, Zap } from 'lucide-react';

export default function MarketIntelligence() {
  const TRENDS = [
    {
      icon: '🎬',
      growth: '+329%',
      title: 'AI Video Generation',
      desc: 'Sora, Runway Gen-3, Kling AI. Shortest learning curve, highest immediate demand.',
      rate: '$180–$450/hr',
      jobs: '5,200 jobs/mo',
      color: 'rgba(255,60,172,0.3)',
      textColor: '#ff3cac',
    },
    {
      icon: '⚙️',
      growth: '+178%',
      title: 'AI Integration & Automation',
      desc: 'n8n, Make, Zapier + APIs. Every business needs automation expertise.',
      rate: '$120–$350/hr',
      jobs: '3,800 jobs/mo',
      color: 'rgba(123,92,255,0.3)',
      textColor: '#7b5cff',
    },
    {
      icon: '📊',
      growth: '+154%',
      title: 'AI Data Annotation',
      desc: 'Training data labeling. Foundational for every AI model company.',
      rate: '$35–$85/hr',
      jobs: '7,600 jobs/mo',
      color: 'rgba(0,255,136,0.3)',
      textColor: '#00ff88',
    },
  ];

  return (
    <section style={{ padding: '100px 40px', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#00f0ff', marginBottom: '16px', display: 'block' }}>
          // ai market trends
        </span>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: '16px' }}>
          Fastest-Growing AI Skills
          <span style={{ color: '#00ff88', marginLeft: '12px' }}>+329% YoY</span>
        </h2>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.5)', fontWeight: 300, maxWidth: '500px', margin: '0 auto', lineHeight: 1.7 }}>
          Based on Upwork 2026 In-Demand Skills Report. Highest growth. Highest demand. Highest pay.
        </p>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
        {TRENDS.map(trend => (
          <div
            key={trend.title}
            style={{
              background: '#111827',
              border: '1px solid #1e2d4a',
              borderRadius: '16px',
              padding: '32px',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#7b5cff';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.5), 0 0 60px rgba(123,92,255,0.2)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#1e2d4a';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: '3px',
              background: trend.color,
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <span style={{ fontFamily: 'Syne', fontSize: '32px', fontWeight: 800, color: '#00f0ff' }}>
                {trend.growth}
              </span>
              <span style={{ fontSize: '48px' }}>{trend.icon}</span>
            </div>

            <h3 style={{ fontFamily: 'Syne', fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {trend.title}
            </h3>

            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', lineHeight: 1.6 }}>
              {trend.desc}
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <span style={{
                fontSize: '11px',
                padding: '4px 12px',
                background: trend.color,
                border: `1px solid ${trend.textColor}40`,
                borderRadius: '100px',
                color: trend.textColor,
                fontFamily: 'Space Mono',
              }}>
                {trend.rate}
              </span>
              <span style={{
                fontSize: '11px',
                padding: '4px 12px',
                background: 'rgba(0,255,136,0.15)',
                border: '1px solid rgba(0,255,136,0.3)',
                borderRadius: '100px',
                color: '#00ff88',
                fontFamily: 'Space Mono',
              }}>
                {trend.jobs}
              </span>
            </div>

            <button style={{
              width: '100%',
              background: 'transparent',
              border: `1px solid ${trend.textColor}`,
              color: trend.textColor,
              padding: '8px 18px',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter',
            }}
            onMouseEnter={e => {
              e.target.style.background = trend.textColor;
              e.target.style.color = '#000';
            }}
            onMouseLeave={e => {
              e.target.style.background = 'transparent';
              e.target.style.color = trend.textColor;
            }}
            >
              View Providers →
            </button>
          </div>
        ))}
      </div>

      <div style={{
        background: '#0d1428',
        border: '1px solid #1e2d4a',
        borderRadius: '16px',
        padding: '32px',
        marginTop: '48px',
        maxWidth: '1100px',
        marginLeft: 'auto',
        marginRight: 'auto',
        textAlign: 'center',
      }}>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px' }}>
          💡 <strong>Pro tip:</strong> Providers combining 3+ of these skills earn{' '}
          <span style={{ color: '#00f0ff' }}>2.8x more</span> than specialists.
        </p>
      </div>
    </section>
  );
}