/**
 * ADMIN CONTROLLER
 * Admin-only endpoints for user management and analytics
 */

import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * GET /api/admin/users
 * Get all users with pagination and filters
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      isPremium,
      isAdmin,
    } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    // Build filters
    const where: any = {}

    if (search) {
      where.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    if (isPremium !== undefined) {
      where.isPremium = isPremium === 'true'
    }

    if (isAdmin !== undefined) {
      where.isAdmin = isAdmin === 'true'
    }

    // Get users and total count
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limitNum,
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          xp: true,
          level: true,
          streak: true,
          isPremium: true,
          premiumExpiresAt: true,
          isAdmin: true,
          createdAt: true,
          lastStudyDate: true,
          _count: {
            select: {
              progress: true,
              achievements: true,
              payments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ])

    return res.status(200).json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return res.status(500).json({ error: 'Erro ao buscar usuários' })
  }
}

/**
 * GET /api/admin/users/:id
 * Get single user details
 */
export async function getUserDetails(req: Request, res: Response) {
  try {
    const { id } = req.params

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        progress: {
          take: 10,
          orderBy: { lastReviewAt: 'desc' },
          include: {
            phrase: {
              select: {
                en: true,
                pt: true,
                category: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
        achievements: {
          include: {
            achievement: true,
          },
          orderBy: { unlockedAt: 'desc' },
        },
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user

    return res.status(200).json(userWithoutPassword)
  } catch (error) {
    console.error('Error fetching user details:', error)
    return res.status(500).json({ error: 'Erro ao buscar detalhes do usuário' })
  }
}

/**
 * PATCH /api/admin/users/:id
 * Update user (admin privileges, premium status, etc.)
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { isAdmin, isPremium, premiumExpiresAt, xp, level } = req.body

    const updateData: any = {}

    if (isAdmin !== undefined) updateData.isAdmin = isAdmin
    if (isPremium !== undefined) updateData.isPremium = isPremium
    if (premiumExpiresAt !== undefined)
      updateData.premiumExpiresAt = premiumExpiresAt
        ? new Date(premiumExpiresAt)
        : null
    if (xp !== undefined) updateData.xp = parseInt(xp)
    if (level !== undefined) updateData.level = parseInt(level)

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isPremium: true,
        premiumExpiresAt: true,
        xp: true,
        level: true,
      },
    })

    return res.status(200).json({
      message: 'Usuário atualizado com sucesso',
      user,
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return res.status(500).json({ error: 'Erro ao atualizar usuário' })
  }
}

/**
 * DELETE /api/admin/users/:id
 * Delete user (soft delete or hard delete)
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { hard = 'false' } = req.query

    if (hard === 'true') {
      // Hard delete (permanently remove)
      await prisma.user.delete({
        where: { id },
      })
    } else {
      // Soft delete (deactivate account - you'd need to add an 'active' field)
      // For now, we'll do hard delete
      await prisma.user.delete({
        where: { id },
      })
    }

    return res.status(200).json({
      message: 'Usuário removido com sucesso',
    })
  } catch (error) {
    console.error('Error deleting user:', error)
    return res.status(500).json({ error: 'Erro ao remover usuário' })
  }
}

/**
 * GET /api/admin/analytics
 * Get platform analytics and statistics
 */
export async function getAnalytics(req: Request, res: Response) {
  try {
    // Get date range (default: last 30 days)
    const { days = '30' } = req.query
    const daysNum = parseInt(days as string)
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysNum)

    // Run all queries in parallel
    const [
      totalUsers,
      premiumUsers,
      adminUsers,
      totalPayments,
      recentUsers,
      activeUsers,
      totalProgress,
      totalAchievements,
      newsletterSubscribers,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Premium users
      prisma.user.count({
        where: {
          isPremium: true,
          premiumExpiresAt: { gt: new Date() },
        },
      }),

      // Admin users
      prisma.user.count({
        where: { isAdmin: true },
      }),

      // Total payments
      prisma.payment.aggregate({
        _sum: { amount: true },
        _count: true,
        where: { status: 'completed' },
      }),

      // Recent users (last N days)
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),

      // Active users (studied in last 7 days)
      prisma.user.count({
        where: {
          lastStudyDate: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total progress entries
      prisma.userProgress.count(),

      // Total achievements unlocked
      prisma.userAchievement.count(),

      // Newsletter subscribers
      prisma.newsletterSubscriber.count({
        where: { active: true },
      }),
    ])

    // Get user growth by day (last 30 days)
    const userGrowth = await prisma.$queryRaw<
      Array<{ date: string; count: bigint }>
    >`
      SELECT DATE(created_at) as date, COUNT(*)::int as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Get revenue by month (last 12 months)
    const revenueByMonth = await prisma.$queryRaw<
      Array<{ month: string; revenue: number; count: bigint }>
    >`
      SELECT
        TO_CHAR(paid_at, 'YYYY-MM') as month,
        SUM(amount)::float as revenue,
        COUNT(*)::int as count
      FROM "Payment"
      WHERE status = 'completed'
        AND paid_at >= NOW() - INTERVAL '12 months'
      GROUP BY TO_CHAR(paid_at, 'YYYY-MM')
      ORDER BY month DESC
    `

    // Top users by XP
    const topUsers = await prisma.user.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        email: true,
        xp: true,
        level: true,
        streak: true,
        avatar: true,
      },
      orderBy: { xp: 'desc' },
    })

    return res.status(200).json({
      summary: {
        totalUsers,
        premiumUsers,
        adminUsers,
        freeUsers: totalUsers - premiumUsers,
        conversionRate:
          totalUsers > 0
            ? ((premiumUsers / totalUsers) * 100).toFixed(2)
            : '0.00',
        recentUsers,
        activeUsers,
        totalProgress,
        totalAchievements,
        newsletterSubscribers,
      },
      revenue: {
        total: totalPayments._sum.amount || 0,
        transactions: totalPayments._count,
        average:
          totalPayments._count > 0
            ? (Number(totalPayments._sum.amount) / totalPayments._count).toFixed(
                2
              )
            : '0.00',
        byMonth: revenueByMonth,
      },
      growth: {
        userGrowth: userGrowth.map((row) => ({
          date: row.date,
          count: Number(row.count),
        })),
      },
      leaderboard: {
        topUsers,
      },
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return res.status(500).json({ error: 'Erro ao buscar estatísticas' })
  }
}

/**
 * GET /api/admin/health
 * Admin health check
 */
export async function adminHealthCheck(req: Request, res: Response) {
  res.status(200).json({
    status: 'ok',
    service: 'admin',
    timestamp: new Date().toISOString(),
  })
}

/**
 * POST /api/admin/phrases/generate
 * Generate phrases using AI
 */
export async function generateAIPhrases(req: Request, res: Response) {
  try {
    const { category, level, difficulty, count, context } = req.body

    // Validation
    if (!category || !level || !difficulty || !count) {
      return res.status(400).json({
        error: 'Campos obrigatórios: category, level, difficulty, count',
      })
    }

    if (count > 50) {
      return res.status(400).json({
        error: 'Máximo de 50 frases por vez',
      })
    }

    // Import dynamically to avoid circular dependencies
    const {
      generatePhrases,
    } = require('../services/phraseGenerator.service')

    const phrases = await generatePhrases({
      category,
      level,
      difficulty: parseInt(difficulty),
      count: parseInt(count),
      context,
    })

    return res.status(200).json({
      message: `${phrases.length} frases geradas com sucesso`,
      phrases,
    })
  } catch (error: any) {
    console.error('Error generating phrases:', error)
    return res.status(500).json({
      error: 'Erro ao gerar frases',
      message: error.message,
    })
  }
}

/**
 * POST /api/admin/phrases/batch-create
 * Create multiple phrases in batch
 */
export async function batchCreatePhrases(req: Request, res: Response) {
  try {
    const { categoryId, phrases } = req.body

    if (!categoryId || !Array.isArray(phrases) || phrases.length === 0) {
      return res.status(400).json({
        error: 'categoryId e phrases array são obrigatórios',
      })
    }

    // Get next order number for this category
    const lastPhrase = await prisma.phrase.findFirst({
      where: { categoryId: parseInt(categoryId) },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const startOrder = (lastPhrase?.order || 0) + 1

    // Create phrases
    const created = await Promise.all(
      phrases.map((phrase: any, index: number) =>
        prisma.phrase.create({
          data: {
            categoryId: parseInt(categoryId),
            en: phrase.en,
            pt: phrase.pt,
            tip: phrase.tip || null,
            difficulty: phrase.difficulty || 1,
            order: startOrder + index,
          },
        })
      )
    )

    return res.status(201).json({
      message: `${created.length} frases criadas com sucesso`,
      phrases: created,
    })
  } catch (error) {
    console.error('Error batch creating phrases:', error)
    return res.status(500).json({ error: 'Erro ao criar frases' })
  }
}

/**
 * GET /api/admin/phrases
 * Get phrases with filters
 */
export async function getPhrases(req: Request, res: Response) {
  try {
    const { categoryId, difficulty, search, page = '1', limit = '50' } = req.query

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const skip = (pageNum - 1) * limitNum

    const where: any = {}

    if (categoryId) {
      where.categoryId = parseInt(categoryId as string)
    }

    if (difficulty) {
      where.difficulty = parseInt(difficulty as string)
    }

    if (search) {
      where.OR = [
        { en: { contains: search as string, mode: 'insensitive' } },
        { pt: { contains: search as string, mode: 'insensitive' } },
      ]
    }

    const [phrases, total] = await Promise.all([
      prisma.phrase.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          category: {
            select: {
              name: true,
              level: {
                select: {
                  name: true,
                  number: true,
                },
              },
            },
          },
        },
        orderBy: [{ categoryId: 'asc' }, { order: 'asc' }],
      }),
      prisma.phrase.count({ where }),
    ])

    return res.status(200).json({
      phrases,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    })
  } catch (error) {
    console.error('Error fetching phrases:', error)
    return res.status(500).json({ error: 'Erro ao buscar frases' })
  }
}

/**
 * PATCH /api/admin/phrases/:id
 * Update a phrase
 */
export async function updatePhrase(req: Request, res: Response) {
  try {
    const { id } = req.params
    const { en, pt, tip, difficulty, order } = req.body

    const updateData: any = {}

    if (en) updateData.en = en
    if (pt) updateData.pt = pt
    if (tip !== undefined) updateData.tip = tip
    if (difficulty) updateData.difficulty = parseInt(difficulty)
    if (order) updateData.order = parseInt(order)

    const phrase = await prisma.phrase.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        category: {
          select: { name: true },
        },
      },
    })

    return res.status(200).json({
      message: 'Frase atualizada com sucesso',
      phrase,
    })
  } catch (error) {
    console.error('Error updating phrase:', error)
    return res.status(500).json({ error: 'Erro ao atualizar frase' })
  }
}

/**
 * DELETE /api/admin/phrases/:id
 * Delete a phrase
 */
export async function deletePhrase(req: Request, res: Response) {
  try {
    const { id } = req.params

    await prisma.phrase.delete({
      where: { id: parseInt(id) },
    })

    return res.status(200).json({
      message: 'Frase removida com sucesso',
    })
  } catch (error) {
    console.error('Error deleting phrase:', error)
    return res.status(500).json({ error: 'Erro ao remover frase' })
  }
}

/**
 * GET /api/admin/categories
 * Get all categories with levels
 */
export async function getCategories(req: Request, res: Response) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        level: {
          select: {
            name: true,
            number: true,
          },
        },
        _count: {
          select: {
            phrases: true,
          },
        },
      },
      orderBy: [{ levelId: 'asc' }, { order: 'asc' }],
    })

    return res.status(200).json({ categories })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return res.status(500).json({ error: 'Erro ao buscar categorias' })
  }
}

export default {
  getUsers,
  getUserDetails,
  updateUser,
  deleteUser,
  getAnalytics,
  adminHealthCheck,
  generateAIPhrases,
  batchCreatePhrases,
  getPhrases,
  updatePhrase,
  deletePhrase,
  getCategories,
}
