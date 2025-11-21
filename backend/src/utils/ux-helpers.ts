/**
 * UX HELPERS - AprendaInglesGratis
 *
 * User experience optimization utilities
 *
 * Features:
 * - Loading states management
 * - Error handling with user-friendly messages
 * - Success feedback
 * - Toast notifications
 * - Onboarding flow helpers
 * - Progress indicators
 * - Accessibility helpers (WCAG AAA)
 * - Responsive breakpoint helpers
 * - Analytics tracking helpers
 *
 * @module UXHelpers
 * @version 1.0.0
 */

// ==================== TYPES ====================

export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number; // ms
  action?: NotificationAction;
}

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface ProgressState {
  current: number;
  total: number;
  percentage: number;
  label?: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}

// ==================== ERROR MESSAGES ====================

export const ErrorMessages = {
  // Network errors
  NETWORK_ERROR: 'Unable to connect. Please check your internet connection.',
  TIMEOUT: 'Request timed out. Please try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again later.',

  // Auth errors
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
  WEAK_PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',

  // Validation errors
  REQUIRED_FIELD: (field: string) => `${field} is required.`,
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  MIN_LENGTH: (field: string, min: number) =>
    `${field} must be at least ${min} characters.`,
  MAX_LENGTH: (field: string, max: number) =>
    `${field} must be less than ${max} characters.`,

  // Payment errors
  PAYMENT_FAILED: 'Payment failed. Please check your payment method.',
  INSUFFICIENT_FUNDS: 'Insufficient funds. Please use a different payment method.',
  CARD_DECLINED: 'Your card was declined. Please use a different card.',

  // Resource errors
  NOT_FOUND: 'The requested resource was not found.',
  UNAUTHORIZED: 'You don\'t have permission to access this resource.',
  SUBSCRIPTION_REQUIRED: 'This feature requires a premium subscription.',
};

// ==================== SUCCESS MESSAGES ====================

export const SuccessMessages = {
  // Auth
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully! Please check your email.',
  LOGOUT_SUCCESS: 'You\'ve been logged out successfully.',
  PASSWORD_RESET: 'Password reset email sent. Check your inbox.',

  // Learning
  LESSON_COMPLETED: 'Great job! Lesson completed.',
  LEVEL_UP: (level: number) => `Congratulations! You reached level ${level}!`,
  ACHIEVEMENT_UNLOCKED: (name: string) => `Achievement unlocked: ${name}!`,
  STREAK_MILESTONE: (days: number) => `Amazing! ${days} day streak!`,

  // Booking
  LESSON_BOOKED: 'Lesson booked successfully!',
  LESSON_CANCELLED: 'Lesson cancelled and refunded.',

  // Settings
  PROFILE_UPDATED: 'Profile updated successfully.',
  SETTINGS_SAVED: 'Settings saved.',
};

// ==================== LOADING STATE MANAGER ====================

export class LoadingStateManager {
  private states: Map<string, LoadingState> = new Map();
  private listeners: Map<string, Set<(state: LoadingState) => void>> = new Map();

  setLoading(key: string): void {
    this.setState(key, 'loading');
  }

  setSuccess(key: string): void {
    this.setState(key, 'success');
  }

  setError(key: string): void {
    this.setState(key, 'error');
  }

  setIdle(key: string): void {
    this.setState(key, 'idle');
  }

  getState(key: string): LoadingState {
    return this.states.get(key) || 'idle';
  }

  isLoading(key: string): boolean {
    return this.getState(key) === 'loading';
  }

  subscribe(key: string, callback: (state: LoadingState) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  private setState(key: string, state: LoadingState): void {
    this.states.set(key, state);

    // Notify listeners
    this.listeners.get(key)?.forEach((callback) => callback(state));
  }
}

// ==================== NOTIFICATION SYSTEM ====================

export class NotificationSystem {
  private notifications: Notification[] = [];
  private listeners: Set<(notifications: Notification[]) => void> = new Set();

  show(
    type: Notification['type'],
    title: string,
    message: string,
    duration = 5000,
    action?: NotificationAction
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message,
      duration,
      action,
    };

    this.notifications.push(notification);
    this.notifyListeners();

    // Auto-dismiss after duration
    if (duration > 0) {
      setTimeout(() => this.dismiss(notification.id), duration);
    }

    return notification.id;
  }

  success(title: string, message: string, duration?: number): string {
    return this.show('success', title, message, duration);
  }

  error(title: string, message: string, duration = 0): string {
    return this.show('error', title, message, duration);
  }

  warning(title: string, message: string, duration?: number): string {
    return this.show('warning', title, message, duration);
  }

  info(title: string, message: string, duration?: number): string {
    return this.show('info', title, message, duration);
  }

  dismiss(id: string): void {
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.notifyListeners();
  }

  dismissAll(): void {
    this.notifications = [];
    this.notifyListeners();
  }

  subscribe(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.add(callback);

    // Initial call
    callback(this.notifications);

    // Return unsubscribe
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((callback) => callback([...this.notifications]));
  }

  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== PROGRESS TRACKER ====================

export class ProgressTracker {
  private current: number = 0;
  private total: number = 100;
  private label?: string;
  private listeners: Set<(state: ProgressState) => void> = new Set();

  constructor(total: number = 100, label?: string) {
    this.total = total;
    this.label = label;
  }

  setCurrent(value: number): void {
    this.current = Math.max(0, Math.min(value, this.total));
    this.notifyListeners();
  }

