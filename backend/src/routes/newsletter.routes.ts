/**
 * NEWSLETTER ROUTES
 */

import { Router } from 'express'
import {
  subscribe,
  unsubscribe,
  getStats,
  sendCampaign,
  newsletterHealthCheck,
} from '../controllers/newsletter.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Public routes
router.post('/subscribe', subscribe)
router.post('/unsubscribe', unsubscribe)
router.get('/health', newsletterHealthCheck)

// Protected routes (admin only)
router.get('/stats', authenticateToken, getStats)
router.post('/send-campaign', authenticateToken, sendCampaign)

export default router
