import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PlanCard from '@/components/subscription/PlanCard';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', border: '#e2e0dc',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D',
};

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);
  useEffect(() => {
    if (user?.email) db.ServiceProvider.filter({ email: user?.email }).then(p => setProvider(p[0] || null));
  }, [user?.email]);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => db.SubscriptionPlan.filter({ is_active: true })
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription', provider?.email],
    queryFn: () => db.ProviderSubscription.filter({ provider_email: provider?.email }).then(s => s[0]),
    enabled: !!provider?.email
  });

  const { data: currentPlan } = useQuery({
    queryKey: ['current-plan', currentSubscription?.plan_id],
    queryFn: async () => { const r = await db.SubscriptionPlan.filter({ id: currentSubscription.plan_id }); return r[0]; },
    enabled: !!currentSubscription?.plan_id
  });

  const selectPlanMutation = useMutation({
    mutationFn: async (planId) => {
      if (currentSubscription) await db.ProviderSubscription.update(currentSubscription.id, { status: 'cancelled' });
      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
      await db.ProviderSubscription.create({ provider_id: provider.id, provider_email: provider.email, plan_id: planId, status: 'active', start_date: new Date().toISOString().split('T')[0], renewal_date: nextMonth.toISOString().split('T')[0], auto_renew: true, payment_method: 'card' });
    },
    onSuccess: () => { toast.success('Plan updated successfully!'); setSelectedPlan(null); },
    onError: () => toast.error('Failed to update plan')
  });

  if (!user) return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}><Skeleton className="h-96" /></div>
    </div>
  );

  return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, marginBottom: 8 }}>Subscription Plans</h1>
        <p style={{ color: L.text2, marginBottom: 36, fontWeight: 300 }}>Choose the perfect plan for your business</p>

        {currentSubscription && currentPlan && (
          <div style={{ background: `${L.accent}08`, border: `2px solid ${L.accent}30`, borderRadius: 20, padding: '20px 24px', marginBottom: 32 }}>
            <div className="flex items-center gap-3 mb-2">
              <CreditCard className="w-5 h-5" style={{ color: L.accent }} />
              <h3 style={{ fontSize: 18, fontWeight: 700, color: L.text }}>Current Plan: {currentPlan.name}</h3>
            </div>
            <p style={{ color: L.text2, fontSize: 14 }}>${currentPlan.price}/month • Commission: {currentPlan.commission_rate}%</p>
            <p style={{ color: L.text3, fontSize: 13, marginTop: 4 }}>Next renewal: {new Date(currentSubscription.renewal_date).toLocaleDateString()}</p>
          </div>
        )}

        {plansLoading ? (
          <div className="grid md:grid-cols-3 gap-6">{[1,2,3].map(i => <Skeleton key={i} className="h-96" />)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => <PlanCard key={plan.id} plan={plan} isCurrentPlan={currentPlan?.id === plan.id} onSelect={() => setSelectedPlan(plan)} />)}
          </div>
        )}

        {selectedPlan && (
          <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
            <DialogContent>
              <DialogHeader><DialogTitle>Upgrade to {selectedPlan.name}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div style={{ padding: '16px', borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: L.text }}>Billing Next Cycle</p>
                      <p style={{ color: L.text2, fontSize: 13, marginTop: 4 }}>You'll be charged ${selectedPlan.price} at the start of your next billing cycle.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between" style={{ color: L.text }}><span>Plan Price</span><span>${selectedPlan.price}/month</span></div>
                  <div className="flex justify-between" style={{ color: L.text2 }}><span>Commission Rate</span><span>{selectedPlan.commission_rate}%</span></div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedPlan(null)}>Cancel</Button>
                  <Button className="flex-1 bg-slate-900 text-white hover:bg-slate-700" onClick={() => selectPlanMutation.mutate(selectedPlan.id)} disabled={selectPlanMutation.isPending}>
                    {selectPlanMutation.isPending ? 'Processing...' : 'Confirm Upgrade'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}