import { useEffect, useRef, useState } from 'react';

export const usePullToRefresh = (onRefresh, containerSelector = 'main') => {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const container = useRef(null);

  useEffect(() => {
    container.current = document.querySelector(containerSelector);
    if (!container.current) return;

    let startY = 0;
    let isTouching = false;

    const handleTouchStart = (e) => {
      // Only start pull if we're at the top of the container
      if (container.current.scrollTop === 0) {
        startY = e.touches[0].clientY;
        isTouching = true;
        setIsPulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchMove = (e) => {
      if (!isTouching || container.current.scrollTop !== 0) {
        isTouching = false;
        return;
      }

      const currentY = e.touches[0].clientY;
      const distance = currentY - startY;

      if (distance > 0) {
        e.preventDefault();
        setPullDistance(distance);
        setIsPulling(distance > 80); // Threshold for pull-to-refresh
      }
    };

    const handleTouchEnd = async () => {
      isTouching = false;

      if (pullDistance > 80) {
        setIsRefreshing(true);
        try {
          await onRefresh?.();
        } catch (error) {
          console.error('Refresh error:', error);
        } finally {
          setIsRefreshing(false);
          setPullDistance(0);
          setIsPulling(false);
        }
      } else {
        setPullDistance(0);
        setIsPulling(false);
      }
    };

    container.current.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.current.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.current.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      if (container.current) {
        container.current.removeEventListener('touchstart', handleTouchStart);
        container.current.removeEventListener('touchmove', handleTouchMove);
        container.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [onRefresh]);

  return { isPulling, pullDistance, isRefreshing };
};

export default usePullToRefresh;