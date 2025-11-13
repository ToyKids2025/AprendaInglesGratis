/**
 * LIVE CLASSES SERVICE
 * Real-time interactive learning sessions
 */

import { PrismaClient } from '@prisma/client'
import { Server as SocketIOServer } from 'socket.io'

const prisma = new PrismaClient()

// Store active live sessions
const activeClasses = new Map<string, Set<string>>() // classId -> Set<userId>
const userSockets = new Map<string, string>() // userId -> socketId

/**
 * LIVE CLASS MANAGEMENT
 */

/**
 * Create live class
 */
export async function createLiveClass(instructorId: string, data: {
  title: string
  description: string
  type: string
  scheduledAt: Date
  duration: number
  timezone?: string
  maxParticipants?: number
  isPublic?: boolean
  requiresEnrollment?: boolean
  price?: number
  isPremium?: boolean
  level?: string
  category?: string
  tags?: string[]
  language?: string
  allowChat?: boolean
  allowQuestions?: boolean
  enableRecording?: boolean
  enableWhiteboard?: boolean
  enableBreakoutRooms?: boolean
  slides?: any[]
  attachments?: any[]
  platform?: string
}) {
  const liveClass = await prisma.liveClass.create({
    data: {
      instructorId,
      title: data.title,
      description: data.description,
      type: data.type,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      timezone: data.timezone || 'UTC',
      maxParticipants: data.maxParticipants || 100,
      isPublic: data.isPublic !== false,
      requiresEnrollment: data.requiresEnrollment || false,
      price: data.price || 0,
      isPremium: data.isPremium || false,
      level: data.level,
      category: data.category,
      tags: data.tags || [],
      language: data.language || 'en-US',
      allowChat: data.allowChat !== false,
      allowQuestions: data.allowQuestions !== false,
      enableRecording: data.enableRecording !== false,
      enableWhiteboard: data.enableWhiteboard || false,
      enableBreakoutRooms: data.enableBreakoutRooms || false,
      slides: data.slides || [],
      attachments: data.attachments || [],
      platform: data.platform || 'internal',
    },
  })

  // Generate meeting ID
  const meetingId = generateMeetingId()
  const meetingPassword = generateMeetingPassword()

  await prisma.liveClass.update({
    where: { id: liveClass.id },
    data: {
      meetingId,
      meetingPassword,
      meetingUrl: `https://englishflow.com/live/${meetingId}`,
    },
  })

  return { ...liveClass, meetingId, meetingPassword }
}

/**
 * Get live class
 */
export async function getLiveClass(classId: string, userId?: string) {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
    include: {
      registrations: userId ? {
        where: { userId },
        take: 1,
      } : undefined,
    },
  })

  if (!liveClass) {
    throw new Error('Live class not found')
  }

  // Get current attendance if live
  let currentAttendees = 0
  if (liveClass.status === 'live') {
    currentAttendees = activeClasses.get(classId)?.size || 0
  }

  return {
    ...liveClass,
    currentAttendees,
    isRegistered: userId && liveClass.registrations ? liveClass.registrations.length > 0 : false,
  }
}

/**
 * Get upcoming live classes
 */
export async function getUpcomingClasses(filters?: {
  category?: string
  level?: string
  type?: string
  instructorId?: string
}) {
  const where: any = {
    scheduledAt: { gte: new Date() },
    status: 'scheduled',
    isPublic: true,
  }

  if (filters?.category) where.category = filters.category
  if (filters?.level) where.level = filters.level
  if (filters?.type) where.type = filters.type
  if (filters?.instructorId) where.instructorId = filters.instructorId

  return await prisma.liveClass.findMany({
    where,
    orderBy: { scheduledAt: 'asc' },
    take: 20,
  })
}

/**
 * Update live class
 */
export async function updateLiveClass(classId: string, updates: any) {
  return await prisma.liveClass.update({
    where: { id: classId },
    data: updates,
  })
}

/**
 * Cancel live class
 */
