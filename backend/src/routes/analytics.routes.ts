/**
 * ANALYTICS ROUTES
 */
import { Router } from 'express'
import { getUserAnalytics, getDashboard } from '../controllers/analytics.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/user', authenticateToken, getUserAnalytics)
router.get('/dashboard', authenticateToken, getDashboard)

export default router
