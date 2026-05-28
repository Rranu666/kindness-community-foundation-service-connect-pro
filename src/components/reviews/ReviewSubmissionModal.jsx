import React, { useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Star, Upload, X, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

const G = {
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D',
  amber: '#FF8C42',
  green: '#06D6A0',
  blue: '#4361EE',
  card: '#140b00',
};

export default function ReviewSubmissionModal({ open, onClose, order, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [qualityScore, setQualityScore] = useState(5);
  const [profScore, setProfScore] = useState(5);
  const [punctScore, setPunctScore] = useState(5);
  const [wouldRecommend, setWouldRecommend] = useState(true);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedPhotos.length > 3) {
      toast.error('Maximum 3 photos allowed');
      return;
    }

    for (const file of files) {
      try {
        const result = await uploadFile({ file });
        setUploadedPhotos(prev => [...prev, result.file_url]);
      } catch (err) {
        toast.error('Failed to upload photo');
      }
    }
  };

  const handleSubmit = async () => {
    if (!comment.trim()) {
      toast.error('Please write a review');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.Review.create({
        order_id: order.id,
        provider_id: order.provider_id,
        customer_email: order.customer_email,
        customer_name: order.customer_name,
        rating,
        comment,
        photos: uploadedPhotos,
        latency_score: qualityScore,
        accuracy_score: profScore,
        speed_score: punctScore,
        would_recommend: wouldRecommend,
        is_verified_purchase: true,
      });

      toast.success('Review submitted successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent style={{ background: G.card, border: `1px solid ${G.border}`, color: G.text, maxWidth: '500px' }}>
        <DialogHeader>
          <DialogTitle style={{ color: G.text }}>Rate Your Experience</DialogTitle>
          <DialogDescription style={{ color: G.muted }}>
            Help us improve by sharing your feedback about {order?.provider_name}
          </DialogDescription>
        </DialogHeader>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overall Rating */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: G.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>
              Overall Rating
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1, 2, 3, 4, 5].map(i => (
                <button
                  key={i}
                  onClick={() => setRating(i)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: i <= rating ? `${G.amber}20` : G.surface,
                    border: `1px solid ${i <= rating ? G.amber : G.border}`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => {
                    if (i <= rating) {
                      e.currentTarget.style.background = `${G.amber}35`;
                      e.currentTarget.style.transform = 'scale(1.08)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (i <= rating) {
                      e.currentTarget.style.background = `${G.amber}20`;
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                >
                  <Star size={16} style={{ fill: i <= rating ? G.amber : 'transparent', color: i <= rating ? G.amber : G.faint }} />
                </button>
              ))}
            </div>
          </div>

          {/* Written Review */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: G.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>
              Your Review
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..."
              style={{
                width: '100%',
                minHeight: 100,
                padding: '12px 14px',
                borderRadius: 12,
                background: G.surface,
                border: `1px solid ${G.border}`,
                color: G.text,
                fontSize: 13,
                fontFamily: 'inherit',
                resize: 'vertical',
                outline: 'none',
              }}
              onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={e => e.currentTarget.style.borderColor = G.border}
            />
          </div>

          {/* Category Scores */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 13, fontWeight: 700, color: G.faint, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Detailed Scores
            </label>
            {[
              { label: 'Quality of Work', value: qualityScore, onChange: setQualityScore },
              { label: 'Professionalism', value: profScore, onChange: setProfScore },
              { label: 'Punctuality', value: punctScore, onChange: setPunctScore },
            ].map(({ label, value, onChange }) => (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: G.muted }}>{label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: G.amber }}>{value}/5</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(i => (
                    <button
                      key={i}
                      onClick={() => onChange(i)}
                      style={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        background: i <= value ? G.amber : 'rgba(255,255,255,0.06)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Photo Upload */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 700, color: G.faint, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, display: 'block' }}>
              Photos (Optional)
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              {uploadedPhotos.map((url, i) => (
                <div key={i} style={{ position: 'relative', width: 60, height: 60, borderRadius: 10, overflow: 'hidden' }}>
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button
                    onClick={() => setUploadedPhotos(prev => prev.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: 0, right: 0, background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', cursor: 'pointer', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {uploadedPhotos.length < 3 && (
                <label style={{
                  width: 60,
                  height: 60,
                  borderRadius: 10,
                  border: `2px dashed ${G.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: G.muted,
                  fontSize: 20,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = G.rose;
                    e.currentTarget.style.color = G.rose;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = G.border;
                    e.currentTarget.style.color = G.muted;
                  }}
                >
                  <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <Upload size={18} />
                </label>
              )}
            </div>
          </div>

          {/* Recommend */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={wouldRecommend}
              onChange={e => setWouldRecommend(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 13, color: G.muted }}>I would recommend this provider</span>
          </label>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 12,
              background: isSubmitting ? 'rgba(255,77,109,0.5)' : G.rose,
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: 14,
              cursor: isSubmitting ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}