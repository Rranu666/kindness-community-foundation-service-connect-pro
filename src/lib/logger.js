// Centralized error logging (production-ready)
const isDev = import.meta.env.DEV;

const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
    url: typeof window !== 'undefined' ? window.location.href : 'unknown',
  };
  
  console[level.toLowerCase()] = (msg, ...args) => {
    if (isDev) {
      console.log(`[${timestamp}] ${level}: ${msg}`, ...args);
    }
  };
  
  // In production, send critical errors to monitoring service
  if (!isDev && level === 'error') {
    // Could integrate with Sentry, LogRocket, etc.
    console.error('[PROD ERROR]', logEntry);
  }
};

export const logger = {
  info: (msg, data) => log('INFO', msg, data),
  warn: (msg, data) => log('WARN', msg, data),
  error: (msg, data) => log('ERROR', msg, data),
};