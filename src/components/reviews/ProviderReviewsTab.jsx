import React, { useState } from 'react';
import { Star, ThumbsUp, Award, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

const G = {
  surface: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF', muted: 'rgba(240,242,255,0.5)', faint: 'rgba(240,242,255,0.22)',
  rose: '#FF4D6D', amber: '#FF8C42', green: '#06D6A0', blue: '#4361EE',
  card: '#140b00',
};

function StarRow({ value = 0, max = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={12} style={{ fill: i <= Math.round(value) ? '#f59e0b' : 'transparent', color: i <= Math.round(value) ? '#f59e0b' : 'rgba(255,255,255,0.18)' }} />
      ))}
    </div>
  );
}

function RatingBar({ label, icon, value, color }) {
  const pct = Math.round((value / 5) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: G.muted }}>{label}</span>
          <span style={{ fontSize: 12, fontWeight: 800, color }}>
            {value > 0 ? value.toFixed(1) : '—'}
          </span>
        </div>
        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ height: '100%', borderRadius: 3, background: `linear-gradient(90deg, ${color}, ${color}aa)`, width: `${pct}%`, transition: 'width 0.8s ease' }} />
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }) {
   const initials = review.customer_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
   const colors = [G.rose, G.amber, G.blue, G.green];
   const color = colors[initials.charCodeAt(0) % colors.length];
   const [imageIndex, setImageIndex] = React.useState(0);

   return (
     <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, padding: '20px 22px', transition: 'border-color 0.2s' }}
       onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'}
       onMouseLeave={e => e.currentTarget.style.borderColor = G.border}>

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        {/* Avatar */}
        <div style={{ width: 40, height: 40, borderRadius: 12, background: `${color}22`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color, flexShrink: 0 }}>
          {initials}
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: G.text }}>{review.customer_name || 'Homeowner'}</span>
            <StarRow value={review.rating} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
            {review.would_recommend && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: G.green, background: `${G.green}15`, border: `1px solid ${G.green}25`, borderRadius: 100, padding: '2px 8px' }}>
                <ThumbsUp size={9} /> Recommends
              </span>
            )}
            <span style={{ fontSize: 11, color: G.faint }}>
              {new Date(review.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Photos Gallery */}
      {review.photos && review.photos.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'rgba(0,0,0,0.2)', marginBottom: 8 }}>
            <img src={review.photos[imageIndex]} alt="" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
            {review.photos.length > 1 && (
              <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 11, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 20 }}>
                {imageIndex + 1} / {review.photos.length}
              </div>
            )}
          </div>
          {review.photos.length > 1 && (
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
              {review.photos.map((photo, i) => (
                <button key={i} onClick={() => setImageIndex(i)} style={{ width: 56, height: 56, borderRadius: 10, overflow: 'hidden', border: `2px solid ${i === imageIndex ? G.rose : 'rgba(255,255,255,0.1)'}`, cursor: 'pointer', flexShrink: 0 }}>
                  <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Written review */}
      {review.comment && (
        <p style={{ fontSize: 14, color: G.muted, lineHeight: 1.7, marginBottom: 14, fontStyle: 'italic' }}>
          "{review.comment}"
        </p>
      )}

      {/* Metric scores */}
      {(review.latency_score || review.accuracy_score || review.speed_score) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: review.measurable_impact ? 14 : 0 }}>
          {[
            { icon: '🏅', label: 'Quality',         val: review.latency_score,  color: G.amber },
            { icon: '🤝', label: 'Professionalism', val: review.accuracy_score, color: G.blue },
            { icon: '⏰', label: 'Punctuality',     val: review.speed_score,    color: G.green },
          ].map(m => m.val ? (
            <div key={m.label} style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 12, padding: '8px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{m.icon}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: m.color }}>{m.val.toFixed(1)}</div>
              <div style={{ fontSize: 9, color: G.faint, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            </div>
          ) : null)}
        </div>
      ) : null}

      {/* Highlight */}
      {review.measurable_impact && (
        <div style={{ background: `${G.green}08`, border: `1px solid ${G.green}18`, borderRadius: 12, padding: '10px 14px', display: 'flex', gap: 8 }}>
          <CheckCircle2 size={14} style={{ color: G.green, flexShrink: 0, marginTop: 2 }} />
          <p style={{ fontSize: 13, color: G.muted, lineHeight: 1.6 }}>{review.measurable_impact}</p>
        </div>
      )}
    </div>
  );
}

function RatingSummary({ reviews }) {
  if (!reviews.length) return null;

  const avg = (key) => {
    const vals = reviews.map(r => r[key]).filter(Boolean);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
  };

  const overallAvg = avg('rating');
  const qualityAvg = avg('latency_score');
  const profAvg = avg('accuracy_score');
  const punctAvg = avg('speed_score');

  // Rating distribution
  const dist = [5, 4, 3, 2, 1].map(star => ({
    star,
    count: reviews.filter(r => Math.round(r.rating) === star).length,
  }));

  const recommends = reviews.filter(r => r.would_recommend).length;

  return (
    <div style={{ background: G.card, border: `1px solid ${G.border}`, borderRadius: 20, padding: '24px', marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

        {/* Left: overall score */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 56, fontWeight: 900, color: G.text, lineHeight: 1, letterSpacing: '-0.04em' }}>
            {overallAvg.toFixed(1)}
          </div>
          <StarRow value={overallAvg} />
          <p style={{ fontSize: 12, color: G.faint, marginTop: 8 }}>{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          {recommends > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, background: `${G.green}12`, border: `1px solid ${G.green}25`, borderRadius: 100, padding: '5px 12px' }}>
              <ThumbsUp size={11} style={{ color: G.green }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: G.green }}>{Math.round((recommends / reviews.length) * 100)}% recommend</span>
            </div>
          )}
        </div>

        {/* Right: distribution */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {dist.map(({ star, count }) => (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: G.faint, width: 14, textAlign: 'right' }}>{star}</span>
              <Star size={10} style={{ fill: '#f59e0b', color: '#f59e0b', flexShrink: 0 }} />
              <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 3, background: 'linear-gradient(90deg, #f59e0b, #FF8C42)', width: reviews.length ? `${(count / reviews.length) * 100}%` : '0%', transition: 'width 0.6s ease' }} />
              </div>
              <span style={{ fontSize: 10, color: G.faint, width: 18 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {(qualityAvg || profAvg || punctAvg) > 0 && (
        <div style={{ borderTop: `1px solid ${G.border}`, marginTop: 20, paddingTop: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <RatingBar label="Quality of Work"   icon="🏅" value={qualityAvg} color={G.amber} />
          <RatingBar label="Professionalism"   icon="🤝" value={profAvg}    color={G.blue} />
          <RatingBar label="Punctuality"       icon="⏰" value={punctAvg}   color={G.green} />
        </div>
      )}
    </div>
  );
}

export default function ProviderReviewsTab({ reviews }) {
  if (!reviews.length) {
    return (
      <div style={{ textAlign: 'center', padding: '52px 24px', background: G.card, border: `1px solid ${G.border}`, borderRadius: 20 }}>
        <MessageSquare size={38} style={{ color: G.faint, margin: '0 auto 14px' }} />
        <h3 style={{ fontWeight: 800, fontSize: 18, color: G.text, marginBottom: 8 }}>No reviews yet</h3>
        <p style={{ fontSize: 14, color: G.muted }}>Be the first to rate this provider after your service is complete.</p>
      </div>
    );
  }

  return (
    <div>
      <RatingSummary reviews={reviews} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
      </div>
    </div>
  );
}