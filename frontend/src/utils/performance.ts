/**
 * PERFORMANCE MONITORING
 * Web Vitals and performance metrics tracking
 */

// Web Vitals types
interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta?: number
  id?: string
}

// Thresholds based on Google's Web Vitals
const THRESHOLDS = {
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 }, // First Input Delay
  CLS: { good: 0.1, poor: 0.25 }, // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
}

/**
 * Get rating based on value and thresholds
 */
function getRating(
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

/**
 * Log performance metric to console (dev) or analytics (prod)
 */
function logMetric(metric: PerformanceMetric): void {
  if (import.meta.env.DEV) {
    // Development: Log to console with color
    const color =
      metric.rating === 'good'
        ? 'green'
        : metric.rating === 'needs-improvement'
        ? 'orange'
        : 'red'

    console.log(
      `%c⚡ ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`,
      `color: ${color}; font-weight: bold;`
    )
  } else {
    // Production: Send to analytics
    // TODO: Integrate with Google Analytics, Mixpanel, or custom analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        event_category: 'Web Vitals',
        value: Math.round(metric.value),
        event_label: metric.rating,
        non_interaction: true,
      })
    }
  }
}

/**
 * Measure Largest Contentful Paint (LCP)
 * Good: < 2.5s | Needs Improvement: < 4s | Poor: >= 4s
 */
export function measureLCP(): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1] as any

      const metric: PerformanceMetric = {
        name: 'LCP',
        value: lastEntry.renderTime || lastEntry.loadTime,
        rating: getRating('LCP', lastEntry.renderTime || lastEntry.loadTime),
      }

      logMetric(metric)
    })

    observer.observe({ type: 'largest-contentful-paint', buffered: true })
  } catch (error) {
    console.error('Error measuring LCP:', error)
  }
}

/**
 * Measure First Input Delay (FID)
 * Good: < 100ms | Needs Improvement: < 300ms | Poor: >= 300ms
 */
export function measureFID(): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach((entry: any) => {
        const metric: PerformanceMetric = {
          name: 'FID',
          value: entry.processingStart - entry.startTime,
          rating: getRating('FID', entry.processingStart - entry.startTime),
        }

        logMetric(metric)
      })
    })

    observer.observe({ type: 'first-input', buffered: true })
  } catch (error) {
    console.error('Error measuring FID:', error)
  }
}

/**
 * Measure Cumulative Layout Shift (CLS)
 * Good: < 0.1 | Needs Improvement: < 0.25 | Poor: >= 0.25
 */
export function measureCLS(): void {
  if (!('PerformanceObserver' in window)) return

  try {
    let clsValue = 0

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries() as any[]

      entries.forEach((entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
        }
      })

      const metric: PerformanceMetric = {
        name: 'CLS',
        value: clsValue,
        rating: getRating('CLS', clsValue),
      }

      logMetric(metric)
    })

    observer.observe({ type: 'layout-shift', buffered: true })
  } catch (error) {
    console.error('Error measuring CLS:', error)
  }
}

/**
 * Measure First Contentful Paint (FCP)
 */
export function measureFCP(): void {
  if (!('PerformanceObserver' in window)) return

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()

      entries.forEach((entry) => {
        const metric: PerformanceMetric = {
          name: 'FCP',
          value: entry.startTime,
          rating: getRating('FCP', entry.startTime),
        }

        logMetric(metric)
      })
    })

    observer.observe({ type: 'paint', buffered: true })
  } catch (error) {
    console.error('Error measuring FCP:', error)
  }
}

/**
 * Measure Time to First Byte (TTFB)
 */
export function measureTTFB(): void {
  if (!('performance' in window) || !performance.timing) return

  try {
    const navigation = performance.getEntriesByType(
      'navigation'
    )[0] as PerformanceNavigationTiming

    if (navigation) {
      const ttfb = navigation.responseStart - navigation.requestStart

      const metric: PerformanceMetric = {
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
      }

      logMetric(metric)
    }
  } catch (error) {
    console.error('Error measuring TTFB:', error)
  }
}

/**
 * Initialize all performance monitoring
 */
export function initPerformanceMonitoring(): void {
  // Wait for page load
  if (document.readyState === 'complete') {
    measureAll()
  } else {
    window.addEventListener('load', measureAll)
  }
}

function measureAll(): void {
  measureLCP()
  measureFID()
  measureCLS()
  measureFCP()
  measureTTFB()

  console.log('✅ Performance monitoring initialized')
}

/**
 * Measure custom performance marks
 */
export function measureCustom(name: string, startMark: string, endMark: string): void {
  if (!('performance' in window)) return

  try {
    performance.measure(name, startMark, endMark)
    const measure = performance.getEntriesByName(name)[0]

    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
  } catch (error) {
    console.error(`Error measuring ${name}:`, error)
  }
}

/**
 * Mark a performance point
 */
export function mark(name: string): void {
  if ('performance' in window && performance.mark) {
    performance.mark(name)
  }
}

// Type declaration for gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}
