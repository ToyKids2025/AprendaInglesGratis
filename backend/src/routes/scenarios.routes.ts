/**
 * CONVERSATION SCENARIOS ROUTES
 */

import { Router } from 'express'
import {
  getScenarios,
  getScenarioBySlug,
  createScenario,
  updateScenario,
  deleteScenario,
  getAllScenariosAdmin,
} from '../controllers/scenarios.controller'
import { authenticateToken } from '../middleware/auth'
import { requireAdmin } from '../middleware/adminAuth'

const router = Router()

// Public routes (for authenticated users)
router.get('/', authenticateToken, getScenarios)
router.get('/:slug', authenticateToken, getScenarioBySlug)

// Admin routes
router.get('/admin/all', authenticateToken, requireAdmin, getAllScenariosAdmin)
router.post('/admin', authenticateToken, requireAdmin, createScenario)
router.patch('/admin/:id', authenticateToken, requireAdmin, updateScenario)
router.delete('/admin/:id', authenticateToken, requireAdmin, deleteScenario)

export default router
