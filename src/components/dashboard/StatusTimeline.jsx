import React from 'react';
import { CheckCircle2, Clock, Truck, Star, XCircle } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

const STATUS_EVENTS = {
  pending:     { icon: Clock,        color: '#d97706', label: 'Booking Received',    detail: 'Your booking request has been submitted.' },
  confirmed:   { icon: CheckCircle2, color: L.blue,    label: 'Booking Confirmed',   detail: 'Your appointment has been confirmed by the provider.' },
  in_progress: { icon: Truck,        color: '#059669', label: 'Technician En Route', detail: 'Your technician is on the way to your location.' },
  completed:   { icon: Star,         color: '#0369a1', label: 'Service Completed',   detail: 'The service has been marked complete. Please review and download your invoice.' },
  cancelled:   { icon: XCircle,      color: '#dc2626', label: 'Booking Cancelled',   detail: 'This booking was cancelled.' },
};

const ORDER_FLOW = ['pending', 'confirmed', 'in_progress', 'completed'];

export default function StatusTimeline({ order }) {
  const currentIndex = ORDER_FLOW.indexOf(order.status);
  const isCancelled  = order.status === 'cancelled';
  const events = isCancelled
    ? [STATUS_EVENTS.pending, STATUS_EVENTS.cancelled]
    : ORDER_FLOW.slice(0, Math.max(currentIndex + 1, 1)).map(s => STATUS_EVENTS[s]);

  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Status Updates</p>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {events.map((ev, i) => {
          const Icon = ev.icon;
          const isLast = i === events.length - 1;
          return (
            <div key={i} style={{ display: 'flex', gap: 14 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: `${ev.color}15`, border: `2px solid ${ev.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isLast ? `0 0 10px ${ev.color}30` : 'none' }}>
                  <Icon size={13} style={{ color: ev.color }} />
                </div>
                {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: L.border, margin: '4px 0' }} />}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                <p style={{ fontWeight: 700, fontSize: 13, color: ev.color, marginBottom: 2 }}>{ev.label}</p>
                <p style={{ fontSize: 12, color: L.text2, lineHeight: 1.5, fontWeight: 300 }}>{ev.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}