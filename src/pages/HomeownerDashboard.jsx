import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Shield, Zap, CheckCircle2, DollarSign, ArrowRight, Calendar, Receipt, Search, RefreshCw } from 'lucide-react';
import SmartEmptyState from '@/components/ui/SmartEmptyState';
import BookingStatusCard from '@/components/dashboard/BookingStatusCard';
import InvoicesSection from '@/components/dashboard/InvoicesSection';
import VerifyRateModal from '@/components/reviews/VerifyRateModal';
import { THEME as L } from '@/lib/theme';

export default function HomeownerDashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('active');
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedOrderForRating, setSelectedOrderForRating] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['homeowner-orders', user?.email],
    queryFn: () => db.Order.filter({ customer_email: user?.email }, '-created_date', 100),
    enabled: !!user?.email,
    refetchInterval: 30000,
    staleTime: 30000,
  });

  const { data: providers = [] } = useQuery({
    queryKey: ['providers-all'],
    queryFn: () => db.ServiceProvider.list(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: invoices = [] } = useQuery({
    queryKey: ['homeowner-invoices', user?.email],
    queryFn: () => db.Invoice.filter({ customer_email: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  // Real-time subscription
  useEffect(() => {
    if (!user?.email) return;
    const unsub = db.Order.subscribe((event) => {
      if (event.data?.customer_email === user.email) {
        queryClient.invalidateQueries({ queryKey: ['homeowner-orders', user.email] });
      }
    });
    return unsub;
  }, [user?.email]);

  const getProvider = (id) => providers.find(p => p.id === id);
  const getInvoice = (orderId) => invoices.find(inv => inv.order_id === orderId);

  const activeOrders = orders.filter(o => ['pending', 'confirmed', 'in_progress'].includes(o.status));
  const completedOrders = orders.filter(o => o.status === 'completed');
  const totalSpent = completedOrders.reduce((s, o) => s + (o.total_amount || 0), 0);

  const tabOrders = activeTab === 'active' ? activeOrders : completedOrders;

  if (!user) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", gap: 20 }}>
        <Shield size={48} style={{ color: L.accent }} />
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 700, fontSize: 24, color: L.text, marginBottom: 8 }}>Secure Dashboard</h2>
          <p style={{ color: L.text2, marginBottom: 24, fontWeight: 300 }}>Sign in to view your bookings and invoices.</p>
        </div>
        <button onClick={() => auth.redirectToLogin()}
          style={{ background: L.text, border: 'none', borderRadius: 100, color: '#fff', fontWeight: 700, fontSize: 15, padding: '13px 32px', cursor: 'pointer' }}>
          Sign In to Continue
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: L.bg, minHeight: '100vh', color: L.text, fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* Hero Header */}
      <section style={{ background: L.bg2, borderBottom: `1px solid ${L.border}`, padding: '36px 0 28px' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: `${L.green}15`, border: `1px solid ${L.green}30`, borderRadius: 100, padding: '5px 12px', marginBottom: 14 }}>
                <Shield size={11} style={{ color: L.green }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: L.green, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Homeowner Dashboard</span>
              </div>
              <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.1, marginBottom: 6, color: L.text }}>
                Welcome back, <span style={{ fontStyle: 'italic', fontWeight: 300, color: L.text2 }}>{user.full_name?.split(' ')[0] || 'there'}</span>
              </h1>
              <p style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>Track bookings, monitor your technician, and manage invoices.</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              <button onClick={() => refetch()}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', borderRadius: 100, background: '#fff', border: `1px solid ${L.border}`, color: L.text2, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                <RefreshCw size={12} /> Refresh
              </button>
              <Link to={createPageUrl('Browse')}>
                <button style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                  <Search size={13} /> Book Service
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '24px 0', background: L.bg2, borderBottom: `1px solid ${L.border}` }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Active Bookings', value: activeOrders.length, icon: Zap, color: L.amber },
              { label: 'Completed', value: completedOrders.length, icon: CheckCircle2, color: L.green },
              { label: 'Total Spent', value: `$${totalSpent.toLocaleString()}`, icon: DollarSign, color: L.accent },
              { label: 'Invoices', value: invoices.length, icon: Receipt, color: L.blue },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: '18px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: L.text3, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{label}</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color, letterSpacing: '-0.04em', lineHeight: 1 }}>{value}</p>
                  </div>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon size={16} style={{ color }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section style={{ padding: '24px 0 60px', background: L.bg }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 100, marginBottom: 24 }}>
            {[
              { key: 'active', label: `Active (${activeOrders.length})` },
              { key: 'completed', label: `Completed (${completedOrders.length})` },
              { key: 'invoices', label: `Invoices (${invoices.length})` },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                style={{ padding: '8px 16px', borderRadius: 100, border: 'none', background: activeTab === tab.key ? L.text : 'transparent', color: activeTab === tab.key ? '#fff' : L.text2, fontWeight: 700, fontSize: 12, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'invoices' ? (
            <InvoicesSection userEmail={user.email} />
          ) : isLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1,2].map(i => <div key={i} style={{ height: 120, borderRadius: 20, background: L.bg2, border: `1px solid ${L.border}` }} />)}
            </div>
          ) : tabOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px' }}>
              {activeTab === 'active' ? (
                <>
                  <Calendar size={40} style={{ color: L.border2, margin: '0 auto 16px' }} />
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: L.text, marginBottom: 8 }}>No active bookings</h3>
                  <p style={{ color: L.text2, marginBottom: 24, fontSize: 14, fontWeight: 300 }}>Book a verified professional to get started.</p>
                  <Link to={createPageUrl('Browse')}>
                    <button style={{ background: L.text, border: 'none', borderRadius: 100, color: '#fff', fontWeight: 700, fontSize: 14, padding: '12px 28px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      Browse Services <ArrowRight size={16} />
                    </button>
                  </Link>
                </>
              ) : (
                <>
                  <CheckCircle2 size={40} style={{ color: L.border2, margin: '0 auto 16px' }} />
                  <h3 style={{ fontWeight: 700, fontSize: 18, color: L.text, marginBottom: 8 }}>No completed services yet</h3>
                  <p style={{ color: L.text2, fontSize: 14, fontWeight: 300 }}>Completed bookings will appear here.</p>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {tabOrders.map(order => (
                <BookingStatusCard key={order.id} order={order} provider={getProvider(order.provider_id)} invoice={getInvoice(order.id)}
                  onRate={activeTab === 'completed' ? (o) => { setSelectedOrderForRating(o); setRatingModalOpen(true); } : null} />
              ))}
            </div>
          )}
        </div>
      </section>

      {selectedOrderForRating && (
        <VerifyRateModal open={ratingModalOpen}
          onClose={() => { setRatingModalOpen(false); setSelectedOrderForRating(null); }}
          order={selectedOrderForRating}
          provider={getProvider(selectedOrderForRating?.provider_id)}
          onSubmitSuccess={() => queryClient.invalidateQueries({ queryKey: ['homeowner-orders'] })} />
      )}
    </div>
  );
}