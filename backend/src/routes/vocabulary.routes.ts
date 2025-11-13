/**
 * VOCABULARY ROUTES
 * API endpoints for vocabulary builder system
 */

import { Router } from 'express'
import {
  createList,
  getUserLists,
  updateList,
  deleteList,
  addWord,
  bulkAddWords,
  getWord,
  updateWord,
  deleteWord,
  getListWords,
  getDueWords,
  reviewWord,
  getStats,
  searchWords,
  shareList,
  copySharedList,
  getListProgress,
  toggleFavorite,
  getReviewHistory,
} from '../controllers/vocabulary.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

/**
 * All routes require authentication
 */
router.use(authenticateToken)

/**
 * VOCABULARY LIST ROUTES
 */

// Create new vocabulary list
router.post('/lists', createList)

// Get all user's vocabulary lists
router.get('/lists', getUserLists)

// Update vocabulary list
router.patch('/lists/:listId', updateList)

// Delete vocabulary list
router.delete('/lists/:listId', deleteList)

// Get list progress/statistics
router.get('/lists/:listId/progress', getListProgress)

// Share vocabulary list
router.post('/lists/share', shareList)

// Copy shared vocabulary list
router.post('/lists/copy', copySharedList)

/**
 * VOCABULARY WORD ROUTES
 */

// Add word to list
router.post('/words', addWord)

// Bulk add words to list
router.post('/words/bulk', bulkAddWords)

// Get single word details
router.get('/words/:wordId', getWord)

// Update word
router.patch('/words/:wordId', updateWord)

// Delete word
router.delete('/words/:wordId', deleteWord)

// Toggle word as favorite
router.post('/words/:wordId/favorite', toggleFavorite)

// Get words by list
router.get('/lists/:listId/words', getListWords)

/**
 * SPACED REPETITION & REVIEW ROUTES
 */

// Get words due for review (spaced repetition)
router.get('/review/due', getDueWords)

// Review word (update spaced repetition data)
router.post('/review', reviewWord)

// Get review history
router.get('/review/history', getReviewHistory)

/**
 * SEARCH & STATISTICS ROUTES
 */

// Search words in vocabulary
router.get('/search', searchWords)

// Get vocabulary statistics
router.get('/stats', getStats)

export default router
