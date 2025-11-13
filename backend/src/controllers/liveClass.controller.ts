/**
 * LIVE CLASSES CONTROLLER
 * Request handlers for live class endpoints
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as liveClassService from '../services/liveClass.service'

/**
 * VALIDATION SCHEMAS
 */

const createLiveClassSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  type: z.enum(['class', 'webinar', 'workshop', 'group_session']),
  scheduledAt: z.string().datetime(),
  duration: z.number().min(15).max(480), // 15 min to 8 hours
  timezone: z.string().optional(),
  maxParticipants: z.number().min(1).max(1000).optional(),
  isPublic: z.boolean().optional(),
  requiresEnrollment: z.boolean().optional(),
  price: z.number().min(0).optional(),
  isPremium: z.boolean().optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  language: z.string().optional(),
  allowChat: z.boolean().optional(),
  allowQuestions: z.boolean().optional(),
  enableRecording: z.boolean().optional(),
  enableWhiteboard: z.boolean().optional(),
  enableBreakoutRooms: z.boolean().optional(),
  slides: z.array(z.any()).optional(),
  attachments: z.array(z.any()).optional(),
  platform: z.enum(['internal', 'zoom', 'google_meet']).optional(),
})

const sendMessageSchema = z.object({
  content: z.string().min(1).max(2000),
  type: z.enum(['text', 'emoji', 'file', 'system']).optional(),
  replyToId: z.string().uuid().optional(),
})

const askQuestionSchema = z.object({
  question: z.string().min(1).max(1000),
})

const answerQuestionSchema = z.object({
  answer: z.string().min(1).max(2000),
})

const createPollSchema = z.object({
  question: z.string().min(1).max(500),
  options: z.array(z.string()).min(2).max(10),
  type: z.enum(['single', 'multiple']).optional(),
  isAnonymous: z.boolean().optional(),
})

const votePollSchema = z.object({
  optionIds: z.array(z.string()).min(1),
})

const createBreakoutRoomsSchema = z.object({
  count: z.number().min(2).max(20),
  duration: z.number().min(5).max(60).optional(),
})

const assignBreakoutRoomSchema = z.object({
  userIds: z.array(z.string().uuid()).min(1),
})

const updateWhiteboardSchema = z.object({
  pageNumber: z.number().min(1).max(50),
  elements: z.array(z.any()),
})

const saveRecordingSchema = z.object({
  title: z.string().min(1).max(200),
  recordingUrl: z.string().url(),
  duration: z.number().min(1),
  fileSize: z.number().optional(),
  isPublic: z.boolean().optional(),
})

const createReviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
  contentQuality: z.number().min(1).max(5).optional(),
  instructorRating: z.number().min(1).max(5).optional(),
  technicalQuality: z.number().min(1).max(5).optional(),
})

/**
 * LIVE CLASS MANAGEMENT
 */

