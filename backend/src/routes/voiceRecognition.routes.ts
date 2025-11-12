/**
 * VOICE RECOGNITION ROUTES
 * Speech-to-text and pronunciation analysis
 */

import { Router } from 'express'
import {
  analyzePronunciation,
  getHistory,
  getStatistics,
  updateSettings,
  uploadAudioMiddleware,
} from '../controllers/voiceRecognition.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

// Analyze pronunciation (with optional audio upload)
router.post('/analyze', uploadAudioMiddleware, analyzePronunciation)

// Get pronunciation history
router.get('/history', getHistory)

// Get voice statistics
router.get('/statistics', getStatistics)

// Update voice settings
router.put('/settings', updateSettings)

export default router
