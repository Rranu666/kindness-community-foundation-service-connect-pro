import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { MessageCircle, Mail, Phone, ChevronDown, Zap, ArrowLeft, MapPin, Search, TrendingUp } from 'lucide-react';
import ChatAssistant from '@/components/ai/ChatAssistant';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', green: '#06D6A0', blue: '#4361EE', amber: '#FF8C42',
};

const FAQS = [
  { q: 'How do I book a home service in California?', a: "It takes under 60 seconds. Search for your service (plumbing, HVAC, cleaning, emergency repair, or recurring maintenance), select a verified professional near you, choose your preferred date and time, and complete secure checkout. You'll receive an instant booking confirmation." },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit cards, debit cards, digital wallets (Apple Pay, Google Pay), and in-app wallet balance. All payments are secured and processed before work begins — no hidden fees or surprise charges.' },
  { q: 'Can I cancel or reschedule my booking?', a: 'Yes. You can cancel or reschedule up to 24 hours before your scheduled service at no cost. Cancellations within 24 hours may incur a small fee. Contact our support team if you need an exception.' },
  { q: 'How do refunds work if I\'m not satisfied?', a: 'Your satisfaction is 100% guaranteed. If the work doesn\'t meet your expectations, we\'ll send another licensed professional at no additional cost, or issue a full refund within 5–7 business days to your original payment method.' },
  { q: 'How do I join as a service provider in California?', a: 'Click "For Providers" in the navigation menu to start your application. You\'ll submit your business details, California contractor license, government ID, and insurance documents. Our team verifies all applications within 1–2 business days.' },
  { q: 'Are all service providers licensed and background-checked?', a: 'Absolutely. Every professional on our platform undergoes a thorough verification process: California license check, criminal background screening, identity verification, and insurance confirmation — all before their very first job.' },
  { q: 'Which cities in California do you serve?', a: 'We currently serve Los Angeles, San Diego, San Jose, San Francisco, Sacramento, Orange County, Fresno, Irvine, Oakland, and surrounding California communities. Coverage is expanding continuously.' },
  { q: 'How quickly can I get a professional to my home?', a: 'Most requests are matched within 30–60 minutes. For emergency plumbing and HVAC repairs, we aim to have a licensed technician on-site within 2–4 hours. Same-day cleaning bookings are available in most California cities.' },
];

const CONTACTS = [
  { icon: Mail, title: 'Email Support', detail: 'contact@kindnesscommunityfoundation.com', href: 'mailto:contact@kindnesscommunityfoundation.com', color: L.blue, cta: 'Send Email' },
  { icon: Phone, title: 'Call Us', detail: '(949) 996-3051', href: 'tel:+19499963051', color: L.amber, cta: 'Call Now' },
  { icon: MessageCircle, title: 'AI Assistant', detail: 'Available 24/7 for instant help', href: null, color: L.accent, cta: 'Chat Below' },
];

