import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown, CreditCard, Wallet } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
};

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [openAddMoney, setOpenAddMoney] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.email],
    queryFn: () => db.Wallet.filter({ customer_email: user?.email }).then(w => w[0]),
    enabled: !!user?.email
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => db.Transaction.filter({ customer_email: user?.email }, '-created_date'),
    enabled: !!user?.email
  });

  const addMoneyMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(addMoneyAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      const newBalance = (wallet?.balance || 0) + amount;
      if (wallet) {
        await db.Wallet.update(wallet.id, { balance: newBalance, total_added: (wallet.total_added || 0) + amount });
      } else {
        await db.Wallet.create({ customer_email: user.email, balance: amount, total_added: amount, total_spent: 0 });
      }
      await db.Transaction.create({ customer_email: user.email, type: 'credit', amount, payment_method: 'card', description: 'Wallet top-up' });
    },
    onSuccess: () => {
      toast.success('Money added to wallet'); setAddMoneyAmount(''); setOpenAddMoney(false);
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.email] });
    },
    onError: (e) => toast.error(e.message || 'Failed to add money')
  });

  if (walletLoading) return (
    <div style={{ minHeight: '100vh', background: L.bg, padding: '48px 32px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Skeleton className="h-48 mb-6 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    </div>
  );

  const QUICK_AMOUNTS = [25, 50, 100, 200];
  const inputStyle = { width: '100%', height: 44, padding: '0 14px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  return (
    <div style={{ minHeight: '100vh', background: L.bg, color: L.text, padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>

        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-1.5px', marginBottom: 6, color: L.text }}>My Wallet</h1>
          <p style={{ fontSize: 14, color: L.text2, fontWeight: 300 }}>Manage your balance and transaction history.</p>
        </div>

        {/* Balance card */}
        <div style={{ background: L.bg2, border: `1px solid ${L.border2}`, borderRadius: 24, padding: '32px', marginBottom: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Wallet size={16} style={{ color: L.text3 }} />
                <span style={{ fontSize: 13, color: L.text2 }}>Wallet Balance</span>
              </div>
              <h2 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.04em', color: L.text, lineHeight: 1 }}>
                ${(wallet?.balance || 0).toFixed(2)}
              </h2>
              <div style={{ display: 'flex', gap: 20, marginTop: 12, fontSize: 12, color: L.text2 }}>
                <span>Added: <strong style={{ color: L.green }}>${(wallet?.total_added || 0).toFixed(2)}</strong></span>
                <span>Spent: <strong style={{ color: L.accent }}>${(wallet?.total_spent || 0).toFixed(2)}</strong></span>
              </div>
            </div>
            <Dialog open={openAddMoney} onOpenChange={setOpenAddMoney}>
              <DialogTrigger asChild>
                <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 22px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: 'pointer', flexShrink: 0 }}>
                  <Plus size={18} /> Add Money
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Money to Wallet</DialogTitle></DialogHeader>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: L.text2, marginBottom: 12 }}>Quick amounts</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
                    {QUICK_AMOUNTS.map(amt => (
                      <button key={amt} onClick={() => setAddMoneyAmount(String(amt))}
                        style={{ padding: '10px', borderRadius: 10, border: `1px solid ${addMoneyAmount === String(amt) ? L.accent : L.border}`, background: addMoneyAmount === String(amt) ? `${L.accent}10` : L.bg2, color: addMoneyAmount === String(amt) ? L.accent : L.text2, fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>
                        ${amt}
                      </button>
                    ))}
                  </div>
                  <label style={{ fontSize: 13, color: L.text2, display: 'block', marginBottom: 6 }}>Custom Amount</label>
                  <input type="number" placeholder="Enter amount" value={addMoneyAmount} onChange={e => setAddMoneyAmount(e.target.value)} style={inputStyle} />
                </div>
                <button onClick={() => addMoneyMutation.mutate()} disabled={addMoneyMutation.isPending || !addMoneyAmount}
                  style={{ width: '100%', padding: '13px', borderRadius: 100, background: L.text, border: 'none', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer', opacity: addMoneyAmount ? 1 : 0.5 }}>
                  {addMoneyMutation.isPending ? 'Processing...' : 'Add Money'}
                </button>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total Credited', value: `$${(wallet?.total_added || 0).toFixed(2)}`, icon: TrendingUp, color: L.green },
            { label: 'Total Spent', value: `$${(wallet?.total_spent || 0).toFixed(2)}`, icon: TrendingDown, color: L.accent },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 16, padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <Icon size={14} style={{ color }} />
                <span style={{ fontSize: 12, color: L.text3 }}>{label}</span>
              </div>
              <p style={{ fontWeight: 800, fontSize: 22, color: L.text }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Transactions */}
        <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' }}>
          <h3 style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: L.text }}>Transaction History</h3>
          {txLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : transactions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {transactions.map(tx => (
                <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 14, background: L.bg2, border: `1px solid ${L.border}` }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: tx.type === 'credit' ? `${L.green}15` : `${L.accent}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {tx.type === 'credit' ? <TrendingUp size={18} style={{ color: L.green }} /> : <TrendingDown size={18} style={{ color: L.accent }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: 14, color: L.text, marginBottom: 2 }}>{tx.description || `${tx.type} — ${tx.payment_method}`}</p>
                    <p style={{ fontSize: 12, color: L.text3 }}>{new Date(tx.created_date).toLocaleDateString()}</p>
                  </div>
                  <p style={{ fontWeight: 800, fontSize: 16, color: tx.type === 'credit' ? L.green : L.accent, flexShrink: 0 }}>
                    {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <CreditCard size={36} style={{ color: L.text3, margin: '0 auto 12px' }} />
              <p style={{ color: L.text2, fontSize: 14, fontWeight: 300 }}>No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}