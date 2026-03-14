import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function WalletPage() {
  const [user, setUser] = useState(null);
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [openAddMoney, setOpenAddMoney] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: wallet, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', user?.email],
    queryFn: () => base44.entities.Wallet.filter({ customer_email: user?.email }).then(w => w[0]),
    enabled: !!user?.email
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ['transactions', user?.email],
    queryFn: () => base44.entities.Transaction.filter({ customer_email: user?.email }, '-created_date'),
    enabled: !!user?.email
  });

  const addMoneyMutation = useMutation({
    mutationFn: async () => {
      const amount = parseFloat(addMoneyAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      const newBalance = (wallet?.balance || 0) + amount;
      
      if (wallet) {
        await base44.entities.Wallet.update(wallet.id, {
          balance: newBalance,
          total_added: (wallet.total_added || 0) + amount
        });
      } else {
        await base44.entities.Wallet.create({
          customer_email: user.email,
          balance: amount,
          total_added: amount,
          total_spent: 0
        });
      }

      await base44.entities.Transaction.create({
        customer_email: user.email,
        type: 'credit',
        amount: amount,
        payment_method: 'card',
        description: `Wallet top-up`
      });

      return true;
    },
    onSuccess: () => {
      toast.success('Money added to wallet');
      setAddMoneyAmount('');
      setOpenAddMoney(false);
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.email] });
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.email] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add money');
    }
  });

  if (walletLoading) {
    return (
      <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
        <div className="max-w-4xl mx-auto px-4">
          <Skeleton className="h-40 mb-8" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#0d0d1f' }} className="min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-white mb-8">My Wallet</h1>

        {/* Wallet Balance */}
        <Card style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0d0d1f 100%)', border: '1px solid rgba(232,53,109,0.3)' }} className="mb-8">
          <CardContent className="pt-8 pb-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Wallet Balance</p>
                  <h2 className="text-4xl font-bold text-white mt-2">${(wallet?.balance || 0).toFixed(2)}</h2>
                <p className="text-sm mt-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Total Added: ${(wallet?.total_added || 0).toFixed(2)} | Total Spent: ${(wallet?.total_spent || 0).toFixed(2)}
                </p>
              </div>
              <Dialog open={openAddMoney} onOpenChange={setOpenAddMoney}>
                <DialogTrigger asChild>
                  <Button size="lg" style={{ background: '#e8356d' }} className="text-white hover:opacity-90">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Money
                  </Button>
                </DialogTrigger>
                <DialogContent style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.3)' }}>
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Money to Wallet</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-white text-sm mb-2 block">Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={addMoneyAmount}
                        onChange={(e) => setAddMoneyAmount(e.target.value)}
                        style={{ background: '#0d0d1f', borderColor: 'rgba(232,53,109,0.2)', color: '#fff' }}
                        className="text-white placeholder:text-gray-500"
                      />
                    </div>
                    <Button
                      className="w-full text-white"
                      style={{ background: '#e8356d' }}
                      onClick={() => addMoneyMutation.mutate()}
                      disabled={addMoneyMutation.isPending || !addMoneyAmount}
                    >
                      {addMoneyMutation.isPending ? 'Processing...' : 'Add Money'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Transaction History */}
        <Card style={{ background: '#13132a', border: '1px solid rgba(232,53,109,0.2)' }}>
          <CardHeader>
            <CardTitle className="text-white">Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            ) : transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg" style={{ background: 'rgba(232,53,109,0.05)' }}>
                    <div className="flex items-center gap-3 flex-1">
                      {tx.type === 'credit' ? (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.2)' }}>
                          <TrendingUp className="w-5 h-5" style={{ color: '#10b981' }} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'rgba(239,68,68,0.2)' }}>
                          <TrendingDown className="w-5 h-5" style={{ color: '#ef4444' }} />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold capitalize">{tx.description || `${tx.type} - ${tx.payment_method}`}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          {new Date(tx.created_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold" style={{ color: tx.type === 'credit' ? '#10b981' : '#ef4444' }}>
                      {tx.type === 'credit' ? '+' : '-'}${tx.amount}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center py-8" style={{ color: 'rgba(255,255,255,0.6)' }}>No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}