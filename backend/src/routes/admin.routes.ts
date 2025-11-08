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
  generateAIPhrases,
  batchCreatePhrases,
  getPhrases,
  updatePhrase,
  deletePhrase,
  getCategories,
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

// Phrase management
router.post('/phrases/generate', generateAIPhrases)
router.post('/phrases/batch-create', batchCreatePhrases)
router.get('/phrases', getPhrases)
router.patch('/phrases/:id', updatePhrase)
router.delete('/phrases/:id', deletePhrase)

// Categories
router.get('/categories', getCategories)

// Health check
router.get('/health', adminHealthCheck)

export default router
