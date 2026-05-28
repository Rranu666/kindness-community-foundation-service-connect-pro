import React, { useState } from 'react';
import { ChevronDown, CheckCircle2, AlertCircle, Database, Shield, Bell, BarChart3 } from 'lucide-react';

export default function VoicePlatformRequirements() {
  const [expandedSection, setExpandedSection] = useState(null);

  const SECTIONS = [
    {
      id: 1,
      title: 'Backend Systems (Critical)',
      icon: '⚙️',
      items: [
        {
          name: 'Speech-to-Text Integration',
          desc: 'Google Cloud Speech-to-Text, Azure Speech, or Whisper API',
          status: 'critical',
        },
        {
          name: 'AI Request Analysis Engine',
          desc: 'NLP for intent extraction, service categorization, entity extraction',
          status: 'critical',
        },
        {
          name: 'Location & Geolocation Service',
          desc: 'GPS, reverse geocoding, provider proximity matching',
          status: 'critical',
        },
        {
          name: 'Provider Matching Algorithm',
          desc: 'Real-time availability, skill matching, price filtering, distance sorting',
          status: 'critical',
        },
      ],
    },
    {
      id: 2,
      title: 'Notification Systems',
      icon: '🔔',
      items: [
        {
          name: 'Push Notifications',
          desc: 'FCM for Android, APNs for iOS, Web push',
          status: 'high',
        },
        {
          name: 'Email Notifications',
          desc: 'SendGrid/AWS SES, automated templates, bounce handling',
          status: 'high',
        },
        {
          name: 'SMS & WhatsApp Integration',
          desc: 'Twilio/AWS SNS for urgent requests, WhatsApp Business API',
          status: 'high',
        },
        {
          name: 'Notification Preferences',
          desc: 'User-controlled notification center, opt-in/opt-out',
          status: 'medium',
        },
      ],
    },
    {
      id: 3,
      title: 'Security & Verification',
      icon: '🔐',
      items: [
        {
          name: 'Provider Verification System',
          desc: 'Background checks, license verification, KYC, fraud detection',
          status: 'critical',
        },
        {
          name: 'Payment & Escrow',
          desc: 'Stripe/PayPal, escrow management, dispute resolution, PCI compliance',
          status: 'critical',
        },
        {
          name: 'Data Privacy & Compliance',
          desc: 'GDPR, data encryption, consent management, audit logging',
          status: 'critical',
        },
        {
          name: 'Rate Limiting & Anti-Abuse',
          desc: 'Spam detection, bot prevention, DDoS protection',
          status: 'high',
        },
      ],
    },
    {
      id: 4,
      title: 'User Communication',
      icon: '💬',
      items: [
        {
          name: 'Request Clarification',
          desc: 'AI-powered follow-up questions, request review before broadcasting',
          status: 'high',
        },
        {
          name: 'In-App Chat System',
          desc: 'Message history, typing indicators, file sharing, read receipts',
          status: 'high',
        },
        {
          name: 'Voice Call Integration',
          desc: 'VOIP calling, call recording, call history',
          status: 'medium',
        },
        {
          name: 'Service Customization',
          desc: 'Custom pricing, variable request details, recurring services',
          status: 'medium',
        },
      ],
    },
    {
      id: 5,
      title: 'Analytics & Quality',
      icon: '📊',
      items: [
        {
          name: 'Request Lifecycle Tracking',
          desc: 'Status pipeline, event logging, conversion funnel analysis',
          status: 'high',
        },
        {
          name: 'Provider Performance Metrics',
          desc: 'Response time, acceptance rate, cancellation rate, earnings',
          status: 'high',
        },
        {
          name: 'Rating & Review System',
          desc: 'Photo evidence, structured ratings, fake review detection',
          status: 'high',
        },
        {
          name: 'Dispute Resolution',
          desc: 'Automated detection, mediation workflow, refund processing',
          status: 'high',
        },
      ],
    },
    {
      id: 6,
      title: 'Mobile & Infrastructure',
      icon: '📱',
      items: [
        {
          name: 'Native Mobile App Features',
          desc: 'Microphone permissions, background location, offline mode',
          status: 'high',
        },
        {
          name: 'Database Optimization',
          desc: 'Geo-spatial indexing, real-time sync, high-volume writes',
          status: 'high',
        },
        {
          name: 'Monitoring & Alerting',
          desc: 'System health monitoring, error tracking, log aggregation',
          status: 'high',
        },
        {
          name: 'Scalability Solutions',
          desc: 'Caching (Redis), search (Elasticsearch), API design',
          status: 'medium',
        },
      ],
    },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 20px' }}>
      <div style={{ marginBottom: '60px', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'Syne',
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 800,
          letterSpacing: '-2px',
          color: '#fff',
          marginBottom: '16px',
        }}>
          Voice Platform: Missing Critical Elements
        </h1>
        <p style={{ fontSize: '16px', color: '#8899bb', maxWidth: '600px', margin: '0 auto' }}>
          Complete checklist of backend systems, security, notifications, and infrastructure needed for production launch.
        </p>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '60px',
      }}>
        <div style={{
          background: 'rgba(255,60,172,0.1)',
          border: '1px solid rgba(255,60,172,0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#ff3cac', marginBottom: '4px' }}>14</p>
          <p style={{ fontSize: '12px', color: '#8899bb', textTransform: 'uppercase', letterSpacing: '1px' }}>Critical Items</p>
        </div>
        <div style={{
          background: 'rgba(255,140,0,0.1)',
          border: '1px solid rgba(255,140,0,0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#ff8c00', marginBottom: '4px' }}>20</p>
          <p style={{ fontSize: '12px', color: '#8899bb', textTransform: 'uppercase', letterSpacing: '1px' }}>High Priority</p>
        </div>
        <div style={{
          background: 'rgba(0,255,136,0.1)',
          border: '1px solid rgba(0,255,136,0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#00ff88', marginBottom: '4px' }}>8</p>
          <p style={{ fontSize: '12px', color: '#8899bb', textTransform: 'uppercase', letterSpacing: '1px' }}>Medium Priority</p>
        </div>
        <div style={{
          background: 'rgba(0,240,255,0.1)',
          border: '1px solid rgba(0,240,255,0.3)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
        }}>
          <p style={{ fontSize: '28px', fontWeight: 800, color: '#00f0ff', marginBottom: '4px' }}>6–12mo</p>
          <p style={{ fontSize: '12px', color: '#8899bb', textTransform: 'uppercase', letterSpacing: '1px' }}>Full Build</p>
        </div>
      </div>

      {/* Detailed Sections */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {SECTIONS.map(section => (
          <div
            key={section.id}
            style={{
              background: '#111827',
              border: '1px solid #253558',
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'all 0.3s',
            }}
          >
            <button
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
              style={{
                width: '100%',
                padding: '20px',
                background: 'transparent',
                border: 'none',
                textAlign: 'left',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(123,92,255,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '28px' }}>{section.icon}</span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '2px' }}>
                    {section.title}
                  </h3>
                  <p style={{ fontSize: '11px', color: '#8899bb' }}>
                    {section.items.length} components
                  </p>
                </div>
              </div>
              <span
                style={{
                  fontSize: '18px',
                  transition: 'transform 0.3s',
                  transform: expandedSection === section.id ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                ▼
              </span>
            </button>

            {expandedSection === section.id && (
              <div style={{
                borderTop: '1px solid #1e2d4a',
                padding: '20px',
                background: '#0d1428',
              }}>
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      paddingBottom: idx < section.items.length - 1 ? '16px' : 0,
                      marginBottom: idx < section.items.length - 1 ? '16px' : 0,
                      borderBottom: idx < section.items.length - 1 ? '1px solid #1e2d4a' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: item.status === 'critical' ? 'rgba(255,60,172,0.2)' : 'rgba(255,140,0,0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: item.status === 'critical' ? '#ff3cac' : item.status === 'high' ? '#ff8c00' : '#00ff88',
                        flexShrink: 0,
                      }}>
                        {item.status === 'critical' ? '!' : item.status === 'high' ? '○' : '✓'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                          {item.name}
                        </p>
                        <p style={{ fontSize: '12px', color: '#8899bb', lineHeight: 1.5 }}>
                          {item.desc}
                        </p>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '8px',
                            fontSize: '10px',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            background: item.status === 'critical' ? 'rgba(255,60,172,0.15)' : item.status === 'high' ? 'rgba(255,140,0,0.15)' : 'rgba(0,255,136,0.15)',
                            color: item.status === 'critical' ? '#ff3cac' : item.status === 'high' ? '#ff8c00' : '#00ff88',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timeline & Stack */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '24px',
        marginTop: '60px',
      }}>
        <div style={{
          background: '#111827',
          border: '1px solid #253558',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>⏱️</span> Implementation Timeline
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#ff3cac', textTransform: 'uppercase', marginBottom: '4px' }}>Phase 1: Launch (Critical)</p>
              <p style={{ fontSize: '11px', color: '#8899bb' }}>Speech recognition, AI analysis, location matching, verification, payments, ratings</p>
              <p style={{ fontSize: '10px', color: '#7b5cff', marginTop: '6px' }}>⏱️ 4–8 weeks</p>
            </div>
            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#ff8c00', textTransform: 'uppercase', marginBottom: '4px' }}>Phase 2: Growth (High)</p>
              <p style={{ fontSize: '11px', color: '#8899bb' }}>Email/SMS, in-app chat, dispute resolution, advanced analytics</p>
              <p style={{ fontSize: '10px', color: '#7b5cff', marginTop: '6px' }}>⏱️ 3–4 months</p>
            </div>
            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ fontSize: '12px', fontWeight: 600, color: '#00ff88', textTransform: 'uppercase', marginBottom: '4px' }}>Phase 3: Scale (Medium)</p>
              <p style={{ fontSize: '11px', color: '#8899bb' }}>WhatsApp, VOIP, recurring services, multi-language</p>
              <p style={{ fontSize: '10px', color: '#7b5cff', marginTop: '6px' }}>⏱️ 6+ months</p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#111827',
          border: '1px solid #253558',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🛠️</span> Recommended Stack
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px', fontFamily: 'Space Mono' }}>
            <div>
              <p style={{ color: '#00f0ff', fontWeight: 600, marginBottom: '2px' }}>Speech Recognition</p>
              <p style={{ color: '#8899bb' }}>Google Cloud Speech, Whisper API</p>
            </div>
            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ color: '#00f0ff', fontWeight: 600, marginBottom: '2px' }}>AI/NLP</p>
              <p style={{ color: '#8899bb' }}>OpenAI GPT, Claude, LangChain</p>
            </div>
            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ color: '#00f0ff', fontWeight: 600, marginBottom: '2px' }}>Payments</p>
              <p style={{ color: '#8899bb' }}>Stripe, PayPal, Razorpay</p>
            </div>
            <div style={{ borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ color: '#00f0ff', fontWeight: 600, marginBottom: '2px' }}>Notifications</p>
              <p style={{ color: '#8899bb' }}>Firebase, SendGrid, Twilio</p>
            </div>
          </div>
        </div>

        <div style={{
          background: '#111827',
          border: '1px solid #253558',
          borderRadius: '16px',
          padding: '24px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💰</span> Cost Estimates
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <p style={{ color: '#b0c4de' }}>Infrastructure & Servers</p>
              <p style={{ color: '#00ff88', fontWeight: 600 }}>$5–15K/mo</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <p style={{ color: '#b0c4de' }}>Speech & AI APIs</p>
              <p style={{ color: '#00ff88', fontWeight: 600 }}>$2–5K/mo</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <p style={{ color: '#b0c4de' }}>Notifications (FCM, Email, SMS)</p>
              <p style={{ color: '#00ff88', fontWeight: 600 }}>$1–3K/mo</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px' }}>
              <p style={{ color: '#b0c4de' }}>Payment Processing</p>
              <p style={{ color: '#00ff88', fontWeight: 600 }}>2–3% + fees</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '8px', borderTop: '1px solid #1e2d4a', paddingTop: '12px' }}>
              <p style={{ color: '#ff3cac', fontWeight: 600 }}>Total First Year (MVP)</p>
              <p style={{ color: '#ff3cac', fontWeight: 600 }}>$150–300K</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(0,240,255,0.1),rgba(123,92,255,0.1))',
        border: '1px solid #253558',
        borderRadius: '16px',
        padding: '32px',
        textAlign: 'center',
        marginTop: '60px',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
          Ready to build a scalable voice service platform?
        </h2>
        <p style={{ fontSize: '14px', color: '#8899bb', marginBottom: '24px' }}>
          Use this checklist to prioritize development and ensure you don't miss critical features.
        </p>
        <a
          href="#"
          style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
            color: '#fff',
            padding: '12px 28px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 700,
            textDecoration: 'none',
            transition: 'all 0.3s',
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 0 40px rgba(0,240,255,0.3)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = 'none';
          }}
        >
          Start Building →
        </a>
      </div>
    </div>
  );
}