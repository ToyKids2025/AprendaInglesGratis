/**
 * ERROR LOGGING MIDDLEWARE
 * Captures and logs all errors with context
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface CustomError extends Error {
  statusCode?: number
  code?: string
  severity?: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Log error to database
 */
async function logError(
  error: CustomError,
  req: Request,
  type: string = 'server'
) {
  try {
    // Determine severity
    let severity = error.severity || 'medium'
    if (error.statusCode && error.statusCode >= 500) {
      severity = 'high'
    }
    if (error.code === 'DATABASE_ERROR' || error.message.includes('ECONNREFUSED')) {
      severity = 'critical'
    }

    // Get user info if available
    const userId = (req as any).user?.id
    const userEmail = (req as any).user?.email

    // Sanitize sensitive data
    const sanitizedHeaders = { ...req.headers }
    delete sanitizedHeaders.authorization
    delete sanitizedHeaders.cookie

    const sanitizedBody = req.body ? JSON.stringify(req.body).substring(0, 5000) : null

    await prisma.errorLog.create({
      data: {
        type,
        severity,
        message: error.message,
        stack: error.stack || null,
        code: error.code || error.statusCode?.toString() || null,
        endpoint: req.path,
        method: req.method,
        userId,
        userEmail,
        requestBody: sanitizedBody,
        queryParams: JSON.stringify(req.query),
        headers: JSON.stringify(sanitizedHeaders),
        environment: process.env.NODE_ENV || 'production',
        version: process.env.APP_VERSION || '1.0.0',
      },
    })
  } catch (logError) {
    // If logging fails, at least log to console
    console.error('Failed to log error to database:', logError)
  }
}

/**
 * Error handling middleware
 */
export function errorHandler(
  error: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log error
  logError(error, req).catch(console.error)

  // Determine status code
  const statusCode = error.statusCode || 500

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      path: req.path,
      method: req.method,
    })
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: {
      message: error.message || 'Internal server error',
      code: error.code || 'INTERNAL_ERROR',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  })
}

/**
 * Async error wrapper
 */
export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

/**
 * Client-side error logging endpoint
 */
export async function logClientError(req: Request, res: Response) {
  try {
    const { message, stack, url, browser, device, os, severity } = req.body

    const userId = (req as any).user?.id
    const userEmail = (req as any).user?.email

    await prisma.errorLog.create({
      data: {
        type: 'client',
        severity: severity || 'medium',
        message,
        stack: stack || null,
        userId,
        userEmail,
        url,
        browser,
        device,
        os,
        environment: process.env.NODE_ENV || 'production',
        version: process.env.APP_VERSION || '1.0.0',
      },
    })

    res.json({ success: true })
  } catch (error) {
    console.error('Failed to log client error:', error)
    res.status(500).json({ success: false })
  }
}

export default {
  errorHandler,
  asyncHandler,
  logClientError,
  logError,
}
