import React, { lazy, ComponentType, LazyExoticComponent } from 'react';

// 성능 모니터링 유틸리티
export class PerformanceMonitor {
  private static observers: Map<string, PerformanceObserver> = new Map();

  // Web Vitals 측정
  static measureWebVitals() {
    if (typeof window === 'undefined') return;

    // Largest Contentful Paint (LCP)
    this.observeMetric('largest-contentful-paint', (entries) => {
      const lastEntry = entries[entries.length - 1];
      console.log('LCP:', Math.round(lastEntry.startTime), 'ms');
    });

    // First Input Delay (FID)
    this.observeMetric('first-input', (entries) => {
      entries.forEach((entry) => {
        const fid = entry.processingStart - entry.startTime;
        console.log('FID:', Math.round(fid), 'ms');
      });
    });

    // Cumulative Layout Shift (CLS)
    this.observeMetric('layout-shift', (entries) => {
      let clsScore = 0;
      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsScore += entry.value;
        }
      });
      if (clsScore > 0) {
        console.log('CLS:', Math.round(clsScore * 10000) / 10000);
      }
    });

    // Time to First Byte (TTFB)
    this.observeMetric('navigation', (entries) => {
      entries.forEach((entry) => {
        const ttfb = entry.responseStart - entry.requestStart;
        console.log('TTFB:', Math.round(ttfb), 'ms');
      });
    });
  }

  private static observeMetric(type: string, callback: (entries: any[]) => void) {
    try {
      const observer = new PerformanceObserver((list) => {
        callback(list.getEntries());
      });
      
      observer.observe({ type, buffered: true });
      this.observers.set(type, observer);
    } catch (error) {
      console.warn(`Performance metric ${type} not supported:`, error);
    }
  }

  // 컴포넌트 렌더링 시간 측정
  static measureComponentRender(componentName: string, renderFn: () => void) {
    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16) { // 60fps 기준 16ms
      console.warn(`Slow render detected: ${componentName} took ${Math.round(renderTime)}ms`);
    }
  }

  // 메모리 사용량 모니터링
  static monitorMemoryUsage() {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const memoryInfo = {
        usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1024 / 1024),
        totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1024 / 1024),
        jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
      };
      
      console.log('Memory Usage:', memoryInfo);
      return memoryInfo;
    }
  }

  // 리소스 로딩 시간 측정
  static measureResourceTiming() {
    const resources = performance.getEntriesByType('resource');
    const slowResources = resources
      .filter(resource => resource.duration > 1000)
      .map(resource => ({
        name: resource.name,
        duration: Math.round(resource.duration),
        size: resource.transferSize
      }));

    if (slowResources.length > 0) {
      console.warn('Slow loading resources:', slowResources);
    }
  }

  // 정리
  static cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers.clear();
  }
}

// 지연 로딩 유틸리티
export class LazyLoader {
  // 컴포넌트 지연 로딩
  static lazyComponent<T extends ComponentType<any>>(
    importFn: () => Promise<{ default: T }>,
    fallback?: ComponentType
  ): LazyExoticComponent<T> {
    return lazy(async () => {
      const start = performance.now();
      const module = await importFn();
      const loadTime = performance.now() - start;
      
      if (loadTime > 2000) {
        console.warn(`Slow component loading: ${loadTime.toFixed(2)}ms`);
      }
      
      return module;
    });
  }

  // 이미지 지연 로딩
  static lazyImage(src: string, placeholder?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(src);
      img.onerror = reject;
      img.src = src;
      
      if (placeholder) {
        // 플레이스홀더가 있다면 먼저 반환
        setTimeout(() => resolve(placeholder), 0);
      }
    });
  }

  // 교차 관찰자를 통한 지연 로딩
  static createIntersectionObserver(
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ): IntersectionObserver {
    return new IntersectionObserver((entries) => {
      entries.forEach(callback);
    }, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }
}

// 번들 최적화 유틸리티
export class BundleOptimizer {
  // 중요한 리소스 사전 로드
  static preloadResource(href: string, as: string = 'script') {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  }

  // DNS 사전 연결
  static preconnectDomain(href: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = href;
    document.head.appendChild(link);
  }

  // 모듈 사전 가져오기
  static preloadModule(moduleId: string) {
    if (typeof document === 'undefined') return;
    
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = moduleId;
    document.head.appendChild(link);
  }

  // 중요하지 않은 스크립트 지연 로드
  static deferScript(src: string, onLoad?: () => void) {
    if (typeof document === 'undefined') return;
    
    const script = document.createElement('script');
    script.src = src;
    script.defer = true;
    if (onLoad) script.onload = onLoad;
    document.body.appendChild(script);
  }
}

// React 성능 최적화 훅
export const usePerformanceMonitor = (componentName: string) => {
  React.useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const mountTime = endTime - startTime;
      
      if (mountTime > 100) {
        console.warn(`Slow component mount: ${componentName} took ${Math.round(mountTime)}ms`);
      }
    };
  }, [componentName]);
};

// 디바운스 훅
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// 스로틀 훅
export const useThrottle = <T>(value: T, limit: number): T => {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastRan = React.useRef(Date.now());

  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
};

