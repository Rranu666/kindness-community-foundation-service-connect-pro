import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Star, X, MessageSquare } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const G = {
  bg2: '#0D1020', surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0',
  grad: 'linear-gradient(135deg, #FF8C42 0%, #FF4D6D 100%)',
};

function StarRating({ value, onChange, label }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <p style={{ fontSize: 13, color: G.muted, marginBottom: 6 }}>{label}</p>}
      <div style={{ display: 'flex', gap: 6 }}>
        {[1, 2, 3, 4, 5].map(star => (
          <button key={star} type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, transition: 'transform 0.15s' }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1.1)'}>
            <Star size={28} style={{
              color: (hovered || value) >= star ? G.amber : G.border,
              fill: (hovered || value) >= star ? G.amber : 'transparent',
              transition: 'all 0.15s',
              filter: (hovered || value) >= star ? `drop-shadow(0 0 4px ${G.amber}80)` : 'none',
            }} />
          </button>
        ))}
        <span style={{ alignSelf: 'center', fontSize: 13, color: G.muted, marginLeft: 8 }}>
          {(hovered || value) > 0 ? ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][hovered || value] : ''}
        </span>
      </div>
    </div>
  );
}

export default function ReviewModal({ open, onClose, order }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const submitMutation = useMutation({
    mutationFn: async () => {
      // Create the review (backend function handles rating recalc)
      await db.Review.create({
        order_id: order.id,
        provider_id: order.provider_id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        rating,
        comment,
        would_recommend: rating >= 4,
        is_verified_purchase: true,
      });
    },
    onSuccess: () => {
      toast.success('Review submitted — thank you!');
      queryClient.invalidateQueries({ queryKey: ['reviews', order.provider_id] });
      queryClient.invalidateQueries({ queryKey: ['myProvider'] });
      onClose();
    },
    onError: (err) => toast.error(err?.message || 'Failed to submit review. Please try again.'),
  });

  const handleSubmit = () => {
    if (rating === 0) { toast.error('Please select a star rating'); return; }
    submitMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: G.bg2, border: `1px solid ${G.border}`, color: G.text, maxWidth: 460 }}>
        <DialogHeader>
          <DialogTitle style={{ color: G.text, fontSize: 18, fontWeight: 800 }}>Rate Your Experience</DialogTitle>
        </DialogHeader>

        <div style={{ marginTop: 4 }}>
          {/* Provider info */}
          <div style={{ background: G.surface, border: `1px solid ${G.border}`, borderRadius: 14, padding: '14px 16px', marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 2 }}>Service completed</p>
            <p style={{ fontWeight: 700, color: G.text }}>{order?.service_name}</p>
            <p style={{ fontSize: 12, color: G.faint }}>by {order?.provider_name}</p>
          </div>

          {/* Overall rating */}
          <p style={{ fontSize: 14, fontWeight: 700, color: G.text, marginBottom: 10 }}>Overall Rating *</p>
          <StarRating value={rating} onChange={setRating} />

          {/* Comment */}
          <div style={{ marginTop: 16, marginBottom: 20 }}>
            <p style={{ fontSize: 13, color: G.muted, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <MessageSquare size={13} /> Tell others about your experience (optional)
            </p>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              placeholder="Was the pro on time? Was the work done well? Any tips for others?"
              style={{
                width: '100%', background: G.surface, border: `1px solid ${G.border}`,
                borderRadius: 12, padding: '12px 14px', color: G.text, fontSize: 14,
                resize: 'none', outline: 'none', fontFamily: "'Inter', system-ui, sans-serif",
                lineHeight: 1.6, boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={e => e.target.style.borderColor = G.border}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose}
              style={{ flex: 1, padding: '11px', borderRadius: 12, background: G.surface, border: `1px solid ${G.border}`, color: G.text, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>
              Skip
            </button>
            <button onClick={handleSubmit} disabled={submitMutation.isPending || rating === 0}
              style={{ flex: 2, padding: '11px', borderRadius: 12, background: G.grad, border: 'none', color: '#fff', fontWeight: 700, fontSize: 14, cursor: rating === 0 ? 'not-allowed' : 'pointer', opacity: rating === 0 ? 0.5 : 1 }}>
              {submitMutation.isPending ? 'Submitting…' : 'Submit Review'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}