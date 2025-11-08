/**
 * ADMIN ROUTES
 * Protected admin-only endpoints
 */

import { Router } from 'express'
import {
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAnalytics,
  adminHealthCheck,
} from '../controllers/admin.controller'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// All admin routes require authentication AND admin privileges
router.use(authenticateToken, requireAdmin)

// User management
router.get('/users', getUsers)
router.get('/users/:id', getUserDetails)
router.patch('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

// Analytics
router.get('/analytics', getAnalytics)

// Health check
router.get('/health', adminHealthCheck)

export default router
