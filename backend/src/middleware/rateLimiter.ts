/**
 * RATE LIMITER MIDDLEWARE
 * Prevents API abuse with configurable rate limits
 */

import { Request, Response, NextFunction } from 'express'

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  message?: string
  skipSuccessfulRequests?: boolean
}

interface RequestRecord {
  count: number
  resetAt: number
}

// In-memory store (use Redis for production)
const store = new Map<string, RequestRecord>()

/**
 * Clean up expired entries every 10 minutes
 */
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (record.resetAt < now) {
      store.delete(key)
    }
  }
}, 10 * 60 * 1000)

/**
 * Get client identifier (IP + User ID if authenticated)
 */
function getClientId(req: Request): string {
  const userId = (req as any).user?.id
  const ip = req.ip || req.socket.remoteAddress || 'unknown'
  return userId ? `${ip}-${userId}` : ip
}

/**
 * Create rate limiter middleware
 */
export function rateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Muitas requisições. Tente novamente mais tarde.',
    skipSuccessfulRequests = false,
  } = config

  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = getClientId(req)
    const now = Date.now()

    // Get or create record
    let record = store.get(clientId)

    // Create new record if doesn't exist or expired
    if (!record || record.resetAt < now) {
      record = {
        count: 0,
        resetAt: now + windowMs,
      }
      store.set(clientId, record)
    }

    // Increment count
    record.count++

    // Add rate limit headers
    const remaining = Math.max(0, maxRequests - record.count)
    const resetInSeconds = Math.ceil((record.resetAt - now) / 1000)

    res.setHeader('X-RateLimit-Limit', maxRequests.toString())
    res.setHeader('X-RateLimit-Remaining', remaining.toString())
    res.setHeader('X-RateLimit-Reset', resetInSeconds.toString())

    // Check if limit exceeded
    if (record.count > maxRequests) {
      res.setHeader('Retry-After', resetInSeconds.toString())
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message,
        retryAfter: resetInSeconds,
      })
    }

    // If skipSuccessfulRequests, decrement count on successful response
    if (skipSuccessfulRequests) {
      const originalEnd = res.end
      res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
        if (res.statusCode < 400) {
          record!.count--
        }
        return originalEnd.call(this, chunk, encoding, callback)
      }
    }

    next()
  }
}

/**
 * Predefined rate limiters for common use cases
 */
export const rateLimiters = {
  // General API: 100 requests per minute
  general: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  }),

  // Strict: 30 requests per minute (auth, payments)
  strict: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30,
    message: 'Muitas tentativas. Por favor, aguarde antes de tentar novamente.',
  }),

  // Auth: 5 failed login attempts per 15 minutes
  auth: rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    skipSuccessfulRequests: true, // Don't count successful logins
  }),

  // AI: 20 requests per minute (expensive operations)
  ai: rateLimit({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20,
    message: 'Limite de requisições de IA atingido. Aguarde um minuto.',
  }),

  // Newsletter: 3 requests per hour (prevent spam)
  newsletter: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Você já se inscreveu recentemente. Tente novamente mais tarde.',
  }),

  // Contact form: 3 messages per hour
  contact: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: 'Limite de mensagens atingido. Tente novamente em 1 hora.',
  }),
}

export default {
  rateLimit,
  rateLimiters,
}
