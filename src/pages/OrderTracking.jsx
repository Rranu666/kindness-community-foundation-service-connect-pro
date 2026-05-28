import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Phone, CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { THEME as L } from '@/lib/theme';

const STATUS_TIMELINE = {
  pending:     { label: 'Booking Confirmed', step: 0, color: L.accent },
  confirmed:   { label: 'Provider Assigned', step: 1, color: L.blue },
  in_progress: { label: 'On the Way',        step: 2, color: L.blue },
  completed:   { label: 'Service Completed', step: 3, color: L.green },
  cancelled:   { label: 'Cancelled',         step: -1, color: '#dc2626' },
};

const cardStyle = { background: '#fff', border: `1px solid #e2e0dc`, borderRadius: 20, overflow: 'hidden', marginBottom: 16 };
const cardHeaderStyle = { padding: '20px 24px', borderBottom: '1px solid #e2e0dc' };
const cardBodyStyle = { padding: '20px 24px' };

export default function OrderTracking() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id');

  const { data: order, isLoading, refetch } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => { const r = await db.Order.filter({ id: orderId }); return r[0]; },
    enabled: !!orderId,
    refetchInterval: 10 * 1000,
    staleTime: 5 * 1000,
  });

  const { data: provider } = useQuery({
    queryKey: ['provider', order?.provider_id],
    queryFn: async () => { const r = await db.ServiceProvider.filter({ id: order.provider_id }); return r[0]; },
    enabled: !!order?.provider_id
  });

  if (isLoading) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <Skeleton className="h-8 w-40 mb-8" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: L.text, marginBottom: 8 }}>Order not found</h2>
          <p style={{ color: L.text2 }}>The order you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const statusInfo = STATUS_TIMELINE[order.status] || STATUS_TIMELINE.pending;

  return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 700, letterSpacing: '-1px', color: L.text, marginBottom: 4 }}>
            Order #{order.order_number}
          </h1>
          <p style={{ color: L.text2, fontWeight: 300 }}>{order.service_name}</p>
        </div>

        {/* Status Timeline */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text, margin: 0 }}>Service Status</h3>
          </div>
          <div style={cardBodyStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              {[0, 1, 2, 3].map((step) => {
                const isActive = statusInfo.step >= step;
                return (
                  <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, background: isActive ? statusInfo.color : L.bg3, transition: 'all 0.3s' }}>
                      {isActive
                        ? <CheckCircle2 size={20} color="#fff" />
                        : <div style={{ width: 8, height: 8, borderRadius: '50%', background: L.border2 }} />
                      }
                    </div>
                    <div style={{ fontSize: 11, textAlign: 'center', color: isActive ? statusInfo.color : L.text3, fontWeight: isActive ? 600 : 400 }}>
                      {['Confirmed', 'Assigned', 'On Way', 'Completed'][step]}
                    </div>
                  </div>
                );
              })}
            </div>
            <p style={{ textAlign: 'center', fontWeight: 700, color: L.text, fontSize: 15 }}>{statusInfo.label}</p>
          </div>
        </div>

        {/* Service Details */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text, margin: 0 }}>Service Details</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            <div>
              <p style={{ fontSize: 12, color: L.text3, marginBottom: 4 }}>Scheduled Date & Time</p>
              <p style={{ color: L.text, fontWeight: 600 }}>{order.scheduled_date} at {order.scheduled_time}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: L.text3, marginBottom: 4 }}>Service Address</p>
              <p style={{ color: L.text, fontWeight: 600, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <MapPin size={14} style={{ color: L.accent, marginTop: 2, flexShrink: 0 }} />
                {order.address}
              </p>
            </div>
          </div>
        </div>

        {/* Provider Info */}
        {provider && (
          <div style={cardStyle}>
            <div style={cardHeaderStyle}>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text, margin: 0 }}>Service Provider</h3>
            </div>
            <div style={{ ...cardBodyStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: 17, color: L.text, marginBottom: 6 }}>{provider.business_name}</p>
                {provider.phone && (
                  <p style={{ color: L.text2, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                    <Phone size={14} /> {provider.phone}
                  </p>
                )}
              </div>
              <Button variant="outline">
                <MessageCircle className="w-4 h-4 mr-2" /> Chat
              </Button>
            </div>
          </div>
        )}

        {/* Payment Summary */}
        <div style={cardStyle}>
          <div style={cardHeaderStyle}>
            <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text, margin: 0 }}>Payment Summary</h3>
          </div>
          <div style={{ ...cardBodyStyle, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: L.text2 }}>
              <span>Service Amount</span><span style={{ color: L.text, fontWeight: 600 }}>${order.subtotal}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: L.text2 }}>
              <span>Commission ({order.commission_rate}%)</span><span>${order.commission_amount}</span>
            </div>
            <div style={{ borderTop: `1px solid ${L.border}`, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15, color: L.text }}>
              <span>Total Amount</span><span>${order.total_amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: L.text3 }}>
              <span>Payment Status</span>
              <span style={{ textTransform: 'capitalize', fontWeight: 600 }}>{order.payment_status}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}