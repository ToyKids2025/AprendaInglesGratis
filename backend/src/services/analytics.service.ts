/**
 * ANALYTICS SERVICE
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getUserAnalytics(userId: string) {
  let analytics = await prisma.userAnalytics.findUnique({ where: { userId } })
  
  if (!analytics) {
    analytics = await prisma.userAnalytics.create({ data: { userId } })
  }
  
  return analytics
}

export async function updateUserAnalytics(userId: string, data: any) {
  return await prisma.userAnalytics.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data }
  })
}

export async function getPlatformMetrics(date: Date) {
  return await prisma.platformMetrics.findUnique({ where: { date } })
}

export async function getDashboardStats() {
  const today = new Date()
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  const [totalUsers, activeUsers, premiumUsers] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { lastActiveAt: { gte: thirtyDaysAgo } } }),
    prisma.user.count({ where: { isPremium: true } })
  ])
  
  return {
    totalUsers,
    activeUsers,
    premiumUsers,
    conversionRate: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0
  }
}
