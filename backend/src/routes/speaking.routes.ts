/**
 * Speaking Routes - AprendaInglesGratis
 * Connects speaking endpoints to SpeakingService
 */

import { Router, Request, Response } from 'express';
import { getSpeakingService } from '../services/speaking.service';

const router = Router();
const speakingService = getSpeakingService();

/**
 * POST /api/v1/speaking/analyze
 * Analyze pronunciation from audio
 */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { userId, phraseId, audioData, expectedText } = req.body;

    if (!userId || !audioData || !expectedText) {
      res.status(400).json({
        success: false,
        error: 'userId, audioData and expectedText are required',
      });
      return;
    }

    const analysis = await speakingService.analyzePronunciation(
      userId,
      phraseId || 'default',
      audioData,
      expectedText
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Speaking analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze pronunciation',
    });
  }
});

/**
 * POST /api/v1/speaking/track-progress
 * Track speaking progress
 */
router.post('/track-progress', async (req: Request, res: Response) => {
  try {
    const { userId, analysis } = req.body;

    if (!userId || !analysis) {
      res.status(400).json({
        success: false,
        error: 'userId and analysis are required',
      });
      return;
    }

    const progress = await speakingService.trackProgress(userId, analysis);

    res.json({
      success: true,
      data: progress,
    });
  } catch (error) {
    console.error('Track progress error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track progress',
    });
  }
});

export default router;
