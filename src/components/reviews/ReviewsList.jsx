import React, { useState, useEffect } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import ReviewCard from './ReviewCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Star } from 'lucide-react';

const G = {
  bg: '#080A12',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.25)',
  amber: '#FF8C42',
};

export default function ReviewsList({ providerId, isProvider = false, onReviewsLoaded = null }) {
  const { data: reviews = [], isLoading, refetch } = useQuery({
    queryKey: ['provider-reviews', providerId],
    queryFn: () => db.Review.filter({ provider_id: providerId }, '-created_date'),
  });

  useEffect(() => {
    onReviewsLoaded?.(reviews);
  }, [reviews, onReviewsLoaded]);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Summary Stats */}
      {reviews.length > 0 && (
        <div style={{
          background: G.surface,
          border: `1px solid ${G.border}`,
          borderRadius: 16,
          padding: '20px',
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: 20,
          alignItems: 'center',
        }}>
          {/* Score */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: G.text }}>
                {averageRating}
              </div>
              <div style={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 4 }}>
                {Array(5).fill(0).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < Math.round(averageRating) ? G.amber : G.faint}
                    style={{ color: i < Math.round(averageRating) ? G.amber : G.faint }}
                  />
                ))}
              </div>
              <p style={{ fontSize: 12, color: G.faint, margin: '6px 0 0 0' }}>
                {reviews.length} review{reviews.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Rating Distribution */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[5, 4, 3, 2, 1].map(rating => (
              <div key={rating} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: G.muted, width: 30 }}>
                  {rating}★
                </span>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: G.border,
                  flex: 1,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%',
                    background: G.amber,
                    width: `${reviews.length > 0 ? (ratingDistribution[rating] / reviews.length) * 100 : 0}%`,
                    transition: 'width 0.3s',
                  }} />
                </div>
                <span style={{ fontSize: 12, color: G.faint, width: 20, textAlign: 'right' }}>
                  {ratingDistribution[rating]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(3).fill(0).map((_, i) => (
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
          <p style={{ fontSize: 14, color: G.muted, margin: 0 }}>
            No reviews yet. Great work will earn great reviews!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {reviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              isProvider={isProvider}
              onReplySubmit={() => refetch()}
            />
          ))}
        </div>
      )}
    </div>
  );
}