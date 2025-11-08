/**
 * TOUCH INTERACTION HOOK
 * Enhanced touch gestures for mobile devices
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
}

interface TouchPosition {
  x: number
  y: number
  time: number
}

export function useSwipe(handlers: SwipeHandlers, threshold: number = 50) {
  const touchStart = useRef<TouchPosition | null>(null)
  const touchEnd = useRef<TouchPosition | null>(null)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null
    touchStart.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    touchEnd.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now(),
    }
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const deltaX = touchStart.current.x - touchEnd.current.x
    const deltaY = touchStart.current.y - touchEnd.current.y
    const deltaTime = touchEnd.current.time - touchStart.current.time

    // Only process fast swipes (< 300ms)
    if (deltaTime > 300) return

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Horizontal swipe
    if (absX > absY && absX > threshold) {
      if (deltaX > 0 && handlers.onSwipeLeft) {
        handlers.onSwipeLeft()
      } else if (deltaX < 0 && handlers.onSwipeRight) {
        handlers.onSwipeRight()
      }
    }
    // Vertical swipe
    else if (absY > threshold) {
      if (deltaY > 0 && handlers.onSwipeUp) {
        handlers.onSwipeUp()
      } else if (deltaY < 0 && handlers.onSwipeDown) {
        handlers.onSwipeDown()
      }
    }

    touchStart.current = null
    touchEnd.current = null
  }, [handlers, threshold])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  }
}

/**
 * Long press hook
 */
export function useLongPress(
  callback: () => void,
  duration: number = 500
) {
  const timeout = useRef<NodeJS.Timeout>()
  const prevented = useRef(false)

  const start = useCallback(() => {
    prevented.current = false
    timeout.current = setTimeout(() => {
      if (!prevented.current) {
        callback()
      }
    }, duration)
  }, [callback, duration])

  const clear = useCallback(() => {
    if (timeout.current) {
      clearTimeout(timeout.current)
    }
    prevented.current = true
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: clear,
    onMouseLeave: clear,
    onTouchStart: start,
    onTouchEnd: clear,
  }
}

/**
 * Detect if device supports touch
 */
export function useTouchDevice() {
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const hasTouchScreen =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0

    setIsTouchDevice(hasTouchScreen)
  }, [])

  return isTouchDevice
}

/**
 * Prevent pull-to-refresh on mobile
 */
export function usePreventPullToRefresh() {
  useEffect(() => {
    let lastTouchY = 0
    let preventPullToRefresh = false

    const touchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return
      lastTouchY = e.touches[0].clientY
      preventPullToRefresh = window.pageYOffset === 0
    }

    const touchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY
      const touchYDelta = touchY - lastTouchY
      lastTouchY = touchY

      if (preventPullToRefresh && touchYDelta > 0) {
        e.preventDefault()
      }
    }

    document.addEventListener('touchstart', touchStart, { passive: false })
    document.addEventListener('touchmove', touchMove, { passive: false })

    return () => {
      document.removeEventListener('touchstart', touchStart)
      document.removeEventListener('touchmove', touchMove)
    }
  }, [])
}

/**
 * Mobile viewport height fix (accounts for address bar)
 */
export function useMobileViewport() {
  useEffect(() => {
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }

    setViewportHeight()
    window.addEventListener('resize', setViewportHeight)
    window.addEventListener('orientationchange', setViewportHeight)

    return () => {
      window.removeEventListener('resize', setViewportHeight)
      window.removeEventListener('orientationchange', setViewportHeight)
    }
  }, [])
}

/**
 * Haptic feedback (vibration)
 */
export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern)
    }
  }, [])

  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate])
  const error = useCallback(() => vibrate([50, 100, 50]), [vibrate])
  const tap = useCallback(() => vibrate(10), [vibrate])
  const longPress = useCallback(() => vibrate(50), [vibrate])

  return {
    vibrate,
    success,
    error,
    tap,
    longPress,
  }
}

export default {
  useSwipe,
  useLongPress,
  useTouchDevice,
  usePreventPullToRefresh,
  useMobileViewport,
  useHaptic,
}
