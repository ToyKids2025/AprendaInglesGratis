import { Router } from 'express'
import {
  getLevels,
  getCategories,
  getCategoryWithPhrases,
  updateProgress,
} from '../controllers/lesson.controller'
import { authMiddleware } from '../middleware/auth'

const router = Router()

router.use(authMiddleware)

router.get('/levels', getLevels)
router.get('/categories', getCategories)
router.get('/categories/:slug', getCategoryWithPhrases)
router.post('/progress', updateProgress)

export default router
