import { useQuery } from '@tanstack/react-query';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';
import { useMemo } from 'react';

export default function useProviderRating(providerId) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['provider-reviews', providerId],
    queryFn: () => db.Review.filter({ provider_id: providerId }),
    enabled: !!providerId,
    staleTime: 5 * 60 * 1000,
  });

  const stats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        totalRatings: 0,
        averageLatency: 0,
        averageAccuracy: 0,
        averageSpeed: 0,
        recommendationRate: 0,
      };
    }

    const avgRating = (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1);
    const avgLatency = (reviews.reduce((sum, r) => sum + (r.latency_score || 0), 0) / reviews.length).toFixed(1);
    const avgAccuracy = (reviews.reduce((sum, r) => sum + (r.accuracy_score || 0), 0) / reviews.length).toFixed(1);
    const avgSpeed = (reviews.reduce((sum, r) => sum + (r.speed_score || 0), 0) / reviews.length).toFixed(1);
    const recommendCount = reviews.filter(r => r.would_recommend).length;
    const recommendRate = Math.round((recommendCount / reviews.length) * 100);

    return {
      averageRating: parseFloat(avgRating),
      totalReviews: reviews.length,
      totalRatings: reviews.length,
      averageLatency: parseFloat(avgLatency),
      averageAccuracy: parseFloat(avgAccuracy),
      averageSpeed: parseFloat(avgSpeed),
      recommendationRate: recommendRate,
    };
  }, [reviews]);

  return { stats, reviews, isLoading };
}