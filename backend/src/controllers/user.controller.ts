import { Response } from 'express'
import { AuthRequest } from '../middleware/auth'
import prisma from '../lib/prisma'

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        xp: true,
        level: true,
        streak: true,
        isPremium: true,
        createdAt: true,
      },
    })

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    res.json(user)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar perfil' })
  }
}

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, avatar } = req.body

    const updatedUser = await prisma.user.update({
      where: { id: req.userId },
      data: {
        ...(name && { name }),
        ...(avatar && { avatar }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        xp: true,
        level: true,
        streak: true,
        isPremium: true,
      },
    })

    res.json(updatedUser)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar perfil' })
  }
}

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        xp: true,
        level: true,
        streak: true,
      },
    })

    const progressCount = await prisma.userProgress.count({
      where: { userId: req.userId },
    })

    const completedPhrases = await prisma.userProgress.count({
      where: {
        userId: req.userId,
        mastery: { gte: 3 },
      },
    })

    const achievementsCount = await prisma.userAchievement.count({
      where: { userId: req.userId },
    })

    res.json({
      xp: user?.xp || 0,
      level: user?.level || 1,
      streak: user?.streak || 0,
      phrasesStarted: progressCount,
      phrasesCompleted: completedPhrases,
      achievements: achievementsCount,
    })
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas' })
  }
}

export const getAchievements = async (req: AuthRequest, res: Response) => {
  try {
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: req.userId },
      include: {
        achievement: true,
      },
      orderBy: {
        unlockedAt: 'desc',
      },
    })

    const allAchievements = await prisma.achievement.findMany()

    const achievementsWithStatus = allAchievements.map((achievement) => {
      const unlocked = userAchievements.find(
        (ua) => ua.achievementId === achievement.id
      )

      return {
        ...achievement,
        unlocked: !!unlocked,
        unlockedAt: unlocked?.unlockedAt || null,
      }
    })

    res.json(achievementsWithStatus)
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar conquistas' })
  }
}
