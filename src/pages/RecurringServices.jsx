import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { THEME as L } from '@/lib/theme';
import { CheckCircle, Calendar, TrendingUp, Wrench } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta } from '@/lib/seo';

const RECURRING_IMG = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80';

const SERVICES = [
  { icon: Calendar, title: 'Regular Cleaning', desc: 'Weekly or monthly home cleaning to keep your space fresh and organized.' },
  { icon: Wrench, title: 'HVAC Maintenance', desc: 'Seasonal tune-ups and inspections to ensure optimal efficiency year-round.' },
  { icon: CheckCircle, title: 'Plumbing Checks', desc: 'Routine inspections and preventive maintenance to avoid costly repairs.' },
  { icon: TrendingUp, title: 'Home Upkeep', desc: 'Ongoing maintenance plans customized to your home\'s specific needs.' },
];

const BENEFITS = [
  'Consistent, quality service',
  'Flexible scheduling options',
  'Loyalty discounts available',
  'One trusted professional',
  'Emergency priority access',
  'Preventive cost savings',
];

export default function RecurringServices() {
  const pageMeta = generatePageMeta('recurring');

  return (
    <>
      <SeoHelmet
        title={pageMeta.title || 'Recurring Home Services California | Maintenance Plans Near You'}
        description={pageMeta.description || 'Schedule recurring home services in California. From cleaning to HVAC & plumbing maintenance, keep your home running smoothly with trusted professionals.'}
        canonical={pageMeta.canonical}
      />

      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
              Recurring Services
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 20 }}>
              Maintenance made<br />simple
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: L.text2, lineHeight: 1.8, maxWidth: 700, margin: '0 auto', fontWeight: 300 }}>
              Set it and forget it. Recurring home services in California keep your property in perfect condition with scheduled, trusted professionals.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{ background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                  Schedule Service
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Recurring Service */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={RECURRING_IMG} alt="Recurring maintenance service" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 20 }}>
                Maintenance made<br />simple
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Stop worrying about when to schedule that next cleaning or maintenance. Our recurring plans keep everything running smoothly and cost you less.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Consistent, quality service', 'Loyal customer discounts', 'One trusted professional'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} style={{ color: '#8b5cf6', flexShrink: 0 }} />
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
                Recurring Service Options
              </h2>
              <p style={{ fontSize: 16, color: L.text2, fontWeight: 300 }}>Keep your home running smoothly with scheduled maintenance</p>
            </div>
            <div style={{ display: 'grid', gap: 24 }} className="md:grid-cols-2 lg:grid-cols-4">
              {SERVICES.map((service, i) => {
                const Icon = service.icon;
                return (
                  <div key={i} style={{
                    background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: 28,
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
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={24} style={{ color: '#8b5cf6' }} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: L.text }}>{service.title}</h3>
                    <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, fontWeight: 300 }}>{service.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 28 }}>
                Benefits of recurring plans
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Consistent, quality service', 'Flexible scheduling options', 'Loyalty discounts available', 'One trusted professional', 'Emergency priority access', 'Preventive cost savings'].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #ede9fe 0%, #faf5ff 100%)',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: '#8b5cf6', marginBottom: 10 }}>Save 20%</div>
              <p style={{ fontSize: 14, color: L.text2, marginBottom: 20 }}>With recurring service plans vs. one-time bookings</p>
              <p style={{ fontSize: 13, color: L.text3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>Cancel anytime, no contracts</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: L.text, borderRadius: 16, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
              Start your recurring plan today
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 32px', fontWeight: 300 }}>
              Schedule regular maintenance and save with recurring home services from trusted California professionals.
            </p>
            <Link to={createPageUrl('Browse')}>
              <button style={{
                background: '#fff', color: L.text, border: 'none', borderRadius: 100,
                fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                Browse Recurring Services
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}