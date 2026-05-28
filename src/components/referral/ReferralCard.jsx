import React, { useState } from 'react';
import { Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function ReferralCard({ code, earnings }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = `${window.location.origin}/?ref=${code}`;

  const copyUrl = () => {
    navigator.clipboard.writeText(referralUrl);
    toast.success('Referral link copied!');
  };

  return (
    <Card style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.2)' }}>
      <CardHeader>
        <CardTitle className="text-white">Your Referral Code</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 rounded-lg" style={{ background: 'rgba(203,60,122,0.1)', border: '2px dashed #cb3c7a' }}>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Referral Code</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-2xl font-bold text-white font-mono">{code}</p>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyToClipboard}
              className="text-white hover:bg-white/10"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Referral Link</p>
          <div className="flex items-center gap-2 mt-2">
            <p className="text-xs flex-1 p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', wordBreak: 'break-all' }}>
              {referralUrl}
            </p>
            <Button
              size="icon"
              variant="ghost"
              onClick={copyUrl}
              className="text-white hover:bg-white/10"
            >
              {copied ? (
                <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
              ) : (
                <Copy className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t" style={{ borderColor: 'rgba(203,60,122,0.2)' }}>
          <p className="text-sm text-white mb-1">Total Earnings from Referrals</p>
          <p className="text-3xl font-bold" style={{ color: '#cb3c7a' }}>${earnings.toFixed(2)}</p>
        </div>
      </CardContent>
    </Card>
  );
}