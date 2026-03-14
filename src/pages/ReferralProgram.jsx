import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Share2, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReferralCard from '@/components/referral/ReferralCard';
import { v4 as uuidv4 } from 'uuid';

export default function ReferralProgram() {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  // Initialize referral code if not exists
  useEffect(() => {
    if (user?.email && !referralCode) {
      const storedCode = localStorage.getItem(`ref_code_${user.email}`);
      if (storedCode) {
        setReferralCode(storedCode);
      } else {
        const newCode = `REF${uuidv4().substring(0, 8).toUpperCase()}`;
        localStorage.setItem(`ref_code_${user.email}`, newCode);
        setReferralCode(newCode);
      }
    }
  }, [user?.email, referralCode]);

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['referrals', user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user?.email }),
    enabled: !!user?.email
  });

  const completedReferrals = referrals.filter(r => r.status === 'completed' || r.status === 'claimed');
  const pendingReferrals = referrals.filter(r => r.status === 'pending');
  const totalEarnings = completedReferrals.reduce((sum, r) => sum + (r.reward_amount || 0), 0);

  if (!user) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-2">Referral Program</h1>
        <p style={{ color: 'rgba(255,255,255,0.6)' }} className="mb-8">Earn rewards by inviting friends and service providers</p>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Total Earnings</p>
                  <p className="text-3xl font-bold text-white mt-2">${totalEarnings.toFixed(2)}</p>
                </div>
                <TrendingUp className="w-8 h-8" style={{ color: '#e8356d' }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Completed Referrals</p>
                  <p className="text-3xl font-bold text-white mt-2">{completedReferrals.length}</p>
                </div>
                <Users className="w-8 h-8" style={{ color: '#10b981' }} />
              </div>
            </CardContent>
          </Card>

          <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Pending Referrals</p>
                  <p className="text-3xl font-bold text-white mt-2">{pendingReferrals.length}</p>
                </div>
                <Share2 className="w-8 h-8" style={{ color: '#f59e0b' }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code */}
        {referralCode && <ReferralCard code={referralCode} earnings={totalEarnings} />}

        {/* Referrals List */}
        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }} className="mt-8">
          <CardHeader>
            <CardTitle className="text-white">Your Referrals</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : referrals.length > 0 ? (
              <Tabs defaultValue="completed" className="w-full">
                <TabsList className="grid w-full grid-cols-2" style={{ background: 'rgba(232,53,109,0.1)' }}>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>

                <TabsContent value="completed" className="space-y-3 mt-4">
                  {completedReferrals.length > 0 ? (
                    completedReferrals.map(ref => (
                      <div key={ref.id} className="p-4 rounded-lg" style={{ background: 'rgba(232,53,109,0.05)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{ref.referred_email}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm capitalize">
                              {ref.referred_type} • {ref.reward_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-bold">${ref.reward_amount}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-xs">
                              {new Date(ref.completion_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-center py-8">
                      No completed referrals yet
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="pending" className="space-y-3 mt-4">
                  {pendingReferrals.length > 0 ? (
                    pendingReferrals.map(ref => (
                      <div key={ref.id} className="p-4 rounded-lg" style={{ background: 'rgba(255,165,0,0.05)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{ref.referred_email}</p>
                            <p style={{ color: 'rgba(255,255,255,0.5)' }} className="text-sm">
                              Waiting for signup...
                            </p>
                          </div>
                          <div className="text-right">
                            <p style={{ color: '#f59e0b' }} className="font-semibold text-sm">Pending</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-center py-8">
                      No pending referrals
                    </p>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.6)' }} className="text-center py-8">
                No referrals yet. Share your code to earn rewards!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}