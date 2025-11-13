/**
 * CHAT ROUTES
 * Real-time chat and messaging endpoints
 */

import { Router } from 'express'
import {
  createDirectConversation,
  createGroup,
  createStudyRoom,
  getConversations,
  getMessages,
  chatWithBot,
  blockUser,
  reportMessage,
} from '../controllers/chat.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// All routes require authentication
router.use(authenticateToken)

router.post('/conversations/direct', createDirectConversation)
router.post('/conversations/group', createGroup)
router.post('/study-rooms', createStudyRoom)
router.get('/conversations', getConversations)
router.get('/conversations/:conversationId/messages', getMessages)
router.post('/bot/chat', chatWithBot)
router.post('/block', blockUser)
router.post('/report', reportMessage)

export default router