export async function cancelLiveClass(classId: string, reason?: string) {
  const liveClass = await prisma.liveClass.update({
    where: { id: classId },
    data: { status: 'cancelled' },
  })

  // Notify all registered users
  const registrations = await prisma.liveClassRegistration.findMany({
    where: { classId, status: 'registered' },
  })

  for (const reg of registrations) {
    // Send cancellation notification
    // await sendNotification(reg.userId, {
    //   title: 'Class Cancelled',
    //   body: `${liveClass.title} has been cancelled. ${reason || ''}`,
    // })

    // Update registration status
    await prisma.liveClassRegistration.update({
      where: { id: reg.id },
      data: { status: 'cancelled' },
    })
  }

  return liveClass
}

/**
 * Delete live class
 */
export async function deleteLiveClass(classId: string) {
  await prisma.liveClass.delete({
    where: { id: classId },
  })
  return { success: true }
}

/**
 * REGISTRATION
 */

/**
 * Register for live class
 */
export async function registerForClass(userId: string, classId: string, paymentId?: string) {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
  })

  if (!liveClass) {
    throw new Error('Live class not found')
  }

  if (liveClass.status === 'ended' || liveClass.status === 'cancelled') {
    throw new Error('Cannot register for ended or cancelled class')
  }

  // Check capacity
  const registeredCount = await prisma.liveClassRegistration.count({
    where: { classId, status: 'registered' },
  })

  if (registeredCount >= liveClass.maxParticipants) {
    throw new Error('Class is full')
  }

  // Check if requires payment
  if (liveClass.price > 0 && !paymentId) {
    throw new Error('Payment required')
  }

  const registration = await prisma.liveClassRegistration.create({
    data: {
      userId,
      classId,
      paymentId,
      paidAmount: liveClass.price,
    },
  })

  return registration
}

/**
 * Cancel registration
 */
export async function cancelRegistration(userId: string, classId: string) {
  const registration = await prisma.liveClassRegistration.findUnique({
    where: {
      userId_classId: { userId, classId },
    },
  })

  if (!registration) {
    throw new Error('Registration not found')
  }

  await prisma.liveClassRegistration.update({
    where: { id: registration.id },
    data: { status: 'cancelled' },
  })

  return { success: true }
}

/**
 * Get user's registrations
 */
export async function getUserRegistrations(userId: string) {
  return await prisma.liveClassRegistration.findMany({
    where: { userId },
    include: {
      class: true,
    },
    orderBy: { registeredAt: 'desc' },
  })
}

/**
 * CLASS SESSION MANAGEMENT
 */

/**
 * Start live class
 */
export async function startLiveClass(classId: string, instructorId: string) {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
  })

  if (!liveClass) {
    throw new Error('Live class not found')
  }

  if (liveClass.instructorId !== instructorId) {
    throw new Error('Only the instructor can start the class')
  }

  if (liveClass.status === 'live') {
    throw new Error('Class is already live')
  }

  const updatedClass = await prisma.liveClass.update({
    where: { id: classId },
    data: {
      status: 'live',
      startedAt: new Date(),
    },
  })

  // Initialize active class tracking
  activeClasses.set(classId, new Set())

  // Notify registered users
  await notifyClassStart(classId)

  return updatedClass
}

/**
 * End live class
 */
export async function endLiveClass(classId: string, instructorId: string) {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
  })

  if (!liveClass) {
    throw new Error('Live class not found')
  }

  if (liveClass.instructorId !== instructorId) {
    throw new Error('Only the instructor can end the class')
  }

  const updatedClass = await prisma.liveClass.update({
    where: { id: classId },
    data: {
      status: 'ended',
      endedAt: new Date(),
    },
  })

  // Clean up active tracking
  activeClasses.delete(classId)

  // Mark all attendances as ended
  await prisma.liveClassAttendance.updateMany({
    where: {
      classId,
      leftAt: null,
    },
    data: {
      leftAt: new Date(),
    },
  })

  return updatedClass
}

/**
 * Join live class
 */
