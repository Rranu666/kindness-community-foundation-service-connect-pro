import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [expandedId, setExpandedId] = useState(null);

  const FAQS = [
    {
      id: 1,
      q: 'How does the escrow & payment protection work?',
      a: 'Funds are held in secure escrow until the buyer confirms delivery. Only then do providers get paid. If there\'s a dispute, our team arbitrates. Zero risk for both sides.',
    },
    {
      id: 2,
      q: 'What\'s the platform fee for providers?',
      a: '10% platform fee on all earnings. No listing fees. Instant payouts to your bank or crypto wallet. That\'s it.',
    },
    {
      id: 3,
      q: 'I\'m new to AI — can I still earn?',
      a: 'Absolutely. Start with lower-barrier skills like data annotation ($35–85/hr) or use our Provider Academy to upskill in high-demand areas. Many top providers started as beginners 6 months ago.',
    },
    {
      id: 4,
      q: 'How long does it take to get your first order?',
      a: 'Providers typically get their first order within 2–7 days of listing. High-quality profiles and competitive pricing attract buyers faster. Our algorithm prioritizes active providers.',
    },
    {
      id: 5,
      q: 'Is my intellectual property (IP) protected?',
      a: 'You own your work. Buyers purchase deliverables, not exclusive rights. You can reuse templates, frameworks, and code across projects. All contracts are buyer-specific.',
    },
  ];

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <section style={{ padding: '100px 40px', position: 'relative', zIndex: 1, background: 'linear-gradient(to bottom, transparent, #080d1a, transparent)' }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <span style={{ fontFamily: 'Space Mono', fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#00f0ff', marginBottom: '16px', display: 'block' }}>
          // questions?
        </span>
        <h2 style={{ fontFamily: 'Syne', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, letterSpacing: '-2px', color: '#fff', lineHeight: 1, marginBottom: '16px' }}>
          Frequently Asked Questions
        </h2>
      </div>

      <div style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {FAQS.map(faq => (
          <div
            key={faq.id}
            style={{
              background: '#111827',
              border: '1px solid #1e2d4a',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}
            onMouseEnter={e => {
              if (expandedId !== faq.id) {
                e.currentTarget.style.borderColor = '#253558';
              }
            }}
            onMouseLeave={e => {
              if (expandedId !== faq.id) {
                e.currentTarget.style.borderColor = '#1e2d4a';
              }
            }}
          >
            <button
              onClick={() => toggleFAQ(faq.id)}
              style={{
                width: '100%',
                padding: '20px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontFamily: 'Inter',
              }}
            >
              <span>{faq.q}</span>
              <span
                style={{
                  fontSize: '20px',
                  transition: 'transform 0.3s',
                  transform: expandedId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>

            {expandedId === faq.id && (
              <div style={{
                padding: '0 20px 20px',
                color: 'rgba(255,255,255,0.6)',
                fontSize: '14px',
                lineHeight: 1.6,
                borderTop: '1px solid #1e2d4a',
                animation: 'fadeIn 0.3s ease-in',
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}