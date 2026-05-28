import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import ReviewSubmissionModal from './ReviewSubmissionModal';
import ReviewCard from './ReviewCard';
import { Button } from '@/components/ui/button';
import { Star, MessageCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const G = {
  bg: '#080A12',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.25)',
  rose: '#FF4D6D',
  amber: '#FF8C42',
  green: '#06D6A0',
};

export default function CustomerReviewsSection() {
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Fetch customer's orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-orders', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return db.Order.filter(
        { customer_email: user.email, status: 'completed' },
        '-created_date'
      );
    },
    enabled: !!user?.email,
  });

  // Fetch reviews for each order
  const { data: reviews = [], isLoading: reviewsLoading } = useQuery({
    queryKey: ['customer-reviews', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return db.Review.filter({ customer_email: user.email }, '-created_date');
    },
    enabled: !!user?.email,
  });

  React.useEffect(() => {
    auth.me().then(setUser).catch(() => {});
  }, []);

  const reviewedOrderIds = new Set(reviews.map(r => r.order_id));
  const unreviewed = orders.filter(o => !reviewedOrderIds.has(o.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Unreviewed Orders Section */}
      {unreviewed.length > 0 && (
        <div style={{
          padding: '20px',
          borderRadius: 16,
          background: `${G.amber}10`,
          border: `1px solid ${G.amber}25`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <MessageCircle size={20} style={{ color: G.amber }} />
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 16, color: G.text, margin: 0 }}>
                Share Your Experience
              </h3>
              <p style={{ fontSize: 13, color: G.muted, margin: '4px 0 0 0' }}>
                You have {unreviewed.length} completed job{unreviewed.length > 1 ? 's' : ''} to review
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {unreviewed.map(order => (
              <div
                key={order.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: `1px solid ${G.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <p style={{ fontWeight: 600, fontSize: 13, color: G.text, margin: 0 }}>
                    {order.service_name} by {order.provider_name}
                  </p>
                  <p style={{ fontSize: 12, color: G.faint, margin: '2px 0 0 0' }}>
                    Completed {new Date(order.updated_date).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowReviewModal(true);
                  }}
                  style={{
                    background: G.amber,
                    color: '#fff',
                    fontWeight: 700,
                    padding: '8px 16px',
                    borderRadius: 10,
                    border: 'none',
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Write Review
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Section */}
      <div>
        <h3 style={{ fontWeight: 700, fontSize: 18, color: G.text, marginBottom: 16 }}>
          My Reviews
        </h3>

        {reviewsLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array(2).fill(0).map((_, i) => (
              <Skeleton key={i} style={{ height: 200, borderRadius: 16 }} />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            borderRadius: 16,
            background: G.surface,
            border: `1px solid ${G.border}`,
          }}>
            <Star size={32} style={{ color: G.faint, margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: G.muted, margin: 0 }}>
              No reviews yet. Complete a job and share your experience.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} isProvider={false} />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedOrder && (
        <ReviewSubmissionModal
          open={showReviewModal}
          onOpenChange={setShowReviewModal}
          order={selectedOrder}
          provider={{ id: selectedOrder.provider_id, name: selectedOrder.provider_name }}
        />
      )}
    </div>
  );
}