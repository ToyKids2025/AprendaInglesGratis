/**
 * READING COMPREHENSION ROUTES
 */

import { Router } from 'express'
import {
  createPassage,
  getPassage,
  getPassages,
  updatePassage,
  publishPassage,
  addQuestion,
  startReading,
  updateReadingProgress,
  submitAnswer,
  completeReading,
  getUserAttempts,
  createHighlight,
  getHighlights,
  deleteHighlight,
  createNote,
  getNotes,
  saveVocabulary,
  getSavedVocabulary,
  markVocabularyLearned,
  createCollection,
  getCollections,
  subscribeToCollection,
  getProgress,
  createChallenge,
  joinChallenge,
  getActiveChallenges,
} from '../controllers/reading.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/passages', getPassages)
router.get('/passages/:passageId', getPassage)
router.get('/collections', getCollections)
router.get('/challenges/active', getActiveChallenges)

// Authenticated routes
router.use(authenticateToken)

// Passage management (instructor)
router.post('/passages', createPassage)
router.patch('/passages/:passageId', updatePassage)
router.post('/passages/:passageId/publish', publishPassage)
router.post('/passages/:passageId/questions', addQuestion)

// Reading attempts
router.post('/passages/:passageId/start', startReading)
router.patch('/attempts/:attemptId/progress', updateReadingProgress)
router.post('/attempts/:attemptId/answer', submitAnswer)
router.post('/attempts/:attemptId/complete', completeReading)
router.get('/attempts', getUserAttempts)

// Highlights & Notes
router.post('/passages/:passageId/highlights', createHighlight)
router.get('/passages/:passageId/highlights', getHighlights)
router.delete('/highlights/:highlightId', deleteHighlight)
router.post('/passages/:passageId/notes', createNote)
router.get('/passages/:passageId/notes', getNotes)

// Vocabulary
router.post('/passages/:passageId/vocabulary', saveVocabulary)
router.get('/vocabulary', getSavedVocabulary)
router.post('/vocabulary/:vocabId/learned', markVocabularyLearned)

// Collections
router.post('/collections', createCollection)
router.post('/collections/:collectionId/subscribe', subscribeToCollection)

// Progress
router.get('/progress', getProgress)

// Challenges
router.post('/challenges', createChallenge)
router.post('/challenges/:challengeId/join', joinChallenge)

export default router