function FaqItem({ item, isOpen, onToggle, index, category }) {
  const categoryColors = {
    booking: { bg: '#4361EE', light: '#4361EE10' },
    payment: { bg: '#06D6A0', light: '#06D6A010' },
    provider: { bg: '#FF8C42', light: '#FF8C4210' },
    general: { bg: '#FF4D6D', light: '#FF4D6D10' },
  };
  
  const colors = categoryColors[category] || categoryColors.general;

  return (
    <div style={{ 
      background: isOpen ? L.bg2 : 'transparent',
      border: `1px solid ${isOpen ? L.border : 'transparent'}`,
      borderRadius: 14,
      padding: isOpen ? 20 : 16,
      marginBottom: 12,
      transition: 'all 0.3s ease',
      cursor: 'pointer'
    }}>
      <button onClick={onToggle}
        style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 32, height: 32, borderRadius: 10, background: colors.light, border: `1px solid ${colors.bg}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: colors.bg }}>?</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: L.text, lineHeight: 1.4, display: 'block' }}>{item.q}</span>
        </div>
        <div style={{ width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s', flexShrink: 0, color: L.text2, transform: isOpen ? 'rotate(180deg)' : 'none', marginTop: 2 }}>
          <ChevronDown size={16} />
        </div>
      </button>
      {isOpen && (
        <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${L.border}` }}>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: L.text2, fontWeight: 300 }}>{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function Support() {
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedContext, setSelectedContext] = useState('general_help');
  const [faqCategory, setFaqCategory] = useState('all');

  const faqsByCategory = {
    booking: FAQS.slice(0, 3),
    payment: FAQS.slice(3, 5),
    provider: FAQS.slice(5, 7),
    general: FAQS.slice(7, 8),
  };

  const displayFaqs = faqCategory === 'all' ? FAQS : faqsByCategory[faqCategory] || [];

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Back button */}
      <div style={{ padding: '32px 32px 0', maxWidth: 1000, margin: '0 auto' }}>
        <Link to={createPageUrl('Home')} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: L.text2, textDecoration: 'none', fontSize: 13, transition: 'all 0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.color = L.text; e.currentTarget.style.transform = 'translateX(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = L.text2; e.currentTarget.style.transform = 'translateX(0)'; }}>
          <ArrowLeft size={14} /> Back to Home
        </Link>
      </div>

      {/* Hero */}
      <div style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: 'clamp(60px,8vw,100px) 32px 60px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', border: `1px solid ${L.border2}`, borderRadius: 100, fontSize: 11, color: L.text3, marginBottom: 20, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Support Center
        </div>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1.05, color: L.text, marginBottom: 14 }}>
          How can we <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>help you?</span>
        </h1>
        <p style={{ fontSize: 16, color: L.text2, maxWidth: 500, margin: '0 auto', fontWeight: 300, lineHeight: 1.7 }}>
          Get instant answers about booking, payments, refunds, and joining as a California service provider.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 32px' }}>

        {/* Location Map Section */}
        <div style={{ marginBottom: 80 }}>
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 12, color: L.text }}>
              <MapPin size={28} style={{ display: 'inline', marginRight: 8, color: L.accent }} /> Serving California
            </h2>
            <p style={{ fontSize: 16, color: L.text2, maxWidth: 600 }}>We're based in Newport Beach with coverage across California's major cities and growing.</p>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'stretch' }}>
            {/* Map */}
            <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20, overflow: 'hidden', minHeight: 300 }}>
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3325.5829471186453!2d-117.88293!3d33.61252!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80dcdb8b7c0a0001%3A0x123456789!2sNewport%20Beach%2C%20CA!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%" height="300" style={{ border: 'none' }} allowFullScreen="" loading="lazy" />
            </div>

            {/* Cities List */}
            <div>
              <div style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20, padding: 24 }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: L.text }}>Major Service Areas</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Sacramento', 'Orange County', 'Fresno', 'Irvine'].map(city => (
                    <div key={city} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: L.bg3, borderRadius: 10, fontSize: 14, color: L.text2 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: L.green }}></span>
                      {city}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Methods */}
        <div style={{ marginBottom: 80 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 28, color: L.text }}>Get in Touch</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, maxWidth: 500 }}>
            {CONTACTS.filter(c => c.title !== 'AI Assistant').map(({ icon: Icon, title, detail, href, color, cta }) => (
              <div key={title} style={{ background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 20, padding: '32px 24px', textAlign: 'center', transition: 'all 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: `${color}12`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <Icon size={24} style={{ color }} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: L.text }}>{title}</h3>
                <p style={{ fontSize: 14, color: L.text3, marginBottom: 20, lineHeight: 1.5 }}>{detail}</p>
                {href ? (
                  <a href={href}
                    style={{ display: 'inline-block', padding: '10px 24px', borderRadius: 100, background: color, color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                    {cta}
                  </a>
                ) : (
                  <button style={{ padding: '10px 24px', borderRadius: 100, background: color, border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
                    onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                    {cta}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Interactive FAQs */}
        <div>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.4rem)', fontWeight: 700, marginBottom: 28, color: L.text }}>Frequently Asked Questions</h2>
          
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap' }}>
            {[{ k: 'all', l: 'All Topics' }, { k: 'booking', l: 'Booking' }, { k: 'payment', l: 'Payments' }, { k: 'provider', l: 'Providers' }, { k: 'general', l: 'General' }].map(cat => (
              <button key={cat.k} onClick={() => { setFaqCategory(cat.k); setOpenFaq(null); }}
                style={{ padding: '10px 18px', borderRadius: 100, border: `1px solid ${faqCategory === cat.k ? L.text : L.border2}`, background: faqCategory === cat.k ? L.text : 'transparent', color: faqCategory === cat.k ? '#fff' : L.text2, fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
                {cat.l}
              </button>
            ))}
          </div>

          {/* FAQ Items - Enhanced */}
          <div style={{ display: 'grid', gap: 12 }}>
            {displayFaqs.map((item, i) => {
              const categoryMap = { 0: 'booking', 1: 'booking', 2: 'booking', 3: 'payment', 4: 'payment', 5: 'provider', 6: 'provider', 7: 'general' };
              return (
                <FaqItem 
                  key={i} 
                  item={item} 
                  index={i} 
                  isOpen={openFaq === i} 
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                  category={categoryMap[i] || 'general'}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}