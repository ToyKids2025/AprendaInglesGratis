/**
 * REQUEST LOGGER MIDDLEWARE
 * Logs all HTTP requests with timing and status
 */

import { Request, Response, NextFunction } from 'express'

interface LogData {
  method: string
  url: string
  status: number
  responseTime: number
  userAgent?: string
  ip?: string
  userId?: string
  error?: string
}

/**
 * Colors for console output
 */
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
}

/**
 * Get color based on status code
 */
function getStatusColor(status: number): string {
  if (status >= 500) return colors.red
  if (status >= 400) return colors.yellow
  if (status >= 300) return colors.cyan
  if (status >= 200) return colors.green
  return colors.reset
}

/**
 * Get color based on response time
 */
function getTimeColor(ms: number): string {
  if (ms >= 1000) return colors.red
  if (ms >= 500) return colors.yellow
  return colors.green
}

/**
 * Format log message
 */
function formatLog(data: LogData): string {
  const statusColor = getStatusColor(data.status)
  const timeColor = getTimeColor(data.responseTime)

  const timestamp = new Date().toISOString()
  const method = data.method.padEnd(6)
  const status = data.status.toString().padStart(3)

  let log = `${colors.gray}[${timestamp}]${colors.reset} `
  log += `${colors.bright}${method}${colors.reset} `
  log += `${colors.blue}${data.url}${colors.reset} `
  log += `${statusColor}${status}${colors.reset} `
  log += `${timeColor}${data.responseTime}ms${colors.reset}`

  if (data.userId) {
    log += ` ${colors.cyan}user:${data.userId.substring(0, 8)}${colors.reset}`
  }

  if (data.error) {
    log += ` ${colors.red}error:${data.error}${colors.reset}`
  }

  return log
}

/**
 * Request logger middleware
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now()

  // Capture original end function
  const originalEnd = res.end

  // Override end function to log after response
  res.end = function (chunk?: any, encoding?: any, callback?: any): Response {
    // Calculate response time
    const responseTime = Date.now() - startTime

    // Get user ID from request (if authenticated)
    const userId = (req as any).user?.id

    // Prepare log data
    const logData: LogData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      responseTime,
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.socket.remoteAddress,
      userId,
    }

    // Log the request
    console.log(formatLog(logData))

    // Store in database for analytics (optional, implement if needed)
    if (process.env.LOG_TO_DATABASE === 'true') {
      // TODO: Store in database
    }

    // Call original end function
    return originalEnd.call(this, chunk, encoding, callback)
  }

  next()
}

/**
 * Error logger middleware
 * Should be used AFTER routes but BEFORE error handler
 */
export function errorLogger(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logData: LogData = {
    method: req.method,
    url: req.originalUrl || req.url,
    status: res.statusCode || 500,
    responseTime: 0,
    userId: (req as any).user?.id,
    error: err.message,
  }

  console.error(formatLog(logData))
  console.error(colors.red + 'Stack trace:' + colors.reset)
  console.error(err.stack)

  // In production, you might want to send this to a service like Sentry
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to error tracking service
  }

  next(err)
}

export default {
  requestLogger,
  errorLogger,
}
