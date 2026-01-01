import React from 'react';

export const measureWebVitals = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] });
  }
};

export const addResourceHints = () => {
  const criticalFonts = [
    '/fonts/Roboto-Regular.woff2',
  ];

  const criticalImages = [
    '/images/logo.png',
    '/images/background.jpg',
  ];

  criticalFonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font;
    link.as = 'font';
    link.type = 'font/woff2';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });

  criticalImages.forEach(image => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = image;
    link.as = 'image';
    document.head.appendChild(link);
  });
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            }
          });
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};

export const optimizeImages = () => {
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.setAttribute('loading', 'lazy');
  });

  const supportsWebP = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  if (supportsWebP()) {
    document.documentElement.classList.add('webp-support');
  }
};

export const cleanupMemory = () => {
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old-') || name.includes('temp-')) {
          caches.delete(name);
        }
      });
    });
  }

  const oldKeys = Object.keys(localStorage).filter(key => 
    key.includes('temp-') || key.includes('cache-')
  );
  oldKeys.forEach(key => localStorage.removeItem(key));
};

export const analyzeBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    console.group('📊 Bundle Analysis');
    
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src?.includes('assets/')) {
        fetch(src, { method: 'HEAD' })
          .then(response => {
            const size = response.headers.get('content-length');
          })
          .catch(() => {});
      }
    });
    
    console.groupEnd();
  }
};

export const monitorPerformanceBudget = () => {
  const budgets = {
    FCP: 2000, 
    LCP: 2500, 
    FID: 100,  
    CLS: 0.1   
  };

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      let metric: string;
      let value: number;
      let budget: number;

      if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
        metric = 'FCP';
        value = entry.startTime;
        budget = budgets.FCP;
      } else if (entry.entryType === 'largest-contentful-paint') {
        metric = 'LCP';
        value = entry.startTime;
        budget = budgets.LCP;
      } else if (entry.entryType === 'first-input') {
        metric = 'FID';
        value = (entry as any).processingStart - entry.startTime;
        budget = budgets.FID;
      } else {
        continue;
      }

    }
  });

  observer.observe({ 
    entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] 
  });
};

export const initPerformanceOptimizations = () => {
  addResourceHints();
  optimizeImages();
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      measureWebVitals();
      monitorPerformanceBudget();
      analyzeBundleSize();
    });
  } else {
    measureWebVitals();
    monitorPerformanceBudget();
    analyzeBundleSize();
  }
  
  window.addEventListener('load', () => {
    registerServiceWorker();
    
    setTimeout(cleanupMemory, 5 * 60 * 1000);
  });
};

export const usePerformanceMonitor = () => {
  const [metrics, setMetrics] = React.useState<{
    fcp?: number;
    lcp?: number;
    fid?: number;
    cls?: number;
  }>({});

  React.useEffect(() => {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        } else if (entry.entryType === 'largest-contentful-paint') {
          setMetrics(prev => ({ ...prev, lcp: entry.startTime }));
        } else if (entry.entryType === 'first-input') {
          const fid = (entry as any).processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, fid }));
        }
      }
    });

    observer.observe({ 
      entryTypes: ['paint', 'largest-contentful-paint', 'first-input'] 
    });

    return () => observer.disconnect();
  }, []);

  return metrics;
};