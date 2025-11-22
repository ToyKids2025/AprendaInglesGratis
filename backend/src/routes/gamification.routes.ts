/**
 * Gamification Routes - AprendaInglesGratis
 * Connects gamification endpoints to GamificationService
 */

import { Router, Request, Response } from 'express';
import { getGamificationService } from '../services/gamification.service';

const router = Router();
const gamificationService = getGamificationService();

/**
 * POST /api/v1/gamification/xp
 * Add XP to user
 */
router.post('/xp', async (req: Request, res: Response) => {
  try {
    const { userId, amount, source } = req.body;

    if (!userId || !amount) {
      res.status(400).json({
        success: false,
        error: 'userId and amount are required',
      });
      return;
    }

    const result = await gamificationService.addXP(
      userId,
      amount,
      source || 'activity'
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add XP',
    });
  }
});

/**
 * GET /api/v1/gamification/leaderboard
 * Get leaderboard
 */
router.get('/leaderboard', async (req: Request, res: Response) => {
  try {
    const { type, period, userId, limit } = req.query;

    const leaderboard = await gamificationService.getLeaderboard(
      (type as any) || 'global',
      (period as any) || 'weekly',
      (userId as string) || '',
      Number(limit) || 100
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error('Leaderboard fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leaderboard',
    });
  }
});

/**
 * GET /api/v1/gamification/achievements/:userId
 * Check and get user achievements
 */
router.get('/achievements/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const achievements = await gamificationService.checkAchievements(userId);

    res.json({
      success: true,
      data: achievements,
    });
  } catch (error) {
    console.error('Achievements fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements',
    });
  }
});

/**
 * POST /api/v1/gamification/streak
 * Update user streak
 */
router.post('/streak', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'userId is required',
      });
      return;
    }

    const streak = await gamificationService.updateStreak(userId);

    res.json({
      success: true,
      data: streak,
    });
  } catch (error) {
    console.error('Streak update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update streak',
    });
  }
});

/**
 * GET /api/v1/gamification/daily-challenge/:userId
 * Get daily challenge for user
 */
router.get('/daily-challenge/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const challenge = await gamificationService.getDailyChallenge(userId);

    res.json({
      success: true,
      data: challenge,
    });
  } catch (error) {
    console.error('Daily challenge fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily challenge',
    });
  }
});

export default router;