  increment(amount: number = 1): void {
    this.setCurrent(this.current + amount);
  }

  setTotal(value: number): void {
    this.total = Math.max(1, value);
    this.notifyListeners();
  }

  setLabel(label: string): void {
    this.label = label;
    this.notifyListeners();
  }

  reset(): void {
    this.current = 0;
    this.notifyListeners();
  }

  getState(): ProgressState {
    return {
      current: this.current,
      total: this.total,
      percentage: Math.round((this.current / this.total) * 100),
      label: this.label,
    };
  }

  subscribe(callback: (state: ProgressState) => void): () => void {
    this.listeners.add(callback);

    // Initial call
    callback(this.getState());

    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach((callback) => callback(state));
  }
}

// ==================== ONBOARDING FLOW ====================

export class OnboardingFlow {
  private steps: OnboardingStep[];
  private currentStepIndex: number = 0;

  constructor(steps: OnboardingStep[]) {
    this.steps = steps;
  }

  getCurrentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex];
  }

  getSteps(): OnboardingStep[] {
    return this.steps;
  }

  getProgress(): number {
    const completed = this.steps.filter((s) => s.completed).length;
    return (completed / this.steps.length) * 100;
  }

  next(): OnboardingStep | null {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
      return this.getCurrentStep();
    }

    return null;
  }

  previous(): OnboardingStep | null {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      return this.getCurrentStep();
    }

    return null;
  }

  completeStep(stepId: string): void {
    const step = this.steps.find((s) => s.id === stepId);
    if (step) {
      step.completed = true;
    }
  }

  isComplete(): boolean {
    return this.steps.filter((s) => s.required).every((s) => s.completed);
  }

  canSkip(): boolean {
    return !this.getCurrentStep().required;
  }
}

// ==================== ANALYTICS HELPERS ====================

export const AnalyticsEvents = {
  // User events
  USER_REGISTERED: 'user_registered',
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',

  // Learning events
  LESSON_STARTED: 'lesson_started',
  LESSON_COMPLETED: 'lesson_completed',
  PHRASE_PRACTICED: 'phrase_practiced',
  QUIZ_COMPLETED: 'quiz_completed',

  // Engagement events
  STREAK_ACHIEVED: 'streak_achieved',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  LEVEL_UP: 'level_up',

  // Conversion events
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  LESSON_BOOKED: 'lesson_booked',

  // Feature usage
  SPEAKING_PRACTICED: 'speaking_practiced',
  LISTENING_PRACTICED: 'listening_practiced',
  GRAMMAR_PRACTICED: 'grammar_practiced',
};

export function trackEvent(
  event: string,
  properties?: Record<string, any>
): void {
  // Integration with PostHog, Mixpanel, etc.
  console.log('Event:', event, properties);

  // In production:
  // posthog.capture(event, properties);
}

export function trackPageView(page: string): void {
  console.log('Page view:', page);

  // In production:
  // posthog.capture('$pageview', { page });
}

// ==================== ACCESSIBILITY HELPERS ====================

export const AccessibilityHelpers = {
  /**
   * Announce to screen readers
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only'; // Screen reader only
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  },

  /**
   * Focus element
   */
  focus(element: HTMLElement): void {
    element.focus();
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  },

  /**
   * Trap focus within element (for modals)
   */
  trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    // Focus first element
    firstElement.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  },
};

// ==================== RESPONSIVE HELPERS ====================

export const Breakpoints = {
  mobile: 320,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export function getBreakpoint(): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  const width = window.innerWidth;

  if (width < Breakpoints.tablet) return 'mobile';
  if (width < Breakpoints.desktop) return 'tablet';
  if (width < Breakpoints.wide) return 'desktop';
  return 'wide';
}

export function isMobile(): boolean {
  return getBreakpoint() === 'mobile';
}

export function isTablet(): boolean {
  return getBreakpoint() === 'tablet';
}

export function isDesktop(): boolean {
  const bp = getBreakpoint();
  return bp === 'desktop' || bp === 'wide';
}

// ==================== FORMATTING HELPERS ====================

export const FormatHelpers = {
  /**
   * Format number with thousands separator
   */
  number(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value);
  },

  /**
   * Format currency
   */
  currency(value: number, currency = 'BRL'): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency,
    }).format(value / 100); // Assuming value is in cents
  },

  /**
   * Format date
   */
  date(date: Date | string, format: 'short' | 'long' = 'short'): string {
    const d = typeof date === 'string' ? new Date(date) : date;

    if (format === 'long') {
      return new Intl.DateTimeFormat('pt-BR', {
        dateStyle: 'long',
      }).format(d);
    }

    return new Intl.DateTimeFormat('pt-BR').format(d);
  },

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  relativeTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.date(d);
  },

  /**
   * Format duration (seconds to mm:ss)
   */
  duration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  },

  /**
   * Truncate text
   */
  truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  },
};

// ==================== VALIDATION HELPERS ====================

export const ValidationHelpers = {
  email(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  },

  phone(phone: string): boolean {
    const regex = /^\+?[1-9]\d{1,14}$/;
    return regex.test(phone.replace(/\s/g, ''));
  },

  url(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  password(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('Must be at least 8 characters');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Must contain uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Must contain lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('Must contain number');
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push('Must contain special character');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },
};

// ==================== DEBOUNCE AND THROTTLE ====================

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return function debounced(...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function throttled(...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ==================== SINGLETON INSTANCES ====================

export const loadingManager = new LoadingStateManager();
export const notifications = new NotificationSystem();
