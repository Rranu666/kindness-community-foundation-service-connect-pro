import React, { useState } from 'react';
import { Clock, CheckCircle2, AlertCircle, MessageSquare, Phone, DollarSign, MapPin } from 'lucide-react';

export default function RequestTracker() {
  const [selectedResponse, setSelectedResponse] = useState(null);

  const REQUEST = {
    id: 'REQ-2026-3894',
    status: 'active',
    createdAt: '2 minutes ago',
    service: 'Drain Clearing - Urgent',
    location: 'Downtown District, Downtown Ave',
  };

  const PROVIDER_RESPONSES = [
    {
      id: 1,
      provider: 'QuickFix Plumbing',
      responder: 'Raj K.',
      avatar: 'QF',
      rating: 4.98,
      responseTime: '1 min ago',
      quote: '$65',
      eta: '10-15 minutes',
      status: 'accepted',
      message: 'We can be there in 10-15 minutes. Our technician Rohan is available now.',
      availability: 'Available Now',
      contact: '+91-9876543210',
      actions: ['Accept Quote', 'Chat', 'Call'],
    },
    {
      id: 2,
      provider: 'DrainPro Services',
      responder: 'Sarah M.',
      avatar: 'DP',
      rating: 4.85,
      responseTime: '45 sec ago',
      quote: '$55–75',
      eta: '15-20 minutes',
      status: 'pending',
      message: 'Interested! Can you provide more details about the drain issue?',
      availability: 'Available Now',
      contact: '+91-9876543211',
      actions: ['Accept Quote', 'Chat', 'Call'],
    },
    {
      id: 3,
      provider: 'Expert Plumbing Hub',
      responder: 'Marcus T.',
      avatar: 'EPH',
      rating: 4.92,
      responseTime: 'Just now',
      quote: '$70–100',
      eta: '20-25 minutes',
      status: 'pending',
      message: 'Got your request. We specialize in complex drain issues.',
      availability: 'Available in 5 min',
      contact: '+91-9876543212',
      actions: ['Accept Quote', 'Chat', 'Call'],
    },
  ];

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Request Status Header */}
      <div style={{
        background: '#111827',
        border: '1px solid #253558',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '40px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          alignItems: 'start',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
              {REQUEST.service}
            </h2>
            <p style={{ fontSize: '13px', color: '#8899bb', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin className="w-3 h-3" /> {REQUEST.location}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              display: 'inline-block',
              background: '#00ff8820',
              color: '#00ff88',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontFamily: 'Space Mono',
            }}>
              🟢 Active
            </span>
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          paddingTop: '24px',
          borderTop: '1px solid #1e2d4a',
        }}>
          <div>
            <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>Request ID</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#00f0ff', fontFamily: 'Space Mono' }}>{REQUEST.id}</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>Posted</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#b0c4de' }}>{REQUEST.createdAt}</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>Responses</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#00ff88' }}>{PROVIDER_RESPONSES.length} providers</p>
          </div>
          <div>
            <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '6px' }}>Best Quote</p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#ff3cac' }}>$55–75</p>
          </div>
        </div>
      </div>

      {/* Provider Responses */}
      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>
        {PROVIDER_RESPONSES.length} Providers Responding
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
        {PROVIDER_RESPONSES.map(response => (
          <div
            key={response.id}
            style={{
              background: '#111827',
              border: selectedResponse?.id === response.id ? '2px solid #00f0ff' : '1px solid #253558',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
            }}
            onClick={() => setSelectedResponse(response)}
            onMouseEnter={e => {
              if (selectedResponse?.id !== response.id) {
                e.currentTarget.style.borderColor = '#7b5cff';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
              }
            }}
            onMouseLeave={e => {
              if (selectedResponse?.id !== response.id) {
                e.currentTarget.style.borderColor = '#253558';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Response Time Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              fontSize: '11px',
              color: '#8899bb',
              fontFamily: 'Space Mono',
            }}>
              {response.responseTime}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: '20px', alignItems: 'start' }}>
              {/* Provider Avatar */}
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 700,
                fontSize: '16px',
              }}>
                {response.avatar}
              </div>

              {/* Provider Info & Message */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fff' }}>
                    {response.provider}
                  </h4>
                  <span style={{ fontSize: '11px', color: '#ff8c00' }}>⭐ {response.rating}</span>
                </div>
                <p style={{ fontSize: '12px', color: '#8899bb', marginBottom: '12px' }}>
                  Contacted by: {response.responder}
                </p>
                <p style={{ fontSize: '13px', color: '#b0c4de', lineHeight: 1.5, marginBottom: '12px', fontStyle: 'italic' }}>
                  "{response.message}"
                </p>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>Quote</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#ff3cac' }}>{response.quote}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>ETA</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#00ff88' }}>{response.eta}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>Availability</p>
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#00f0ff' }}>{response.availability}</p>
                  </div>
                </div>
              </div>

              {/* Quote Badge */}
              <div style={{
                background: response.status === 'accepted' ? '#00ff8820' : '#7b5cff20',
                border: `1px solid ${response.status === 'accepted' ? '#00ff88' : '#7b5cff'}`,
                padding: '12px 16px',
                borderRadius: '8px',
                textAlign: 'center',
                minWidth: '120px',
              }}>
                <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>
                  {response.status === 'accepted' ? '✓ Accepted' : 'Pending'}
                </p>
                <p style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: response.status === 'accepted' ? '#00ff88' : '#7b5cff',
                  fontFamily: 'Syne',
                }}>
                  {response.quote}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            {selectedResponse?.id === response.id && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                marginTop: '20px',
                paddingTop: '20px',
                borderTop: '1px solid #1e2d4a',
              }}>
                <button style={{
                  background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
                  border: 'none',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                }}>
                  Accept Quote
                </button>
                <button style={{
                  background: 'transparent',
                  border: '1px solid #00f0ff',
                  color: '#00f0ff',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <MessageSquare className="w-3 h-3" /> Chat
                </button>
                <button style={{
                  background: 'transparent',
                  border: '1px solid #00ff88',
                  color: '#00ff88',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'Inter',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                }}>
                  <Phone className="w-3 h-3" /> Call
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}