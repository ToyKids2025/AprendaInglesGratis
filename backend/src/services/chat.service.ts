/**
 * CHAT SERVICE
 * Real-time messaging with Socket.IO
 */

import { PrismaClient } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'
import OpenAI from 'openai'

const prisma = new PrismaClient()
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Store active socket connections
const userSockets = new Map<string, string[]>() // userId -> socketIds[]

/**
 * Initialize Socket.IO
 */
export function initializeSocket(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    const userId = socket.handshake.auth.userId

    if (!userId) {
      socket.disconnect()
      return
    }

    // Store socket connection
    const sockets = userSockets.get(userId) || []
    sockets.push(socket.id)
    userSockets.set(userId, sockets)

    // Join user's conversations
    joinUserConversations(socket, userId)

    // Socket event handlers
    socket.on('send_message', (data) => handleSendMessage(io, socket, userId, data))
    socket.on('typing_start', (data) => handleTypingStart(io, socket, userId, data))
    socket.on('typing_stop', (data) => handleTypingStop(io, socket, userId, data))
    socket.on('mark_read', (data) => handleMarkRead(io, socket, userId, data))
    socket.on('react_message', (data) => handleReactMessage(io, socket, userId, data))
    socket.on('delete_message', (data) => handleDeleteMessage(io, socket, userId, data))
    socket.on('edit_message', (data) => handleEditMessage(io, socket, userId, data))

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
      removeSocket(userId, socket.id)
    })
  })
}

/**
 * Join all user's conversations
 */
async function joinUserConversations(socket: any, userId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId, isActive: true },
    select: { conversationId: true },
  })

  participants.forEach((p) => {
    socket.join(`conversation:${p.conversationId}`)
  })
}

/**
 * Handle send message
 */
async function handleSendMessage(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: {
    conversationId: string
    content: string
    type?: string
    replyToId?: string
    attachments?: any[]
  }
) {
  try {
    // Create message
    const message = await prisma.message.create({
      data: {
        conversationId: data.conversationId,
        senderId: userId,
        content: data.content,
        type: data.type || 'text',
        replyToId: data.replyToId,
        attachments: data.attachments,
      },
    })

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
        lastMessageText: data.content.substring(0, 100),
      },
    })

    // Update unread counts for other participants
    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId: data.conversationId,
        userId: { not: userId },
        isActive: true,
      },
      data: {
        unreadCount: { increment: 1 },
      },
    })

    // Broadcast to conversation room
    io.to(`conversation:${data.conversationId}`).emit('new_message', {
      message: {
        ...message,
        sender: await getUserInfo(userId),
      },
    })

    // Send push notifications to offline users
    await sendMessageNotifications(data.conversationId, userId, message)
  } catch (error) {
    socket.emit('error', { message: 'Failed to send message' })
  }
}

/**
 * Handle typing start
 */
async function handleTypingStart(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { conversationId: string }
) {
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: data.conversationId,
      userId,
    },
    data: {
      isTyping: true,
      typingAt: new Date(),
    },
  })

  // Broadcast to others in conversation
  socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
    conversationId: data.conversationId,
    userId,
    isTyping: true,
  })
}

/**
 * Handle typing stop
 */
async function handleTypingStop(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { conversationId: string }
) {
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: data.conversationId,
      userId,
    },
    data: {
      isTyping: false,
    },
  })

  socket.to(`conversation:${data.conversationId}`).emit('user_typing', {
    conversationId: data.conversationId,
    userId,
    isTyping: false,
  })
}

/**
 * Handle mark as read
 */
async function handleMarkRead(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { conversationId: string; messageId: string }
) {
  await prisma.conversationParticipant.updateMany({
    where: {
      conversationId: data.conversationId,
      userId,
    },
    data: {
      lastReadMessageId: data.messageId,
      lastReadAt: new Date(),
      unreadCount: 0,
    },
  })

  // Notify sender that message was read
  const message = await prisma.message.findUnique({
    where: { id: data.messageId },
  })

  if (message) {
    io.to(`conversation:${data.conversationId}`).emit('message_read', {
      messageId: data.messageId,
      userId,
    })
  }
}

/**
 * Handle react to message
 */