export async function joinLiveClass(userId: string, classId: string, sessionId: string, device?: any) {
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: classId },
  })

  if (!liveClass) {
    throw new Error('Live class not found')
  }

  if (liveClass.status !== 'live') {
    throw new Error('Class is not live yet')
  }

  // Check if registered (if required)
  if (liveClass.requiresEnrollment) {
    const registration = await prisma.liveClassRegistration.findUnique({
      where: {
        userId_classId: { userId, classId },
      },
    })

    if (!registration) {
      throw new Error('Not registered for this class')
    }

    // Mark as attended
    await prisma.liveClassRegistration.update({
      where: { id: registration.id },
      data: {
        attended: true,
        attendedAt: new Date(),
      },
    })
  }

  // Create attendance record
  const attendance = await prisma.liveClassAttendance.create({
    data: {
      userId,
      classId,
      sessionId,
      joinedAt: new Date(),
      device: device?.type,
      browser: device?.browser,
      os: device?.os,
    },
  })

  // Add to active tracking
  if (!activeClasses.has(classId)) {
    activeClasses.set(classId, new Set())
  }
  activeClasses.get(classId)!.add(userId)

  // Update class stats
  const currentAttendees = activeClasses.get(classId)!.size
  await prisma.liveClass.update({
    where: { id: classId },
    data: {
      totalAttendees: { increment: 1 },
      peakAttendance: Math.max(liveClass.peakAttendance, currentAttendees),
      avgAttendance: Math.round((liveClass.avgAttendance + currentAttendees) / 2),
    },
  })

  return attendance
}

/**
 * Leave live class
 */
export async function leaveLiveClass(userId: string, classId: string, sessionId: string) {
  const attendance = await prisma.liveClassAttendance.findUnique({
    where: { sessionId },
  })

  if (!attendance) {
    return { success: true }
  }

  const duration = Math.floor((new Date().getTime() - attendance.joinedAt.getTime()) / 1000)

  await prisma.liveClassAttendance.update({
    where: { sessionId },
    data: {
      leftAt: new Date(),
      duration,
    },
  })

  // Remove from active tracking
  activeClasses.get(classId)?.delete(userId)

  return { success: true }
}

/**
 * CHAT & MESSAGING
 */

/**
 * Send message
 */
export async function sendMessage(
  classId: string,
  userId: string,
  userName: string,
  content: string,
  type: string = 'text',
  replyToId?: string
) {
  const message = await prisma.liveClassMessage.create({
    data: {
      classId,
      userId,
      userName,
      content,
      type,
      replyToId,
    },
  })

  // Update class stats
  await prisma.liveClass.update({
    where: { id: classId },
    data: { totalMessages: { increment: 1 } },
  })

  // Update attendance stats
  await prisma.liveClassAttendance.updateMany({
    where: {
      userId,
      classId,
      leftAt: null,
    },
    data: {
      messagesCount: { increment: 1 },
    },
  })

  return message
}

/**
 * Get messages
 */
export async function getMessages(classId: string, limit: number = 100, before?: string) {
  const where: any = {
    classId,
    isDeleted: false,
  }

  if (before) {
    where.timestamp = { lt: new Date(before) }
  }

  return await prisma.liveClassMessage.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    take: limit,
  })
}

/**
 * Delete message
 */
export async function deleteMessage(messageId: string, userId: string) {
  const message = await prisma.liveClassMessage.findUnique({
    where: { id: messageId },
  })

  if (!message) {
    throw new Error('Message not found')
  }

  // Check permission (instructor or own message)
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: message.classId },
  })

  if (message.userId !== userId && liveClass?.instructorId !== userId) {
    throw new Error('Permission denied')
  }

  await prisma.liveClassMessage.update({
    where: { id: messageId },
    data: { isDeleted: true },
  })

  return { success: true }
}

/**
 * Pin message
 */
export async function pinMessage(messageId: string, instructorId: string) {
  const message = await prisma.liveClassMessage.findUnique({
    where: { id: messageId },
  })

  if (!message) {
    throw new Error('Message not found')
  }

  // Verify instructor
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: message.classId },
  })

  if (liveClass?.instructorId !== instructorId) {
    throw new Error('Only instructor can pin messages')
  }

  return await prisma.liveClassMessage.update({
    where: { id: messageId },
    data: { isPinned: true },
  })
}

