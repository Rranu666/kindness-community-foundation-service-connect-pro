import React, { useState } from 'react';
import { MapPin, Star, Clock, CheckCircle2, MessageSquare, Phone } from 'lucide-react';

export default function ProviderMatchingEngine({ serviceRequest }) {
  const [selectedProviders, setSelectedProviders] = useState([]);
  const [broadcastSent, setBroadcastSent] = useState(false);

  // Simulated matched providers
  const MATCHED_PROVIDERS = [
    {
      id: 1,
      name: 'QuickFix Plumbing',
      owner: 'Raj K.',
      avatar: 'QF',
      rating: 4.98,
      reviews: 342,
      distance: '0.8 km away',
      responseTime: '< 5 min',
      price: '$45–95',
      badge: 'Verified',
      onlineStatus: 'Online Now',
      matchScore: 98,
      specialties: ['Drain Clearing', 'Leak Repair', '24/7 Emergency'],
    },
    {
      id: 2,
      name: 'DrainPro Services',
      owner: 'Sarah M.',
      avatar: 'DP',
      rating: 4.85,
      reviews: 287,
      distance: '1.2 km away',
      responseTime: '< 10 min',
      price: '$40–85',
      badge: 'Verified',
      onlineStatus: 'Online Now',
      matchScore: 96,
      specialties: ['Drain Cleaning', 'Pipe Installation', 'Video Inspection'],
    },
    {
      id: 3,
      name: 'Expert Plumbing Hub',
      owner: 'Marcus T.',
      avatar: 'EPH',
      rating: 4.92,
      reviews: 521,
      distance: '2.1 km away',
      responseTime: '< 15 min',
      price: '$50–110',
      badge: 'Premium',
      onlineStatus: 'Available',
      matchScore: 94,
      specialties: ['All Plumbing', 'Emergency Response', 'Warranty'],
    },
  ];

  const handleSelectProvider = (id) => {
    setSelectedProviders(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleBroadcastRequest = () => {
    if (selectedProviders.length > 0) {
      setBroadcastSent(true);
      setTimeout(() => {
        alert(`✅ Request sent to ${selectedProviders.length} provider(s). They'll respond soon!`);
      }, 1500);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>
          Found {MATCHED_PROVIDERS.length} Verified Providers
        </h2>
        <p style={{ fontSize: '14px', color: '#8899bb' }}>
          All nearby and ready to help. Select one or multiple providers to contact.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '20px', marginBottom: '32px' }}>
        {MATCHED_PROVIDERS.map(provider => (
          <div
            key={provider.id}
            style={{
              background: '#111827',
              border: selectedProviders.includes(provider.id) ? '2px solid #00f0ff' : '1px solid #253558',
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onClick={() => handleSelectProvider(provider.id)}
            onMouseEnter={e => {
              if (!selectedProviders.includes(provider.id)) {
                e.currentTarget.style.borderColor = '#7b5cff';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
              }
            }}
            onMouseLeave={e => {
              if (!selectedProviders.includes(provider.id)) {
                e.currentTarget.style.borderColor = '#253558';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {/* Match Score Badge */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
              color: '#fff',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'Space Mono',
            }}>
              {provider.matchScore}% Match
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '20px' }}>
              {/* Avatar & Verification */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
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
                  {provider.avatar}
                </div>
                <span style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#00ff88',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}>
                  ✓ {provider.badge}
                </span>
              </div>

              {/* Details */}
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>
                      {provider.name}
                    </h3>
                    <p style={{ fontSize: '12px', color: '#8899bb' }}>Owner: {provider.owner}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                      <span style={{ color: '#ff8c00' }}>⭐ {provider.rating}</span>
                      <span style={{ fontSize: '12px', color: '#8899bb' }}>({provider.reviews})</span>
                    </div>
                    <span style={{
                      fontSize: '11px',
                      padding: '3px 8px',
                      background: '#00ff8820',
                      color: '#00ff88',
                      borderRadius: '4px',
                      display: 'inline-block',
                    }}>
                      🟢 {provider.onlineStatus}
                    </span>
                  </div>
                </div>

                {/* Key Info */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '12px',
                  marginBottom: '12px',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #1e2d4a',
                }}>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '3px' }}>Distance</p>
                    <p style={{ fontSize: '12px', color: '#00f0ff', fontWeight: 600 }}>{provider.distance}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '3px' }}>Response</p>
                    <p style={{ fontSize: '12px', color: '#00ff88', fontWeight: 600 }}>{provider.responseTime}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '10px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '3px' }}>Price Range</p>
                    <p style={{ fontSize: '12px', color: '#ff3cac', fontWeight: 600 }}>{provider.price}</p>
                  </div>
                </div>

                {/* Specialties */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {provider.specialties.map(s => (
                    <span
                      key={s}
                      style={{
                        fontSize: '11px',
                        padding: '4px 10px',
                        background: 'rgba(123,92,255,0.15)',
                        border: '1px solid rgba(123,92,255,0.3)',
                        borderRadius: '4px',
                        color: '#7b5cff',
                        fontFamily: 'Space Mono',
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid #253558',
                      color: '#b0c4de',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={e => {
                      e.target.style.borderColor = '#00f0ff';
                      e.target.style.color = '#00f0ff';
                    }}
                    onMouseLeave={e => {
                      e.target.style.borderColor = '#253558';
                      e.target.style.color = '#b0c4de';
                    }}
                  >
                    <Phone className="w-3 h-3" /> Call
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid #253558',
                      color: '#b0c4de',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontFamily: 'Inter',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={e => {
                      e.target.style.borderColor = '#00f0ff';
                      e.target.style.color = '#00f0ff';
                    }}
                    onMouseLeave={e => {
                      e.target.style.borderColor = '#253558';
                      e.target.style.color = '#b0c4de';
                    }}
                  >
                    <MessageSquare className="w-3 h-3" /> Chat
                  </button>
                  {selectedProviders.includes(provider.id) && (
                    <div style={{
                      flex: 1,
                      background: '#00f0ff',
                      color: '#000',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}>
                      <CheckCircle2 className="w-3 h-3" /> Selected
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Broadcast Section */}
      {selectedProviders.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,240,255,0.1),rgba(123,92,255,0.1))',
          border: '1px solid #253558',
          borderRadius: '16px',
          padding: '32px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '12px' }}>
            Ready to send your request?
          </h3>
          <p style={{ fontSize: '14px', color: '#8899bb', marginBottom: '24px' }}>
            Your request will be sent to {selectedProviders.length} provider{selectedProviders.length > 1 ? 's' : ''}.
            They'll respond with quotes and availability.
          </p>
          <button
            onClick={handleBroadcastRequest}
            disabled={broadcastSent}
            style={{
              background: broadcastSent ? '#8899bb' : 'linear-gradient(135deg, #7b5cff, #00f0ff)',
              border: 'none',
              color: '#fff',
              padding: '14px 36px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: broadcastSent ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'Syne',
              letterSpacing: '0.5px',
            }}
            onMouseEnter={e => {
              if (!broadcastSent) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 0 40px rgba(0,240,255,0.3)';
              }
            }}
            onMouseLeave={e => {
              if (!broadcastSent) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {broadcastSent ? '✓ Requests Sent!' : '📤 Broadcast Requests'}
          </button>
        </div>
      )}
    </div>
  );
}