export async function createLiveClass(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const data = createLiveClassSchema.parse(req.body)

    const liveClass = await liveClassService.createLiveClass(instructorId, {
      ...data,
      scheduledAt: new Date(data.scheduledAt),
    })

    res.json({
      success: true,
      data: liveClass,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const userId = req.user?.id

    const liveClass = await liveClassService.getLiveClass(classId, userId)

    res.json({
      success: true,
      data: liveClass,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getUpcomingClasses(req: Request, res: Response) {
  try {
    const filters = {
      category: req.query.category as string,
      level: req.query.level as string,
      type: req.query.type as string,
      instructorId: req.query.instructorId as string,
    }

    const classes = await liveClassService.getUpcomingClasses(filters)

    res.json({
      success: true,
      data: classes,
      count: classes.length,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function updateLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const updates = createLiveClassSchema.partial().parse(req.body)

    const liveClass = await liveClassService.updateLiveClass(classId, updates)

    res.json({
      success: true,
      data: liveClass,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function cancelLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const { reason } = req.body

    const liveClass = await liveClassService.cancelLiveClass(classId, reason)

    res.json({
      success: true,
      data: liveClass,
      message: 'Class cancelled successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteLiveClass(req: Request, res: Response) {
  try {
    const { classId } = req.params

    await liveClassService.deleteLiveClass(classId)

    res.json({
      success: true,
      message: 'Class deleted successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * REGISTRATION
 */

export async function registerForClass(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const { paymentId } = req.body

    const registration = await liveClassService.registerForClass(
      userId,
      classId,
      paymentId
    )

    res.json({
      success: true,
      data: registration,
      message: 'Successfully registered for class',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function cancelRegistration(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params

    await liveClassService.cancelRegistration(userId, classId)

    res.json({
      success: true,
      message: 'Registration cancelled',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getUserRegistrations(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const registrations = await liveClassService.getUserRegistrations(userId)

    res.json({
      success: true,
      data: registrations,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * CLASS SESSION
 */

export async function startLiveClass(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const { classId } = req.params

    const liveClass = await liveClassService.startLiveClass(classId, instructorId)

    res.json({
      success: true,
      data: liveClass,
      message: 'Class started successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function endLiveClass(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const { classId } = req.params

    const liveClass = await liveClassService.endLiveClass(classId, instructorId)

    res.json({
      success: true,
      data: liveClass,
      message: 'Class ended successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function joinLiveClass(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`
    const device = req.body.device

    const attendance = await liveClassService.joinLiveClass(
      userId,
      classId,
      sessionId,
      device
    )

    res.json({
      success: true,
      data: attendance,
      message: 'Joined class successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function leaveLiveClass(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const { sessionId } = req.body

    await liveClassService.leaveLiveClass(userId, classId, sessionId)

    res.json({
      success: true,
      message: 'Left class successfully',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * CHAT & MESSAGING
 */

export async function sendMessage(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const data = sendMessageSchema.parse(req.body)

    // Get user name from request (should be in user object)
    const userName = req.user!.name || 'Anonymous'

    const message = await liveClassService.sendMessage(
      classId,
      userId,
      userName,
      data.content,
      data.type,
      data.replyToId
    )

    res.json({
      success: true,
      data: message,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getMessages(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const limit = parseInt(req.query.limit as string) || 100
    const before = req.query.before as string

    const messages = await liveClassService.getMessages(classId, limit, before)

    res.json({
      success: true,
      data: messages,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function deleteMessage(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { messageId } = req.params

    await liveClassService.deleteMessage(messageId, userId)

    res.json({
      success: true,
      message: 'Message deleted',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function pinMessage(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const { messageId } = req.params

    const message = await liveClassService.pinMessage(messageId, instructorId)

    res.json({
      success: true,
      data: message,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * Q&A
 */

export async function askQuestion(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const data = askQuestionSchema.parse(req.body)
    const userName = req.user!.name || 'Anonymous'

    const question = await liveClassService.askQuestion(
      classId,
      userId,
      userName,
      data.question
    )

    res.json({
      success: true,
      data: question,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function answerQuestion(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const { questionId } = req.params
    const data = answerQuestionSchema.parse(req.body)

    const question = await liveClassService.answerQuestion(
      questionId,
      instructorId,
      data.answer
    )

    res.json({
      success: true,
      data: question,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getQuestions(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const status = req.query.status as string

    const questions = await liveClassService.getQuestions(classId, status)

    res.json({
      success: true,
      data: questions,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function upvoteQuestion(req: Request, res: Response) {
  try {
    const { questionId } = req.params

    const question = await liveClassService.upvoteQuestion(questionId)

    res.json({
      success: true,
      data: question,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POLLS
 */

export async function createPoll(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const data = createPollSchema.parse(req.body)

    const poll = await liveClassService.createPoll(
      classId,
      data.question,
      data.options,
      data.type,
      data.isAnonymous
    )

    res.json({
      success: true,
      data: poll,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function votePoll(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { pollId } = req.params
    const data = votePollSchema.parse(req.body)

    const poll = await liveClassService.votePoll(pollId, userId, data.optionIds)

    res.json({
      success: true,
      data: poll,
      message: 'Vote recorded',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function closePoll(req: Request, res: Response) {
  try {
    const { pollId } = req.params

    const poll = await liveClassService.closePoll(pollId)

    res.json({
      success: true,
      data: poll,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * BREAKOUT ROOMS
 */

export async function createBreakoutRooms(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const data = createBreakoutRoomsSchema.parse(req.body)

    const rooms = await liveClassService.createBreakoutRooms(
      classId,
      data.count,
      data.duration
    )

    res.json({
      success: true,
      data: rooms,
      message: `${rooms.length} breakout rooms created`,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function assignToBreakoutRoom(req: Request, res: Response) {
  try {
    const { roomId } = req.params
    const data = assignBreakoutRoomSchema.parse(req.body)

    const room = await liveClassService.assignToBreakoutRoom(roomId, data.userIds)

    res.json({
      success: true,
      data: room,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function closeBreakoutRooms(req: Request, res: Response) {
  try {
    const { classId } = req.params

    await liveClassService.closeBreakoutRooms(classId)

    res.json({
      success: true,
      message: 'All breakout rooms closed',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * WHITEBOARD
 */

export async function updateWhiteboard(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const data = updateWhiteboardSchema.parse(req.body)

    const whiteboard = await liveClassService.updateWhiteboard(
      classId,
      data.pageNumber,
      data.elements,
      userId
    )

    res.json({
      success: true,
      data: whiteboard,
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getWhiteboard(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const pageNumber = parseInt(req.query.pageNumber as string) || 1

    const whiteboard = await liveClassService.getWhiteboard(classId, pageNumber)

    res.json({
      success: true,
      data: whiteboard,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * RECORDINGS
 */

export async function saveRecording(req: Request, res: Response) {
  try {
    const { classId } = req.params
    const data = saveRecordingSchema.parse(req.body)

    const recording = await liveClassService.saveRecording(classId, data)

    res.json({
      success: true,
      data: recording,
      message: 'Recording saved successfully',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * REVIEWS
 */

export async function createReview(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { classId } = req.params
    const data = createReviewSchema.parse(req.body)

    const review = await liveClassService.createReview(classId, userId, data)

    res.json({
      success: true,
      data: review,
      message: 'Thank you for your review!',
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors,
      })
    }

    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}
