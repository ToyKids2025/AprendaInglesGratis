/**
 * CLIENT-SIDE ERROR REPORTER
 * Automatically captures and reports errors to the server
 */

import { api } from '../services/api'

interface ErrorReport {
  message: string
  stack?: string
  url: string
  browser?: string
  device?: string
  os?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  const ua = navigator.userAgent
  let browser = 'Unknown'

  if (ua.indexOf('Firefox') > -1) {
    browser = 'Firefox'
  } else if (ua.indexOf('Chrome') > -1) {
    browser = 'Chrome'
  } else if (ua.indexOf('Safari') > -1) {
    browser = 'Safari'
  } else if (ua.indexOf('Edge') > -1) {
    browser = 'Edge'
  }

  return browser
}

/**
 * Get device type
 */
function getDeviceType(): string {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet'
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'Mobile'
  }
  return 'Desktop'
}

/**
 * Get operating system
 */
function getOS(): string {
  const ua = navigator.userAgent
  let os = 'Unknown'

  if (ua.indexOf('Win') > -1) os = 'Windows'
  else if (ua.indexOf('Mac') > -1) os = 'MacOS'
  else if (ua.indexOf('X11') > -1) os = 'UNIX'
  else if (ua.indexOf('Linux') > -1) os = 'Linux'
  else if (ua.indexOf('Android') > -1) os = 'Android'
  else if (ua.indexOf('iOS') > -1) os = 'iOS'

  return os
}

/**
 * Report error to server
 */
export async function reportError(error: Error, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
  try {
    const report: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      browser: getBrowserInfo(),
      device: getDeviceType(),
      os: getOS(),
      severity,
    }

    // Send to server (don't await to avoid blocking)
    api.post('/api/monitoring/errors/client', report).catch((err) => {
      console.error('Failed to report error to server:', err)
    })
  } catch (reportError) {
    // Silently fail - don't want error reporting to cause more errors
    console.error('Error reporter failed:', reportError)
  }
}

/**
 * Set up global error handlers
 */
export function initErrorReporter() {
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    reportError(
      new Error(`Unhandled Promise: ${event.reason}`),
      'high'
    )
  })

  // Capture global errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    if (event.error) {
      reportError(event.error, 'high')
    }
  })

  // Capture React errors via error boundary (handled separately)
  console.log('Error reporter initialized')
}

/**
 * Manually report an error
 */
export function logError(
  message: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
  additionalInfo?: any
) {
  const error = new Error(message)
  if (additionalInfo) {
    console.error(message, additionalInfo)
  }
  reportError(error, severity)
}

/**
 * Report performance issue
 */
export function reportPerformanceIssue(
  endpoint: string,
  duration: number,
  threshold: number = 3000
) {
  if (duration > threshold) {
    logError(
      `Slow request: ${endpoint} took ${duration}ms`,
      'low'
    )
  }
}

export default {
  reportError,
  initErrorReporter,
  logError,
  reportPerformanceIssue,
}
