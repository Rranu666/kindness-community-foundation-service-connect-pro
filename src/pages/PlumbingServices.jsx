import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { THEME as L } from '@/lib/theme';
import { CheckCircle, Droplet, Wrench, Zap } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta } from '@/lib/seo';

const PLUMBING_IMG = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=600&q=80';
const EMERGENCY_IMG = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80';

const SERVICES = [
  { icon: Wrench, title: 'Emergency Repair', desc: 'Fast response for leaking pipes, burst lines, and urgent plumbing issues 24/7.' },
  { icon: Droplet, title: 'Drain Cleaning', desc: 'Professional drain unclogging and cleaning for kitchens, bathrooms, and sewers.' },
  { icon: Zap, title: 'Water Heaters', desc: 'Repair, replacement, and installation of water heaters for optimal performance.' },
  { icon: CheckCircle, title: 'Pipe Repair', desc: 'Expert pipe repair and repiping services for residential and commercial properties.' },
];

const BENEFITS = [
  '24/7 emergency availability',
  'Licensed and insured professionals',
  'Upfront pricing with no surprises',
  'Fast response times (under 60 minutes average)',
  'Satisfaction guaranteed',
  'Real customer reviews and ratings',
];

export default function PlumbingServices() {
  const pageMeta = generatePageMeta('plumbing');

  return (
    <>
      <SeoHelmet
        title={pageMeta.title || 'Plumbing Services in California | Licensed Plumbers Near You'}
        description={pageMeta.description || 'Need a reliable plumber in California? Find licensed, verified plumbers for drain cleaning, water heater repair, pipe fixes & 24/7 emergency plumbing services near you.'}
        canonical={pageMeta.canonical}
      />

      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
        {/* Hero */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.blue, display: 'inline-block' }} />
              Plumbing Services
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.05, marginBottom: 20 }}>
              Trusted plumbers<br />in California
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: L.text2, lineHeight: 1.8, maxWidth: 700, margin: '0 auto', fontWeight: 300 }}>
              Professional plumbing services you can count on. Licensed, insured, and verified professionals ready to solve any plumbing challenge with speed and expertise.
            </p>
            <div style={{ marginTop: 32 }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{ background: L.text, color: '#fff', border: 'none', borderRadius: 100, fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                  Find a Plumber
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Plumbing Matters */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={PLUMBING_IMG} alt="Professional plumber" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 20 }}>
                Expert plumbing solutions<br />when you need them
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                From emergency repairs to preventive maintenance, our licensed plumbers are equipped to handle any challenge your home's plumbing system faces.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Licensed & insured professionals', 'Advanced diagnostic tools', 'Same-day service available'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} style={{ color: L.blue, flexShrink: 0 }} />
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
                Our Plumbing Services
              </h2>
              <p style={{ fontSize: 16, color: L.text2, fontWeight: 300 }}>Comprehensive solutions for all your plumbing needs</p>
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
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${L.blue}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={24} style={{ color: L.blue }} />
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
                Why choose our plumbers?
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {['24/7 emergency availability', 'Licensed and insured professionals', 'Upfront pricing with no surprises', 'Fast response times (under 60 minutes average)', 'Satisfaction guaranteed', 'Real customer reviews and ratings'].map((benefit, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <CheckCircle size={20} style={{ color: L.blue, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)',
              borderRadius: 16,
              padding: 40,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, fontWeight: 800, color: L.blue, marginBottom: 10 }}>4.97★</div>
              <p style={{ fontSize: 14, color: L.text2, marginBottom: 20 }}>Average rating from 6,200+ verified reviews</p>
              <p style={{ fontSize: 13, color: L.text3, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>98% recommend us</p>
            </div>
          </div>
        </section>



        {/* CTA */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: L.text, borderRadius: 16, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
              Need a plumber now?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 32px', fontWeight: 300 }}>
              Connect with licensed plumbers in California. Available 24/7 for emergencies and scheduled appointments.
            </p>
            <Link to={createPageUrl('Browse')}>
              <button style={{
                background: '#fff', color: L.text, border: 'none', borderRadius: 100,
                fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                Find Plumbers
              </button>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}