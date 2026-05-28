import { useEffect, useState } from 'react';
import { db, auth, invokeLLM, uploadFile, callFunction } from '@/api/db';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function ReferralLinkHandler({ referralCode, onProcessed }) {
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    if (!referralCode) return;

    const processReferral = async () => {
      try {
        const user = await auth.me();
        if (!user) {
          // User not authenticated, store code for later
          localStorage.setItem('pending_referral_code', referralCode);
          setStatus('pending_auth');
          setMessage('Sign up or log in to claim your referral discount');
          return;
        }

        // Process the referral
        const response = await callFunction('processReferralSignup', {
          referral_code: referralCode,
          referred_email: user.email,
          referred_type: user.role || 'customer',
        });

        if (response.data?.success) {
          setPromoCode(response.data.referred_promo_code);
          setStatus('success');
          setMessage(`You've been referred! Use code: ${response.data.referred_promo_code} for $15 off`);
          localStorage.removeItem('pending_referral_code');
        } else {
          setStatus('error');
          setMessage(response.data?.error || 'Failed to process referral');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message);
      }

      onProcessed?.();
    };

    processReferral();
  }, [referralCode, onProcessed]);

  if (status === 'processing') {
    return (
      <div style={{ padding: '12px 16px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgb(59, 130, 246)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <Loader2 size={16} style={{ color: 'rgb(59, 130, 246)' }} className="animate-spin" />
        <span style={{ color: 'rgb(59, 130, 246)', fontSize: 13 }}>Processing referral...</span>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={{ padding: '12px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgb(16, 185, 129)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
        <CheckCircle2 size={16} style={{ color: 'rgb(16, 185, 129)' }} />
        <div style={{ color: 'rgb(16, 185, 129)', fontSize: 13 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgb(239, 68, 68)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
      <AlertCircle size={16} style={{ color: 'rgb(239, 68, 68)' }} />
      <span style={{ color: 'rgb(239, 68, 68)', fontSize: 13 }}>{message}</span>
    </div>
  );
}