async function handleReactMessage(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { messageId: string; emoji: string; conversationId: string }
) {
  const message = await prisma.message.findUnique({
    where: { id: data.messageId },
  })

  if (!message) return

  const reactions = (message.reactions as any) || {}
  const emojiReactions = reactions[data.emoji] || []

  if (emojiReactions.includes(userId)) {
    // Remove reaction
    reactions[data.emoji] = emojiReactions.filter((id: string) => id !== userId)
  } else {
    // Add reaction
    reactions[data.emoji] = [...emojiReactions, userId]
  }

  await prisma.message.update({
    where: { id: data.messageId },
    data: { reactions },
  })

  io.to(`conversation:${data.conversationId}`).emit('message_reaction', {
    messageId: data.messageId,
    emoji: data.emoji,
    userId,
    reactions,
  })
}

/**
 * Handle delete message
 */
async function handleDeleteMessage(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { messageId: string; conversationId: string }
) {
  const message = await prisma.message.findUnique({
    where: { id: data.messageId },
  })

  if (!message || message.senderId !== userId) {
    socket.emit('error', { message: 'Cannot delete this message' })
    return
  }

  await prisma.message.update({
    where: { id: data.messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      content: '[Deleted]',
    },
  })

  io.to(`conversation:${data.conversationId}`).emit('message_deleted', {
    messageId: data.messageId,
  })
}

/**
 * Handle edit message
 */
async function handleEditMessage(
  io: SocketIOServer,
  socket: any,
  userId: string,
  data: { messageId: string; conversationId: string; content: string }
) {
  const message = await prisma.message.findUnique({
    where: { id: data.messageId },
  })

  if (!message || message.senderId !== userId) {
    socket.emit('error', { message: 'Cannot edit this message' })
    return
  }

  await prisma.message.update({
    where: { id: data.messageId },
    data: {
      content: data.content,
      isEdited: true,
      editedAt: new Date(),
    },
  })

  io.to(`conversation:${data.conversationId}`).emit('message_edited', {
    messageId: data.messageId,
    content: data.content,
  })
}

/**
 * Create direct conversation
 */
export async function createDirectConversation(userId1: string, userId2: string) {
  // Check if conversation already exists
  const existing = await prisma.conversation.findFirst({
    where: {
      type: 'direct',
      AND: [
        { participantIds: { array_contains: userId1 } },
        { participantIds: { array_contains: userId2 } },
      ],
    },
  })

  if (existing) {
    return existing
  }

  // Create new conversation
  const conversation = await prisma.conversation.create({
    data: {
      type: 'direct',
      participantIds: [userId1, userId2],
      participants: {
        create: [
          { userId: userId1 },
          { userId: userId2 },
        ],
      },
    },
    include: {
      participants: true,
    },
  })

  return conversation
}

/**
 * Create group conversation
 */
export async function createGroupConversation(data: {
  name: string
  description?: string
  imageUrl?: string
  createdBy: string
  participantIds: string[]
}) {
  const conversation = await prisma.conversation.create({
    data: {
      type: 'group',
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl,
      createdBy: data.createdBy,
      participantIds: data.participantIds,
      participants: {
        create: data.participantIds.map((userId) => ({
          userId,
          role: userId === data.createdBy ? 'admin' : 'member',
        })),
      },
    },
    include: {
      participants: true,
    },
  })

  return conversation
}

/**
 * Create study room
 */
export async function createStudyRoom(data: {
  name: string
  description?: string
  topic?: string
  maxParticipants?: number
  isPublic?: boolean
  password?: string
  hostId: string
  scheduledFor?: Date
}) {
  // Create conversation for study room
  const conversation = await prisma.conversation.create({
    data: {
      type: 'study_room',
      name: data.name,
      participantIds: [data.hostId],
      participants: {
        create: {
          userId: data.hostId,
          role: 'admin',
        },
      },
    },
  })

  // Create study room
  const studyRoom = await prisma.studyRoom.create({
    data: {
      name: data.name,
      description: data.description,
      topic: data.topic,
      maxParticipants: data.maxParticipants || 50,
      isPublic: data.isPublic !== false,
      password: data.password,
      hostId: data.hostId,
      scheduledFor: data.scheduledFor,
      conversationId: conversation.id,
      status: data.scheduledFor ? 'scheduled' : 'active',
    },
  })

  return studyRoom
}

/**
 * Get user's conversations
 */
export async function getUserConversations(userId: string) {
  const participants = await prisma.conversationParticipant.findMany({
    where: { userId, isActive: true },
    include: {
      conversation: {
        include: {
          participants: true,
        },
      },
    },
    orderBy: {
      conversation: {
        lastMessageAt: 'desc',
      },
    },
  })

  return participants.map((p) => ({
    ...p.conversation,
    unreadCount: p.unreadCount,
    lastReadAt: p.lastReadAt,
  }))
}

