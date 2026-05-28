import { Info, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ReferralBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(255,77,109,0.12) 0%, rgba(67,97,238,0.12) 100%)',
      border: '1px solid rgba(255,77,109,0.25)',
      borderRadius: 12,
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 20,
      position: 'relative',
    }}>
      <Share2 size={18} style={{ color: '#FF4D6D', flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#F0F2FF', fontSize: 14 }}>
          Earn $15 rewards by sharing your referral link
        </p>
        <p style={{ margin: '4px 0 0', color: 'rgba(240,242,255,0.6)', fontSize: 12 }}>
          Both you and your friends get $15 off your next service
        </p>
      </div>
      <Link to={createPageUrl('ReferralProgram')}>
        <button style={{
          background: '#FF4D6D',
          border: 'none',
          borderRadius: 8,
          color: '#fff',
          fontWeight: 600,
          fontSize: 12,
          padding: '8px 16px',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
          Get Your Link
        </button>
      </Link>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(240,242,255,0.5)',
          cursor: 'pointer',
          fontSize: 18,
          padding: '0 8px',
        }}>
        ✕
      </button>
    </div>
  );
}