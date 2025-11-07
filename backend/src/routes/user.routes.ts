import { Router } from 'express'
import {
  getProfile,
  updateProfile,
  getStats,
  getAchievements,
} from '../controllers/user.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/profile', getProfile)
router.put('/profile', updateProfile)
router.get('/stats', getStats)
router.get('/achievements', getAchievements)

export default router
