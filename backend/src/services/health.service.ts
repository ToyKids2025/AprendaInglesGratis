/**
 * SYSTEM HEALTH MONITORING SERVICE
 * Track system health, uptime, and resource usage
 */

import { PrismaClient } from '@prisma/client'
import os from 'os'

const prisma = new PrismaClient()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'critical'
  uptime: number
  memory: {
    total: number
    used: number
    free: number
    percentage: number
  }
  cpu: {
    usage: number
    cores: number
  }
  database: {
    connected: boolean
    responseTime: number
  }
  application: {
    activeUsers: number
    requestsPerMin: number
    errorsPerMin: number
  }
  timestamp: Date
}

/**
 * Get current system health
 */
export async function getSystemHealth(): Promise<HealthStatus> {
  const startTime = Date.now()

  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    const dbResponseTime = Date.now() - startTime

    // Memory stats
    const totalMemory = os.totalmem() / 1024 / 1024 // MB
    const freeMemory = os.freemem() / 1024 / 1024
    const usedMemory = totalMemory - freeMemory
    const memoryPercentage = (usedMemory / totalMemory) * 100

    // CPU stats
    const cpuUsage = os.loadavg()[0] // 1-minute load average
    const cpuCores = os.cpus().length

    // Get active users (last 15 minutes)
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000)
    const activeUsers = await prisma.user.count({
      where: {
        lastStudyDate: {
          gte: fifteenMinutesAgo,
        },
      },
    })

    // Get requests per minute (last minute)
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000)
    const requestsPerMin = await prisma.performanceMetric.count({
      where: {
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    })

    // Get errors per minute (last minute)
    const errorsPerMin = await prisma.errorLog.count({
      where: {
        createdAt: {
          gte: oneMinuteAgo,
        },
      },
    })

    // Determine overall health status
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy'

    if (
      memoryPercentage > 90 ||
      cpuUsage > cpuCores * 0.9 ||
      dbResponseTime > 1000 ||
      errorsPerMin > 10
    ) {
      status = 'critical'
    } else if (
      memoryPercentage > 75 ||
      cpuUsage > cpuCores * 0.7 ||
      dbResponseTime > 500 ||
      errorsPerMin > 5
    ) {
      status = 'degraded'
    }

    return {
      status,
      uptime: process.uptime(),
      memory: {
        total: Math.round(totalMemory),
        used: Math.round(usedMemory),
        free: Math.round(freeMemory),
        percentage: Math.round(memoryPercentage),
      },
      cpu: {
        usage: Math.round(cpuUsage * 100) / 100,
        cores: cpuCores,
      },
      database: {
        connected: true,
        responseTime: dbResponseTime,
      },
      application: {
        activeUsers,
        requestsPerMin,
        errorsPerMin,
      },
      timestamp: new Date(),
    }
  } catch (error) {
    console.error('Health check failed:', error)

    return {
      status: 'critical',
      uptime: process.uptime(),
      memory: {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0,
      },
      cpu: {
        usage: 0,
        cores: os.cpus().length,
      },
      database: {
        connected: false,
        responseTime: -1,
      },
      application: {
        activeUsers: 0,
        requestsPerMin: 0,
        errorsPerMin: 0,
      },
      timestamp: new Date(),
    }
  }
}

/**
 * Record health snapshot to database
 */
export async function recordHealthSnapshot() {
  try {
    const health = await getSystemHealth()

    await prisma.systemHealth.create({
      data: {
        uptime: health.uptime,
        memoryTotal: health.memory.total,
        memoryUsed: health.memory.used,
        cpuUsage: health.cpu.usage,
        dbConnections: 1, // TODO: Get actual connection count
        dbResponseTime: health.database.responseTime,
        activeUsers: health.application.activeUsers,
        requestsPerMin: health.application.requestsPerMin,
        errorsPerMin: health.application.errorsPerMin,
        status: health.status,
      },
    })

    return health
  } catch (error) {
    console.error('Failed to record health snapshot:', error)
    throw error
  }
}

/**
 * Get health history
 */
export async function getHealthHistory(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const history = await prisma.systemHealth.findMany({
    where: {
      createdAt: {
        gte: since,
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return history
}

/**
 * Get health statistics
 */
export async function getHealthStats(hours: number = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000)

  const [history, avgStats] = await Promise.all([
    prisma.systemHealth.findMany({
      where: { createdAt: { gte: since } },
      select: {
        status: true,
        cpuUsage: true,
        memoryUsed: true,
        memoryTotal: true,
        dbResponseTime: true,
        createdAt: true,
      },
    }),
    prisma.systemHealth.aggregate({
      where: { createdAt: { gte: since } },
      _avg: {
        cpuUsage: true,
        memoryUsed: true,
        dbResponseTime: true,
        requestsPerMin: true,
        errorsPerMin: true,
      },
      _max: {
        cpuUsage: true,
        memoryUsed: true,
        dbResponseTime: true,
      },
    }),
  ])

  const statusCounts = {
    healthy: history.filter((h) => h.status === 'healthy').length,
    degraded: history.filter((h) => h.status === 'degraded').length,
    critical: history.filter((h) => h.status === 'critical').length,
  }

  const uptimePercentage =
    history.length > 0
      ? ((statusCounts.healthy + statusCounts.degraded) / history.length) * 100
      : 100

  return {
    period: `${hours} hours`,
    uptime: Math.round(uptimePercentage * 100) / 100,
    statusCounts,
    averages: {
      cpuUsage: Math.round((avgStats._avg.cpuUsage || 0) * 100) / 100,
      memoryUsed: Math.round(avgStats._avg.memoryUsed || 0),
      dbResponseTime: Math.round(avgStats._avg.dbResponseTime || 0),
      requestsPerMin: Math.round(avgStats._avg.requestsPerMin || 0),
      errorsPerMin: Math.round((avgStats._avg.errorsPerMin || 0) * 100) / 100,
    },
    peaks: {
      cpuUsage: Math.round((avgStats._max.cpuUsage || 0) * 100) / 100,
      memoryUsed: Math.round(avgStats._max.memoryUsed || 0),
      dbResponseTime: Math.round(avgStats._max.dbResponseTime || 0),
    },
  }
}

/**
 * Start periodic health monitoring (every 5 minutes)
 */
export function startHealthMonitoring() {
  const INTERVAL = 5 * 60 * 1000 // 5 minutes

  // Record initial snapshot
  recordHealthSnapshot().catch(console.error)

  // Record periodic snapshots
  setInterval(() => {
    recordHealthSnapshot().catch(console.error)
  }, INTERVAL)

  console.log('Health monitoring started (5-minute intervals)')
}

export default {
  getSystemHealth,
  recordHealthSnapshot,
  getHealthHistory,
  getHealthStats,
  startHealthMonitoring,
}
