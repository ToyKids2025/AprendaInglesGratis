import { Router } from 'express'
import { connectAccount, shareAchievement, getShares } from '../controllers/social.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()
router.use(authenticateToken)

router.post('/connect', connectAccount)
router.post('/share/achievement', shareAchievement)
router.get('/shares', getShares)

export default router
