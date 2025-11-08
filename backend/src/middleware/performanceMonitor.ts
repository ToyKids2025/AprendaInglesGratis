/**
 * PERFORMANCE MONITORING MIDDLEWARE
 * Track response times, slow queries, and system metrics
 */

import { Request, Response, NextFunction } from 'express'
import { PrismaClient } from '@prisma/client'
import os from 'os'

const prisma = new PrismaClient()

// Track slow query threshold (1 second)
const SLOW_QUERY_THRESHOLD = 1000

/**
 * Performance monitoring middleware
 */
export function performanceMonitor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const startTime = Date.now()
  const startMemory = process.memoryUsage().heapUsed / 1024 / 1024 // MB

  // Override res.json to capture when response is sent
  const originalJson = res.json.bind(res)
  res.json = function (body: any) {
    const duration = Date.now() - startTime
    const endMemory = process.memoryUsage().heapUsed / 1024 / 1024
    const memoryUsed = endMemory - startMemory

    // Log performance metric asynchronously
    logPerformanceMetric(req, res, duration, memoryUsed).catch(console.error)

    return originalJson(body)
  }

  next()
}

/**
 * Log performance metric to database
 */
async function logPerformanceMetric(
  req: Request,
  res: Response,
  duration: number,
  memoryUsed: number
) {
  try {
    // Skip logging for health checks and static files
    if (
      req.path === '/health' ||
      req.path.startsWith('/static') ||
      req.path.startsWith('/assets')
    ) {
      return
    }

    const userId = (req as any).user?.id
    const isSlow = duration > SLOW_QUERY_THRESHOLD

    // Get CPU usage
    const cpuUsage = os.loadavg()[0] // 1-minute load average

    await prisma.performanceMetric.create({
      data: {
        endpoint: req.path,
        method: req.method,
        duration,
        userId,
        statusCode: res.statusCode,
        memoryUsed,
        cpuUsage,
        isSlow,
        // TODO: Track actual DB queries when Prisma middleware is set up
        dbQueries: 0,
        dbDuration: 0,
      },
    })

    // Log slow queries to console
    if (isSlow) {
      console.warn(`[SLOW REQUEST] ${req.method} ${req.path} - ${duration}ms`)
    }
  } catch (error) {
    // Don't fail the request if logging fails
    console.error('Failed to log performance metric:', error)
  }
}

/**
 * Get performance stats for endpoint
 */
export async function getPerformanceStats(endpoint?: string, hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const where = {
    createdAt: { gte: since },
    ...(endpoint && { endpoint }),
  }

  const [metrics, slowQueries] = await Promise.all([
    prisma.performanceMetric.findMany({
      where,
      select: {
        duration: true,
        endpoint: true,
        method: true,
      },
    }),
    prisma.performanceMetric.count({
      where: { ...where, isSlow: true },
    }),
  ])

  if (metrics.length === 0) {
    return {
      count: 0,
      avgDuration: 0,
      minDuration: 0,
      maxDuration: 0,
      slowQueries: 0,
    }
  }

  const durations = metrics.map((m) => m.duration)
  const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length

  return {
    count: metrics.length,
    avgDuration: Math.round(avgDuration),
    minDuration: Math.min(...durations),
    maxDuration: Math.max(...durations),
    slowQueries,
    p95: percentile(durations, 95),
    p99: percentile(durations, 99),
  }
}

/**
 * Calculate percentile
 */
function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0
  const sorted = [...arr].sort((a, b) => a - b)
  const index = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[index]
}

/**
 * Get slowest endpoints
 */
export async function getSlowestEndpoints(limit: number = 10) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours

  const metrics = await prisma.performanceMetric.groupBy({
    by: ['endpoint', 'method'],
    where: {
      createdAt: { gte: since },
    },
    _avg: {
      duration: true,
    },
    _count: true,
    orderBy: {
      _avg: {
        duration: 'desc',
      },
    },
    take: limit,
  })

  return metrics.map((m) => ({
    endpoint: m.endpoint,
    method: m.method,
    avgDuration: Math.round(m._avg.duration || 0),
    requests: m._count,
  }))
}

export default {
  performanceMonitor,
  getPerformanceStats,
  getSlowestEndpoints,
}
