/**
 * CHAT CONTROLLER
 * REST endpoints for chat functionality
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as chatService from '../services/chat.service'

const createGroupSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  imageUrl: z.string().url().optional(),
  participantIds: z.array(z.string()).min(1).max(50),
})

const createStudyRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  topic: z.string().optional(),
  maxParticipants: z.number().min(2).max(1000).optional(),
  isPublic: z.boolean().optional(),
  password: z.string().optional(),
  scheduledFor: z.string().datetime().optional(),
})

const chatBotSchema = z.object({
  botId: z.string(),
  message: z.string().min(1).max(2000),
})

const blockUserSchema = z.object({
  blockedUserId: z.string(),
  reason: z.string().optional(),
})

const reportMessageSchema = z.object({
  messageId: z.string(),
  reason: z.enum(['spam', 'harassment', 'inappropriate', 'other']),
  description: z.string().max(1000).optional(),
})

export async function createDirectConversation(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { otherUserId } = req.body

    if (!otherUserId) {
      return res.status(400).json({ success: false, error: 'otherUserId is required' })
    }

    const conversation = await chatService.createDirectConversation(userId, otherUserId)

    res.json({ success: true, data: conversation })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function createGroup(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = createGroupSchema.parse(req.body)

    const conversation = await chatService.createGroupConversation({
      ...data,
      createdBy: userId,
      participantIds: [...data.participantIds, userId],
    })

    res.json({ success: true, data: conversation })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function createStudyRoom(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = createStudyRoomSchema.parse(req.body)

    const studyRoom = await chatService.createStudyRoom({
      ...data,
      hostId: userId,
      scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : undefined,
    })

    res.json({ success: true, data: studyRoom })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function getConversations(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const conversations = await chatService.getUserConversations(userId)

    res.json({ success: true, data: conversations })
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message })
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { conversationId } = req.params
    const limit = parseInt(req.query.limit as string) || 50
    const before = req.query.before as string

    const messages = await chatService.getConversationMessages(
      conversationId,
      userId,
      limit,
      before
    )

    res.json({ success: true, data: messages })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function chatWithBot(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = chatBotSchema.parse(req.body)

    const botMessage = await chatService.chatWithBot(userId, data.botId, data.message)

    res.json({ success: true, data: botMessage })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function blockUser(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = blockUserSchema.parse(req.body)

    await chatService.blockUser(userId, data.blockedUserId, data.reason)

    res.json({ success: true, message: 'User blocked successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}

export async function reportMessage(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const data = reportMessageSchema.parse(req.body)

    await chatService.reportMessage(data.messageId, userId, data.reason, data.description)

    res.json({ success: true, message: 'Message reported successfully' })
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message })
  }
}
