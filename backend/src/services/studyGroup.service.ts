/**
 * STUDY GROUP SERVICE
 * Group learning, challenges, and collaboration
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Create study group
 */
export async function createStudyGroup(
  userId: string,
  data: {
    name: string
    description?: string
    image?: string
    isPublic?: boolean
    maxMembers?: number
    requireApproval?: boolean
  }
) {
  const group = await prisma.studyGroup.create({
    data: {
      ...data,
      creatorId: userId,
    },
  })

  // Add creator as admin member
  await prisma.groupMember.create({
    data: {
      groupId: group.id,
      userId,
      role: 'admin',
      status: 'active',
    },
  })

  // Create activity
  await prisma.groupActivity.create({
    data: {
      groupId: group.id,
      userId,
      type: 'group_created',
      content: `${data.name} was created`,
    },
  })

  return group
}

/**
 * Get study group
 */
export async function getStudyGroup(groupId: string, userId?: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      members: {
        where: {
          status: 'active',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
              xp: true,
              level: true,
            },
          },
        },
        orderBy: {
          xpContributed: 'desc',
        },
      },
    },
  })

  if (!group) {
    throw new Error('Group not found')
  }

  // Check if user is a member
  let userMembership = null
  if (userId) {
    userMembership = group.members.find((m) => m.userId === userId)
  }

  return {
    ...group,
    isMember: !!userMembership,
    userRole: userMembership?.role,
  }
}

/**
 * Search study groups
 */
export async function searchStudyGroups(query: string, limit: number = 20) {
  const groups = await prisma.studyGroup.findMany({
    where: {
      isPublic: true,
      name: {
        contains: query,
        mode: 'insensitive',
      },
    },
    include: {
      creator: {
        select: {
          name: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          members: true,
        },
      },
    },
    orderBy: {
      memberCount: 'desc',
    },
    take: limit,
  })

  return groups
}

/**
 * Get popular study groups
 */
export async function getPopularStudyGroups(limit: number = 10) {
  return await prisma.studyGroup.findMany({
    where: {
      isPublic: true,
    },
    include: {
      creator: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      memberCount: 'desc',
    },
    take: limit,
  })
}

/**
 * Join study group
 */
export async function joinStudyGroup(groupId: string, userId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    throw new Error('Group not found')
  }

  // Check if already a member
  const existing = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  })

  if (existing) {
    if (existing.status === 'active') {
      throw new Error('Already a member')
    }
    if (existing.status === 'banned') {
      throw new Error('You are banned from this group')
    }
  }

  // Check if group is full
  if (group.memberCount >= group.maxMembers) {
    throw new Error('Group is full')
  }

  // Create membership
  const status = group.requireApproval ? 'pending' : 'active'

  const member = await prisma.groupMember.create({
    data: {
      groupId,
      userId,
      status,
    },
  })

  // Update member count if active
  if (status === 'active') {
    await prisma.studyGroup.update({
      where: { id: groupId },
      data: {
        memberCount: {
          increment: 1,
        },
      },
    })

    // Create activity
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    await prisma.groupActivity.create({
      data: {
        groupId,
        userId,
        type: 'member_joined',
        content: `${user?.name || 'Someone'} joined the group`,
      },
    })
  }

  return member
}

/**
 * Leave study group
 */
export async function leaveStudyGroup(groupId: string, userId: string) {
  const membership = await prisma.groupMember.findUnique({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  })

  if (!membership) {
    throw new Error('Not a member of this group')
  }

  // Don't let creator leave their own group
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  })

  if (group?.creatorId === userId) {
    throw new Error('Group creator cannot leave. Delete the group instead.')
  }

  // Remove membership
  await prisma.groupMember.delete({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
  })

  // Update member count
  await prisma.studyGroup.update({
    where: { id: groupId },
    data: {
      memberCount: {
        decrement: 1,
      },
    },
  })

  return { success: true }
}

/**
 * Get group activities
 */
export async function getGroupActivities(groupId: string, limit: number = 50) {
  return await prisma.groupActivity.findMany({
    where: {
      groupId,
    },
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
    take: limit,
  })
}

/**
 * Update member XP contribution
 */
export async function updateMemberXP(groupId: string, userId: string, xpGained: number) {
  await prisma.groupMember.update({
    where: {
      groupId_userId: {
        groupId,
        userId,
      },
    },
    data: {
      xpContributed: {
        increment: xpGained,
      },
    },
  })

  await prisma.studyGroup.update({
    where: { id: groupId },
    data: {
      totalXP: {
        increment: xpGained,
      },
    },
  })
}

/**
 * Get user's study groups
 */
export async function getUserStudyGroups(userId: string) {
  const memberships = await prisma.groupMember.findMany({
    where: {
      userId,
      status: 'active',
    },
    include: {
      group: {
        include: {
          creator: {
            select: {
              name: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: {
      joinedAt: 'desc',
    },
  })

  return memberships.map((m) => ({
    ...m.group,
    userRole: m.role,
    xpContributed: m.xpContributed,
  }))
}

/**
 * Delete study group (creator only)
 */
export async function deleteStudyGroup(groupId: string, userId: string) {
  const group = await prisma.studyGroup.findUnique({
    where: { id: groupId },
  })

  if (!group) {
    throw new Error('Group not found')
  }

  if (group.creatorId !== userId) {
    throw new Error('Only the creator can delete this group')
  }

  await prisma.studyGroup.delete({
    where: { id: groupId },
  })

  return { success: true }
}

export default {
  createStudyGroup,
  getStudyGroup,
  searchStudyGroups,
  getPopularStudyGroups,
  joinStudyGroup,
  leaveStudyGroup,
  getGroupActivities,
  updateMemberXP,
  getUserStudyGroups,
  deleteStudyGroup,
}
