/**
 * ANALYTICS TRACKING
 * Centralized analytics for user behavior tracking
 * Supports Google Analytics, Mixpanel, or custom backend
 */

// Analytics configuration
const ANALYTICS_CONFIG = {
  GA_MEASUREMENT_ID: import.meta.env.VITE_GA_MEASUREMENT_ID || '',
  MIXPANEL_TOKEN: import.meta.env.VITE_MIXPANEL_TOKEN || '',
  ENABLE_CONSOLE_LOGS: import.meta.env.DEV,
}

// Event types
export type AnalyticsEvent =
  | 'page_view'
  | 'sign_up'
  | 'login'
  | 'logout'
  | 'lesson_start'
  | 'lesson_complete'
  | 'phrase_practice'
  | 'achievement_unlock'
  | 'certificate_download'
  | 'ai_conversation_start'
  | 'ai_message_sent'
  | 'profile_update'
  | 'streak_milestone'
  | 'level_up'
  | 'share'
  | 'error'

interface AnalyticsEventData {
  event: AnalyticsEvent
  properties?: Record<string, any>
  user_id?: string
  timestamp?: number
}

/**
 * Initialize Google Analytics
 */
export function initGoogleAnalytics(): void {
  if (!ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
      console.log('ℹ️ Google Analytics not configured')
    }
    return
  }

  // Load gtag.js script
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ANALYTICS_CONFIG.GA_MEASUREMENT_ID}`
  document.head.appendChild(script)

  // Initialize dataLayer
  window.dataLayer = window.dataLayer || []
  function gtag(...args: any[]) {
    window.dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
    send_page_view: false, // We'll manually track page views
  })

  window.gtag = gtag

  if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log('✅ Google Analytics initialized')
  }
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string): void {
  const data: AnalyticsEventData = {
    event: 'page_view',
    properties: {
      page_path: path,
      page_title: title || document.title,
    },
    timestamp: Date.now(),
  }

  // Google Analytics
  if (window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
    })
  }

  // Console log in dev
  if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log('📊 Page View:', path)
  }

  // Send to custom backend
  sendToBackend(data)
}

/**
 * Track a custom event
 */
export function trackEvent(
  event: AnalyticsEvent,
  properties?: Record<string, any>
): void {
  const data: AnalyticsEventData = {
    event,
    properties,
    timestamp: Date.now(),
  }

  // Google Analytics
  if (window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag('event', event, properties)
  }

  // Console log in dev
  if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log('📊 Event:', event, properties)
  }

  // Send to custom backend
  sendToBackend(data)
}

/**
 * Track user signup
 */
export function trackSignup(method: 'email' | 'google' | 'facebook' = 'email'): void {
  trackEvent('sign_up', {
    method,
  })
}

/**
 * Track user login
 */
export function trackLogin(method: 'email' | 'google' | 'facebook' = 'email'): void {
  trackEvent('login', {
    method,
  })
}

/**
 * Track lesson start
 */
export function trackLessonStart(lessonId: string, level: number): void {
  trackEvent('lesson_start', {
    lesson_id: lessonId,
    level,
  })
}

/**
 * Track lesson completion
 */
export function trackLessonComplete(
  lessonId: string,
  score: number,
  timeSpent: number
): void {
  trackEvent('lesson_complete', {
    lesson_id: lessonId,
    score,
    time_spent_seconds: timeSpent,
  })
}

/**
 * Track phrase practice
 */
export function trackPhrasePractice(
  phraseId: string,
  correct: boolean,
  timeSpent: number
): void {
  trackEvent('phrase_practice', {
    phrase_id: phraseId,
    correct,
    time_spent_seconds: timeSpent,
  })
}

/**
 * Track achievement unlock
 */
export function trackAchievementUnlock(achievementId: string, rarity: string): void {
  trackEvent('achievement_unlock', {
    achievement_id: achievementId,
    rarity,
  })
}

/**
 * Track certificate download
 */
export function trackCertificateDownload(level: number, xp: number): void {
  trackEvent('certificate_download', {
    level,
    xp,
  })
}

/**
 * Track AI conversation
 */
export function trackAIConversation(action: 'start' | 'message', messageCount?: number): void {
  if (action === 'start') {
    trackEvent('ai_conversation_start', {})
  } else {
    trackEvent('ai_message_sent', {
      message_count: messageCount,
    })
  }
}

/**
 * Track level up
 */
export function trackLevelUp(newLevel: number, xp: number): void {
  trackEvent('level_up', {
    new_level: newLevel,
    xp,
  })
}

/**
 * Track streak milestone
 */
export function trackStreakMilestone(days: number): void {
  trackEvent('streak_milestone', {
    days,
  })
}

/**
 * Track social share
 */
export function trackShare(
  content: 'achievement' | 'certificate' | 'level',
  platform?: string
): void {
  trackEvent('share', {
    content,
    platform,
  })
}

/**
 * Track errors
 */
export function trackError(error: string, context?: Record<string, any>): void {
  trackEvent('error', {
    error_message: error,
    ...context,
  })
}

/**
 * Set user ID for tracking
 */
export function setUserId(userId: string): void {
  if (window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag('config', ANALYTICS_CONFIG.GA_MEASUREMENT_ID, {
      user_id: userId,
    })
  }

  if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log('👤 User ID set:', userId)
  }
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (window.gtag && ANALYTICS_CONFIG.GA_MEASUREMENT_ID) {
    window.gtag('set', 'user_properties', properties)
  }

  if (ANALYTICS_CONFIG.ENABLE_CONSOLE_LOGS) {
    console.log('👤 User properties:', properties)
  }
}

/**
 * Send event to custom backend
 */
async function sendToBackend(data: AnalyticsEventData): Promise<void> {
  // Skip in development
  if (import.meta.env.DEV) return

  try {
    // Get API URL from environment
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    // Add user ID from localStorage if available
    const userStr = localStorage.getItem('user')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        data.user_id = user.id
      } catch (e) {
        // Ignore parse errors
      }
    }

    // Send to backend analytics endpoint
    await fetch(`${API_URL}/api/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
  } catch (error) {
    // Silently fail - don't break user experience
    console.error('Analytics error:', error)
  }
}

// Type declarations
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer: any[]
  }
}

export default {
  init: initGoogleAnalytics,
  trackPageView,
  trackEvent,
  trackSignup,
  trackLogin,
  trackLessonStart,
  trackLessonComplete,
  trackPhrasePractice,
  trackAchievementUnlock,
  trackCertificateDownload,
  trackAIConversation,
  trackLevelUp,
  trackStreakMilestone,
  trackShare,
  trackError,
  setUserId,
  setUserProperties,
}
