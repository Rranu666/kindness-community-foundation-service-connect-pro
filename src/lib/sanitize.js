// XSS Prevention - Sanitize user inputs
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Sanitize for HTML context (stricter)
export const sanitizeHTML = (html) => {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate phone format (basic)
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone?.replace(/\s/g, ''));
};

// Validate URL
export const isValidURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Rate limiting helper (client-side)
export const createRateLimiter = (limit = 3, windowMs = 60000) => {
  let attempts = [];
  
  return {
    check: () => {
      const now = Date.now();
      attempts = attempts.filter(time => now - time < windowMs);
      
      if (attempts.length >= limit) {
        return false;
      }
      
      attempts.push(now);
      return true;
    },
    reset: () => {
      attempts = [];
    },
  };
};