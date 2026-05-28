import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { THEME as L } from '@/lib/theme';
import { CheckCircle, Wind, Flame, Zap } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta } from '@/lib/seo';

const HVAC_IMG = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=600&q=80';

const SERVICES = [
  { icon: Wind, title: 'AC Repair & Install', desc: 'Professional air conditioning repair and installation services for year-round comfort.' },
  { icon: Flame, title: 'Heating Systems', desc: 'Furnace repair, maintenance, and heating system installation for cold months.' },
  { icon: Zap, title: 'HVAC Tune-ups', desc: 'Regular maintenance and inspections to keep your system running efficiently.' },
  { icon: CheckCircle, title: 'Duct Cleaning', desc: 'Complete air duct cleaning and sealing for improved air quality and efficiency.' },
];

const BENEFITS = [
  'Energy-efficient solutions',
  'Licensed HVAC technicians',
  '24/7 emergency service available',
  'Upfront pricing guaranteed',
  'Warranty on all services',
  'Same-day appointments available',
];

export default function HVACServices() {
  const pageMeta = generatePageMeta('hvac');

  return (
    <>
      <SeoHelmet
        title={pageMeta.title || 'HVAC Services California | AC & Heating Repair Experts Near You'}
        description={pageMeta.description || 'Get expert HVAC services in California. Book trusted technicians for AC repair, heating systems, duct cleaning & maintenance. Fast, affordable & reliable service.'}
        canonical={pageMeta.canonical}
      />

      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.green, display: 'inline-block' }} />
              HVAC Services
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 20 }}>
              Stay comfortable<br />year-round
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: L.text2, lineHeight: 1.8, maxWidth: 700, margin: '0 auto', fontWeight: 300 }}>
              Expert HVAC services in California. Trusted technicians for AC repair, heating, maintenance, and energy-efficient solutions.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{ background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                  Find HVAC Expert
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why HVAC Matters */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={HVAC_IMG} alt="HVAC system installation" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 20 }}>
                Perfect temperature,<br />all year long
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Whether it's scorching summer heat or freezing winter cold, our HVAC experts keep your home comfortable with efficient, reliable solutions.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Energy-efficient systems', 'Expert installation & repair', 'Preventive maintenance plans'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} style={{ color: L.green, flexShrink: 0 }} />
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
                Our HVAC Services
              </h2>
              <p style={{ fontSize: 16, color: L.text2, fontWeight: 300 }}>Heating, ventilation, and cooling solutions for every season</p>
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
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${L.green}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={24} style={{ color: L.green }} />
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
                Why choose our HVAC pros?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['Energy-efficient solutions', 'Licensed HVAC technicians', '24/7 emergency service available', 'Upfront pricing guaranteed', 'Warranty on all services', 'Same-day appointments available'].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} style={{ color: L.green, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%)',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: L.green, marginBottom: 10 }}>4.97★</div>
              <p style={{ fontSize: 14, color: L.text2, marginBottom: 20 }}>Average rating from 6,200+ verified reviews</p>
              <p style={{ fontSize: 13, color: L.text3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>98% recommend us</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: L.text, borderRadius: 16, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
              Need HVAC service?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 32px', fontWeight: 300 }}>
              Expert technicians ready for AC repair, heating maintenance, and emergency HVAC service in California.
            </p>
            <Link to={createPageUrl('Browse')}>
              <button style={{
                background: '#fff', color: L.text, border: 'none', borderRadius: 100,
                fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                Find HVAC Professionals
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}