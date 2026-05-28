import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { THEME as L } from '@/lib/theme';
import { CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta } from '@/lib/seo';

const EMERGENCY_IMG = 'https://images.unsplash.com/photo-1581092918070-90d5f1b8fdd5?w=600&q=80';

const SERVICES = [
  { icon: AlertCircle, title: 'Plumbing Emergencies', desc: 'Burst pipes, severe leaks, and water damage requiring immediate attention 24/7.' },
  { icon: AlertCircle, title: 'HVAC Breakdowns', desc: 'AC failure in summer or heating system breakdown in winter—we respond fast.' },
  { icon: AlertCircle, title: 'Water Damage Repair', desc: 'Rapid response to minimize damage and prevent mold growth and structural issues.' },
  { icon: AlertCircle, title: 'Electrical Repairs', desc: 'Safe emergency electrical service for power outages and circuit breaker issues.' },
];

const BENEFITS = [
  'Available 24/7/365',
  'Average 30-minute response',
  'Licensed emergency technicians',
  'No extra charge for nights/weekends',
  'Emergency diagnosis included',
  'Payment plans available',
];

export default function EmergencyRepairs() {
  const pageMeta = generatePageMeta('emergency');

  return (
    <>
      <SeoHelmet
        title={pageMeta.title || 'Emergency Repair Services California | 24/7 Home Repairs Near You'}
        description={pageMeta.description || 'Fast emergency repair services in California. Get 24/7 help for plumbing, HVAC, electrical & urgent home repairs. Trusted professionals ready when you need them.'}
        canonical={pageMeta.canonical}
      />

      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
              Emergency Service
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 20 }}>
              Help when you need<br />it most
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: L.text2, lineHeight: 1.8, maxWidth: 700, margin: '0 auto', fontWeight: 300 }}>
              24/7 emergency repair services in California. Rapid response from licensed professionals for urgent plumbing, HVAC, electrical, and water damage issues.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dc2626'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.transform = 'none'; }}>
                  Emergency Help Now
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Fast Response Matters */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={EMERGENCY_IMG} alt="Emergency repair technician" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 20 }}>
                Help when you need<br />it most
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Home emergencies don't wait for business hours. Our 24/7 response team is always ready to handle urgent repairs and minimize damage to your property.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['24/7/365 availability', 'Average 30-minute response', 'Licensed emergency technicians'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2 }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 16 }}>
                24/7 Emergency Response
              </h2>
              <p style={{ fontSize: 16, color: L.text2, fontWeight: 300 }}>Rapid help for any home emergency</p>
            </div>
            <div style={{ display: 'grid', gap: 24 }} className="md:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, i) => {
                const Icon = service.icon;
                return (
                  <div key={i} style={{
                    background: L.bg, border: `1px solid ${L.border}`, borderRadius: 16, padding: 28,
                    transition: 'all 0.3s ease',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = L.border2;
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = L.border;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={24} style={{ color: '#ef4444' }} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: L.text }}>{service.title}</h3>
                    <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, fontWeight: 300 }}>{service.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderTop: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 28 }}>
                Always there for you
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {BENEFITS.map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
            }}>
              <Clock size={48} style={{ color: '#ef4444', margin: '0 auto 16px' }} />
              <p style={{ fontSize: 16, color: L.text, fontWeight: 700, marginBottom: 8 }}>Always Available</p>
              <p style={{ fontSize: 14, color: L.text2 }}>24 hours a day, 7 days a week, 365 days a year</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: '#ef4444', borderRadius: 16, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
              Emergency help is minutes away
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 32px', fontWeight: 300 }}>
              Don't wait—call now for immediate assistance with any home emergency in California.
            </p>
            <Link to={createPageUrl('Browse')}>
              <button style={{
                background: '#fff', color: '#ef4444', border: 'none', borderRadius: 100,
                fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                Get Emergency Help
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}