/**
 * Q&A MANAGEMENT
 */

/**
 * Ask question
 */
export async function askQuestion(
  classId: string,
  userId: string,
  userName: string,
  question: string
) {
  const q = await prisma.liveClassQuestion.create({
    data: {
      classId,
      userId,
      userName,
      question,
    },
  })

  // Update class stats
  await prisma.liveClass.update({
    where: { id: classId },
    data: { totalQuestions: { increment: 1 } },
  })

  return q
}

/**
 * Answer question
 */
export async function answerQuestion(
  questionId: string,
  instructorId: string,
  answer: string
) {
  const question = await prisma.liveClassQuestion.findUnique({
    where: { id: questionId },
  })

  if (!question) {
    throw new Error('Question not found')
  }

  // Verify instructor
  const liveClass = await prisma.liveClass.findUnique({
    where: { id: question.classId },
  })

  if (liveClass?.instructorId !== instructorId) {
    throw new Error('Only instructor can answer questions')
  }

  return await prisma.liveClassQuestion.update({
    where: { id: questionId },
    data: {
      status: 'answered',
      answer,
      answeredBy: instructorId,
      answeredAt: new Date(),
    },
  })
}

/**
 * Get questions
 */
export async function getQuestions(classId: string, status?: string) {
  const where: any = { classId }
  if (status) where.status = status

  return await prisma.liveClassQuestion.findMany({
    where,
    orderBy: [
      { upvotes: 'desc' },
      { createdAt: 'asc' },
    ],
  })
}

/**
 * Upvote question
 */
export async function upvoteQuestion(questionId: string) {
  return await prisma.liveClassQuestion.update({
    where: { id: questionId },
    data: { upvotes: { increment: 1 } },
  })
}

/**
 * POLLS
 */

/**
 * Create poll
 */
export async function createPoll(
  classId: string,
  question: string,
  options: string[],
  type: string = 'single',
  isAnonymous: boolean = false
) {
  const pollOptions = options.map((text, index) => ({
    id: `opt_${index}`,
    text,
    votes: 0,
  }))

  return await prisma.liveClassPoll.create({
    data: {
      classId,
      question,
      options: pollOptions,
      type,
      isAnonymous,
    },
  })
}

/**
 * Vote on poll
 */
export async function votePoll(pollId: string, userId: string, optionIds: string[]) {
  const poll = await prisma.liveClassPoll.findUnique({
    where: { id: pollId },
  })

  if (!poll) {
    throw new Error('Poll not found')
  }

  if (!poll.isActive) {
    throw new Error('Poll is closed')
  }

  // Check if already voted
  const existingVote = await prisma.pollVote.findUnique({
    where: {
      pollId_userId: { pollId, userId },
    },
  })

  if (existingVote) {
    throw new Error('Already voted')
  }

  // Create vote
  await prisma.pollVote.create({
    data: {
      pollId,
      userId,
      selectedOptions: optionIds,
    },
  })

  // Update poll results
  const results = poll.results as any
  optionIds.forEach((optionId) => {
    results[optionId] = (results[optionId] || 0) + 1
  })

  return await prisma.liveClassPoll.update({
    where: { id: pollId },
    data: {
      totalVotes: { increment: 1 },
      results,
    },
  })
}

/**
 * Close poll
 */
export async function closePoll(pollId: string) {
  return await prisma.liveClassPoll.update({
    where: { id: pollId },
    data: {
      isActive: false,
      closedAt: new Date(),
    },
  })
}

/**
 * BREAKOUT ROOMS
 */

/**
 * Create breakout rooms
 */
export async function createBreakoutRooms(
  classId: string,
  count: number,
  duration?: number
) {
  const rooms = []

  for (let i = 1; i <= count; i++) {
    const room = await prisma.breakoutRoom.create({
      data: {
        classId,
        name: `Room ${i}`,
        roomNumber: i,
        duration,
      },
    })
    rooms.push(room)
  }

  return rooms
}

/**
 * Assign to breakout room
 */
