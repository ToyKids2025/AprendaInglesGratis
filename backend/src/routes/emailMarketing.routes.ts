/**
 * EMAIL MARKETING ROUTES
 * Campaign and automation endpoints
 */

import { Router } from 'express'
import {
  createCampaign,
  sendCampaign,
  getCampaignAnalytics,
  createDripSequence,
  getTemplates,
} from '../controllers/emailMarketing.controller'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// All routes require admin access
router.use(authenticateToken, requireAdmin)

// Campaign management
router.post('/campaigns', createCampaign)
router.post('/campaigns/:id/send', sendCampaign)
router.get('/campaigns/:id/analytics', getCampaignAnalytics)

// Drip sequences
router.post('/drip-sequences', createDripSequence)

// Templates
router.get('/templates', getTemplates)

export default router
