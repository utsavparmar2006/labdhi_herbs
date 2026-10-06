'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface UseInfiniteScrollOptions {
  onLoadMore: () => void | Promise<void>;
  hasMore: boolean;
  isLoading: boolean;
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

/**
 * Industry-standard IntersectionObserver hook for high-performance on-scroll pagination.
 * Pre-fetches the next page before reaching the bottom using configurable rootMargin.
 */
export function useInfiniteScroll({
  onLoadMore,
  hasMore,
  isLoading,
  threshold = 0.1,
  rootMargin = '250px',
  disabled = false,
}: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasMore && !isLoading && !disabled) {
        onLoadMore();
      }
    },
    [onLoadMore, hasMore, isLoading, disabled]
  );

  useEffect(() => {
    const element = sentinelRef.current;
    if (!element || disabled) return;

    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin,
      threshold,
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [handleObserver, rootMargin, threshold, disabled]);

  return { sentinelRef };
}
