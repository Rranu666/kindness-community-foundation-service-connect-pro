import React from 'react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  const [showRestored, setShowRestored] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
    } else if (wasOffline) {
      setShowRestored(true);
      const t = setTimeout(() => {
        setShowRestored(false);
        setWasOffline(false);
      }, 3000);
      return () => clearTimeout(t);
    }
  }, [isOnline, wasOffline]);

  if (isOnline && !showRestored) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, padding: '10px 20px', borderRadius: 100,
      background: isOnline ? 'rgba(6,214,160,0.15)' : 'rgba(255,77,109,0.15)',
      border: `1px solid ${isOnline ? 'rgba(6,214,160,0.4)' : 'rgba(255,77,109,0.4)'}`,
      backdropFilter: 'blur(20px)',
      display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 13, fontWeight: 600,
      color: isOnline ? '#06D6A0' : '#FF4D6D',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'all 0.3s ease',
      fontFamily: "'Inter', system-ui, sans-serif",
      whiteSpace: 'nowrap',
    }}>
      {isOnline
        ? <><Wifi size={14} /> Connection restored</>
        : <><WifiOff size={14} /> You're offline — some features may be unavailable</>
      }
    </div>
  );
}