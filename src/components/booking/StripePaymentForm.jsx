import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { db, auth, invokeLLM, uploadFile, callFunction } from '@/api/db';

export default function StripePaymentForm({ 
  amount, 
  orderId, 
  paymentMethod, 
  onSuccess, 
  onError 
}) {
  const [loading, setLoading] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    const numOnly = value.replace(/\D/g, '');
    if (numOnly.length === 0) return '';
    if (numOnly.length <= 2) return numOnly;
    return `${numOnly.slice(0, 2)}/${numOnly.slice(2, 4)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvc || !cardDetails.cardholderName) {
      toast.error('Please fill in all card details');
      return;
    }

    // Validate card format
    const cardNum = cardDetails.cardNumber.replace(/\s/g, '');
    if (!/^\d{13,19}$/.test(cardNum)) {
      toast.error('Invalid card number');
      return;
    }

    const [month, year] = cardDetails.expiryDate.split('/').map(Number);
    const now = new Date();
    const expireDate = new Date(2000 + year, month - 1);
    if (isNaN(month) || isNaN(year) || month < 1 || month > 12 || expireDate <= now) {
      toast.error('Invalid expiry date');
      return;
    }

    if (!/^\d{3,4}$/.test(cardDetails.cvc)) {
      toast.error('Invalid CVC');
      return;
    }

    setLoading(true);
    try {
      // IMPORTANT: In PRODUCTION, card details must be tokenized via Stripe.js
      // to ensure PCI DSS compliance. Direct card data should NEVER be sent to backend.
      // The current implementation is for demo only.
      
      // TODO: Replace with proper @stripe/react-stripe-js implementation
      console.warn('[SECURITY] Stripe payment form requires PCI-compliant tokenization in production');
      
      const response = await callFunction('processBookingPayment', {
        orderId,
        totalAmount: amount,
        paymentMethod: 'card',
        // In production: tokenize via Stripe.js and send token only
        cardNumber: cardDetails.cardNumber,
        expiryDate: cardDetails.expiryDate,
        cvc: cardDetails.cvc,
        cardholderName: cardDetails.cardholderName
      });

      if (response.data.success) {
        toast.success(response.data.message);
        onSuccess?.(response.data);
      } else {
        toast.error(response.data.error || 'Payment failed');
        onError?.(response.data.error);
      }
    } catch (error) {
      toast.error(error.message || 'Payment processing failed');
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-white/70 text-sm block mb-2">Cardholder Name</label>
        <input
          type="text"
          value={cardDetails.cardholderName}
          onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
          placeholder="John Doe"
          style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          className="placeholder:text-gray-500"
        />
      </div>

      <div>
        <label className="text-white/70 text-sm block mb-2">Card Number</label>
        <input
          type="text"
          value={cardDetails.cardNumber}
          onChange={(e) => setCardDetails({...cardDetails, cardNumber: formatCardNumber(e.target.value.slice(0, 19))})}
          placeholder="4242 4242 4242 4242"
          maxLength="19"
          style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid', width: '100%', boxSizing: 'border-box', outline: 'none' }}
          className="placeholder:text-gray-500 font-mono"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-white/70 text-sm block mb-2">Expiry Date</label>
          <input
            type="text"
            value={cardDetails.expiryDate}
            onChange={(e) => setCardDetails({...cardDetails, expiryDate: formatExpiryDate(e.target.value)})}
            placeholder="MM/YY"
            maxLength="5"
            style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            className="placeholder:text-gray-500"
          />
        </div>
        <div>
          <label className="text-white/70 text-sm block mb-2">CVC</label>
          <input
            type="text"
            value={cardDetails.cvc}
            onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value.slice(0, 4)})}
            placeholder="123"
            maxLength="4"
            style={{ background: '#0f0900', borderColor: 'rgba(203,60,122,0.2)', color: '#fff', padding: '8px 12px', borderRadius: '8px', border: '1px solid', width: '100%', boxSizing: 'border-box', outline: 'none' }}
            className="placeholder:text-gray-500"
          />
        </div>
      </div>

      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Total: <span className="font-bold" style={{ color: '#cb3c7a' }}>${amount.toFixed(2)}</span>
      </p>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full h-12 text-white" 
        style={{ background: '#cb3c7a' }}
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
        ) : (
          `Pay $${amount.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}