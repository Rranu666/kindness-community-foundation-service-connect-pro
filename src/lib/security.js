// Security utilities for production
import { sanitizeInput } from './sanitize';

// CSRF Token management
export const getCsrfToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.content;
  if (!token) {
    console.warn('[SECURITY] CSRF token not found in meta tags');
  }
  return token;
};

// Request interceptor for CSRF
export const createSecureHeaders = () => {
  const csrfToken = getCsrfToken();
  return {
    'X-CSRF-Token': csrfToken || '',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type': 'application/json',
  };
};

// Rate limiting for sensitive operations
class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside window
    const recentAttempts = userAttempts.filter(time => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    return true;
  }

  reset(key) {
    this.attempts.delete(key);
  }
}

export const loginLimiter = new RateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 min
export const apiLimiter = new RateLimiter(100, 60000); // 100 requests per minute
export const paymentLimiter = new RateLimiter(3, 60000); // 3 payment attempts per minute

// Content Security Policy check
export const validateCSP = () => {
  const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content;
  if (!csp) {
    console.warn('[SECURITY] Content Security Policy not set');
  }
};

// Secure storage for sensitive data
export const secureStorage = {
  setToken: (token) => {
    // Use sessionStorage instead of localStorage for sensitive tokens
    try {
      sessionStorage.setItem('__auth_token', token);
    } catch (e) {
      console.warn('[SECURITY] Cannot store token:', e.message);
    }
  },

  getToken: () => {
    try {
      return sessionStorage.getItem('__auth_token');
    } catch (e) {
      console.warn('[SECURITY] Cannot retrieve token:', e.message);
      return null;
    }
  },

  clearToken: () => {
    try {
      sessionStorage.removeItem('__auth_token');
    } catch (e) {
      console.warn('[SECURITY] Cannot clear token:', e.message);
    }
  },
};

// Validate and sanitize redirect URLs
export const validateRedirectUrl = (url) => {
  try {
    const parsed = new URL(url);
    // Only allow same-origin redirects
    if (parsed.origin !== window.location.origin) {
      console.warn('[SECURITY] Blocking cross-origin redirect:', url);
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

// Detect potential XSS in response data
export const validateResponseData = (data) => {
  if (typeof data === 'string' && (data.includes('<script') || data.includes('javascript:'))) {
    console.warn('[SECURITY] Potential XSS detected in response');
    return false;
  }
  return true;
};