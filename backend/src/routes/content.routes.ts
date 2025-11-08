/**
 * CONTENT ROUTES
 * Categories, topics, tags, and advanced search
 */

import { Router } from 'express'
import {
  getCategories,
  getCategoryBySlug,
  getTags,
  getTopics,
  getSituations,
  searchPhrases,
  saveSearch,
  getSavedSearches,
} from '../controllers/content.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Public routes
router.get('/categories', getCategories)
router.get('/categories/:slug', getCategoryBySlug)
router.get('/tags', getTags)
router.get('/topics', getTopics)
router.get('/situations', getSituations)
router.post('/search', searchPhrases)

// Authenticated routes
router.post('/search/save', authenticateToken, saveSearch)
router.get('/search/saved', authenticateToken, getSavedSearches)

export default router
