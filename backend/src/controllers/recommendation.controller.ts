/**
 * RECOMMENDATION CONTROLLER
 * AI-powered content recommendations
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as recommendationService from '../services/recommendation.service'

// Validation schemas
const getRecommendationsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  algorithm: z
    .enum(['hybrid', 'collaborative', 'content_based', 'spaced_repetition'])
    .optional(),
})

const submitFeedbackSchema = z.object({
  phraseId: z.string().uuid(),
  rating: z.number().min(1).max(5).optional(),
  isRelevant: z.boolean().optional(),
  isTooEasy: z.boolean().optional(),
  isTooHard: z.boolean().optional(),
  isInteresting: z.boolean().optional(),
  comment: z.string().max(500).optional(),
})

const createLearningPathSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  duration: z.number().min(1), // Days
  phraseIds: z.array(z.string().uuid()).min(1),
  milestones: z.array(z.any()).optional(),
})

/**
 * GET /api/recommendations
 * Get personalized recommendations for user
 */
export async function getRecommendations(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { limit = 20, algorithm = 'hybrid' } = req.query

    const validatedData = getRecommendationsSchema.parse({
      limit: limit ? parseInt(limit as string) : 20,
      algorithm: algorithm as string,
    })

    const recommendations = await recommendationService.getRecommendedPhrases(
      userId,
      validatedData.limit,
      validatedData.algorithm
    )

    res.json({
      success: true,
      recommendations,
      count: recommendations.length,
    })
  } catch (error: any) {
    console.error('Failed to get recommendations:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/recommendations/feedback
 * Submit feedback on recommendation
 */
export async function submitFeedback(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = submitFeedbackSchema.parse(req.body)

    const feedback = await recommendationService.submitFeedback({
      userId,
      ...validatedData,
    })

    res.json({
      success: true,
      feedback,
    })
  } catch (error: any) {
    console.error('Failed to submit feedback:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/recommendations/analytics
 * Get recommendation analytics for user
 */
export async function getAnalytics(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const analytics = await recommendationService.getRecommendationAnalytics(userId)

    res.json({
      success: true,
      analytics,
    })
  } catch (error: any) {
    console.error('Failed to get analytics:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/recommendations/preferences/update
 * Update user preferences based on behavior
 */
export async function updatePreferences(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const preferences = await recommendationService.updateUserPreferences(userId)

    res.json({
      success: true,
      preferences,
    })
  } catch (error: any) {
    console.error('Failed to update preferences:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/recommendations/learning-paths
 * Create custom learning path
 */
export async function createLearningPath(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = createLearningPathSchema.parse(req.body)

    const path = await recommendationService.createLearningPath({
      ...validatedData,
      createdBy: userId,
    })

    res.json({
      success: true,
      path,
    })
  } catch (error: any) {
    console.error('Failed to create learning path:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/recommendations/learning-paths/:pathId/enroll
 * Enroll in learning path
 */
export async function enrollInPath(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { pathId } = req.params

    const enrollment = await recommendationService.enrollInPath(userId, pathId)

    res.json({
      success: true,
      enrollment,
    })
  } catch (error: any) {
    console.error('Failed to enroll in path:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/recommendations/learning-paths
 * Get user's learning paths
 */
export async function getUserPaths(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const paths = await recommendationService.getUserPaths(userId)

    res.json({
      success: true,
      paths,
    })
  } catch (error: any) {
    console.error('Failed to get user paths:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  getRecommendations,
  submitFeedback,
  getAnalytics,
  updatePreferences,
  createLearningPath,
  enrollInPath,
  getUserPaths,
}
