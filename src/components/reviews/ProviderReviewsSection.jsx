import React, { useEffect, useState } from 'react';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useQuery } from '@tanstack/react-query';
import ReviewsList from './ReviewsList';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp } from 'lucide-react';

const G = {
  bg: '#080A12',
  surface: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.08)',
  text: '#F0F2FF',
  muted: 'rgba(240,242,255,0.5)',
  faint: 'rgba(240,242,255,0.25)',
  amber: '#FF8C42',
  green: '#06D6A0',
};

export default function ProviderReviewsSection() {
  const [provider, setProvider] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchProvider = async () => {
      const user = await auth.me();
      const providers = await db.ServiceProvider.filter({
        created_by: user.email,
      });
      if (providers.length > 0) {
        setProvider(providers[0]);
      }
    };
    fetchProvider();
  }, []);

  const { isLoading } = useQuery({
    queryKey: ['provider-stats', provider?.id],
    queryFn: async () => {
      if (!provider?.id) return null;
      const providerReviews = await db.Review.filter({
        provider_id: provider.id,
      }, '-created_date');
      setReviews(providerReviews);
      return providerReviews;
    },
    enabled: !!provider?.id,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <Skeleton style={{ height: 200, borderRadius: 16 }} />
        <Skeleton style={{ height: 300, borderRadius: 16 }} />
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const respondeCount = reviews.filter(r => r.provider_response).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Stats Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        
        {/* Avg Rating */}
        <div style={{
          padding: '16px',
          borderRadius: 16,
          background: G.surface,
          border: `1px solid ${G.border}`,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <Star size={24} fill={G.amber} style={{ color: G.amber }} />
          </div>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.text, margin: 0 }}>
            {averageRating}
          </p>
          <p style={{ fontSize: 12, color: G.faint, margin: '4px 0 0 0' }}>
            Average Rating ({reviews.length})
          </p>
        </div>

        {/* Response Rate */}
        <div style={{
          padding: '16px',
          borderRadius: 16,
          background: G.surface,
          border: `1px solid ${G.border}`,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <TrendingUp size={24} style={{ color: G.green }} />
          </div>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.text, margin: 0 }}>
            {reviews.length > 0 ? Math.round((respondeCount / reviews.length) * 100) : 0}%
          </p>
          <p style={{ fontSize: 12, color: G.faint, margin: '4px 0 0 0' }}>
            Response Rate
          </p>
        </div>

        {/* Total Reviews */}
        <div style={{
          padding: '16px',
          borderRadius: 16,
          background: G.surface,
          border: `1px solid ${G.border}`,
          textAlign: 'center',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>💬</span>
          </div>
          <p style={{ fontSize: 28, fontWeight: 900, color: G.text, margin: 0 }}>
            {reviews.length}
          </p>
          <p style={{ fontSize: 12, color: G.faint, margin: '4px 0 0 0' }}>
            Total Reviews
          </p>
        </div>
      </div>

      {/* Reviews List */}
      {provider && (
        <div>
          <h3 style={{ fontWeight: 700, fontSize: 18, color: G.text, marginBottom: 16 }}>
            Customer Reviews
          </h3>
          <ReviewsList providerId={provider.id} isProvider={true} />
        </div>
      )}
    </div>
  );
}