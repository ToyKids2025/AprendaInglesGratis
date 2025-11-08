/**
 * SOCIAL ROUTES
 * Profiles, friends, groups, and leaderboards
 */

import { Router } from 'express'
import {
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
} from '../controllers/social.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Profile routes
router.get('/profile/:userId', authenticateToken, getUserProfile)
router.patch('/profile', authenticateToken, updateProfile)

// Friend routes
router.post('/friends/request/:friendId', authenticateToken, sendFriendRequest)
router.post('/friends/accept/:friendId', authenticateToken, acceptFriendRequest)
router.post('/friends/reject/:friendId', authenticateToken, rejectFriendRequest)
router.delete('/friends/:friendId', authenticateToken, removeFriend)
router.get('/friends', authenticateToken, getFriends)
router.get('/friends/requests', authenticateToken, getFriendRequests)

// User search
router.get('/users/search', authenticateToken, searchUsers)

// Activity feed
router.get('/activity', authenticateToken, getActivityFeed)

// Study group routes
router.post('/groups', authenticateToken, createStudyGroup)
router.get('/groups/my', authenticateToken, getMyStudyGroups)
router.get('/groups/:groupId', getStudyGroup) // Public
router.get('/groups', getStudyGroups) // Public
router.post('/groups/:groupId/join', authenticateToken, joinStudyGroup)
router.post('/groups/:groupId/leave', authenticateToken, leaveStudyGroup)

// Leaderboard routes
router.get('/leaderboard', getLeaderboard) // Public
router.get('/leaderboard/friends', authenticateToken, getFriendsLeaderboard)
router.get('/leaderboard/rank', authenticateToken, getUserRank)

export default router
