/**
 * Centralized provider data fetching hooks
 * Eliminates duplicate queries across Dashboard, Browse, ProviderProfile, etc.
 */

import { useQuery } from '@tanstack/react-query';
import { db, auth, invokeLLM, uploadFile } from '@/api/db';

/**
 * Fetch all service categories
 */
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => db.ServiceCategory.list(),
    staleTime: 1000 * 60 * 30, // 30 min cache
  });
}

/**
 * Fetch a single provider with all their data
 */
export function useProvider(providerId) {
  return useQuery({
    queryKey: ['provider', providerId],
    queryFn: () => providerId ? db.ServiceProvider.filter({ id: providerId }) : null,
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch all services for a provider
 */
export function useProviderServices(providerId) {
  return useQuery({
    queryKey: ['provider-services', providerId],
    queryFn: () => providerId ? db.Service.filter({ provider_id: providerId }) : [],
    enabled: !!providerId,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Fetch reviews for a provider
 */
export function useProviderReviews(providerId) {
  return useQuery({
    queryKey: ['provider-reviews', providerId],
    queryFn: () => providerId ? db.Review.filter({ provider_id: providerId }) : [],
    enabled: !!providerId,
    staleTime: 1000 * 60 * 10,
  });
}

/**
 * Fetch all providers with optional filters
 */
export function useProviders(filters = {}) {
  return useQuery({
    queryKey: ['providers', filters],
    queryFn: () => db.ServiceProvider.filter(filters),
    staleTime: 1000 * 60 * 15,
  });
}

/**
 * Fetch provider's availability schedule
 */
export function useProviderAvailability(providerId) {
  return useQuery({
    queryKey: ['provider-availability', providerId],
    queryFn: () => providerId ? db.ProviderAvailability.filter({ provider_id: providerId }) : [],
    enabled: !!providerId,
    staleTime: 1000 * 60 * 10,
  });
}