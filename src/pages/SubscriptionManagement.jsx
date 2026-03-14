import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { CreditCard, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import PlanCard from '@/components/subscription/PlanCard';

export default function SubscriptionManagement() {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchProvider = async () => {
      if (user?.email) {
        const p = await base44.entities.ServiceProvider.filter({ email: user?.email });
        setProvider(p[0] || null);
      }
    };
    fetchProvider();
  }, [user?.email]);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => base44.entities.SubscriptionPlan.filter({ is_active: true })
  });

  const { data: currentSubscription } = useQuery({
    queryKey: ['current-subscription', provider?.email],
    queryFn: () => base44.entities.ProviderSubscription.filter({ provider_email: provider?.email }).then(s => s[0]),
    enabled: !!provider?.email
  });

  const { data: currentPlan } = useQuery({
    queryKey: ['current-plan', currentSubscription?.plan_id],
    queryFn: async () => {
      const results = await base44.entities.SubscriptionPlan.filter({ id: currentSubscription.plan_id });
      return results[0];
    },
    enabled: !!currentSubscription?.plan_id
  });

  const selectPlanMutation = useMutation({
    mutationFn: async (planId) => {
      if (currentSubscription) {
        await base44.entities.ProviderSubscription.update(currentSubscription.id, {
          status: 'cancelled'
        });
      }

      const today = new Date();
      const nextMonth = new Date(today.setMonth(today.getMonth() + 1));

      await base44.entities.ProviderSubscription.create({
        provider_id: provider.id,
        provider_email: provider.email,
        plan_id: planId,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        renewal_date: nextMonth.toISOString().split('T')[0],
        auto_renew: true,
        payment_method: 'card'
      });

      return true;
    },
    onSuccess: () => {
      toast.success('Plan updated successfully!');
      setSelectedPlan(null);
    },
    onError: () => {
      toast.error('Failed to update plan');
    }
  });

  if (!user) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
        <div className="max-w-6xl mx-auto px-4">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription Plans</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-8">Choose the perfect plan for your business</p>

        {/* Current Subscription */}
        {currentSubscription && currentPlan && (
          <Card style={{ background: 'rgba(232,53,109,0.1)', border: '2px solid #e8356d' }} className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="w-5 h-5" style={{ color: '#e8356d' }} />
                <h3 className="text-lg font-semibold text-white">Current Plan: {currentPlan.name}</h3>
              </div>
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-sm">
                ${currentPlan.price}/month • Commission: {currentPlan.commission_rate}%
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-xs mt-2">
                Next renewal: {new Date(currentSubscription.renewal_date).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Plans Grid */}
        {plansLoading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={currentPlan?.id === plan.id}
                onSelect={() => setSelectedPlan(plan)}
              />
            ))}
          </div>
        )}

        {/* Confirmation Dialog */}
        {selectedPlan && (
          <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
            <DialogContent style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)' }}>
              <DialogHeader>
                <DialogTitle className="text-white">Upgrade to {selectedPlan.name}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="p-4 rounded-lg" style={{ background: 'rgba(255,165,0,0.1)', border: '1px solid rgba(255,165,0,0.3)' }}>
                  <div className="flex gap-2">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-white">Billing Next Cycle</p>
                      <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-xs mt-1">
                        You'll be charged ${selectedPlan.price} at the start of your next billing cycle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-white">
                    <span>Plan Price</span>
                    <span>${selectedPlan.price}/month</span>
                  </div>
                  <div className="flex justify-between" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <span>Commission Rate</span>
                    <span>{selectedPlan.commission_rate}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedPlan(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1 text-white"
                    style={{ background: '#e8356d' }}
                    onClick={() => selectPlanMutation.mutate(selectedPlan.id)}
                    disabled={selectPlanMutation.isPending}
                  >
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