/**
 * Get conversation messages
 */
export async function getConversationMessages(
  conversationId: string,
  userId: string,
  limit: number = 50,
  before?: string
) {
  // Verify user is participant
  const participant = await prisma.conversationParticipant.findFirst({
    where: { conversationId, userId, isActive: true },
  })

  if (!participant) {
    throw new Error('Not a participant of this conversation')
  }

  const messages = await prisma.message.findMany({
    where: {
      conversationId,
      isDeleted: false,
      ...(before && { createdAt: { lt: new Date(before) } }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return messages.reverse()
}

/**
 * Chat with AI bot
 */
export async function chatWithBot(
  userId: string,
  botId: string,
  message: string
) {
  // Get or create bot session
  let session = await prisma.userChatBotSession.findFirst({
    where: { userId, botId, isActive: true },
    include: { bot: true },
  })

  if (!session) {
    const bot = await prisma.chatBot.findUnique({ where: { id: botId } })
    if (!bot) throw new Error('Bot not found')

    // Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        type: 'direct',
        participantIds: [userId],
        participants: {
          create: { userId },
        },
      },
    })

    session = await prisma.userChatBotSession.create({
      data: {
        userId,
        botId,
        conversationId: conversation.id,
      },
      include: { bot: true },
    })
  }

  // Save user message
  await prisma.message.create({
    data: {
      conversationId: session.conversationId,
      senderId: userId,
      content: message,
    },
  })

  // Get conversation history
  const history = await prisma.message.findMany({
    where: { conversationId: session.conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  // Call OpenAI
  const response = await openai.chat.completions.create({
    model: session.bot.model,
    messages: [
      { role: 'system', content: session.bot.systemPrompt },
      ...history.map((m) => ({
        role: m.senderId === userId ? 'user' as const : 'assistant' as const,
        content: m.content,
      })),
    ],
    temperature: session.bot.temperature,
    max_tokens: session.bot.maxTokens,
  })

  const botReply = response.choices[0].message.content || 'Sorry, I could not generate a response.'

  // Save bot message
  const botMessage = await prisma.message.create({
    data: {
      conversationId: session.conversationId,
      senderId: botId, // Use botId as sender
      content: botReply,
    },
  })

  // Update session
  await prisma.userChatBotSession.update({
    where: { id: session.id },
    data: {
      messagesCount: { increment: 1 },
      lastMessageAt: new Date(),
    },
  })

  return botMessage
}

/**
 * Block user
 */
export async function blockUser(userId: string, blockedUserId: string, reason?: string) {
  return await prisma.blockedUser.create({
    data: {
      userId,
      blockedUserId,
      reason,
    },
  })
}

/**
 * Report message
 */
export async function reportMessage(
  messageId: string,
  reporterId: string,
  reason: string,
  description?: string
) {
  return await prisma.reportedMessage.create({
    data: {
      messageId,
      reporterId,
      reason,
      description,
    },
  })
}

/**
 * Helper functions
 */
function removeSocket(userId: string, socketId: string) {
  const sockets = userSockets.get(userId) || []
  const updated = sockets.filter((id) => id !== socketId)

  if (updated.length === 0) {
    userSockets.delete(userId)
  } else {
    userSockets.set(userId, updated)
  }
}

async function getUserInfo(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarUrl: true },
  })
  return user
}

async function sendMessageNotifications(
  conversationId: string,
  senderId: string,
  message: any
) {
  // Get offline participants
  const participants = await prisma.conversationParticipant.findMany({
    where: {
      conversationId,
      userId: { not: senderId },
      isActive: true,
      notificationsEnabled: true,
    },
  })

  const sender = await getUserInfo(senderId)

  for (const participant of participants) {
    // Check if user is online
    const isOnline = userSockets.has(participant.userId)

    if (!isOnline) {
      // Send push notification
      // await pushNotificationService.sendToUser(participant.userId, {
      //   title: sender?.name || 'New message',
      //   body: message.content.substring(0, 100),
      //   actionUrl: `/chat/${conversationId}`,
      // })
    }
  }
}

export const chatService = {
  initializeSocket,
  createDirectConversation,
  createGroupConversation,
  createStudyRoom,
  getUserConversations,
  getConversationMessages,
  chatWithBot,
  blockUser,
  reportMessage,
}
