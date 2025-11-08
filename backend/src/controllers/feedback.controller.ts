/**
 * FEEDBACK CONTROLLER
 * Handle user feedback, bug reports, and surveys
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { sendEmail, EmailType } from '../services/email.service'

// Validation schemas
const createFeedbackSchema = z.object({
  type: z.enum(['bug', 'feature', 'improvement', 'general']),
  category: z.enum(['ui', 'performance', 'content', 'audio', 'other']).optional(),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  rating: z.number().int().min(1).max(5).optional(),
  browser: z.string().optional(),
  device: z.string().optional(),
  os: z.string().optional(),
})

const submitSurveySchema = z.object({
  surveyType: z.enum(['onboarding', 'weekly', 'cancellation', 'nps']),
  responses: z.record(z.any()),
  npsScore: z.number().int().min(0).max(10).optional(),
})

/**
 * POST /api/feedback
 * Submit user feedback
 */
export async function submitFeedback(req: Request, res: Response) {
  try {
    const userId = (req as any).userId // Optional - can be anonymous

    const validatedData = createFeedbackSchema.parse(req.body)

    // Create feedback
    const feedback = await prisma.feedback.create({
      data: {
        ...validatedData,
        userId: userId || null,
        version: process.env.APP_VERSION || '1.0.0',
      },
    })

    // Send notification email to admin
    if (validatedData.type === 'bug' || validatedData.rating && validatedData.rating <= 2) {
      await sendEmail(
        process.env.ADMIN_EMAIL || 'admin@englishflow.com',
        EmailType.ADMIN_NOTIFICATION,
        {
          subject: `New ${validatedData.type}: ${validatedData.title}`,
          message: `
Type: ${validatedData.type}
Title: ${validatedData.title}
Description: ${validatedData.description}
Rating: ${validatedData.rating || 'N/A'}
Category: ${validatedData.category || 'N/A'}

View in admin panel: ${process.env.FRONTEND_URL}/admin/feedback/${feedback.id}
          `,
        }
      )
    }

    return res.status(201).json({
      success: true,
      message: 'Feedback enviado com sucesso! Obrigado pela contribuição.',
      feedbackId: feedback.id,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      })
    }

    console.error('Submit feedback error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar feedback',
    })
  }
}

/**
 * GET /api/feedback/my
 * Get user's feedback history
 */
export async function getMyFeedback(req: Request, res: Response) {
  try {
    const userId = (req as any).userId

    const feedback = await prisma.feedback.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        rating: true,
        createdAt: true,
        resolvedAt: true,
      },
    })

    return res.json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error('Get my feedback error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar feedback',
    })
  }
}

/**
 * POST /api/feedback/survey
 * Submit survey response
 */
export async function submitSurvey(req: Request, res: Response) {
  try {
    const userId = (req as any).userId

    const validatedData = submitSurveySchema.parse(req.body)

    // Check if user already submitted this survey type recently
    const existingSurvey = await prisma.survey.findFirst({
      where: {
        userId,
        surveyType: validatedData.surveyType,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    })

    if (existingSurvey) {
      return res.status(400).json({
        success: false,
        error: 'Você já respondeu esta pesquisa recentemente',
      })
    }

    // Create survey response
    const survey = await prisma.survey.create({
      data: {
        userId,
        surveyType: validatedData.surveyType,
        responses: validatedData.responses,
        npsScore: validatedData.npsScore,
      },
    })

    // Send thank you and maybe reward XP
    if (validatedData.surveyType === 'nps' || validatedData.surveyType === 'weekly') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          xp: { increment: 50 }, // Reward for feedback
        },
      })
    }

    return res.status(201).json({
      success: true,
      message: 'Pesquisa enviada com sucesso! Você ganhou 50 XP.',
      surveyId: survey.id,
      xpEarned: 50,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: error.errors,
      })
    }

    console.error('Submit survey error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar pesquisa',
    })
  }
}

/**
 * GET /api/admin/feedback
 * Get all feedback (admin only)
 */
export async function getAllFeedback(req: Request, res: Response) {
  try {
    const { type, status, priority, page = 1, limit = 20 } = req.query

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string)

    const where: any = {}
    if (type) where.type = type
    if (status) where.status = status
    if (priority) where.priority = priority

    const [feedback, total] = await Promise.all([
      prisma.feedback.findMany({
        where,
        skip,
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              isPremium: true,
            },
          },
        },
      }),
      prisma.feedback.count({ where }),
    ])

    return res.json({
      success: true,
      feedback,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    })
  } catch (error) {
    console.error('Get all feedback error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar feedback',
    })
  }
}

/**
 * PATCH /api/admin/feedback/:id
 * Update feedback status (admin only)
 */
export async function updateFeedbackStatus(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { status, priority, adminNotes } = req.body
    const adminId = (req as any).userId

    const feedback = await prisma.feedback.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(adminNotes && { adminNotes }),
        ...(status === 'completed' && {
          resolvedAt: new Date(),
          resolvedBy: adminId,
        }),
      },
    })

    // Notify user if their feedback was addressed
    if (status === 'completed' && feedback.userId) {
      const user = await prisma.user.findUnique({
        where: { id: feedback.userId },
        select: { email: true },
      })

      if (user?.email) {
        await sendEmail(user.email, EmailType.GENERAL, {
          subject: 'Seu feedback foi implementado!',
          message: `
Olá!

Seu feedback "${feedback.title}" foi implementado! 🎉

Obrigado por ajudar a melhorar o English Flow.

Resposta do time: ${adminNotes || 'Implementado com sucesso!'}
          `,
        })
      }
    }

    return res.json({
      success: true,
      feedback,
    })
  } catch (error) {
    console.error('Update feedback status error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar feedback',
    })
  }
}

/**
 * GET /api/admin/feedback/stats
 * Get feedback statistics (admin only)
 */
export async function getFeedbackStats(req: Request, res: Response) {
  try {
    const [
      totalFeedback,
      byType,
      byStatus,
      avgRating,
      recentFeedback,
    ] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.groupBy({
        by: ['type'],
        _count: true,
      }),
      prisma.feedback.groupBy({
        by: ['status'],
        _count: true,
      }),
      prisma.feedback.aggregate({
        _avg: { rating: true },
        where: { rating: { not: null } },
      }),
      prisma.feedback.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    return res.json({
      success: true,
      stats: {
        total: totalFeedback,
        recent: recentFeedback,
        averageRating: avgRating._avg.rating || 0,
        byType: byType.reduce((acc, item) => {
          acc[item.type] = item._count
          return acc
        }, {} as Record<string, number>),
        byStatus: byStatus.reduce((acc, item) => {
          acc[item.status] = item._count
          return acc
        }, {} as Record<string, number>),
      },
    })
  } catch (error) {
    console.error('Get feedback stats error:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
    })
  }
}

export default {
  submitFeedback,
  getMyFeedback,
  submitSurvey,
  getAllFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
}
