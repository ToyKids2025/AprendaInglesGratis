/**
 * Grammar Routes - AprendaInglesGratis
 * Connects grammar endpoints to GrammarService
 */

import { Router, Request, Response } from 'express';
import { getGrammarService } from '../services/grammar.service';

const router = Router();
const grammarService = getGrammarService();

/**
 * POST /api/v1/grammar/correct
 * Correct grammar in text
 */
router.post('/correct', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      res.status(400).json({
        success: false,
        error: 'text is required',
      });
      return;
    }

    const corrections = await grammarService.correctText(text);

    res.json({
      success: true,
      data: corrections,
    });
  } catch (error) {
    console.error('Grammar correction error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to correct grammar',
    });
  }
});

/**
 * POST /api/v1/grammar/explain
 * Explain a grammar mistake
 */
router.post('/explain', async (req: Request, res: Response) => {
  try {
    const { mistake, context, level } = req.body;

    if (!mistake) {
      res.status(400).json({
        success: false,
        error: 'mistake is required',
      });
      return;
    }

    const explanation = await grammarService.explainMistake(
      mistake,
      context || ''
    );

    res.json({
      success: true,
      data: explanation,
    });
  } catch (error) {
    console.error('Grammar explanation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to explain grammar',
    });
  }
});

/**
 * POST /api/v1/grammar/exercise
 * Generate grammar exercises
 */
router.post('/exercise', async (req: Request, res: Response) => {
  try {
    const { topic, type, level } = req.body;

    if (!topic) {
      res.status(400).json({
        success: false,
        error: 'topic is required',
      });
      return;
    }

    const exercises = await grammarService.generateExercises(
      topic,
      type || 'fill_blank',
      level || 'B1'
    );

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Exercise generation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate exercises',
    });
  }
});

/**
 * GET /api/v1/grammar/topics/:level
 * Get available grammar topics by level
 */
router.get('/topics/:level', async (req: Request, res: Response) => {
  try {
    const { level } = req.params;

    const topics = await grammarService.getTopicsByLevel(level as any);

    res.json({
      success: true,
      data: topics,
    });
  } catch (error) {
    console.error('Topics fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topics',
    });
  }
});

/**
 * GET /api/v1/grammar/topic/:topicId
 * Get grammar topic details
 */
router.get('/topic/:topicId', async (req: Request, res: Response) => {
  try {
    const { topicId } = req.params;
    const { level } = req.query;

    const details = await grammarService.getTopicDetails(
      topicId,
      (level as any) || 'B1'
    );

    res.json({
      success: true,
      data: details,
    });
  } catch (error) {
    console.error('Topic details error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch topic details',
    });
  }
});

/**
 * POST /api/v1/grammar/personalized/:userId
 * Get personalized grammar exercises
 */
router.post('/personalized/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { count } = req.body;

    const exercises = await grammarService.getPersonalizedExercises(
      userId,
      count || 10
    );

    res.json({
      success: true,
      data: exercises,
    });
  } catch (error) {
    console.error('Personalized exercises error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personalized exercises',
    });
  }
});

export default router;
