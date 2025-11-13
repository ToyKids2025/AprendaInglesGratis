/**
 * SOCIAL MEDIA INTEGRATION SERVICE
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function connectAccount(userId: string, provider: string, token: string) {
  return await prisma.socialAccount.create({
    data: { userId, provider, providerId: 'temp', accessToken: token }
  })
}

export async function shareAchievement(userId: string, achievementId: string, platforms: string[]) {
  const share = await prisma.socialShare.create({
    data: { userId, type: 'achievement', platforms, status: 'success' }
  })
  
  // Post to social platforms (integrate with APIs)
  for (const platform of platforms) {
    // await postToPlatform(platform, content)
  }
  
  return share
}

export async function getUserShares(userId: string) {
  return await prisma.socialShare.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
}
