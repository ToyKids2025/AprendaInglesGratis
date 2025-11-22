/**
 * Placement Test Routes - AprendaInglesGratis
 * Connects placement test endpoints to PlacementService
 */

import { Router, Request, Response } from 'express';
import { getPlacementService } from '../services/placement.service';

const router = Router();
const placementService = getPlacementService();

/**
 * POST /api/v1/placement/start
 * Start a new placement test
 */
router.post('/start', async (req: Request, res: Response) => {
  try {
    const { userId, previousLevel } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'userId is required',
      });
      return;
    }

    const test = await placementService.startTest(userId, previousLevel);

    res.json({
      success: true,
      data: test,
    });
  } catch (error) {
    console.error('Placement test start error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start placement test',
    });
  }
});

/**
 * POST /api/v1/placement/submit-answer
 * Submit an answer and get next question
 */
router.post('/submit-answer', async (req: Request, res: Response) => {
  try {
    const { testId, questionId, answer, timeSpent } = req.body;

    if (!testId || !questionId || answer === undefined) {
      res.status(400).json({
        success: false,
        error: 'testId, questionId, and answer are required',
      });
      return;
    }

    const result = await placementService.submitAnswer(
      testId,
      questionId,
      answer,
      timeSpent || 0
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit answer',
    });
  }
});

/**
 * GET /api/v1/placement/result/:testId
 * Get placement test result
 */
router.get('/result/:testId', async (req: Request, res: Response) => {
  try {
    const { testId } = req.params;

    // TODO: Implement result retrieval from database
    res.json({
      success: true,
      data: {
        testId,
        status: 'pending',
        message: 'Complete the test to see results',
      },
    });
  } catch (error) {
    console.error('Result fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch result',
    });
  }
});

export default router;
