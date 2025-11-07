/**
 * ACCESSIBILITY HOOKS
 * React hooks for accessibility features
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Announce message to screen readers
 */
export function useAnnouncement() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Create live region for announcements
    const announcer = document.createElement('div')
    announcer.setAttribute('aria-live', 'polite')
    announcer.setAttribute('aria-atomic', 'true')
    announcer.setAttribute('role', 'status')
    announcer.className = 'sr-only'
    document.body.appendChild(announcer)
    announcerRef.current = announcer

    return () => {
      if (announcerRef.current) {
        document.body.removeChild(announcerRef.current)
      }
    }
  }, [])

  const announce = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (announcerRef.current) {
      announcerRef.current.setAttribute('aria-live', priority)
      announcerRef.current.textContent = message

      // Clear after announcement
      setTimeout(() => {
        if (announcerRef.current) {
          announcerRef.current.textContent = ''
        }
      }, 1000)
    }
  }

  return announce
}

/**
 * Focus trap for modals and dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!isActive || !containerRef.current) return

    const container = containerRef.current
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    // Focus first element
    firstElement?.focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [isActive])

  return containerRef
}

/**
 * Focus management - restore focus after action
 */
export function useFocusReturn() {
  const previousFocusRef = useRef<HTMLElement | null>(null)

  const saveFocus = () => {
    previousFocusRef.current = document.activeElement as HTMLElement
  }

  const restoreFocus = () => {
    previousFocusRef.current?.focus()
  }

  return { saveFocus, restoreFocus }
}

/**
 * Keyboard navigation helper
 */
export function useKeyboardNavigation(
  onEnter?: () => void,
  onEscape?: () => void,
  onArrowUp?: () => void,
  onArrowDown?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Enter':
          onEnter?.()
          break
        case 'Escape':
          onEscape?.()
          break
        case 'ArrowUp':
          e.preventDefault()
          onArrowUp?.()
          break
        case 'ArrowDown':
          e.preventDefault()
          onArrowDown?.()
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onEnter, onEscape, onArrowUp, onArrowDown])
}

/**
 * Reduced motion detection
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

/**
 * High contrast mode detection
 */
export function useHighContrast(): boolean {
  const [prefersHighContrast, setPrefersHighContrast] = useState(false)

  useEffect(() => {
    // Check for Windows high contrast mode
    const mediaQuery = window.matchMedia('(prefers-contrast: high)')
    setPrefersHighContrast(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersHighContrast(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersHighContrast
}

/**
 * Focus visible utility (show focus only for keyboard users)
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false)

  useEffect(() => {
    let hadKeyboardEvent = false

    const handleKeyDown = () => {
      hadKeyboardEvent = true
      setIsFocusVisible(true)
    }

    const handleMouseDown = () => {
      hadKeyboardEvent = false
      setIsFocusVisible(false)
    }

    const handleFocus = () => {
      if (hadKeyboardEvent) {
        setIsFocusVisible(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('focus', handleFocus, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('focus', handleFocus, true)
    }
  }, [])

  return isFocusVisible
}

/**
 * ARIA live region hook
 */
export function useAriaLive() {
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite')

  const announce = (msg: string, pri: 'polite' | 'assertive' = 'polite') => {
    setMessage(msg)
    setPriority(pri)

    // Clear after announcement
    setTimeout(() => setMessage(''), 1000)
  }

  const LiveRegion = () => (
    <div
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )

  return { announce, LiveRegion }
}

export default {
  useAnnouncement,
  useFocusTrap,
  useFocusReturn,
  useKeyboardNavigation,
  useReducedMotion,
  useHighContrast,
  useFocusVisible,
  useAriaLive,
}
