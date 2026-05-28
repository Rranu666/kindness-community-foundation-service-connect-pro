import { useState, useCallback } from 'react';

/**
 * useRetry — wrap any async function with automatic retry + loading/error state
 * Usage:
 *   const { execute, loading, error, reset } = useRetry(myAsyncFn, { maxRetries: 3, delay: 1000 });
 */
export function useRetry(fn, { maxRetries = 3, delay = 1000 } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const result = await fn(...args);
        setLoading(false);
        setAttempt(0);
        return result;
      } catch (err) {
        setAttempt(i + 1);
        if (i === maxRetries) {
          setError(err);
          setLoading(false);
          throw err;
        }
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }, [fn, maxRetries, delay]);

  const reset = useCallback(() => {
    setError(null);
    setAttempt(0);
    setLoading(false);
  }, []);

  return { execute, loading, error, attempt, reset };
}

export default useRetry;