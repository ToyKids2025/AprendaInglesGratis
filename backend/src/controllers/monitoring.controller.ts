/**
 * MONITORING CONTROLLER
 * Admin endpoints for errors, performance, and system health
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import {
  getSystemHealth,
  getHealthHistory,
  getHealthStats,
} from '../services/health.service'
import {
  getPerformanceStats,
  getSlowestEndpoints,
} from '../middleware/performanceMonitor'

const prisma = new PrismaClient()

/**
 * GET /api/monitoring/errors
 * Get error logs with filtering
 */
export async function getErrorLogs(req: Request, res: Response) {
  try {
    const { type, severity, resolved, limit = 50, offset = 0 } = req.query

    const where: any = {}
    if (type) where.type = type
    if (severity) where.severity = severity
    if (resolved !== undefined) where.resolved = resolved === 'true'

    const [errors, total] = await Promise.all([
      prisma.errorLog.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.errorLog.count({ where }),
    ])

    res.json({
      success: true,
      errors,
      total,
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error: any) {
    console.error('Failed to get error logs:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/errors/stats
 * Get error statistics
 */
export async function getErrorStats(req: Request, res: Response) {
  try {
    const { hours = 24 } = req.query
    const since = new Date(Date.now() - Number(hours) * 60 * 60 * 1000)

    const [total, byType, bySeverity, recent, resolved, unresolved] =
      await Promise.all([
        prisma.errorLog.count(),
        prisma.errorLog.groupBy({
          by: ['type'],
          _count: true,
          where: { createdAt: { gte: since } },
        }),
        prisma.errorLog.groupBy({
          by: ['severity'],
          _count: true,
          where: { createdAt: { gte: since } },
        }),
        prisma.errorLog.count({
          where: { createdAt: { gte: since } },
        }),
        prisma.errorLog.count({
          where: { resolved: true },
        }),
        prisma.errorLog.count({
          where: { resolved: false },
        }),
      ])

    const typeStats: Record<string, number> = {}
    byType.forEach((item) => {
      typeStats[item.type] = item._count
    })

    const severityStats: Record<string, number> = {}
    bySeverity.forEach((item) => {
      severityStats[item.severity] = item._count
    })

    res.json({
      success: true,
      stats: {
        total,
        recent,
        resolved,
        unresolved,
        byType: typeStats,
        bySeverity: severityStats,
      },
    })
  } catch (error: any) {
    console.error('Failed to get error stats:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * PATCH /api/monitoring/errors/:id
 * Update error status
 */
export async function updateErrorStatus(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { resolved, notes } = req.body
    const adminId = (req as any).user.id

    const updated = await prisma.errorLog.update({
      where: { id },
      data: {
        resolved: resolved ?? undefined,
        notes: notes ?? undefined,
        ...(resolved && {
          resolvedBy: adminId,
          resolvedAt: new Date(),
        }),
      },
    })

    res.json({
      success: true,
      error: updated,
    })
  } catch (error: any) {
    console.error('Failed to update error:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/performance
 * Get performance metrics
 */
export async function getPerformanceMetrics(req: Request, res: Response) {
  try {
    const { endpoint, hours = 24, limit = 50, offset = 0 } = req.query

    const where: any = {
      createdAt: {
        gte: new Date(Date.now() - Number(hours) * 60 * 60 * 1000),
      },
    }
    if (endpoint) where.endpoint = endpoint

    const [metrics, total, slowest] = await Promise.all([
      prisma.performanceMetric.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: Number(limit),
        skip: Number(offset),
      }),
      prisma.performanceMetric.count({ where }),
      getSlowestEndpoints(10),
    ])

    res.json({
      success: true,
      metrics,
      total,
      slowest,
      limit: Number(limit),
      offset: Number(offset),
    })
  } catch (error: any) {
    console.error('Failed to get performance metrics:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/performance/stats
 * Get performance statistics
 */
export async function getPerformanceStatsEndpoint(req: Request, res: Response) {
  try {
    const { endpoint, hours = 24 } = req.query

    const stats = await getPerformanceStats(
      endpoint as string | undefined,
      Number(hours)
    )

    res.json({
      success: true,
      stats,
    })
  } catch (error: any) {
    console.error('Failed to get performance stats:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/health
 * Get current system health
 */
export async function getHealth(req: Request, res: Response) {
  try {
    const health = await getSystemHealth()

    res.json({
      success: true,
      health,
    })
  } catch (error: any) {
    console.error('Failed to get health:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/health/history
 * Get system health history
 */
export async function getHealthHistoryEndpoint(req: Request, res: Response) {
  try {
    const { hours = 24 } = req.query

    const history = await getHealthHistory(Number(hours))

    res.json({
      success: true,
      history,
    })
  } catch (error: any) {
    console.error('Failed to get health history:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/monitoring/health/stats
 * Get system health statistics
 */
export async function getHealthStatsEndpoint(req: Request, res: Response) {
  try {
    const { hours = 24 } = req.query

    const stats = await getHealthStats(Number(hours))

    res.json({
      success: true,
      stats,
    })
  } catch (error: any) {
    console.error('Failed to get health stats:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * DELETE /api/monitoring/errors/cleanup
 * Clean up old resolved errors
 */
export async function cleanupErrors(req: Request, res: Response) {
  try {
    const { days = 30 } = req.query
    const cutoffDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000)

    const deleted = await prisma.errorLog.deleteMany({
      where: {
        resolved: true,
        createdAt: {
          lt: cutoffDate,
        },
      },
    })

    res.json({
      success: true,
      deleted: deleted.count,
    })
  } catch (error: any) {
    console.error('Failed to cleanup errors:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  getErrorLogs,
  getErrorStats,
  updateErrorStatus,
  getPerformanceMetrics,
  getPerformanceStatsEndpoint,
  getHealth,
  getHealthHistoryEndpoint,
  getHealthStatsEndpoint,
  cleanupErrors,
}
