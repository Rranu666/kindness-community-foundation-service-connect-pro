import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Shield, FileText, ChevronDown, ArrowLeft } from 'lucide-react';

const G = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  surface: '#f7f7f5',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', muted: '#555555', faint: '#999999',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
  rose: '#FF4D6D', blue: '#4361EE', green: '#06D6A0',
};

const TERMS = [
  { title: '1. Acceptance of Terms', body: 'By accessing and using the Kindness Community Foundation Marketplace ("Platform"), you agree to these Terms & Conditions. If you do not agree, please refrain from using the Platform.' },
  { title: '2. User Responsibilities', body: 'All users (service seekers and providers) agree to provide accurate information, behave respectfully, and comply with applicable laws. Misuse of the platform will result in account termination.' },
  { title: '3. Service Provider Obligations', body: 'Service providers are responsible for delivering the services they list, maintaining professional standards, and honoring confirmed bookings. Providers must be qualified to offer the services they advertise.' },
  { title: '4. Platform Commission', body: 'The Platform charges a commission on each completed transaction to maintain operations and continue serving the community. Commission rates are clearly disclosed at the time of booking.' },
  { title: '5. Payments & Refunds', body: 'All payments are processed securely through the Platform. Refund requests must be submitted within 48 hours of service completion. Disputes will be reviewed on a case-by-case basis.' },
  { title: '6. Limitation of Liability', body: 'Kindness Community Foundation is a marketplace platform connecting seekers and providers. We are not directly responsible for the quality of services rendered by independent providers. We do, however, take complaints seriously and act on them.' },
  { title: '7. Changes to Terms', body: 'We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.' },
  { title: '8. Contact', body: 'For questions regarding these terms, please visit our Support page.' },
];

const PRIVACY = [
  { title: '1. Information We Collect', body: 'We collect information you provide when registering, booking services, or communicating on the Platform. This includes name, email, phone number, location, and payment details.' },
  { title: '2. How We Use Your Information', body: 'We use your data to: facilitate service bookings and payments; verify service provider credentials; send important updates and notifications; and improve our platform experience.' },
  { title: '3. Data Sharing', body: 'We do not sell your personal data. We share necessary details between seekers and providers only to fulfill bookings. We may share data with payment processors and legal authorities when required.' },
  { title: '4. Data Security', body: 'We use industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure. We encourage users to use strong passwords.' },
  { title: '5. Cookies', body: 'We use cookies to improve your experience on the Platform. You may disable cookies in your browser settings, though this may affect some functionality.' },
  { title: '6. Your Rights', body: 'You have the right to access, correct, or delete your personal data. To make a request, please contact us through the Support page.' },
  { title: "7. Children's Privacy", body: 'Our Platform is not intended for children under 13. We do not knowingly collect data from minors.' },
];

function AccordionSection({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div style={{ borderTop: `1px solid ${G.border}` }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: `1px solid ${G.border}`, overflow: 'hidden', transition: 'border-color 0.2s' }}>
          <button onClick={() => setOpen(open === i ? null : i)}
            style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12 }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: G.text }}>{item.title}</span>
            <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1px solid ${G.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0, background: open === i ? G.text : 'transparent', transform: open === i ? 'rotate(45deg)' : 'none' }}>
              <span style={{ color: open === i ? '#fff' : G.muted, fontSize: 18, lineHeight: 1 }}>+</span>
            </div>
          </button>
          {open === i && (
            <div style={{ padding: '0 0 18px' }}>
              <p style={{ fontSize: 14, lineHeight: 1.8, color: G.muted, fontWeight: 300 }}>{item.body}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function TermsAndPrivacy() {
  const [tab, setTab] = useState('terms');

  return (
    <div style={{ minHeight: '100vh', background: G.bg, color: G.text, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 32px 80px' }}>
        
        {/* Back button */}
        <Link to={createPageUrl('Home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: G.muted, textDecoration: 'none', fontSize: 13, marginBottom: 40, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = G.text; e.currentTarget.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = G.muted; e.currentTarget.style.transform = 'translateX(0)'; }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-1.5px', marginBottom: 10, color: G.text }}>
            Terms of Service &{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300, color: G.muted }}>Privacy Policy</span>
          </h1>
          <p style={{ fontSize: 14, color: G.muted }}>Service Connect Pro by Kindness Community Foundation — California Home Services Marketplace · Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: G.bg2, border: `1px solid ${G.border}`, borderRadius: 100, marginBottom: 40 }}>
          {[
            { k: 'terms', l: 'Terms & Conditions', icon: FileText },
            { k: 'privacy', l: 'Privacy Policy', icon: Shield },
          ].map(({ k, l, icon: Icon }) => (
            <button key={k} onClick={() => setTab(k)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 100, border: 'none', background: tab === k ? G.text : 'transparent', color: tab === k ? '#fff' : G.muted, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
              <Icon size={14} /> {l}
            </button>
          ))}
        </div>

        <AccordionSection items={tab === 'terms' ? TERMS : PRIVACY} />
      </div>
    </div>
  );
}