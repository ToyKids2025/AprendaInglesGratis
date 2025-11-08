/**
 * SOCIAL SERVICE
 * User profiles, friends, and social interactions
 */

import { PrismaClient } from '@prisma/client'
import { sendEmail, EmailType } from './email.service'

const prisma = new PrismaClient()

/**
 * Get or create user profile
 */
export async function getUserProfile(userId: string) {
  let profile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          xp: true,
          level: true,
          streak: true,
          createdAt: true,
        },
      },
    },
  })

  // Create profile if it doesn't exist
  if (!profile) {
    profile = await prisma.userProfile.create({
      data: {
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            xp: true,
            level: true,
            streak: true,
            createdAt: true,
          },
        },
      },
    })
  }

  return profile
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: {
    bio?: string
    location?: string
    language?: string
    timezone?: string
    learningGoal?: string
    targetLevel?: string
    studyTime?: number
    isPublic?: boolean
    showStreak?: boolean
    showXP?: boolean
    showProgress?: boolean
  }
) {
  return await prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data,
    },
  })
}

/**
 * Send friend request
 */
export async function sendFriendRequest(userId: string, friendId: string) {
  // Check if already friends or pending
  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  })

  if (existing) {
    if (existing.status === 'accepted') {
      throw new Error('Already friends')
    }
    if (existing.status === 'pending') {
      throw new Error('Friend request already sent')
    }
  }

  // Create friendship records (both directions)
  const [friendship] = await Promise.all([
    prisma.friendship.create({
      data: {
        userId,
        friendId,
        requestedBy: userId,
        status: 'pending',
      },
      include: {
        friend: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.friendship.create({
      data: {
        userId: friendId,
        friendId: userId,
        requestedBy: userId,
        status: 'pending',
      },
    }),
  ])

  // Send email notification
  if (friendship.friend.email) {
    const senderUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    await sendEmail(
      friendship.friend.email,
      EmailType.FRIEND_REQUEST,
      {
        friendName: senderUser?.name || 'Someone',
      }
    )
  }

  return friendship
}

/**
 * Accept friend request
 */
export async function acceptFriendRequest(userId: string, friendId: string) {
  // Update both friendship records
  await prisma.friendship.updateMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
    data: {
      status: 'accepted',
      acceptedAt: new Date(),
    },
  })

  // Create activity feed entry
  await prisma.activityFeed.create({
    data: {
      userId,
      type: 'friend_joined',
      title: 'New Friend',
      description: 'You are now friends!',
      relatedUserId: friendId,
      isPublic: true,
    },
  })

  return { success: true }
}

/**
 * Reject friend request
 */
export async function rejectFriendRequest(userId: string, friendId: string) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  })

  return { success: true }
}

/**
 * Remove friend
 */
export async function removeFriend(userId: string, friendId: string) {
  await prisma.friendship.deleteMany({
    where: {
      OR: [
        { userId, friendId },
        { userId: friendId, friendId: userId },
      ],
    },
  })

  return { success: true }
}

/**
 * Get user's friends
 */
export async function getFriends(userId: string, status: string = 'accepted') {
  const friendships = await prisma.friendship.findMany({
    where: {
      userId,
      status,
    },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          xp: true,
          level: true,
          streak: true,
        },
      },
    },
    orderBy: {
      acceptedAt: 'desc',
    },
  })

  return friendships.map((f) => ({
    ...f.friend,
    friendshipId: f.id,
    friendsSince: f.acceptedAt,
  }))
}

/**
 * Get friend requests (pending)
 */
export async function getFriendRequests(userId: string) {
  const requests = await prisma.friendship.findMany({
    where: {
      userId,
      status: 'pending',
      requestedBy: {
        not: userId, // Only requests sent TO this user
      },
    },
    include: {
      friend: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          xp: true,
          level: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return requests.map((r) => ({
    ...r.friend,
    requestId: r.id,
    requestedAt: r.createdAt,
  }))
}

/**
 * Search users for friends
 */
export async function searchUsers(query: string, currentUserId: string, limit: number = 20) {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          id: {
            not: currentUserId,
          },
        },
        {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
      xp: true,
      level: true,
      streak: true,
    },
    take: limit,
  })

  // Check friendship status for each user
  const userIds = users.map((u) => u.id)
  const friendships = await prisma.friendship.findMany({
    where: {
      userId: currentUserId,
      friendId: {
        in: userIds,
      },
    },
  })

  const friendshipMap = new Map(friendships.map((f) => [f.friendId, f.status]))

  return users.map((user) => ({
    ...user,
    friendshipStatus: friendshipMap.get(user.id) || null,
  }))
}

/**
 * Get activity feed
 */
export async function getActivityFeed(userId: string, includeFriends: boolean = true) {
  const where: any = {
    isPublic: true,
  }

  if (includeFriends) {
    // Get user's friends
    const friends = await prisma.friendship.findMany({
      where: {
        userId,
        status: 'accepted',
      },
      select: {
        friendId: true,
      },
    })

    const friendIds = friends.map((f) => f.friendId)

    where.userId = {
      in: [userId, ...friendIds],
    }
  } else {
    where.userId = userId
  }

  const activities = await prisma.activityFeed.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
  })

  return activities
}

/**
 * Create activity
 */
export async function createActivity(
  userId: string,
  type: string,
  title: string,
  description?: string,
  metadata?: any
) {
  return await prisma.activityFeed.create({
    data: {
      userId,
      type,
      title,
      description,
      metadata,
      isPublic: true,
    },
  })
}

export default {
  getUserProfile,
  updateUserProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers,
  getActivityFeed,
  createActivity,
}
