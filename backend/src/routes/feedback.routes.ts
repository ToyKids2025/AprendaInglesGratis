/**
 * FEEDBACK ROUTES
 */

import { Router } from 'express'
import {
  submitFeedback,
  getMyFeedback,
  submitSurvey,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
} from '../controllers/feedback.controller'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// Public/user routes
router.post('/', submitFeedback) // Can be anonymous
router.get('/my', authenticateToken, getMyFeedback)
router.post('/survey', authenticateToken, submitSurvey)

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllFeedback)
router.patch('/admin/:id', authenticateToken, requireAdmin, updateFeedbackStatus)
router.get('/admin/stats', authenticateToken, requireAdmin, getFeedbackStats)

export default router
