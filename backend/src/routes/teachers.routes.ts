/**
 * Teachers Routes - AprendaInglesGratis
 * Connects teacher marketplace endpoints to TeachersService
 */

import { Router, Request, Response } from 'express';
import { getTeachersService } from '../services/teachers.service';

const router = Router();
const teachersService = getTeachersService();

/**
 * GET /api/v1/teachers/search
 * Search for teachers with filters
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const {
      specialization,
      minRating,
      maxRate,
      availability,
      page,
      limit,
    } = req.query;

    const filters: any = {};

    if (specialization) {
      filters.specializations = Array.isArray(specialization)
        ? specialization
        : [specialization];
    }
    if (minRating) filters.minRating = Number(minRating);
    if (maxRate) filters.maxHourlyRate = Number(maxRate);
    if (availability) filters.availability = availability;
    filters.page = Number(page) || 1;
    filters.limit = Number(limit) || 20;

    const result = await teachersService.searchTeachers(filters);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Teacher search error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search teachers',
    });
  }
});

/**
 * POST /api/v1/teachers/find-matching
 * Find matching teachers based on student preferences
 */
router.post('/find-matching', async (req: Request, res: Response) => {
  try {
    const { studentId, preferences, limit } = req.body;

    if (!studentId) {
      res.status(400).json({
        success: false,
        error: 'studentId is required',
      });
      return;
    }

    const teachers = await teachersService.findMatchingTeachers(
      studentId,
      limit || 10
    );

    res.json({
      success: true,
      data: teachers,
    });
  } catch (error) {
    console.error('Find matching teachers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to find matching teachers',
    });
  }
});

/**
 * POST /api/v1/teachers/book-lesson
 * Book a lesson with a teacher
 */
router.post('/book-lesson', async (req: Request, res: Response) => {
  try {
    const { studentId, teacherId, scheduledAt, duration, topic } = req.body;

    if (!studentId || !teacherId || !scheduledAt || !duration) {
      res.status(400).json({
        success: false,
        error: 'studentId, teacherId, scheduledAt, and duration are required',
      });
      return;
    }

    const lesson = await teachersService.bookLesson(
      studentId,
      teacherId,
      new Date(scheduledAt),
      duration,
      topic
    );

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Book lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book lesson',
    });
  }
});

/**
 * POST /api/v1/teachers/cancel-lesson
 * Cancel a lesson
 */
router.post('/cancel-lesson', async (req: Request, res: Response) => {
  try {
    const { lessonId, userId, reason } = req.body;

    if (!lessonId || !userId) {
      res.status(400).json({
        success: false,
        error: 'lessonId and userId are required',
      });
      return;
    }

    const lesson = await teachersService.cancelLesson(
      lessonId,
      userId,
      reason || 'User cancelled'
    );

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Cancel lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel lesson',
    });
  }
});

/**
 * POST /api/v1/teachers/complete-lesson
 * Mark a lesson as completed
 */
router.post('/complete-lesson', async (req: Request, res: Response) => {
  try {
    const { lessonId } = req.body;

    if (!lessonId) {
      res.status(400).json({
        success: false,
        error: 'lessonId is required',
      });
      return;
    }

    const lesson = await teachersService.completeLesson(lessonId);

    res.json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete lesson',
    });
  }
});

/**
 * POST /api/v1/teachers/review
 * Submit a review for a lesson
 */
router.post('/review', async (req: Request, res: Response) => {
  try {
    const { lessonId, studentId, rating, comment } = req.body;

    if (!lessonId || !studentId || rating === undefined) {
      res.status(400).json({
        success: false,
        error: 'lessonId, studentId, and rating are required',
      });
      return;
    }

    const review = await teachersService.submitReview(
      lessonId,
      studentId,
      rating,
      comment
    );

    res.json({
      success: true,
      data: review,
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit review',
    });
  }
});

/**
 * GET /api/v1/teachers/analytics/:teacherId
 * Get teacher analytics (for teachers)
 */
router.get('/analytics/:teacherId', async (req: Request, res: Response) => {
  try {
    const { teacherId } = req.params;

    const analytics = await teachersService.getTeacherAnalytics(teacherId);

    res.json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error('Teacher analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch teacher analytics',
    });
  }
});

export default router;
