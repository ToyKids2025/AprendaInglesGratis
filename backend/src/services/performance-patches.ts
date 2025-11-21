/**
 * PERFORMANCE PATCHES - AprendaInglesGratis
 *
 * Performance optimization patches and monitoring
 *
 * Features:
 * - Bundle size optimization
 * - Code splitting strategies
 * - Lazy loading implementations
 * - Image optimization
 * - Network request optimization
 * - Memory leak prevention
 * - Performance monitoring
 * - Automatic performance fixes
 *
 * @module PerformancePatches
 * @version 1.0.0
 */

// ==================== TYPES ====================

interface PerformanceMetrics {
  // Core Web Vitals
  LCP?: number; // Largest Contentful Paint
  FID?: number; // First Input Delay
  CLS?: number; // Cumulative Layout Shift
  FCP?: number; // First Contentful Paint
  TTFB?: number; // Time to First Byte

  // Custom metrics
  apiResponseTime: Map<string, number>;
  bundleSize?: number;
  memoryUsage?: number;
  activeConnections?: number;
}

interface PerformanceIssue {
  type: IssueType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  suggestion: string;
  autoFix?: () => void;
}

type IssueType =
  | 'slow_query'
  | 'large_bundle'
  | 'memory_leak'
  | 'n_plus_one'
  | 'slow_api'
  | 'large_image'
  | 'blocking_resource';

// ==================== PERFORMANCE MONITORING ====================

export class PerformanceMonitor {
  private metrics: PerformanceMetrics;
  private issues: PerformanceIssue[] = [];
  private observers: Map<string, PerformanceObserver> = new Map();

  constructor() {
    this.metrics = {
      apiResponseTime: new Map(),
    };

    if (typeof window !== 'undefined') {
      this.initializeBrowserMonitoring();
    }
  }

  // ==================== BROWSER MONITORING ====================

