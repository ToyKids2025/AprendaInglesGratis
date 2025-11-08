/**
 * MONITORING ROUTES
 * Admin endpoints for system monitoring
 */

import { Router } from 'express'
import {
  getErrorLogs,
  getErrorStats,
  updateErrorStatus,
  getPerformanceMetrics,
  getPerformanceStatsEndpoint,
  getHealth,
  getHealthHistoryEndpoint,
  getHealthStatsEndpoint,
  cleanupErrors,
} from '../controllers/monitoring.controller'
import { logClientError } from '../middleware/errorLogger'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// Public endpoints
router.get('/health', getHealth) // Public health check
router.post('/errors/client', logClientError) // Client-side error logging

// Admin error monitoring
router.get('/errors', authenticateToken, requireAdmin, getErrorLogs)
router.get('/errors/stats', authenticateToken, requireAdmin, getErrorStats)
router.patch('/errors/:id', authenticateToken, requireAdmin, updateErrorStatus)
router.delete('/errors/cleanup', authenticateToken, requireAdmin, cleanupErrors)

// Admin performance monitoring
router.get('/performance', authenticateToken, requireAdmin, getPerformanceMetrics)
router.get('/performance/stats', authenticateToken, requireAdmin, getPerformanceStatsEndpoint)

// Admin system health
router.get('/health/history', authenticateToken, requireAdmin, getHealthHistoryEndpoint)
router.get('/health/stats', authenticateToken, requireAdmin, getHealthStatsEndpoint)

export default router
