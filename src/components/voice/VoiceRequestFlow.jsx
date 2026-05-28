import React, { useState } from 'react';
import { Mic, MapPin, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

const STAGES = [
  { id: 1, label: 'Record Voice', icon: '🎤', status: 'current' },
  { id: 2, label: 'AI Analysis', icon: '🧠', status: 'pending' },
  { id: 3, label: 'Match Providers', icon: '📍', status: 'pending' },
  { id: 4, label: 'Send Requests', icon: '📤', status: 'pending' },
  { id: 5, label: 'Provider Responses', icon: '💬', status: 'pending' },
];

export default function VoiceRequestFlow() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [detectedService, setDetectedService] = useState(null);
  const [stage, setStage] = useState(1);

  const handleVoiceRecord = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recognition
      setTimeout(() => {
        setTranscript("I need a plumber to clear my drains urgently. I'm near the downtown area.");
        setDetectedService({
          category: 'Plumbing',
          urgency: 'urgent',
          location: 'Downtown District',
          description: 'Drain clearing service',
        });
        setStage(2);
      }, 2000);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px' }}>
      {/* Progress */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '60px',
        position: 'relative',
      }}>
        {STAGES.map((s, idx) => (
          <React.Fragment key={s.id}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              zIndex: 10,
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: stage >= s.id ? '#7b5cff' : '#1e2d4a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                marginBottom: '8px',
                border: stage === s.id ? '3px solid #00f0ff' : 'none',
                transition: 'all 0.3s',
              }}>
                {s.icon}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: stage >= s.id ? '#00f0ff' : '#8899bb',
                textAlign: 'center',
              }}>
                {s.label}
              </span>
            </div>
            {idx < STAGES.length - 1 && (
              <div style={{
                flex: 1,
                height: '3px',
                background: stage > s.id ? '#7b5cff' : '#1e2d4a',
                margin: '0 16px 30px',
                transition: 'all 0.3s',
              }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Stage 1: Voice Recording */}
      {stage === 1 && (
        <div style={{
          background: 'linear-gradient(135deg,rgba(0,240,255,0.1),rgba(123,92,255,0.1))',
          border: '1px solid #253558',
          borderRadius: '20px',
          padding: '48px',
          textAlign: 'center',
        }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: '28px', fontWeight: 800, color: '#fff', marginBottom: '16px' }}>
            Tell us what you need
          </h2>
          <p style={{ fontSize: '14px', color: '#8899bb', marginBottom: '32px' }}>
            Speak your service request naturally. Our AI will understand your needs.
          </p>

          <button
            onClick={handleVoiceRecord}
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: isRecording ? 'linear-gradient(135deg, #ff3cac, #ff8c00)' : 'linear-gradient(135deg, #7b5cff, #00f0ff)',
              border: 'none',
              color: '#fff',
              fontSize: '48px',
              cursor: 'pointer',
              margin: '0 auto 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: isRecording ? 'pulse 1s infinite' : 'none',
              transition: 'all 0.3s',
              boxShadow: isRecording ? '0 0 40px rgba(255,60,172,0.4)' : 'none',
            }}
          >
            🎤
          </button>

          <p style={{ fontSize: '13px', color: '#00ff88', fontWeight: 600, marginBottom: '16px' }}>
            {isRecording ? '🔴 Recording...' : '⏱️ Press to start speaking'}
          </p>

          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.05); }
            }
          `}</style>
        </div>
      )}

      {/* Stage 2+: Results */}
      {stage >= 2 && transcript && (
        <div style={{
          background: '#111827',
          border: '1px solid #253558',
          borderRadius: '20px',
          padding: '40px',
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📝 Your Request</span>
          </h3>
          <p style={{ fontSize: '14px', color: '#b0c4de', marginBottom: '32px', lineHeight: 1.6, fontStyle: 'italic' }}>
            "{transcript}"
          </p>

          {detectedService && (
            <>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✓</span> Service Detected
              </h3>
              <div style={{
                background: '#0d1428',
                border: '1px solid #1e2d4a',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '32px',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <p style={{ fontSize: '11px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>Category</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: '#00f0ff' }}>{detectedService.category}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '11px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>Urgency</p>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: detectedService.urgency === 'urgent' ? '#ff3cac' : '#00ff88' }}>
                      {detectedService.urgency === 'urgent' ? '🔴 Urgent' : '🟢 Normal'}
                    </p>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p style={{ fontSize: '11px', color: '#8899bb', textTransform: 'uppercase', marginBottom: '4px' }}>Location</p>
                    <p style={{ fontSize: '14px', color: '#b0c4de', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin className="w-4 h-4" /> {detectedService.location}
                    </p>
                  </div>
                </div>
              </div>

              {stage >= 3 && (
                <button
                  onClick={() => setStage(stage + 1)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #7b5cff, #00f0ff)',
                    border: 'none',
                    color: '#fff',
                    padding: '14px 28px',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
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
                  Continue to Providers →
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}