/**
 * REFERRAL & AFFILIATE ROUTES
 * Referral program and affiliate management endpoints
 */

import { Router } from 'express'
import {
  generateReferralCode,
  trackClick,
  getStats,
  applyAffiliate,
  requestPayout,
  getLeaderboard,
  getReferrals,
  getCommissions,
} from '../controllers/referral.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Public endpoint
router.post('/track-click', trackClick)
router.get('/leaderboard', getLeaderboard)

// Protected endpoints (require authentication)
router.post('/generate-code', authenticateToken, generateReferralCode)
router.get('/stats', authenticateToken, getStats)
router.get('/referrals', authenticateToken, getReferrals)
router.get('/commissions', authenticateToken, getCommissions)

// Affiliate program
router.post('/affiliate/apply', authenticateToken, applyAffiliate)
router.post('/payout/request', authenticateToken, requestPayout)

export default router
