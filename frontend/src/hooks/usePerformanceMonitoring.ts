import { useEffect, useCallback } from 'react';

interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export function usePerformanceMonitoring() {
  const measurePerformance = useCallback((name: string, fn: () => void | Promise<void>) => {
    const startTime = performance.now();
    
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && duration > 1000) {
          // Log slow operations
          console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
      });
    } else {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      return result;
    }
  }, []);

  const measureRender = useCallback((componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development' && duration > 16) {
        console.warn(`Slow render: ${componentName} took ${duration.toFixed(2)}ms`);
      }
    };
  }, []);

  // Monitor Core Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined' && 'web-vital' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(console.log);
        getFID(console.log);
        getFCP(console.log);
        getLCP(console.log);
        getTTFB(console.log);
      });
    }
  }, []);

  return {
    measurePerformance,
    measureRender,
  };
}