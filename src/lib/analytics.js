import { db, auth, invokeLLM, uploadFile } from '@/api/db';

/**
 * Centralized analytics wrapper — tracks key user actions across the platform.
 * Wraps analytics.track so it never throws.
 */
export const track = (eventName, properties = {}) => {
  try {
    analytics.track({ eventName, properties });
  } catch (e) {
    // Never break the app for analytics
  }
};

// Pre-defined event names for consistency
export const EVENTS = {
  // Navigation
  PAGE_VIEW: 'page_view',
  
  // Booking funnel
  BROWSE_SEARCH: 'browse_search',
  PROVIDER_VIEWED: 'provider_profile_viewed',
  BOOKING_STARTED: 'booking_started',
  BOOKING_COMPLETED: 'booking_completed',
  BOOKING_CANCELLED: 'booking_cancelled',

  // Provider
  PROVIDER_SIGNUP_STARTED: 'provider_signup_started',
  PROVIDER_SIGNUP_COMPLETED: 'provider_signup_completed',

  // Voice
  VOICE_REQUEST_STARTED: 'voice_request_started',
  VOICE_REQUEST_MATCHED: 'voice_request_matched',

  // Auth
  SIGN_IN_CLICKED: 'sign_in_clicked',
  SIGN_OUT: 'sign_out',

  // Reviews
  REVIEW_SUBMITTED: 'review_submitted',

  // Wallet
  WALLET_TOP_UP: 'wallet_top_up',
};