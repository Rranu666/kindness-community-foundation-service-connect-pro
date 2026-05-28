import React from 'react';
import { Star } from 'lucide-react';
import { THEME as L } from '@/lib/theme';

export default function ProviderRatingBadge({ rating = 0, reviews = 0, showReviewCount = true }) {
  if (rating === 0 && reviews === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => <Star key={i} size={13} style={{ color: L.border2 }} />)}
        </div>
        <span style={{ fontSize: 11, color: L.text3 }}>No reviews yet</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: L.text }}>{rating.toFixed(1)}</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3,4,5].map(i => (
            <Star key={i} size={12}
              fill={i <= Math.round(rating) ? '#f59e0b' : 'transparent'}
              style={{ color: i <= Math.round(rating) ? '#f59e0b' : L.border2 }} />
          ))}
        </div>
      </div>
      {showReviewCount && (
        <span style={{ fontSize: 11, color: L.text3 }}>
          {reviews} {reviews === 1 ? 'review' : 'reviews'}
        </span>
      )}
    </div>
  );
}