  private initializeBrowserMonitoring(): void {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();

    // Monitor navigation timing
    this.observeNavigation();

    // Monitor resource loading
    this.observeResources();
  }

  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];

        this.metrics.LCP = lastEntry.startTime;

        if (lastEntry.startTime > 2500) {
          this.reportIssue({
            type: 'blocking_resource',
            severity: 'high',
            description: `LCP is ${lastEntry.startTime}ms (target: <2.5s)`,
            suggestion: 'Optimize images and remove render-blocking resources',
          });
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.set('lcp', observer);
    } catch (error) {
      console.error('LCP observation failed:', error);
    }
  }

  /**
   * Observe First Input Delay
   */
  private observeFID(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstEntry = entries[0] as any;

        this.metrics.FID = firstEntry.processingStart - firstEntry.startTime;

        if (this.metrics.FID > 100) {
          this.reportIssue({
            type: 'blocking_resource',
            severity: 'medium',
            description: `FID is ${this.metrics.FID}ms (target: <100ms)`,
            suggestion: 'Reduce JavaScript execution time',
          });
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
      this.observers.set('fid', observer);
    } catch (error) {
      console.error('FID observation failed:', error);
    }
  }

  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS(): void {
    try {
      let clsValue = 0;

      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
            this.metrics.CLS = clsValue;
          }
        }

        if (clsValue > 0.1) {
          this.reportIssue({
            type: 'blocking_resource',
            severity: 'medium',
            description: `CLS is ${clsValue.toFixed(3)} (target: <0.1)`,
            suggestion: 'Add explicit width/height to images and containers',
          });
        }
      });

      observer.observe({ type: 'layout-shift', buffered: true });
      this.observers.set('cls', observer);
    } catch (error) {
      console.error('CLS observation failed:', error);
    }
  }

  /**
   * Observe navigation timing
   */
  private observeNavigation(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming;

      if (navigation) {
        this.metrics.FCP = navigation.responseStart - navigation.fetchStart;
        this.metrics.TTFB = navigation.responseStart - navigation.requestStart;

        // Check TTFB
        if (this.metrics.TTFB > 600) {
          this.reportIssue({
            type: 'slow_api',
            severity: 'high',
            description: `TTFB is ${this.metrics.TTFB}ms (target: <600ms)`,
            suggestion: 'Optimize server response time or use CDN',
          });
        }
      }
    });
  }

  /**
   * Observe resource loading
   */
  private observeResources(): void {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming;

          // Check for large images
          if (
            resource.initiatorType === 'img' &&
            resource.transferSize > 500000
          ) {
            // >500KB
            this.reportIssue({
              type: 'large_image',
              severity: 'medium',
              description: `Large image: ${resource.name} (${Math.round(resource.transferSize / 1024)}KB)`,
              suggestion: 'Compress and optimize images',
            });
          }

          // Check for slow resources
          if (resource.duration > 1000) {
            this.reportIssue({
              type: 'slow_api',
              severity: 'low',
              description: `Slow resource: ${resource.name} (${Math.round(resource.duration)}ms)`,
              suggestion: 'Optimize or cache this resource',
            });
          }
        }
      });

      observer.observe({ type: 'resource', buffered: true });
      this.observers.set('resource', observer);
    } catch (error) {
      console.error('Resource observation failed:', error);
    }
  }

  // ==================== SERVER-SIDE MONITORING ====================

  /**
   * Track API response time
   */
  trackAPICall(endpoint: string, duration: number): void {
    const existing = this.metrics.apiResponseTime.get(endpoint) || 0;
    const avgDuration = (existing + duration) / 2;

    this.metrics.apiResponseTime.set(endpoint, avgDuration);

    // Report slow APIs
    if (duration > 1000) {
      this.reportIssue({
        type: 'slow_api',
        severity: duration > 3000 ? 'high' : 'medium',
        description: `Slow API: ${endpoint} took ${duration}ms`,
        suggestion: 'Optimize database queries or add caching',
      });
    }
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (typeof process !== 'undefined') {
      const usage = process.memoryUsage();
      this.metrics.memoryUsage = usage.heapUsed;

      // Check for high memory usage
      if (usage.heapUsed > 500 * 1024 * 1024) {
        // >500MB
        this.reportIssue({
          type: 'memory_leak',
          severity: 'critical',
          description: `High memory usage: ${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
          suggestion: 'Check for memory leaks',
        });
      }
    }
  }

  // ==================== ISSUE MANAGEMENT ====================

  private reportIssue(issue: PerformanceIssue): void {
    // Avoid duplicate issues
    const exists = this.issues.some(
      (i) => i.type === issue.type && i.description === issue.description
    );

    if (!exists) {
      this.issues.push(issue);

      // Log critical issues
      if (issue.severity === 'critical') {
        console.error('Performance issue:', issue);
      }

      // Auto-fix if available
      if (issue.autoFix) {
        issue.autoFix();
      }
    }
  }

  getIssues(): PerformanceIssue[] {
    return this.issues;
  }

  getMetrics(): PerformanceMetrics {
    return this.metrics;
  }

  clearIssues(): void {
    this.issues = [];
  }

  disconnect(): void {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
  }
}

// ==================== OPTIMIZATION PATCHES ====================

export class OptimizationPatches {
  // ==================== LAZY LOADING ====================

  /**
   * Lazy load images
   */
  static lazyLoadImages(): void {
    if ('loading' in HTMLImageElement.prototype) {
      // Native lazy loading
      const images = document.querySelectorAll('img[data-src]');
      images.forEach((img: any) => {
        img.src = img.dataset.src;
        img.loading = 'lazy';
      });
    } else {
      // Fallback with Intersection Observer
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img);
      });
    }
  }

  /**
   * Prefetch critical resources
   */
  static prefetchResources(urls: string[]): void {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  /**
   * Preload critical fonts
   */
  static preloadFonts(fontUrls: string[]): void {
    fontUrls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = url;
      document.head.appendChild(link);
    });
  }

  // ==================== CACHING STRATEGIES ====================

  /**
   * Cache API responses with Service Worker
   */
  static enableServiceWorkerCache(
    cacheName: string,
    urlsToCache: string[]
  ): void {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then((registration) => {
        console.log('Service Worker registered:', registration);

        // Cache URLs
        caches.open(cacheName).then((cache) => {
          cache.addAll(urlsToCache);
        });
      });
    }
  }

  /**
   * Implement stale-while-revalidate
   */
  static async staleWhileRevalidate(
    url: string,
    cacheName: string
  ): Promise<Response> {
    const cache = await caches.open(cacheName);

    // Try cache first
    const cachedResponse = await cache.match(url);

    // Fetch fresh data in background
    const fetchPromise = fetch(url).then((networkResponse) => {
      cache.put(url, networkResponse.clone());
      return networkResponse;
    });

    // Return cached or wait for network
    return cachedResponse || fetchPromise;
  }

  // ==================== BUNDLE OPTIMIZATION ====================

  /**
   * Dynamic import for code splitting
   */
  static async loadModule<T>(
    modulePath: string
  ): Promise<T> {
    try {
      const module = await import(/* @vite-ignore */ modulePath);
      return module.default || module;
    } catch (error) {
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * Tree shake unused code (build-time optimization hint)
   */
  static markAsTreeShakeable(obj: any): void {
    // This is a hint for bundlers
    Object.defineProperty(obj, '__esModule', { value: true });
  }

  // ==================== MEMORY OPTIMIZATION ====================

  /**
   * Cleanup event listeners
   */
  static cleanupEventListeners(
    element: HTMLElement,
    listeners: Map<string, EventListener>
  ): void {
    listeners.forEach((listener, event) => {
      element.removeEventListener(event, listener);
    });

    listeners.clear();
  }

  /**
   * Debounce resize events
   */
  static optimizeResizeHandler(
    callback: () => void,
    delay = 250
  ): () => void {
    let timeoutId: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(callback, delay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }

  /**
   * Throttle scroll events
   */
  static optimizeScrollHandler(
    callback: () => void,
    limit = 100
  ): () => void {
    let inThrottle = false;

    const handleScroll = () => {
      if (!inThrottle) {
        callback();
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }

  // ==================== REQUEST OPTIMIZATION ====================

  /**
   * Batch API requests
   */
  static createRequestBatcher<T>(
    batchFn: (ids: string[]) => Promise<T[]>,
    delay = 50
  ): (id: string) => Promise<T> {
    let batch: string[] = [];
    let resolvers: Map<string, (value: T) => void> = new Map();
    let timeoutId: NodeJS.Timeout;

    return (id: string) => {
      return new Promise<T>((resolve) => {
        batch.push(id);
        resolvers.set(id, resolve);

        clearTimeout(timeoutId);
        timeoutId = setTimeout(async () => {
          const batchCopy = [...batch];
          const resolversCopy = new Map(resolvers);

          batch = [];
          resolvers = new Map();

          try {
            const results = await batchFn(batchCopy);

            results.forEach((result, index) => {
              const id = batchCopy[index];
              const resolve = resolversCopy.get(id);
              if (resolve) resolve(result);
            });
          } catch (error) {
            console.error('Batch request failed:', error);
          }
        }, delay);
      });
    };
  }

  /**
   * Cancel duplicate requests
   */
  static createRequestDeduplicator<T>(): (
    key: string,
    fn: () => Promise<T>
  ) => Promise<T> {
    const pending = new Map<string, Promise<T>>();

    return async (key: string, fn: () => Promise<T>) => {
      if (pending.has(key)) {
        return pending.get(key)!;
      }

      const promise = fn().finally(() => {
        pending.delete(key);
      });

      pending.set(key, promise);
      return promise;
    };
  }

  // ==================== IMAGE OPTIMIZATION ====================

  /**
   * Generate srcset for responsive images
   */
  static generateSrcSet(
    baseUrl: string,
    widths: number[]
  ): string {
    return widths
      .map((width) => `${baseUrl}?w=${width} ${width}w`)
      .join(', ');
  }

  /**
   * Get optimal image format
   */
  static getOptimalImageFormat(): 'webp' | 'jpeg' {
    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;

    const support = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    return support ? 'webp' : 'jpeg';
  }

  /**
   * Compress image client-side
   */
  static async compressImage(
    file: File,
    maxWidth = 1920,
    quality = 0.8
  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Compression failed'));
              }
            },
            'image/jpeg',
            quality
          );
        };

        img.src = e.target!.result as string;
      };

      reader.readAsDataURL(file);
    });
  }
}

// ==================== PERFORMANCE BUDGETS ====================

export const PerformanceBudgets = {
  // Core Web Vitals targets
  LCP: 2500, // ms
  FID: 100, // ms
  CLS: 0.1, // score

  // Custom targets
  TTFB: 600, // ms
  FCP: 1800, // ms
  API_RESPONSE: 1000, // ms
  BUNDLE_SIZE: 250 * 1024, // 250KB
  IMAGE_SIZE: 500 * 1024, // 500KB
};

// ==================== SINGLETON INSTANCES ====================

export const performanceMonitor = new PerformanceMonitor();

// Auto-start monitoring
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    performanceMonitor.trackMemoryUsage();

    // Report performance to analytics
    setTimeout(() => {
      const metrics = performanceMonitor.getMetrics();
      console.log('Performance metrics:', metrics);

      // In production, send to analytics
      // trackEvent('performance_report', metrics);
    }, 5000);
  });
}

export default {
  PerformanceMonitor,
  OptimizationPatches,
  PerformanceBudgets,
  performanceMonitor,
};
