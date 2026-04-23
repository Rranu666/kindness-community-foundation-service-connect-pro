import React from 'react';
import { Star } from 'lucide-react';
import { format } from 'date-fns';

const PINK = '#cb3c7a';

export default function ReviewCard({ review, dark = false }) {
  if (dark) {
    return (
      <div className="rounded-xl p-5" style={{ background: '#140b00', border: '1px solid rgba(203,60,122,0.12)' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-white text-sm" style={{ background: PINK }}>
            {review.customer_name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white text-sm">{review.customer_name || 'Anonymous'}</span>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {(review.created_at || review.created_date) ? format(new Date(review.created_at || review.created_date), 'MMM d, yyyy') : ''}
              </span>
            </div>
            <div className="flex items-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-white/10'}`} />
              ))}
            </div>
            {review.comment && (
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{review.comment}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-100">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#cb3c7a] to-[#9b2d5c] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-white">
            {review.customer_name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-slate-800">{review.customer_name || 'Anonymous'}</h4>
            <span className="text-xs text-slate-400">
              {(review.created_at || review.created_date) ? format(new Date(review.created_at || review.created_date), 'MMM d, yyyy') : ''}
            </span>
          </div>
          <div className="flex items-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star key={star} className={`w-4 h-4 ${star <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
            ))}
          </div>
          {review.comment && (
            <p className="text-sm text-slate-600">{review.comment}</p>
          )}
        </div>
      </div>
    </div>
  );
}