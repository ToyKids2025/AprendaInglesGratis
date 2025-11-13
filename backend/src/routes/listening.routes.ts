import { Router } from 'express'
import { createExercise, getExercise, getExercises, startExercise, submitAnswer, completeExercise, getProgress } from '../controllers/listening.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/exercises', getExercises)
router.get('/exercises/:exerciseId', getExercise)

router.use(authenticateToken)

router.post('/exercises', createExercise)
router.post('/exercises/:exerciseId/start', startExercise)
router.post('/attempts/:attemptId/answer', submitAnswer)
router.post('/attempts/:attemptId/complete', completeExercise)
router.get('/progress', getProgress)

export default router
