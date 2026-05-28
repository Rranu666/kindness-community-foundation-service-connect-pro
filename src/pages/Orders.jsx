import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, MapPin, ChevronRight, XCircle, RotateCcw, ShoppingBag, Star, RefreshCw } from 'lucide-react';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import BookingModal from '@/components/booking/BookingModal';
import ReviewSubmissionModal from '@/components/reviews/ReviewSubmissionModal';
import { THEME as L } from '@/lib/theme';

const STATUS_STYLES = {
  pending:     { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  confirmed:   { bg: '#eff3ff', color: '#4361EE', label: 'Confirmed' },
  in_progress: { bg: '#f5f3ff', color: '#7C3AED', label: 'In Progress' },
  completed:   { bg: '#ecfdf5', color: '#059669', label: 'Completed' },
  cancelled:   { bg: '#fef2f2', color: '#dc2626', label: 'Cancelled' },
};

export default function Orders() {
  const [user, setUser] = useState(null);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [rebookOrder, setRebookOrder] = useState(null);
  const [rebookService, setRebookService] = useState(null);
  const [rebookProvider, setRebookProvider] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => db.Order.filter({ customer_email: user?.email }, '-scheduled_date'),
    enabled: !!user?.email
  });

  const { isPulling, pullDistance, isRefreshing } = usePullToRefresh(async () => {
    setRefreshing(true);
    try {
      await refetch();
    } finally {
      setRefreshing(false);
    }
  }, 'main');

  const cancelMutation = useMutation({
    mutationFn: async (orderId) => {
      await db.Order.update(orderId, { status: 'cancelled' });
      const order = orders.find(o => o.id === orderId);
      if (order) {
        await db.Notification.create({
          recipient_email: order.customer_email, recipient_type: 'customer',
          type: 'cancellation', title: 'Booking Cancelled',
          message: `Your booking for ${order.service_name} has been cancelled.`,
          order_id: orderId, channels: ['email']
        });
      }
    },
    onSuccess: () => { toast.success('Booking cancelled'); setCancelOrderId(null); queryClient.invalidateQueries({ queryKey: ['orders', user?.email] }); },
  });

  const handleRebook = async (order) => {
    const [services, providers] = await Promise.all([
      db.Service.filter({ id: order.service_id }),
      db.ServiceProvider.filter({ id: order.provider_id }),
    ]);
    if (services[0] && providers[0]) {
      setRebookService(services[0]); setRebookProvider(providers[0]); setRebookOrder(order);
    } else toast.error('Service or provider no longer available');
  };

  const upcoming = orders.filter(o => ['pending', 'confirmed', 'in_progress'].includes(o.status));
  const past = orders.filter(o => ['completed', 'cancelled'].includes(o.status));
  const shown = tab === 'upcoming' ? upcoming : past;

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif", position: 'relative' }}>
      {/* Pull-to-Refresh Indicator */}
      {(isPulling || isRefreshing) && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: Math.min(pullDistance, 80),
          background: L.bg2,
          borderBottom: `1px solid ${L.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 40,
          transition: isRefreshing ? 'height 0.3s ease' : 'none',
        }}>
          <RefreshCw size={20} style={{ color: L.accent, animation: isRefreshing ? 'spin 0.6s linear infinite' : 'none' }} />
        </div>
      )}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 6, color: L.text }}>My Orders</h1>
          <p style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>Track and manage your service bookings.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 100, marginBottom: 28 }}>
          {[{ k: 'upcoming', l: `Upcoming (${upcoming.length})` }, { k: 'past', l: `Past (${past.length})` }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ padding: '9px 22px', borderRadius: 100, border: 'none', background: tab === t.k ? L.text : 'transparent', color: tab === t.k ? '#fff' : L.text2, fontWeight: 700, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }}>
              {t.l}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-2xl" />)}
          </div>
        ) : shown.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {shown.map(order => {
              const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
              return (
                <div key={order.id}
                  style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '20px 24px', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = L.border2}
                  onMouseLeave={e => e.currentTarget.style.borderColor = L.border}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 700, fontSize: 16, color: L.text, marginBottom: 2 }}>{order.service_name}</h3>
                      <p style={{ fontSize: 12, color: L.text3 }}>by {order.provider_name} · #{order.order_number}</p>
                    </div>
                    <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color, flexShrink: 0 }}>{st.label}</span>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 13, color: L.text2, marginBottom: 16 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Clock size={13} style={{ color: L.accent }} />{order.scheduled_date} at {order.scheduled_time}</span>
                    {order.address && <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><MapPin size={13} style={{ color: L.accent }} />{order.address}</span>}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: `1px solid ${L.border}` }}>
                    <div>
                      <p style={{ fontSize: 11, color: L.text3, marginBottom: 2 }}>Total</p>
                      <p style={{ fontWeight: 800, fontSize: 18, color: L.text }}>${order.total_amount?.toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {order.status === 'completed' && (
                        <button onClick={() => setReviewOrder(order)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 100, background: '#fffbeb', border: '1px solid #fde68a', color: '#d97706', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <Star size={12} /> Rate
                        </button>
                      )}
                      {['completed', 'cancelled'].includes(order.status) && (
                        <button onClick={() => handleRebook(order)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 100, background: '#eff3ff', border: '1px solid #c7d2fe', color: L.blue, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <RotateCcw size={12} /> Rebook
                        </button>
                      )}
                      {['pending', 'confirmed'].includes(order.status) && (
                        <button onClick={() => setCancelOrderId(order.id)}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 100, background: `${L.accent}10`, border: `1px solid ${L.accent}25`, color: L.accent, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                      <Link to={createPageUrl(`OrderTracking?id=${order.id}`)}>
                        <button style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '7px 14px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                          Track <ChevronRight size={13} />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 24px', background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 24 }}>
            <ShoppingBag size={48} style={{ color: L.border2, margin: '0 auto 16px' }} />
            <p style={{ fontWeight: 700, marginBottom: 8, color: L.text }}>No {tab} bookings</p>
            <p style={{ fontSize: 14, color: L.text2, marginBottom: 20, fontWeight: 300 }}>
              {tab === 'upcoming' ? 'Book a service to get started' : 'Your completed bookings will appear here'}
            </p>
            {tab === 'upcoming' && (
              <Link to={createPageUrl('Browse')}>
                <button style={{ padding: '10px 24px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Browse Services</button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Cancel dialog */}
      <Dialog open={!!cancelOrderId} onOpenChange={() => setCancelOrderId(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Cancel Booking?</DialogTitle></DialogHeader>
          <p style={{ color: L.text2, fontSize: 14 }}>Are you sure you want to cancel this booking? This action cannot be undone.</p>
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button onClick={() => setCancelOrderId(null)}
              style={{ flex: 1, padding: '10px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
              Keep Booking
            </button>
            <button onClick={() => cancelMutation.mutate(cancelOrderId)} disabled={cancelMutation.isPending}
              style={{ flex: 1, padding: '10px', borderRadius: 100, background: L.accent, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>
              {cancelMutation.isPending ? 'Cancelling...' : 'Yes, Cancel'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {rebookService && rebookProvider && (
        <BookingModal open={!!rebookOrder} onClose={() => { setRebookOrder(null); setRebookService(null); setRebookProvider(null); }} service={rebookService} provider={rebookProvider} />
      )}

      {reviewOrder && (
        <ReviewSubmissionModal open={!!reviewOrder} onClose={() => setReviewOrder(null)} order={reviewOrder}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['orders', user?.email] })} />
      )}
    </div>
  );
}