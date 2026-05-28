import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Banknote, Percent } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
};

const STATUS_STYLES = {
  pending:    { bg: '#fbbf2420', color: '#d97706' },
  approved:   { bg: '#4361EE15', color: '#4361EE' },
  processing: { bg: '#7C3AED15', color: '#7C3AED' },
  completed:  { bg: '#06D6A015', color: '#059669' },
  failed:     { bg: '#FF4D6D15', color: '#FF4D6D' },
};

const COMMISSION_RATE = 10;

export default function ProviderPayouts() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [bankDetails, setBankDetails] = useState({ bank_name: '', bank_account: '' });
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [tab, setTab] = useState('history');
  const queryClient = useQueryClient();

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => {
    if (user?.email) db.ServiceProvider.filter({ email: user.email }).then(p => setProvider(p[0] || null));
  }, [user?.email]);

  const { data: orders = [] } = useQuery({
    queryKey: ['completed-orders', provider?.id],
    queryFn: () => db.Order.filter({ provider_id: provider?.id, status: 'completed' }),
    enabled: !!provider?.id
  });

  const { data: payouts = [], isLoading: payoutsLoading } = useQuery({
    queryKey: ['payouts', provider?.email],
    queryFn: () => db.Payout.filter({ provider_email: provider?.email }, '-requested_date'),
    enabled: !!provider?.email
  });

  const totalRevenue = orders.reduce((s, o) => s + (o.subtotal || 0), 0);
  const totalCommission = orders.reduce((s, o) => s + (o.commission_amount || 0), 0);
  const totalEarnings = totalRevenue - totalCommission;
  const totalWithdrawn = payouts.filter(p => ['completed','approved','processing'].includes(p.status)).reduce((s, p) => s + p.amount, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn - pendingPayouts;

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      if (amount > availableBalance) throw new Error(`Max: $${availableBalance.toFixed(2)}`);
      if (amount < 10) throw new Error('Minimum withdrawal is $10');
      await db.Payout.create({
        provider_id: provider.id, provider_email: provider.email, amount, status: 'pending',
        requested_date: new Date().toISOString().split('T')[0],
        bank_account: bankDetails.bank_account,
        bank_name: withdrawMethod === 'bank' ? bankDetails.bank_name : withdrawMethod
      });
    },
    onSuccess: () => { toast.success('Payout request submitted'); setWithdrawAmount(''); setOpenWithdraw(false); queryClient.invalidateQueries({ queryKey: ['payouts'] }); },
    onError: (e) => toast.error(e.message)
  });

  const inputStyle = { height: 44, padding: '0 14px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };

  if (!user) return (
    <div style={{ minHeight: '100vh', background: L.bg, padding: '48px 32px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}><Skeleton className="h-96 rounded-2xl" /></div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 6, color: L.text }}>Payouts & Earnings</h1>
          <p style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>Platform commission: {COMMISSION_RATE}%</p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }} className="md:grid-cols-4">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: L.accent },
            { label: 'Commission', value: `$${totalCommission.toFixed(2)}`, icon: Percent, color: L.amber },
            { label: 'Net Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: L.green },
            { label: 'Available', value: `$${Math.max(0, availableBalance).toFixed(2)}`, icon: Banknote, color: L.blue },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: 11, color: L.text3 }}>{label}</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: 20, color: L.text }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Balance + Withdraw */}
        <div style={{ background: L.bg2, border: `1px solid ${L.border2}`, borderRadius: 20, padding: '24px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 13, color: L.text2, marginBottom: 4 }}>Available Balance</p>
            <p style={{ fontWeight: 800, fontSize: 32, color: L.green, letterSpacing: '-0.03em' }}>${Math.max(0, availableBalance).toFixed(2)}</p>
            {pendingPayouts > 0 && <p style={{ fontSize: 12, color: L.amber, marginTop: 4 }}>⏳ ${pendingPayouts.toFixed(2)} pending</p>}
          </div>
          <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
            <DialogTrigger asChild>
              <button disabled={availableBalance < 10}
                style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: availableBalance >= 10 ? 'pointer' : 'not-allowed', opacity: availableBalance >= 10 ? 1 : 0.5 }}>
                <Banknote size={16} /> Withdraw Funds
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Request Withdrawal</DialogTitle></DialogHeader>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Withdrawal Method</label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {withdrawMethod === 'bank' && (
                  <>
                    <div>
                      <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Bank Name</label>
                      <input value={bankDetails.bank_name} onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })} placeholder="e.g. Chase Bank" style={inputStyle} />
                    </div>
                    <div>
                      <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Account Number</label>
                      <input value={bankDetails.bank_account} onChange={e => setBankDetails({ ...bankDetails, bank_account: e.target.value })} placeholder="Account number" style={inputStyle} />
                    </div>
                  </>
                )}
                {(withdrawMethod === 'paypal' || withdrawMethod === 'upi') && (
                  <div>
                    <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>{withdrawMethod === 'paypal' ? 'PayPal Email' : 'UPI ID'}</label>
                    <input value={bankDetails.bank_account} onChange={e => setBankDetails({ ...bankDetails, bank_account: e.target.value })} placeholder={withdrawMethod === 'paypal' ? 'you@paypal.com' : 'yourname@upi'} style={inputStyle} />
                  </div>
                )}
                <div>
                  <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Amount (min $10, max ${availableBalance.toFixed(2)})</label>
                  <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="Enter amount" style={inputStyle} />
                </div>
                <button onClick={() => requestPayoutMutation.mutate()} disabled={requestPayoutMutation.isPending || !withdrawAmount}
                  style={{ padding: '12px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: withdrawAmount ? 1 : 0.5 }}>
                  {requestPayoutMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tabs */}
        <div style={{ display: 'inline-flex', gap: 4, padding: 4, background: L.bg2, border: `1px solid ${L.border}`, borderRadius: 100, marginBottom: 20 }}>
          {[{ k: 'history', l: 'Withdrawal History' }, { k: 'earnings', l: 'Earnings Breakdown' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)}
              style={{ padding: '9px 18px', borderRadius: 100, border: 'none', background: tab === t.k ? L.text : 'transparent', color: tab === t.k ? '#fff' : L.text2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
              {t.l}
            </button>
          ))}
        </div>

        {tab === 'history' && (
          <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '20px 24px' }}>
            {payoutsLoading ? <Skeleton className="h-32 rounded-xl" /> : payouts.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {payouts.map(payout => {
                  const st = STATUS_STYLES[payout.status] || STATUS_STYLES.pending;
                  return (
                    <div key={payout.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: 14, background: L.bg2 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Banknote size={16} style={{ color: L.accent }} />
                        <div>
                          <p style={{ fontWeight: 700, fontSize: 15, color: L.text }}>${payout.amount}</p>
                          <p style={{ fontSize: 12, color: L.text3 }}>{payout.bank_name || 'Transfer'} · {new Date(payout.requested_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <span style={{ padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 700, background: st.bg, color: st.color }}>{payout.status}</span>
                    </div>
                  );
                })}
              </div>
            ) : <p style={{ textAlign: 'center', color: L.text2, padding: '32px 0', fontWeight: 300 }}>No withdrawal history</p>}
          </div>
        )}

        {tab === 'earnings' && (
          <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { l: 'Platform Commission Rate', v: `${COMMISSION_RATE}%`, c: L.text2 },
                { l: 'Total Orders Completed', v: orders.length, c: L.text2 },
                { l: 'Gross Revenue', v: `$${totalRevenue.toFixed(2)}`, c: L.text },
                { l: 'Commission Deducted', v: `-$${totalCommission.toFixed(2)}`, c: L.accent },
                { l: 'Net Earnings', v: `$${totalEarnings.toFixed(2)}`, c: L.green },
              ].map(({ l, v, c }) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 12, background: L.bg2 }}>
                  <span style={{ color: L.text2, fontSize: 14 }}>{l}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: c }}>{v}</span>
                </div>
              ))}
            </div>
            {orders.length > 0 && (
              <>
                <h4 style={{ fontWeight: 700, fontSize: 14, marginBottom: 12, color: L.text }}>Recent Orders</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 240, overflowY: 'auto' }}>
                  {orders.slice(0, 10).map(order => (
                    <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', borderRadius: 10, background: L.bg2, fontSize: 13 }}>
                      <span style={{ color: L.text2 }}>{order.service_name} · {order.scheduled_date}</span>
                      <span style={{ color: L.text, fontWeight: 600 }}>${((order.subtotal || 0) - (order.commission_amount || 0)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}