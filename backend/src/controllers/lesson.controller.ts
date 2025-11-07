import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

export const getLevels = async (req: AuthRequest, res: Response) => {
  try {
    const levels = await prisma.level.findMany({
      orderBy: { number: 'asc' },
      include: {
        categories: {
          include: {
            _count: {
              select: { phrases: true },
            },
          },
        },
      },
    })

    res.json(levels)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar níveis' })
  }
}

export const getCategories = async (req: AuthRequest, res: Response) => {
  try {
    const { levelId } = req.query

    const where = levelId ? { levelId: Number(levelId) } : {}

    const categories = await prisma.category.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        level: true,
        _count: {
          select: { phrases: true },
        },
      },
    })

    // Get user progress for each category
    const categoriesWithProgress = await Promise.all(
      categories.map(async (category) => {
        const totalPhrases = category._count.phrases

        const completedPhrases = await prisma.userProgress.count({
          where: {
            userId: req.userId,
            phrase: {
              categoryId: category.id,
            },
            mastery: { gte: 3 },
          },
        })

        return {
          ...category,
          totalPhrases,
          completedPhrases,
        }
      })
    )

    res.json(categoriesWithProgress)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categorias' })
  }
}

export const getCategoryWithPhrases = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        level: true,
        phrases: {
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!category) {
      return res.status(404).json({ message: 'Categoria não encontrada' })
    }

    // Get user progress for each phrase
    const phrasesWithProgress = await Promise.all(
      category.phrases.map(async (phrase) => {
        const progress = await prisma.userProgress.findUnique({
          where: {
            userId_phraseId: {
              userId: req.userId!,
              phraseId: phrase.id,
            },
          },
        })

        return {
          ...phrase,
          progress: progress || null,
        }
      })
    )

    res.json({
      ...category,
      phrases: phrasesWithProgress,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar categoria' })
  }
}

export const updateProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { phraseId, correct } = req.body

    if (!phraseId || typeof correct !== 'boolean') {
      return res.status(400).json({ message: 'Dados inválidos' })
    }

    // Get or create progress
    let progress = await prisma.userProgress.findUnique({
      where: {
        userId_phraseId: {
          userId: req.userId!,
          phraseId,
        },
      },
    })

    if (!progress) {
      progress = await prisma.userProgress.create({
        data: {
          userId: req.userId!,
          phraseId,
          mastery: 0,
          timesReviewed: 0,
          correctAnswers: 0,
          wrongAnswers: 0,
        },
      })
    }

    // Update progress
    const updatedProgress = await prisma.userProgress.update({
      where: { id: progress.id },
      data: {
        timesReviewed: { increment: 1 },
        ...(correct
          ? {
              correctAnswers: { increment: 1 },
              mastery: { increment: progress.mastery < 5 ? 1 : 0 },
            }
          : {
              wrongAnswers: { increment: 1 },
              mastery: { decrement: progress.mastery > 0 ? 1 : 0 },
            }),
        lastReviewAt: new Date(),
        // Calculate next review based on spaced repetition
        nextReviewAt: correct
          ? new Date(Date.now() + getReviewInterval(progress.mastery + 1))
          : new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day if wrong
      },
    })

    // Award XP
    const xpGained = correct ? 10 : 5
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        xp: { increment: xpGained },
      },
    })

    res.json({
      progress: updatedProgress,
      xpGained,
    })
  } catch (error) {
    console.error('Error updating progress:', error)
    res.status(500).json({ message: 'Erro ao atualizar progresso' })
  }
}

// Spaced repetition intervals (in milliseconds)
function getReviewInterval(mastery: number): number {
  const intervals = {
    1: 1 * 24 * 60 * 60 * 1000, // 1 day
    2: 3 * 24 * 60 * 60 * 1000, // 3 days
    3: 7 * 24 * 60 * 60 * 1000, // 7 days
    4: 14 * 24 * 60 * 60 * 1000, // 14 days
    5: 30 * 24 * 60 * 60 * 1000, // 30 days
  }

  return intervals[mastery as keyof typeof intervals] || intervals[5]
}
