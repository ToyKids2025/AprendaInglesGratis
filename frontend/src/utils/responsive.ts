/**
 * RESPONSIVE BREAKPOINTS & UTILITIES
 * Centralized responsive design system
 */

// Tailwind breakpoints (for reference)
export const BREAKPOINTS = {
  sm: 640,   // Mobile landscape
  md: 768,   // Tablet
  lg: 1024,  // Desktop
  xl: 1280,  // Large desktop
  '2xl': 1536, // Extra large
} as const

/**
 * Check if current viewport matches a breakpoint
 */
export function useMediaQuery(query: string): boolean {
  if (typeof window === 'undefined') return false

  return window.matchMedia(query).matches
}

/**
 * Check if mobile viewport
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < BREAKPOINTS.md
}

/**
 * Check if tablet viewport
 */
export function isTablet(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.md && window.innerWidth < BREAKPOINTS.lg
}

/**
 * Check if desktop viewport
 */
export function isDesktop(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= BREAKPOINTS.lg
}

/**
 * Get current device type
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (isMobile()) return 'mobile'
  if (isTablet()) return 'tablet'
  return 'desktop'
}

/**
 * Viewport change listener
 */
export function onViewportChange(callback: (device: 'mobile' | 'tablet' | 'desktop') => void): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = () => {
    callback(getDeviceType())
  }

  window.addEventListener('resize', handler)

  // Call immediately
  handler()

  // Return cleanup function
  return () => window.removeEventListener('resize', handler)
}

/**
 * Mobile-specific utilities
 */
export const mobileUtils = {
  // Disable body scroll (for modals on mobile)
  disableScroll: () => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.width = '100%'
  },

  // Enable body scroll
  enableScroll: () => {
    if (typeof document === 'undefined') return
    document.body.style.overflow = ''
    document.body.style.position = ''
    document.body.style.width = ''
  },

  // Check if touch device
  isTouchDevice: (): boolean => {
    if (typeof window === 'undefined') return false
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0
  },

  // Get safe area insets (for notch support)
  getSafeAreaInsets: () => {
    if (typeof window === 'undefined') return { top: 0, right: 0, bottom: 0, left: 0 }

    const style = getComputedStyle(document.documentElement)
    return {
      top: parseInt(style.getPropertyValue('env(safe-area-inset-top)') || '0'),
      right: parseInt(style.getPropertyValue('env(safe-area-inset-right)') || '0'),
      bottom: parseInt(style.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
      left: parseInt(style.getPropertyValue('env(safe-area-inset-left)') || '0'),
    }
  },
}

/**
 * Responsive image helper
 */
export function getResponsiveImageSize(baseWidth: number): number {
  const device = getDeviceType()

  switch (device) {
    case 'mobile':
      return Math.min(baseWidth, 640)
    case 'tablet':
      return Math.min(baseWidth, 1024)
    case 'desktop':
    default:
      return baseWidth
  }
}

/**
 * Responsive font size calculator
 */
export function getResponsiveFontSize(baseSizePx: number): string {
  const device = getDeviceType()

  const scale = {
    mobile: 0.85,
    tablet: 0.95,
    desktop: 1,
  }

  return `${baseSizePx * scale[device]}px`
}

/**
 * Orientation detection
 */
export function isPortrait(): boolean {
  if (typeof window === 'undefined') return true
  return window.innerHeight > window.innerWidth
}

export function isLandscape(): boolean {
  return !isPortrait()
}

/**
 * Viewport dimensions
 */
export function getViewportDimensions() {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 }
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}

export default {
  BREAKPOINTS,
  useMediaQuery,
  isMobile,
  isTablet,
  isDesktop,
  getDeviceType,
  onViewportChange,
  mobileUtils,
  getResponsiveImageSize,
  getResponsiveFontSize,
  isPortrait,
  isLandscape,
  getViewportDimensions,
}
