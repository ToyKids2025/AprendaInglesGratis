/**
 * RECOMMENDATION ROUTES
 * AI-powered content recommendations
 */

import { Router } from 'express'
import {
  getRecommendations,
  submitFeedback,
  getAnalytics,
  updatePreferences,
  createLearningPath,
  enrollInPath,
  getUserPaths,
} from '../controllers/recommendation.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Get personalized recommendations
router.get('/', getRecommendations)

// Submit feedback on recommendation
router.post('/feedback', submitFeedback)

// Get recommendation analytics
router.get('/analytics', getAnalytics)

// Update preferences based on behavior
router.post('/preferences/update', updatePreferences)

// Learning paths
router.post('/learning-paths', createLearningPath)
router.get('/learning-paths', getUserPaths)
router.post('/learning-paths/:pathId/enroll', enrollInPath)

export default router
