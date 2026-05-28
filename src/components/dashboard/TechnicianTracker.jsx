import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Phone, CheckCircle, Truck, Signal } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

function ETACountdown({ minutes }) {
  const [remaining, setRemaining] = useState(minutes);
  useEffect(() => {
    if (remaining <= 0) return;
    const t = setInterval(() => setRemaining(r => Math.max(0, r - 1)), 60000);
    return () => clearInterval(t);
  }, []);
  return (
    <span style={{ fontWeight: 900, color: '#059669', fontSize: 26, letterSpacing: '-0.03em' }}>
      {remaining > 0 ? `~${remaining} min` : 'Arrived'}
    </span>
  );
}

function LiveMapPanel({ isInProgress, isConfirmed, order }) {
  const canvasRef = useRef(null);
  const posRef = useRef({ x: 0.15, y: 0.5 });
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isInProgress) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let frame = 0;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      // Background
      ctx.fillStyle = '#f7f7f5'; ctx.fillRect(0, 0, W, H);
      // Grid
      ctx.strokeStyle = 'rgba(67,97,238,0.07)'; ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 28) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      // Main road
      ctx.strokeStyle = 'rgba(67,97,238,0.2)'; ctx.lineWidth = 6; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(0, H*0.5); ctx.lineTo(W, H*0.5); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,140,66,0.3)'; ctx.lineWidth = 1.5; ctx.setLineDash([12,10]);
      ctx.beginPath(); ctx.moveTo(0, H*0.5); ctx.lineTo(W, H*0.5); ctx.stroke(); ctx.setLineDash([]);
      // Move truck
      frame++;
      if (frame % 2 === 0) { posRef.current.x = Math.min(0.85, posRef.current.x + 0.003); }
      const tx = posRef.current.x * W, ty = H * 0.5;
      // Destination
      const dx = W * 0.9, dy = H * 0.5;
      ctx.fillStyle = '#059669';
      ctx.beginPath(); ctx.arc(dx, dy, 9, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = 'rgba(5,150,105,0.15)';
      ctx.beginPath(); ctx.arc(dx, dy, 18 + Math.sin(frame*0.08)*4, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('YOU', dx, dy);
      // Route line
      const grad = ctx.createLinearGradient(tx, ty, dx, dy);
      grad.addColorStop(0, L.amber); grad.addColorStop(1, '#059669');
      ctx.strokeStyle = grad; ctx.lineWidth = 2; ctx.setLineDash([6,5]);
      ctx.beginPath(); ctx.moveTo(tx,ty); ctx.lineTo(dx,dy); ctx.stroke(); ctx.setLineDash([]);
      // Truck
      const pulse = Math.sin(frame*0.1) * 3;
      ctx.fillStyle = 'rgba(255,140,66,0.12)';
      ctx.beginPath(); ctx.arc(tx, ty, 18+pulse, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = L.amber; ctx.shadowBlur = 10; ctx.shadowColor = L.amber;
      ctx.beginPath(); ctx.arc(tx, ty, 8, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = '10px sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('🚐', tx, ty);
      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isInProgress]);

  return (
    <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: L.bg2, border: `1px solid ${L.border}`, height: 180 }}>
      {isInProgress ? (
        <canvas ref={canvasRef} width={600} height={180} style={{ width: '100%', height: '100%', display: 'block' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${L.blue}12`, border: `1px solid ${L.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Truck size={22} style={{ color: L.blue }} />
          </div>
          <p style={{ fontSize: 12, color: L.text3, fontWeight: 600 }}>
            {isConfirmed ? 'Technician dispatching soon…' : 'Live tracking not available'}
          </p>
        </div>
      )}
      {isInProgress && (
        <div style={{ position: 'absolute', top: 10, right: 10, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 100, padding: '4px 10px' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#059669' }}>LIVE</span>
        </div>
      )}
    </div>
  );
}

const STATUS_STEPS = [
  { key: 'confirmed',   label: 'Booked',    icon: CheckCircle },
  { key: 'dispatched',  label: 'Dispatched', icon: Signal },
  { key: 'in_progress', label: 'En Route',   icon: Truck },
  { key: 'arrived',     label: 'On Site',    icon: MapPin },
];

export default function TechnicianTracker({ order, provider }) {
  const isInProgress = order.status === 'in_progress';
  const isConfirmed  = order.status === 'confirmed';
  const stepIndex    = isInProgress ? 2 : isConfirmed ? 1 : 0;

  return (
    <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, overflow: 'hidden' }}>
      <div style={{ padding: '14px 20px', background: L.bg2, borderBottom: `1px solid ${L.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `${L.amber}15`, border: `1px solid ${L.amber}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Navigation size={15} style={{ color: L.amber }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: 14, color: L.text }}>Technician Tracker</p>
          <p style={{ fontSize: 11, color: L.text3 }}>
            {isInProgress ? 'Real-time tracking active' : isConfirmed ? 'Awaiting dispatch' : 'Tracking unavailable'}
          </p>
        </div>
        {provider?.phone && (
          <a href={`tel:${provider.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 100, background: 'rgba(5,150,105,0.1)', border: '1px solid rgba(5,150,105,0.25)', color: '#059669', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>
            <Phone size={12} />Call
          </a>
        )}
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
              {isInProgress ? 'Est. Arrival' : 'Scheduled Time'}
            </p>
            {isInProgress
              ? <ETACountdown minutes={18} />
              : <span style={{ fontWeight: 900, color: L.blue, fontSize: 22 }}>{order.scheduled_time || 'TBD'}</span>
            }
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Provider</p>
            <p style={{ fontWeight: 700, fontSize: 14, color: L.text }}>{provider?.business_name || order.provider_name || '—'}</p>
            {order.address && <p style={{ fontSize: 11, color: L.text2, display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end', marginTop: 2 }}><MapPin size={10} />{order.address}</p>}
          </div>
        </div>

        <LiveMapPanel isInProgress={isInProgress} isConfirmed={isConfirmed} order={order} provider={provider} />

        <div style={{ display: 'flex', alignItems: 'center' }}>
          {STATUS_STEPS.map((step, i) => {
            const Icon = step.icon;
            const done = i < stepIndex, active = i === stepIndex;
            return (
              <React.Fragment key={step.key}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: done ? '#059669' : active ? L.amber : L.bg3, border: `2px solid ${done ? '#059669' : active ? L.amber : L.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                    <Icon size={13} style={{ color: done || active ? '#fff' : L.text3 }} />
                  </div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: done || active ? L.text : L.text3, marginTop: 4, textAlign: 'center' }}>{step.label}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div style={{ height: 2, flex: 1, background: done ? '#059669' : L.border, marginBottom: 18, transition: 'background 0.4s' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}