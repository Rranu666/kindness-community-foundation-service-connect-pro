import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Star, MessageCircle, Send, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const G = {
  bg: '#080A12',
  bg2: '#0D1020',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.25)',
  rose: '#FF4D6D',
  amber: '#FF8C42',
  green: '#06D6A0',
};

export default function ReviewCard({ review, isProvider = false, onReplySubmit = null }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) return;

    setSubmitting(true);
    try {
      await db.Review.update(review.id, {
        provider_response: replyText,
        provider_response_date: new Date().toISOString(),
      });
      setReplyText('');
      setShowReplyForm(false);
      onReplySubmit?.();
    } catch (err) {
      console.error('Failed to submit reply', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: G.surface,
      border: `1px solid ${G.border}`,
      borderRadius: 16,
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>

      {/* Review Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${G.rose}, ${G.amber})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 14,
              color: '#fff',
            }}>
              {review.customer_name?.charAt(0) || 'C'}
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 14, color: G.text, margin: 0 }}>
                {review.customer_name}
              </p>
              <p style={{ fontSize: 12, color: G.faint, margin: 0 }}>
                {review.created_date && formatDistanceToNow(new Date(review.created_date), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {review.is_verified_purchase && (
          <div style={{
            padding: '4px 10px',
            borderRadius: 100,
            background: `${G.green}15`,
            border: `1px solid ${G.green}30`,
            fontSize: 11,
            fontWeight: 700,
            color: G.green,
            whiteSpace: 'nowrap',
          }}>
            ✓ Verified
          </div>
        )}
      </div>

      {/* Rating */}
      <div style={{ display: 'flex', gap: 4 }}>
        {Array(5).fill(0).map((_, i) => (
          <Star
            key={i}
            size={16}
            fill={i < review.rating ? G.amber : G.faint}
            style={{ color: i < review.rating ? G.amber : G.faint }}
          />
        ))}
      </div>

      {/* Comment */}
      {review.comment && (
        <p style={{ fontSize: 14, lineHeight: 1.6, color: G.muted, margin: 0 }}>
          {review.comment}
        </p>
      )}

      {/* Photos */}
      {review.photos && review.photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: 8 }}>
          {review.photos.map((photo, i) => (
            <img
              key={i}
              src={photo}
              alt=""
              style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 10 }}
            />
          ))}
        </div>
      )}

      {/* Additional Scores */}
      {(review.latency_score || review.accuracy_score || review.speed_score) && (
        <div style={{
          padding: '12px 14px',
          borderRadius: 12,
          background: G.bg2,
          border: `1px solid ${G.border}`,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          fontSize: 12,
        }}>
          {review.latency_score && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: G.faint, marginBottom: 4 }}>Response Time</div>
              <div style={{ fontWeight: 700, color: G.text }}>
                {review.latency_score}/5 ⭐
              </div>
            </div>
          )}
          {review.accuracy_score && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: G.faint, marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontWeight: 700, color: G.text }}>
                {review.accuracy_score}/5 ⭐
              </div>
            </div>
          )}
          {review.speed_score && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ color: G.faint, marginBottom: 4 }}>Speed</div>
              <div style={{ fontWeight: 700, color: G.text }}>
                {review.speed_score}/5 ⭐
              </div>
            </div>
          )}
        </div>
      )}

      {/* Provider Response */}
      {review.provider_response ? (
        <div style={{
          padding: '14px 16px',
          borderRadius: 12,
          background: `${G.green}08`,
          border: `1px solid ${G.green}20`,
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: G.green, margin: '0 0 8px 0' }}>
            Provider's Response
          </p>
          <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6, margin: 0 }}>
            {review.provider_response}
          </p>
          <p style={{ fontSize: 11, color: G.faint, margin: '8px 0 0 0' }}>
            {review.provider_response_date && formatDistanceToNow(new Date(review.provider_response_date), { addSuffix: true })}
          </p>
        </div>
      ) : isProvider ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {!showReplyForm ? (
            <button
              onClick={() => setShowReplyForm(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '10px 16px',
                borderRadius: 10,
                background: G.surface,
                border: `1px solid ${G.border}`,
                color: G.muted,
                fontWeight: 600,
                fontSize: 13,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `${G.rose}15`;
                e.currentTarget.style.borderColor = `${G.rose}40`;
                e.currentTarget.style.color = G.text;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = G.surface;
                e.currentTarget.style.borderColor = G.border;
                e.currentTarget.style.color = G.muted;
              }}
            >
              <MessageCircle size={14} />
              Reply to review
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <textarea
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder="Write your response..."
                style={{
                  width: '100%',
                  height: 70,
                  padding: '10px 12px',
                  borderRadius: 10,
                  background: G.bg2,
                  border: `1px solid ${G.border}`,
                  color: G.text,
                  fontFamily: 'inherit',
                  fontSize: 13,
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setShowReplyForm(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: G.surface,
                    border: `1px solid ${G.border}`,
                    color: G.muted,
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submitting || !replyText.trim()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 16px',
                    borderRadius: 8,
                    background: G.rose,
                    border: 'none',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: submitting || !replyText.trim() ? 'not-allowed' : 'pointer',
                    opacity: submitting || !replyText.trim() ? 0.6 : 1,
                  }}
                >
                  {submitting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Send size={12} />
                  )}
                  Send
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}