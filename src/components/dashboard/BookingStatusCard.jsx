import React, { useState } from 'react';
import { Calendar, Clock, MapPin, ChevronDown, CheckCircle2, DollarSign, Star, Download, Receipt, Phone } from 'lucide-react';
import TechnicianTracker from './TechnicianTracker';
import StatusTimeline from './StatusTimeline';
import { THEME as L } from '@/lib/theme';

const STATUS_CONFIG = {
  pending:     { label: 'Pending',     color: '#d97706', bg: '#fef3c7' },
  confirmed:   { label: 'Confirmed',   color: L.blue,    bg: '#eff3ff' },
  in_progress: { label: 'In Progress', color: '#059669', bg: '#ecfdf5' },
  completed:   { label: 'Completed',   color: '#0369a1', bg: '#e0f2fe' },
  cancelled:   { label: 'Cancelled',   color: '#dc2626', bg: '#fef2f2' },
};

const SERVICE_EMOJI = (name = '') => {
  if (name.toLowerCase().includes('plumb')) return '🔧';
  if (name.toLowerCase().includes('hvac') || name.toLowerCase().includes('ac')) return '❄️';
  if (name.toLowerCase().includes('clean')) return '✨';
  return '🏠';
};

export default function BookingStatusCard({ order, provider, invoice, onRate }) {
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const status      = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isActive    = ['confirmed', 'in_progress'].includes(order.status);
  const isCompleted = order.status === 'completed';

  const handleDownloadInvoice = () => {
    if (!invoice?.pdf_url) return;
    setDownloading(true);
    window.open(invoice.pdf_url, '_blank');
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <div style={{
      background: '#fff', borderRadius: 20, overflow: 'hidden',
      border: `1px solid ${isActive ? `${L.amber}40` : isCompleted ? `${L.green}30` : L.border}`,
      boxShadow: isActive ? `0 4px 20px ${L.amber}10` : 'none',
      transition: 'all 0.2s',
    }}>
      {/* Accent bar */}
      <div style={{ height: 3, background: isActive ? L.grad : isCompleted ? L.green : L.border }} />

      {/* Header */}
      <div onClick={() => setExpanded(e => !e)}
        style={{ padding: '18px 22px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14 }}
        onMouseEnter={e => e.currentTarget.style.background = L.bg2}
        onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: `${status.color}15`, border: `1px solid ${status.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 22 }}>
          {SERVICE_EMOJI(order.service_name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 15, color: L.text, marginBottom: 2 }}>{order.service_name}</h3>
              <p style={{ fontSize: 12, color: L.text3 }}>with {provider?.business_name || order.provider_name}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: status.color, background: status.bg, borderRadius: 100, padding: '4px 12px', whiteSpace: 'nowrap' }}>
                {status.label}
              </span>
              <ChevronDown size={16} style={{ color: L.text3, transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s', flexShrink: 0 }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, marginTop: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: L.text2 }}>
              <Calendar size={11} style={{ color: L.blue }} />
              {new Date(order.scheduled_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
            {order.scheduled_time && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: L.text2 }}><Clock size={11} style={{ color: L.amber }} />{order.scheduled_time}</span>}
            {order.address && <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: L.text2, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}><MapPin size={11} style={{ color: L.accent }} />{order.address}</span>}
            <span style={{ marginLeft: 'auto', fontWeight: 800, fontSize: 15, color: L.text }}>${(order.total_amount || 0).toFixed(2)}</span>
          </div>
          {isActive && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: L.text3, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: L.blue }}>{order.status === 'in_progress' ? '65%' : '30%'}</span>
              </div>
              <div style={{ height: 5, borderRadius: 3, background: L.bg3 }}>
                <div style={{ height: '100%', borderRadius: 3, background: L.blue, width: order.status === 'in_progress' ? '65%' : '30%', transition: 'width 1s ease' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded panel */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${L.border}`, padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 18, background: L.bg2 }}>
          {isActive && <TechnicianTracker order={order} provider={provider} />}
          <StatusTimeline order={order} />

          {/* Pricing */}
          <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: L.text3, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Pricing Breakdown</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[{ label: 'Service', val: order.subtotal }, { label: 'Tax', val: order.tax_amount }, { label: 'Tip', val: order.tip_amount }]
                .filter(r => r.val > 0).map(r => (
                  <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: L.text2 }}>{r.label}</span>
                    <span style={{ color: L.text }}>${r.val.toFixed(2)}</span>
                  </div>
                ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, paddingTop: 10, borderTop: `1px solid ${L.border}` }}>
                <span style={{ color: L.text }}>Total</span>
                <span style={{ color: L.accent }}>${(order.total_amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {isCompleted && invoice?.pdf_url && (
              <button onClick={handleDownloadInvoice} disabled={downloading}
                style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '11px 18px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', opacity: downloading ? 0.7 : 1 }}>
                <Download size={14} />{downloading ? 'Opening…' : 'Download Invoice'}
              </button>
            )}
            {isCompleted && !invoice?.pdf_url && (
              <div style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 18px', borderRadius: 100, background: L.bg3, border: `1px solid ${L.border}`, color: L.text3, fontSize: 13 }}>
                <Receipt size={14} />Invoice Pending
              </div>
            )}
            {isCompleted && onRate && (
              <button onClick={() => onRate(order)}
                style={{ flex: 1, minWidth: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 18px', borderRadius: 100, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
                <Star size={14} />Rate Service
              </button>
            )}
            {isActive && provider?.phone && (
              <a href={`tel:${provider.phone}`}
                style={{ flex: 1, minWidth: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '11px 18px', borderRadius: 100, background: `${L.green}12`, border: `1px solid ${L.green}25`, color: '#059669', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>
                <Phone size={14} />Call Technician
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}