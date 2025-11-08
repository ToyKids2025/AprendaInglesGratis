/**
 * GAMIFICATION ROUTES
 * Challenges, quests, daily goals
 */

import { Router } from 'express'
import {
  getChallenges,
  joinChallenge,
  claimChallengeReward,
  getDailyGoal,
  claimDailyGoalReward,
  getQuests,
  startQuest,
} from '../controllers/gamification.controller'
import { authenticateToken } from '../middleware/auth'

const router = Router()

// Challenges
router.get('/challenges', getChallenges)
router.post('/challenges/:id/join', authenticateToken, joinChallenge)
router.post('/challenges/:id/claim', authenticateToken, claimChallengeReward)

// Daily Goals
router.get('/daily-goal', authenticateToken, getDailyGoal)
router.post('/daily-goal/claim', authenticateToken, claimDailyGoalReward)

// Quests
router.get('/quests', authenticateToken, getQuests)
router.post('/quests/:id/start', authenticateToken, startQuest)

export default router
