/**
 * PUSH NOTIFICATION ROUTES
 * Device registration and notification management
 */

import { Router } from 'express'
import {
  registerDevice,
  unregisterDevice,
  sendToMe,
  sendToSegment,
  scheduleNotification,
  trackOpened,
  trackClicked,
  getPreferences,
  updatePreferences,
  getAnalytics,
  getHistory,
  testNotification,
} from '../controllers/pushNotification.controller'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// Public endpoints (tracking)
router.post('/track/opened', trackOpened)
router.post('/track/clicked', trackClicked)

// Protected endpoints (require authentication)
router.use(authenticateToken)

router.post('/device/register', registerDevice)
router.post('/device/unregister', unregisterDevice)
router.post('/test', testNotification)
router.post('/send-to-me', sendToMe)
router.get('/preferences', getPreferences)
router.put('/preferences', updatePreferences)
router.get('/history', getHistory)

// Admin endpoints
router.post('/send-to-segment', requireAdmin, sendToSegment)
router.post('/schedule', requireAdmin, scheduleNotification)
router.get('/analytics/:notificationId', requireAdmin, getAnalytics)

export default router
