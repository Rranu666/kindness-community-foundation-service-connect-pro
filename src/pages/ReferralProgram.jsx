import { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Share2, TrendingUp, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReferralCard from '@/components/referral/ReferralCard';

const L = {
  bg: '#ffffff', bg2: '#f7f7f5', bg3: '#f0efed',
  border: '#e2e0dc', border2: '#d4d0ca',
  text: '#111111', text2: '#555555', text3: '#999999',
  accent: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0',
};

export default function ReferralProgram() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => { auth.me().then(setUser).catch(() => {}); }, []);

  useEffect(() => {
    if (!user?.email) return;
    const initializeCode = async () => {
      const existingReferrals = await db.Referral.filter({ referrer_email: user.email });
      if (existingReferrals.length > 0 && existingReferrals[0].referral_code) {
        setReferralCode(existingReferrals[0].referral_code);
      } else {
        const code = `REF${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        await db.Referral.create({ referrer_email: user.email, referrer_type: user.role || 'customer', referral_code: code, referred_email: '', referred_type: 'customer', status: 'pending', reward_amount: 15, reward_type: 'discount' });
        setReferralCode(code);
      }
    };
    initializeCode();
  }, [user?.email]);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => db.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email
  });

  const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'claimed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalEarnings = completedReferrals.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  if (!user) {
    return (
      <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}><Skeleton className="h-96" /></div>
      </div>
    );
  }

  return (
    <div style={{ background: L.bg, minHeight: '100vh', padding: '48px 32px 80px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, letterSpacing: '-1.5px', color: L.text, marginBottom: 8 }}>Referral Program</h1>
        <p style={{ color: L.text2, marginBottom: 36, fontWeight: 300 }}>Earn rewards by inviting friends and service providers</p>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}`, icon: TrendingUp, color: L.accent },
            { label: 'Completed Referrals', value: completedReferrals.length, icon: Users, color: L.green },
            { label: 'Pending Referrals', value: pendingReferrals.length, icon: Share2, color: L.amber },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px' }}>
              <div className="flex items-start justify-between">
                <div>
                  <p style={{ fontSize: 13, color: L.text2, marginBottom: 8 }}>{label}</p>
                  <p style={{ fontSize: 32, fontWeight: 800, color: L.text, letterSpacing: '-0.04em' }}>{value}</p>
                </div>
                <Icon className="w-8 h-8" style={{ color }} />
              </div>
            </div>
          ))}
        </div>

        {referralCode && <ReferralCard code={referralCode} earnings={totalEarnings} />}

        {/* Referrals List */}
        <div style={{ background: '#fff', border: `1px solid ${L.border}`, borderRadius: 20, padding: '24px', marginTop: 28 }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: L.text, marginBottom: 20 }}>Your Referrals</h3>
          {isLoading ? (
            <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16" />)}</div>
          ) : referrals.length > 0 ? (
            <Tabs defaultValue="completed" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-stone-50 border border-stone-200">
                <TabsTrigger value="completed">Completed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
              </TabsList>
              <TabsContent value="completed" className="space-y-3 mt-4">
                {completedReferrals.length > 0 ? completedReferrals.map(ref => (
                  <div key={ref.id} style={{ padding: '16px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontWeight: 600, color: L.text }}>{ref.referred_email}</p>
                        <p style={{ color: L.text3, fontSize: 13 }} className="capitalize">{ref.referred_type} • {ref.reward_type}</p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontWeight: 700, color: L.text }}>${ref.reward_amount}</p>
                        <p style={{ color: L.text3, fontSize: 12 }}>{new Date(ref.completion_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )) : <p style={{ color: L.text2, textAlign: 'center', padding: '32px' }}>No completed referrals yet</p>}
              </TabsContent>
              <TabsContent value="pending" className="space-y-3 mt-4">
                {pendingReferrals.length > 0 ? pendingReferrals.map(ref => (
                  <div key={ref.id} style={{ padding: '16px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}` }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p style={{ fontWeight: 600, color: L.text }}>{ref.referred_email}</p>
                        <p style={{ color: L.text3, fontSize: 13 }}>Waiting for signup...</p>
                      </div>
                      <span style={{ color: L.amber, fontWeight: 600, fontSize: 13 }}>Pending</span>
                    </div>
                  </div>
                )) : <p style={{ color: L.text2, textAlign: 'center', padding: '32px' }}>No pending referrals</p>}
              </TabsContent>
            </Tabs>
          ) : (
            <p style={{ color: L.text2, textAlign: 'center', padding: '32px', fontWeight: 300 }}>No referrals yet. Share your code to earn rewards!</p>
          )}
        </div>
      </div>
    </div>
  );
}