import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook to reduce API calls
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events and similar
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Stable callback that doesn't change on re-renders
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback(
    ((...args: any[]) => callbackRef.current(...args)) as T,
    []
  );
};

// Memoize expensive calculations
export const useExpensiveMemo = <T>(
  factory: () => T,
  deps: React.DependencyList,
  isExpensive = true
): T => {
  return useMemo(() => {
    if (isExpensive) {
      // Add small delay for very expensive calculations
      const start = performance.now();
      const result = factory();
      const end = performance.now();
      if (end - start > 16) { // If calculation takes more than 1 frame (16ms)
        console.warn(`Expensive calculation detected: ${end - start}ms`);
      }
      return result;
    }
    return factory();
  }, deps);
};

// Intersection observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        if (entry.isIntersecting && !hasIntersected) {
          setHasIntersected(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Performance monitoring hook
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());

  useEffect(() => {
    renderCount.current += 1;
  });

  useEffect(() => {
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;
    
    if (renderTime > 16) {
      console.warn(
        `${componentName} rendered ${renderCount.current} times, last render took ${renderTime.toFixed(2)}ms`
      );
    }
    
    startTime.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
}; 