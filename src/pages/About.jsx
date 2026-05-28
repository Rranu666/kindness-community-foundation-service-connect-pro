import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { THEME as L } from '@/lib/theme';
import { CheckCircle, Users, Zap, Heart, Globe, Shield } from 'lucide-react';
import SeoHelmet from '@/lib/SeoHelmet';
import { generatePageMeta } from '@/lib/seo';

const TEAM_IMG = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop';
const TECH_IMG = 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=800&auto=format&fit=crop';
const COMMUNITY_IMG = 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop';

const VALUES = [
  {
    icon: Shield,
    title: 'Verified & Trustworthy',
    desc: 'Every professional is licensed, insured, background-checked, and vetted for excellence.',
  },
  {
    icon: Users,
    title: 'Community Driven',
    desc: 'We build lasting connections between homeowners and professionals who genuinely care.',
  },
  {
    icon: Zap,
    title: 'Transparent & Fast',
    desc: 'Upfront pricing, instant booking, and 24-hour average response times across California.',
  },
  {
    icon: Heart,
    title: 'Purpose Guided',
    desc: "Part of KCF's mission to transform communities through compassion and technology.",
  },
  {
    icon: Globe,
    title: 'California Focused',
    desc: 'Deep local expertise across Los Angeles, San Diego, San Jose, SF, Sacramento & Orange County.',
  },
  {
    icon: CheckCircle,
    title: "100% Satisfaction",
    desc: "If you're not satisfied, we make it right. Your peace of mind is our priority.",
  },
];

const STATS = [
  { number: '2,400+', label: 'Verified Professionals' },
  { number: '6,200+', label: 'Customer Reviews' },
  { number: '4.97★', label: 'Average Rating' },
  { number: '98%', label: 'Recommend Us' },
];

export default function About() {
  const pageMeta = generatePageMeta('about');

  return (
    <>
      <SeoHelmet
        title={pageMeta.title}
        description={pageMeta.description}
        canonical={pageMeta.canonical}
      />

      <div style={{ background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>

        {/* ═══ HERO ═══ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.green, display: 'inline-block' }} />
              About Service Connect Pro
            </div>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 700, letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 20 }}>
              More than a marketplace.
              <br />
              <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>A community revolution.</span>
            </h1>
            <p style={{ fontSize: 'clamp(13px, 2vw, 18px)', color: L.text2, lineHeight: 1.8, maxWidth: 700, margin: '0 auto', fontWeight: 300 }}>
              Service Connect Pro by Kindness Community Foundation transforms how California homeowners connect with verified professionals. We're building an ecosystem powered by transparency, trust, and genuine human values.
            </p>
          </div>
        </section>

        {/* ═══ MISSION ═══ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 10, color: L.text3, marginBottom: 16, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: L.amber }} />
                Our Mission
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
                Redefining trust in home services
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Service Connect Pro is built on a simple belief: homeowners deserve professionals they can trust, and professionals deserve a platform that respects their expertise.
              </p>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
                We're not just connecting people—we're building a technology-driven ecosystem where verified professionals deliver trusted services, customers experience transparency and reliability, and communities grow through meaningful connections.
              </p>
              <Link to={createPageUrl('Browse')}>
                <button style={{
                  background: L.text, color: '#fff', border: 'none', borderRadius: 100,
                  fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = L.text; e.currentTarget.style.transform = 'none'; }}>
                  Find a Professional →
                </button>
              </Link>
            </div>
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={TEAM_IMG} alt="Verified professionals team" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
          </div>
        </section>

        {/* ═══ STATS ═══ */}
        <section style={{ padding: 'clamp(48px, 8vw, 80px) 32px', background: L.bg2, borderTop: `1px solid ${L.border}`, borderBottom: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
              <h2 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 12 }}>
                Trusted by thousands
              </h2>
              <p style={{ fontSize: 16, color: L.text2, fontWeight: 300 }}>Real numbers from real California homeowners</p>
            </div>
            <div style={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', background: L.border, borderRadius: 12, overflow: 'hidden' }}>
              {STATS.map((stat, i) => (
                <div key={i} style={{ background: L.bg, padding: 'clamp(24px, 3vw, 40px)', textAlign: 'center' }}>
                  <div style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.04em', marginBottom: 8, color: L.text }}>{stat.number}</div>
                  <div style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ VALUES ═══ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 'clamp(40px, 6vw, 60px)' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 10, color: L.text3, marginBottom: 16, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: L.blue }} />
                Our Values
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 16 }}>
                What we stand for
              </h2>
              <p style={{ fontSize: 16, color: L.text2, maxWidth: 600, margin: '0 auto', fontWeight: 300 }}>
                Six core values guide every decision we make
              </p>
            </div>
            <div style={{ display: 'grid', gap: 24 }} className="md:grid-cols-2 lg:grid-cols-3">
              {VALUES.map((value, i) => {
                const Icon = value.icon;
                return (
                  <div key={i} style={{
                    background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 16, padding: 28,
                    transition: 'all 0.3s ease',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = L.border2;
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = L.border;
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: `${L.blue}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                      <Icon size={24} style={{ color: L.blue }} />
                    </div>
                    <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: L.text }}>{value.title}</h3>
                    <p style={{ fontSize: 14, color: L.text2, lineHeight: 1.6, fontWeight: 300 }}>{value.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ KCF CONNECTION ═══ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px', background: L.bg2, borderTop: `1px solid ${L.border}` }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gap: 'clamp(40px, 6vw, 60px)', alignItems: 'center' }} className="lg:grid-cols-2">
            <div style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
              <img src={COMMUNITY_IMG} alt="Community connection" width="500" height="400" style={{ width: '100%', height: 'auto', display: 'block' }} />
            </div>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 10, color: L.text3, marginBottom: 16, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
                <span style={{ width: 4, height: 4, borderRadius: '50%', background: L.green }} />
                Global Vision
              </div>
              <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.1, marginBottom: 20 }}>
                Part of something bigger
              </h2>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                Service Connect Pro is proudly backed by Kindness Community Foundation (KCF LLC), a global initiative dedicated to transforming how communities connect and thrive.
              </p>
              <p style={{ fontSize: 16, color: L.text2, lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
                By combining innovation with human values, we're not just solving a problem—we're building a movement where technology serves humanity, and business becomes a force for good.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Technology-driven ecosystem', 'Community-first approach', 'Purpose-guided growth'].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <CheckCircle size={18} style={{ color: L.green, flexShrink: 0 }} />
                    <span style={{ fontSize: 15, color: L.text2, fontWeight: 300 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section style={{ padding: 'clamp(60px, 8vw, 100px) 32px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', background: L.text, borderRadius: 16, padding: 'clamp(40px, 6vw, 80px)', textAlign: 'center' }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 700, letterSpacing: '-1.5px', color: '#fff', marginBottom: 16 }}>
              Ready to experience the difference?
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8, maxWidth: 600, margin: '0 auto 32px', fontWeight: 300 }}>
              Join thousands of California homeowners who trust Service Connect Pro for verified, transparent, and compassionate home services.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to={createPageUrl('Browse')}>
                <button style={{
                  background: '#fff', color: L.text, border: 'none', borderRadius: 100,
                  fontWeight: 600, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#f0efed'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'none'; }}>
                  Browse Professionals
                </button>
              </Link>
              <Link to={createPageUrl('ProviderSignup')}>
                <button style={{
                  background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 100,
                  fontWeight: 500, fontSize: 15, padding: '14px 32px', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}>
                  Join as Professional
                </button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}