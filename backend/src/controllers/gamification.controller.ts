/**
 * GAMIFICATION CONTROLLER
 * Challenges, quests, daily goals, and rewards
 */

import { Request, Response } from 'express'
import * as challengeService from '../services/challenge.service'

/**
 * GET /api/gamification/challenges
 * Get active challenges
 */
export async function getChallenges(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id

    const challenges = await challengeService.getActiveChallenges(userId)

    res.json({
      success: true,
      challenges,
    })
  } catch (error: any) {
    console.error('Failed to get challenges:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/gamification/challenges/:id/join
 * Join a challenge
 */
export async function joinChallenge(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    const userChallenge = await challengeService.joinChallenge(userId, id)

    res.json({
      success: true,
      userChallenge,
    })
  } catch (error: any) {
    console.error('Failed to join challenge:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/gamification/challenges/:id/claim
 * Claim challenge reward
 */
export async function claimChallengeReward(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    const reward = await challengeService.claimChallengeReward(userId, id)

    res.json({
      success: true,
      reward,
    })
  } catch (error: any) {
    console.error('Failed to claim reward:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/gamification/daily-goal
 * Get today's daily goal
 */
export async function getDailyGoal(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const goal = await challengeService.getDailyGoal(userId)

    res.json({
      success: true,
      goal,
    })
  } catch (error: any) {
    console.error('Failed to get daily goal:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/gamification/daily-goal/claim
 * Claim daily goal reward
 */
export async function claimDailyGoalReward(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const reward = await challengeService.claimDailyGoalReward(userId)

    res.json({
      success: true,
      reward,
    })
  } catch (error: any) {
    console.error('Failed to claim daily goal reward:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * GET /api/gamification/quests
 * Get available quests
 */
export async function getQuests(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id

    const quests = await challengeService.getActiveQuests(userId)

    res.json({
      success: true,
      quests,
    })
  } catch (error: any) {
    console.error('Failed to get quests:', error)
    res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

/**
 * POST /api/gamification/quests/:id/start
 * Start a quest
 */
export async function startQuest(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id
    const { id } = req.params

    const userQuest = await challengeService.startQuest(userId, id)

    res.json({
      success: true,
      userQuest,
    })
  } catch (error: any) {
    console.error('Failed to start quest:', error)
    res.status(400).json({
      success: false,
      error: error.message,
    })
  }
}

export default {
  getChallenges,
  joinChallenge,
  claimChallengeReward,
  getDailyGoal,
  claimDailyGoalReward,
  getQuests,
  startQuest,
}
