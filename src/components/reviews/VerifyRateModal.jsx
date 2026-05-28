import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { Upload, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { THEME as L } from '@/lib/theme';

export default function VerifyRateModal({ open, onClose, order, provider, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [latencyScore, setLatencyScore] = useState(0);
  const [accuracyScore, setAccuracyScore] = useState(0);
  const [speedScore, setSpeedScore] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState(false);

  const handleAddPhoto = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const result = await uploadFile({ file });
        setPhotos(prev => [...prev, result.file_url]);
      }
      toast.success(`${files.length} photo(s) uploaded`);
    } catch { toast.error('Failed to upload photos'); }
    finally { setUploading(false); }
  };

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await db.Review.create({
        order_id: order.id, provider_id: provider.id,
        customer_email: order.customer_email, customer_name: order.customer_name,
        rating, comment: comment.trim() || null,
        photos: photos.length > 0 ? photos : null,
        latency_score: latencyScore > 0 ? latencyScore : null,
        accuracy_score: accuracyScore > 0 ? accuracyScore : null,
        speed_score: speedScore > 0 ? speedScore : null,
        would_recommend: wouldRecommend, is_verified_purchase: true,
      });
      const allReviews = await db.Review.filter({ provider_id: provider.id });
      const avgRating = allReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / allReviews.length;
      await db.ServiceProvider.update(provider.id, { rating: Math.round(avgRating * 10) / 10, total_reviews: allReviews.length });
      toast.success('Review submitted!');
      onSuccess?.();
      onClose();
    } catch { toast.error('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  const metricBtnStyle = (active) => ({
    flex: 1, padding: '6px 0', borderRadius: 8, fontSize: 12, fontWeight: 700, transition: 'all 0.15s',
    background: active ? L.text : L.bg2, color: active ? '#fff' : L.text2, border: `1px solid ${active ? L.text : L.border}`, cursor: 'pointer',
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <p style={{ fontSize: 13, color: L.text2, marginTop: 4, fontWeight: 300 }}>Help us improve by rating {provider?.business_name}</p>
        </DialogHeader>

        <div className="space-y-5">
          {/* Star Rating */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: L.text, display: 'block', marginBottom: 10 }}>Overall Rating *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[1,2,3,4,5].map(i => (
                <button key={i} onClick={() => setRating(i)} style={{ fontSize: 28, opacity: i <= rating ? 1 : 0.3, transform: i <= rating ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.15s', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>⭐</button>
              ))}
            </div>
            {rating > 0 && <p style={{ fontSize: 12, color: L.text2, marginTop: 6 }}>{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}</p>}
          </div>

          {/* Recommend */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
            <input type="checkbox" checked={wouldRecommend} onChange={e => setWouldRecommend(e.target.checked)} style={{ width: 16, height: 16 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: L.text }}>I would recommend this provider</span>
          </label>

          {/* Metric Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {[
              { label: 'Response Time', score: latencyScore, setScore: setLatencyScore },
              { label: 'Accuracy',      score: accuracyScore, setScore: setAccuracyScore },
              { label: 'Speed',         score: speedScore,   setScore: setSpeedScore },
            ].map(({ label, score, setScore }) => (
              <div key={label}>
                <p style={{ fontSize: 12, fontWeight: 600, color: L.text, marginBottom: 6 }}>{label}</p>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(i => <button key={i} onClick={() => setScore(i)} style={metricBtnStyle(i <= score)}>{i}</button>)}
                </div>
              </div>
            ))}
          </div>

          {/* Comment */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: L.text, display: 'block', marginBottom: 6 }}>Tell us more</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Share your experience..." rows={4}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 12, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }} />
          </div>

          {/* Photos */}
          <div>
            <label style={{ fontSize: 14, fontWeight: 600, color: L.text, display: 'block', marginBottom: 10 }}>Add Photos (Optional)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
              {photos.map((url, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={url} alt="" style={{ width: 72, height: 72, borderRadius: 10, objectFit: 'cover' }} />
                  <button onClick={() => setPhotos(p => p.filter((_, j) => j !== i))}
                    style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, background: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#fff' }}>
                    <X size={11} />
                  </button>
                </div>
              ))}
              <label style={{ width: 72, height: 72, borderRadius: 10, border: `2px dashed ${L.border2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = L.accent}
                onMouseLeave={e => e.currentTarget.style.borderColor = L.border2}>
                <input type="file" multiple accept="image/*" onChange={handleAddPhoto} disabled={uploading} style={{ display: 'none' }} />
                <Upload size={18} style={{ color: L.text3 }} />
              </label>
            </div>
            <p style={{ fontSize: 11, color: L.text3 }}>Max 5 photos · JPG, PNG</p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '12px', borderRadius: 100, background: L.bg2, border: `1px solid ${L.border}`, color: L.text, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
            <button onClick={handleSubmit} disabled={submitting || rating === 0}
              style={{ flex: 1, padding: '12px', borderRadius: 100, background: rating > 0 ? L.text : L.bg3, border: 'none', color: rating > 0 ? '#fff' : L.text3, fontWeight: 700, fontSize: 14, cursor: rating > 0 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: submitting ? 0.7 : 1 }}>
              {submitting && <Loader2 size={15} className="animate-spin" />}Submit Review
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}