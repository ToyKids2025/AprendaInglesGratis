/**
 * WRITING EXERCISES CONTROLLER
 * Request handlers for AI-powered writing practice
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as writingService from '../services/writing.service'

/**
 * VALIDATION SCHEMAS
 */

const createExerciseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  type: z.enum(['essay', 'email', 'paragraph', 'story', 'report', 'letter']),
  prompt: z.string().min(10),
  wordCountMin: z.number().min(1).optional(),
  wordCountMax: z.number().min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  category: z.enum(['business', 'academic', 'creative', 'general']),
  topic: z.string().optional(),
  gradingCriteria: z.object({
    grammar: z.number().min(0).max(100),
    vocabulary: z.number().min(0).max(100),
    coherence: z.number().min(0).max(100),
    style: z.number().min(0).max(100),
  }).optional(),
  sampleAnswer: z.string().optional(),
  tips: z.array(z.string()).optional(),
  vocabulary: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  difficulty: z.number().min(1).max(5).optional(),
  estimatedTime: z.number().optional(),
  tags: z.array(z.string()).optional(),
})

const submitWritingSchema = z.object({
  content: z.string().min(10),
  timeSpent: z.number().min(0).optional(),
})

const submitRevisionSchema = z.object({
  content: z.string().min(10),
  changesDescription: z.string().optional(),
})

const createChallengeSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(10),
  challengeType: z.enum(['daily', 'weekly', 'themed', 'timed']),
  topic: z.string().min(1),
  prompt: z.string().min(10),
  wordCountMin: z.number().min(1).optional(),
  wordCountMax: z.number().min(1).optional(),
  timeLimit: z.number().min(1).optional(),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  timezone: z.string().optional(),
  xpReward: z.number().min(0).optional(),
  badgeId: z.string().uuid().optional(),
})

/**
 * EXERCISE MANAGEMENT
 */

export async function createExercise(req: Request, res: Response) {
  try {
    const instructorId = req.user!.id
    const data = createExerciseSchema.parse(req.body)

    const exercise = await writingService.createExercise(instructorId, data)

    res.json({
      success: true,
      data: exercise,
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

export async function getExercise(req: Request, res: Response) {
  try {
    const { exerciseId } = req.params

    const exercise = await writingService.getExercise(exerciseId)

    if (!exercise) {
      return res.status(404).json({
        success: false,
        error: 'Exercise not found',
      })
    }

    res.json({
      success: true,
      data: exercise,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getExercises(req: Request, res: Response) {
  try {
    const filters = {
      level: req.query.level as string,
      category: req.query.category as string,
      type: req.query.type as string,
    }

    const exercises = await writingService.getExercises(filters)

    res.json({
      success: true,
      data: exercises,
      count: exercises.length,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * SUBMISSION & GRADING
 */

export async function submitWriting(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { exerciseId } = req.params
    const data = submitWritingSchema.parse(req.body)

    const submission = await writingService.submitWriting(userId, exerciseId, data)

    res.json({
      success: true,
      data: submission,
      message: 'Submission received! AI grading in progress...',
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

export async function getSubmission(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { submissionId } = req.params

    const submission = await writingService.getSubmission(submissionId, userId)

    res.json({
      success: true,
      data: submission,
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getUserSubmissions(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const filters = {
      exerciseId: req.query.exerciseId as string,
      status: req.query.status as string,
    }

    const submissions = await writingService.getUserSubmissions(userId, filters)

    res.json({
      success: true,
      data: submissions,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * REVISIONS
 */

export async function submitRevision(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { submissionId } = req.params
    const data = submitRevisionSchema.parse(req.body)

    const revision = await writingService.submitRevision(
      userId,
      submissionId,
      data.content,
      data.changesDescription
    )

    res.json({
      success: true,
      data: revision,
      message: 'Revision submitted! Re-grading in progress...',
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
 * ERROR TRACKING
 */

export async function getCommonErrors(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const errors = await writingService.getCommonErrors(userId)

    res.json({
      success: true,
      data: errors,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function markErrorAsLearned(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { errorId } = req.params

    const error = await writingService.markErrorAsLearned(userId, errorId)

    res.json({
      success: true,
      data: error,
      message: 'Error marked as learned',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * PROGRESS
 */

export async function getProgress(req: Request, res: Response) {
  try {
    const userId = req.user!.id

    const progress = await writingService.getProgress(userId)

    res.json({
      success: true,
      data: progress,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * CHALLENGES
 */

export async function createChallenge(req: Request, res: Response) {
  try {
    const data = createChallengeSchema.parse(req.body)

    const challenge = await writingService.createChallenge({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    })

    res.json({
      success: true,
      data: challenge,
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

export async function joinChallenge(req: Request, res: Response) {
  try {
    const userId = req.user!.id
    const { challengeId } = req.params

    const participant = await writingService.joinChallenge(userId, challengeId)

    res.json({
      success: true,
      data: participant,
      message: 'Successfully joined challenge',
    })
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getActiveChallenges(req: Request, res: Response) {
  try {
    const challenges = await writingService.getActiveChallenges()

    res.json({
      success: true,
      data: challenges,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * TEMPLATES & RESOURCES
 */

export async function getTemplates(req: Request, res: Response) {
  try {
    const type = req.query.type as string
    const level = req.query.level as string

    const templates = await writingService.getTemplates(type, level)

    res.json({
      success: true,
      data: templates,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export async function getTopics(req: Request, res: Response) {
  try {
    const filters = {
      category: req.query.category as string,
      level: req.query.level as string,
      type: req.query.type as string,
    }

    const topics = await writingService.getTopics(filters)

    res.json({
      success: true,
      data: topics,
    })
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}
