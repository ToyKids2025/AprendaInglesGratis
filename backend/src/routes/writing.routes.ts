/**
 * WRITING EXERCISES ROUTES
 * API endpoints for AI-powered writing practice
 */

import { Router } from 'express'
import {
  createExercise,
  getExercise,
  getExercises,
  submitWriting,
  getSubmission,
  getUserSubmissions,
  submitRevision,
  getCommonErrors,
  markErrorAsLearned,
  getProgress,
  createChallenge,
  joinChallenge,
  getActiveChallenges,
  getTemplates,
  getTopics,
} from '../controllers/writing.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * PUBLIC ROUTES
 */

// Get exercises (public list)
router.get('/exercises', getExercises)

// Get exercise details
router.get('/exercises/:exerciseId', getExercise)

// Get active challenges
router.get('/challenges/active', getActiveChallenges)

// Get templates
router.get('/templates', getTemplates)

// Get topics
router.get('/topics', getTopics)

/**
 * AUTHENTICATED ROUTES
 */
router.use(authenticateToken)

/**
 * EXERCISE MANAGEMENT
 */

// Create exercise (instructor only)
router.post('/exercises', createExercise)

/**
 * SUBMISSION & GRADING
 */

// Submit writing for exercise
router.post('/exercises/:exerciseId/submit', submitWriting)

// Get submission details
router.get('/submissions/:submissionId', getSubmission)

// Get my submissions
router.get('/submissions', getUserSubmissions)

/**
 * REVISIONS
 */

// Submit revision
router.post('/submissions/:submissionId/revise', submitRevision)

/**
 * ERROR TRACKING
 */

// Get my common errors
router.get('/errors/common', getCommonErrors)

// Mark error as learned
router.post('/errors/:errorId/learned', markErrorAsLearned)

/**
 * PROGRESS
 */

// Get my writing progress
router.get('/progress', getProgress)

/**
 * CHALLENGES
 */

// Create challenge (admin only)
router.post('/challenges', createChallenge)

// Join challenge
router.post('/challenges/:challengeId/join', joinChallenge)

export default router
