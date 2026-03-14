import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrendingUp, DollarSign, Clock, CheckCircle2, Banknote, Building, Percent, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const COMMISSION_RATE = 10;

const statusColors = {
  pending: { bg: '#fbbf24', text: '#000' },
  approved: { bg: '#3b82f6', text: '#fff' },
  processing: { bg: '#06b6d4', text: '#fff' },
  completed: { bg: '#10b981', text: '#fff' },
  failed: { bg: '#ef4444', text: '#fff' }
};

function StatusBadge({ status }) {
  const s = statusColors[status] || statusColors.pending;
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-full capitalize" style={{ background: s.bg, color: s.text }}>
      {status}
    </span>
  );
}

export default function ProviderPayouts() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [bankDetails, setBankDetails] = useState({ bank_name: '', bank_account: '' });
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (user?.email) {
      base44.entities.ServiceProvider.filter({ email: user.email })
        .then(p => setProvider(p[0] || null));
    }
  }, [user?.email]);

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['completed-orders', provider?.id],
    queryFn: () => base44.entities.Order.filter({ provider_id: provider?.id, status: 'completed' }),
    enabled: !!provider?.id
  });

  const { data: payouts = [], isLoading: payoutsLoading, refetch: refetchPayouts } = useQuery({
    queryKey: ['payouts', provider?.email],
    queryFn: () => base44.entities.Payout.filter({ provider_email: provider?.email }, '-requested_date'),
    enabled: !!provider?.email
  });

  // Financial calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalCommission = orders.reduce((sum, o) => sum + (o.commission_amount || 0), 0);
  const totalEarnings = totalRevenue - totalCommission;
  const totalWithdrawn = payouts
    .filter(p => ['completed', 'approved', 'processing'].includes(p.status))
    .reduce((sum, p) => sum + p.amount, 0);
  const pendingPayouts = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const availableBalance = totalEarnings - totalWithdrawn - pendingPayouts;

  const requestPayoutMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(withdrawAmount);
      if (isNaN(amount) || amount <= 0) throw new Error('Invalid amount');
      if (amount > availableBalance) throw new Error(`Max available: $${availableBalance.toFixed(2)}`);
      if (amount < 10) throw new Error('Minimum withdrawal is $10');

      await base44.entities.Payout.create({
        provider_id: provider.id,
        provider_email: provider.email,
        amount,
        status: 'pending',
        requested_date: new Date().toISOString().split('T')[0],
        bank_account: bankDetails.bank_account,
        bank_name: withdrawMethod === 'bank' ? bankDetails.bank_name : withdrawMethod
      });

      await base44.entities.Notification.create({
        recipient_email: provider.email,
        recipient_type: 'provider',
        type: 'payout_approved',
        title: 'Payout Request Submitted',
        message: `Your payout of $${amount} has been submitted and is being reviewed.`,
        channels: ['email']
      });
    },
    onSuccess: () => {
      toast.success('Payout request submitted');
      setWithdrawAmount('');
      setOpenWithdraw(false);
      queryClient.invalidateQueries({ queryKey: ['payouts'] });
    },
    onError: (e) => toast.error(e.message || 'Failed to request payout')
  });

  if (!user) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4"><Skeleton className="h-96" /></div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Payouts & Earnings</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>Platform commission: {COMMISSION_RATE}%</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: '#e8356d' },
            { label: 'Commission Paid', value: `$${totalCommission.toFixed(2)}`, icon: Percent, color: '#f59e0b' },
            { label: 'Net Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: DollarSign, color: '#10b981' },
            { label: 'Available', value: `$${Math.max(0, availableBalance).toFixed(2)}`, icon: Banknote, color: '#3b82f6' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
              <CardContent className="p-4">
                <Icon className="w-5 h-5 mb-2" style={{ color }} />
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
                <p className="text-xl font-bold text-white">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Withdraw Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-white font-semibold text-lg">Available Balance: <span style={{ color: '#10b981' }}>${Math.max(0, availableBalance).toFixed(2)}</span></p>
            {pendingPayouts > 0 && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>Pending: ${pendingPayouts.toFixed(2)}</p>
            )}
          </div>
          <Dialog open={openWithdraw} onOpenChange={setOpenWithdraw}>
            <DialogTrigger asChild>
              <Button style={{ background: '#e8356d' }} className="text-white" disabled={availableBalance < 10}>
                <Banknote className="w-4 h-4 mr-2" /> Withdraw Funds
              </Button>
            </DialogTrigger>
            <DialogContent style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)' }}>
              <DialogHeader>
                <DialogTitle className="text-white">Request Withdrawal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Withdrawal Method</Label>
                  <Select value={withdrawMethod} onValueChange={setWithdrawMethod}>
                    <SelectTrigger style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ background: '#13132a' }}>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {withdrawMethod === 'bank' && (
                  <>
                    <div>
                      <Label className="text-white">Bank Name</Label>
                      <Input value={bankDetails.bank_name}
                        onChange={e => setBankDetails({ ...bankDetails, bank_name: e.target.value })}
                        placeholder="e.g. HDFC Bank"
                        style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                        className="placeholder:text-gray-500" />
                    </div>
                    <div>
                      <Label className="text-white">Account Number</Label>
                      <Input value={bankDetails.bank_account}
                        onChange={e => setBankDetails({ ...bankDetails, bank_account: e.target.value })}
                        placeholder="Account number"
                        style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                        className="placeholder:text-gray-500" />
                    </div>
                  </>
                )}

                {(withdrawMethod === 'mobile_money' || withdrawMethod === 'paypal' || withdrawMethod === 'upi') && (
                  <div>
                    <Label className="text-white">{withdrawMethod === 'paypal' ? 'PayPal Email' : withdrawMethod === 'upi' ? 'UPI ID' : 'Mobile Number'}</Label>
                    <Input value={bankDetails.bank_account}
                      onChange={e => setBankDetails({ ...bankDetails, bank_account: e.target.value })}
                      placeholder={withdrawMethod === 'paypal' ? 'you@paypal.com' : withdrawMethod === 'upi' ? 'yourname@upi' : '+91 99999 99999'}
                      style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                      className="placeholder:text-gray-500" />
                  </div>
                )}

                <div>
                  <Label className="text-white">Amount</Label>
                  <Input type="number" value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder={`Max: $${availableBalance.toFixed(2)}`}
                    max={availableBalance}
                    style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                    className="placeholder:text-gray-500" />
                  <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Minimum withdrawal: $10</p>
                </div>

                <Button className="w-full text-white" style={{ background: '#e8356d' }}
                  onClick={() => requestPayoutMutation.mutate()}
                  disabled={requestPayoutMutation.isPending || !withdrawAmount}>
                  {requestPayoutMutation.isPending ? 'Processing...' : 'Request Withdrawal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="history">
          <TabsList style={{ background: 'rgba(255,255,255,0.05)' }} className="border border-white/10 mb-4">
            <TabsTrigger value="history" className="text-white data-[state=active]:bg-pink-500/20">Withdrawal History</TabsTrigger>
            <TabsTrigger value="earnings" className="text-white data-[state=active]:bg-pink-500/20">Earnings Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="history">
            <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
              <CardContent className="pt-4">
                {payoutsLoading ? (
                  <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
                ) : payouts.length > 0 ? (
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                        <div className="flex items-center gap-3">
                          <Banknote className="w-5 h-5" style={{ color: '#e8356d' }} />
                          <div>
                            <p className="text-white font-semibold">${payout.amount}</p>
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                              {payout.bank_name || 'Bank Transfer'} · {new Date(payout.requested_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StatusBadge status={payout.status} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.5)' }}>No withdrawal history</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings">
            <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
              <CardHeader>
                <CardTitle className="text-white text-base">Commission Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Platform Commission Rate</span>
                    <span className="text-white font-semibold">{COMMISSION_RATE}%</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Total Orders Completed</span>
                    <span className="text-white font-semibold">{orders.length}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Gross Revenue</span>
                    <span className="text-white font-semibold">${totalRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.07)' }}>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>Commission Deducted</span>
                    <span style={{ color: '#ef4444' }} className="font-semibold">-${totalCommission.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}>
                    <span className="text-white font-semibold">Net Earnings</span>
                    <span style={{ color: '#10b981' }} className="font-bold text-lg">${totalEarnings.toFixed(2)}</span>
                  </div>
                </div>

                {orders.length > 0 && (
                  <div>
                    <p className="text-white font-medium mb-3">Recent Completed Orders</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {orders.slice(0, 10).map(order => (
                        <div key={order.id} className="flex justify-between text-sm p-2 rounded" style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <span style={{ color: 'rgba(255,255,255,0.6)' }}>{order.service_name} · {order.scheduled_date}</span>
                          <div className="text-right">
                            <span className="text-white">${((order.subtotal || 0) - (order.commission_amount || 0)).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}