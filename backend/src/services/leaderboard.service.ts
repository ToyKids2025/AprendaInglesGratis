export async function getGlobalLeaderboard(limit = 100) {
  return await prisma.user.findMany({
    orderBy: { totalXP: 'desc' },
    take: limit,
    select: { id: true, name: true, totalXP: true, level: true }
  })
}

export async function getFriendsLeaderboard(userId: string) {
  // Get user's friends and rank by XP
  return []
}