export async function assignToBreakoutRoom(roomId: string, userIds: string[]) {
  const room = await prisma.breakoutRoom.findUnique({
    where: { id: roomId },
  })

  if (!room) {
    throw new Error('Breakout room not found')
  }

  const updatedParticipants = [...room.participantIds, ...userIds]

  return await prisma.breakoutRoom.update({
    where: { id: roomId },
    data: {
      participantIds: updatedParticipants,
    },
  })
}

/**
 * Close breakout rooms
 */
export async function closeBreakoutRooms(classId: string) {
  await prisma.breakoutRoom.updateMany({
    where: { classId, isActive: true },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  })

  return { success: true }
}

/**
 * WHITEBOARD
 */

/**
 * Update whiteboard
 */
export async function updateWhiteboard(
  classId: string,
  pageNumber: number,
  elements: any[],
  userId: string
) {
  return await prisma.whiteboardData.upsert({
    where: {
      classId_pageNumber: { classId, pageNumber },
    },
    update: {
      elements,
      updatedBy: userId,
      updatedAt: new Date(),
    },
    create: {
      classId,
      pageNumber,
      elements,
      updatedBy: userId,
    },
  })
}

/**
 * Get whiteboard
 */
export async function getWhiteboard(classId: string, pageNumber: number = 1) {
  return await prisma.whiteboardData.findUnique({
    where: {
      classId_pageNumber: { classId, pageNumber },
    },
  })
}

/**
 * RECORDINGS
 */

/**
 * Save recording
 */
export async function saveRecording(classId: string, data: {
  title: string
  recordingUrl: string
  duration: number
  fileSize?: number
  isPublic?: boolean
}) {
  const liveClass = await prisma.liveClass.update({
    where: { id: classId },
    data: {
      recordingUrl: data.recordingUrl,
      recordingDuration: data.duration,
    },
  })

  const recording = await prisma.classRecording.create({
    data: {
      classId,
      title: data.title,
      recordingUrl: data.recordingUrl,
      duration: data.duration,
      fileSize: data.fileSize,
      isPublic: data.isPublic || false,
      status: 'ready',
      processedAt: new Date(),
    },
  })

  return recording
}

/**
 * REVIEWS
 */

/**
 * Create review
 */
export async function createReview(
  classId: string,
  userId: string,
  data: {
    rating: number
    comment?: string
    contentQuality?: number
    instructorRating?: number
    technicalQuality?: number
  }
) {
  return await prisma.liveClassReview.create({
    data: {
      classId,
      userId,
      rating: data.rating,
      comment: data.comment,
      contentQuality: data.contentQuality,
      instructorRating: data.instructorRating,
      technicalQuality: data.technicalQuality,
    },
  })
}

/**
 * HELPER FUNCTIONS
 */

function generateMeetingId(): string {
  return Math.random().toString(36).substring(2, 12).toUpperCase()
}

function generateMeetingPassword(): string {
  return Math.random().toString(36).substring(2, 10)
}

async function notifyClassStart(classId: string) {
  const registrations = await prisma.liveClassRegistration.findMany({
    where: { classId, status: 'registered' },
  })

  for (const reg of registrations) {
    // Send notification
    // await pushNotification(reg.userId, {
    //   title: 'Class Starting Now!',
    //   body: 'Click to join',
    //   actionUrl: `/live/${classId}`,
    // })
  }
}

export const liveClassService = {
  createLiveClass,
  getLiveClass,
  getUpcomingClasses,
  updateLiveClass,
  cancelLiveClass,
  deleteLiveClass,
  registerForClass,
  cancelRegistration,
  getUserRegistrations,
  startLiveClass,
  endLiveClass,
  joinLiveClass,
  leaveLiveClass,
  sendMessage,
  getMessages,
  deleteMessage,
  pinMessage,
  askQuestion,
  answerQuestion,
  getQuestions,
  upvoteQuestion,
  createPoll,
  votePoll,
  closePoll,
  createBreakoutRooms,
  assignToBreakoutRoom,
  closeBreakoutRooms,
  updateWhiteboard,
  getWhiteboard,
  saveRecording,
  createReview,
}
