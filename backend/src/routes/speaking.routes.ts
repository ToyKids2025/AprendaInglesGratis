import { Router } from 'express'
import { createExercise, getExercises, saveRecording, analyzeRecording, getUserRecordings, getPronunciationExercises, submitPronunciation } from '../controllers/speaking.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

router.get('/exercises', getExercises)
router.get('/pronunciation', getPronunciationExercises)

router.use(authenticateToken)

router.post('/exercises', createExercise)
router.post('/recordings', saveRecording)
router.post('/recordings/:recordingId/analyze', analyzeRecording)
router.get('/recordings', getUserRecordings)
router.post('/pronunciation/submit', submitPronunciation)

export default router
