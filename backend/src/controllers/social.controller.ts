/**
 * SOCIAL CONTROLLER
 * Profiles, friends, groups, and leaderboards
 */

import { Request, Response } from 'express'
import { z } from 'zod'
import * as socialService from '../services/social.service'
import * as studyGroupService from '../services/studyGroup.service'
import * as leaderboardService from '../services/leaderboard.service'

// Validation schemas
const updateProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  location: z.string().max(100).optional(),
  language: z.string().max(50).optional(),
  timezone: z.string().max(50).optional(),
  learningGoal: z.string().optional(),
  targetLevel: z.string().optional(),
  studyTime: z.number().min(5).max(480).optional(),
  isPublic: z.boolean().optional(),
  showStreak: z.boolean().optional(),
  showXP: z.boolean().optional(),
  showProgress: z.boolean().optional(),
})

const createGroupSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  image: z.string().url().optional(),
  isPublic: z.boolean().optional(),
  maxMembers: z.number().min(2).max(500).optional(),
  requireApproval: z.boolean().optional(),
})

/**
 * GET /api/social/profile/:userId
 * Get user profile
 */
export async function getUserProfile(req: Request, res: Response) {
  try {
    const { userId } = req.params

    const profile = await socialService.getUserProfile(userId)

    res.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error('Failed to get user profile:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * PATCH /api/social/profile
 * Update own profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = updateProfileSchema.parse(req.body)

    const profile = await socialService.updateUserProfile(userId, validatedData)

    res.json({
      success: true,
      profile,
    })
  } catch (error: any) {
    console.error('Failed to update profile:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/friends/request/:friendId
 * Send friend request
 */
export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { friendId } = req.params

    if (userId === friendId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot send friend request to yourself',
      })
    }

    const friendship = await socialService.sendFriendRequest(userId, friendId)

    res.json({
      success: true,
      friendship,
    })
  } catch (error: any) {
    console.error('Failed to send friend request:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/friends/accept/:friendId
 * Accept friend request
 */
export async function acceptFriendRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { friendId } = req.params

    await socialService.acceptFriendRequest(userId, friendId)

    res.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Failed to accept friend request:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/friends/reject/:friendId
 * Reject friend request
 */
export async function rejectFriendRequest(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { friendId } = req.params

    await socialService.rejectFriendRequest(userId, friendId)

    res.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Failed to reject friend request:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * DELETE /api/social/friends/:friendId
 * Remove friend
 */
export async function removeFriend(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { friendId } = req.params

    await socialService.removeFriend(userId, friendId)

    res.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Failed to remove friend:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/friends
 * Get user's friends
 */
export async function getFriends(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const friends = await socialService.getFriends(userId)

    res.json({
      success: true,
      friends,
    })
  } catch (error: any) {
    console.error('Failed to get friends:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/friends/requests
 * Get pending friend requests
 */
export async function getFriendRequests(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const requests = await socialService.getFriendRequests(userId)

    res.json({
      success: true,
      requests,
    })
  } catch (error: any) {
    console.error('Failed to get friend requests:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/users/search
 * Search for users
 */
export async function searchUsers(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { q } = req.query

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter required',
      })
    }

    const users = await socialService.searchUsers(q, userId)

    res.json({
      success: true,
      users,
    })
  } catch (error: any) {
    console.error('Failed to search users:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/activity
 * Get activity feed
 */
export async function getActivityFeed(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { includeFriends = 'true' } = req.query

    const activities = await socialService.getActivityFeed(
      userId,
      includeFriends === 'true'
    )

    res.json({
      success: true,
      activities,
    })
  } catch (error: any) {
    console.error('Failed to get activity feed:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/groups
 * Create study group
 */
export async function createStudyGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const validatedData = createGroupSchema.parse(req.body)

    const group = await studyGroupService.createStudyGroup(userId, validatedData)

    res.json({
      success: true,
      group,
    })
  } catch (error: any) {
    console.error('Failed to create study group:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/groups/:groupId
 * Get study group details
 */
export async function getStudyGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id
    const { groupId } = req.params

    const group = await studyGroupService.getStudyGroup(groupId, userId)

    res.json({
      success: true,
      group,
    })
  } catch (error: any) {
    console.error('Failed to get study group:', error)
    res.status(404).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/groups
 * Get popular or search groups
 */
export async function getStudyGroups(req: Request, res: Response) {
  try {
    const { q } = req.query

    let groups
    if (q && typeof q === 'string') {
      groups = await studyGroupService.searchStudyGroups(q)
    } else {
      groups = await studyGroupService.getPopularStudyGroups()
    }

    res.json({
      success: true,
      groups,
    })
  } catch (error: any) {
    console.error('Failed to get study groups:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/groups/:groupId/join
 * Join study group
 */
export async function joinStudyGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { groupId } = req.params

    const member = await studyGroupService.joinStudyGroup(groupId, userId)

    res.json({
      success: true,
      member,
    })
  } catch (error: any) {
    console.error('Failed to join study group:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/social/groups/:groupId/leave
 * Leave study group
 */
export async function leaveStudyGroup(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { groupId } = req.params

    await studyGroupService.leaveStudyGroup(groupId, userId)

    res.json({
      success: true,
    })
  } catch (error: any) {
    console.error('Failed to leave study group:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/groups/my
 * Get user's study groups
 */
export async function getMyStudyGroups(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const groups = await studyGroupService.getUserStudyGroups(userId)

    res.json({
      success: true,
      groups,
    })
  } catch (error: any) {
    console.error('Failed to get study groups:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/leaderboard
 * Get leaderboard
 */
export async function getLeaderboard(req: Request, res: Response) {
  try {
    const { type = 'xp', limit = 100, offset = 0 } = req.query

    let leaderboard
    if (type === 'xp') {
      leaderboard = await leaderboardService.getGlobalXPLeaderboard(
        Number(limit),
        Number(offset)
      )
    } else if (type === 'streak') {
      leaderboard = await leaderboardService.getGlobalStreakLeaderboard(
        Number(limit),
        Number(offset)
      )
    } else if (type === 'weekly') {
      leaderboard = await leaderboardService.getWeeklyXPLeaderboard(Number(limit))
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid leaderboard type',
      })
    }

    res.json({
      success: true,
      leaderboard,
    })
  } catch (error: any) {
    console.error('Failed to get leaderboard:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/leaderboard/friends
 * Get friends leaderboard
 */
export async function getFriendsLeaderboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const leaderboard = await leaderboardService.getFriendsLeaderboard(userId)

    res.json({
      success: true,
      leaderboard,
    })
  } catch (error: any) {
    console.error('Failed to get friends leaderboard:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/social/leaderboard/rank
 * Get user's rank
 */
export async function getUserRank(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const ranks = await leaderboardService.getUserRanks(userId)

    res.json({
      success: true,
      ranks,
    })
  } catch (error: any) {
    console.error('Failed to get user rank:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  getUserProfile,
  updateProfile,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests,
  searchUsers,
  getActivityFeed,
  createStudyGroup,
  getStudyGroup,
  getStudyGroups,
  joinStudyGroup,
  leaveStudyGroup,
  getMyStudyGroups,
  getLeaderboard,
  getFriendsLeaderboard,
  getUserRank,
}
