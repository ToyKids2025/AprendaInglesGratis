/**
 * AI ROUTES
 * Rotas para conversação com IA e avaliação
 */

import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import * as aiController from '../controllers/ai.controller'

const router = Router()

// Todas as rotas de IA requerem autenticação
router.use(authMiddleware)

// Conversação
router.post('/conversation/start', aiController.startConversation)
router.post('/conversation/message', aiController.sendMessage)
router.get('/conversation/:id', aiController.getConversation)
router.get('/conversations', aiController.getConversations)

// Avaliação
router.post('/evaluate', aiController.evaluateAnswer)

export default router
