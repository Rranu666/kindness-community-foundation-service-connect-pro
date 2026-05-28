import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import { Star, AlertCircle } from 'lucide-react';
import VerifyRateModal from './VerifyRateModal';
import { toast } from 'sonner';

export default function ReviewTrigger({ orderId, providerId, onReviewComplete }) {
  const [showModal, setShowModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => db.Order.get(orderId),
    enabled: !!orderId,
  });

  const { data: existingReviews = [] } = useQuery({
    queryKey: ['reviews', orderId],
    queryFn: () => db.Review.filter({ order_id: orderId }),
    enabled: !!orderId,
  });

  useEffect(() => {
    setHasReviewed(existingReviews.length > 0);
  }, [existingReviews]);

  const handleReviewSubmit = async (reviewData) => {
    try {
      await db.Review.create(reviewData);
      setShowModal(false);
      setHasReviewed(true);
      toast.success('Thank you for your review!');
      onReviewComplete?.();
    } catch (error) {
      toast.error('Failed to submit review');
    }
  };

  if (order?.status !== 'completed') {
    return null;
  }

  return (
    <>
      {!hasReviewed && (
        <div style={{
          padding: '16px 20px',
          borderRadius: 14,
          background: 'rgba(67,97,238,0.1)',
          border: '1px solid rgba(67,97,238,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <Star size={16} style={{ color: '#4361EE' }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#F0F2FF', marginBottom: 4 }}>
              How was your experience?
            </p>
            <p style={{ fontSize: 12, color: 'rgba(240,242,255,0.6)' }}>
              Share your feedback to help other customers find great providers
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 10,
              background: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
              border: 'none',
              color: '#fff',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}>
            Leave Review
          </button>
        </div>
      )}

      <VerifyRateModal
        open={showModal}
        onClose={() => setShowModal(false)}
        orderId={orderId}
        providerId={providerId}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}