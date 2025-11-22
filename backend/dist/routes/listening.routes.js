"use strict";
/**
 * Listening Routes - AprendaInglesGratis
 * Connects listening endpoints to ListeningService
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const listening_service_1 = require("../services/listening.service");
const router = (0, express_1.Router)();
const listeningService = (0, listening_service_1.getListeningService)();
/**
 * POST /api/v1/listening/session/create
 * Create a new listening session
 */
router.post('/session/create', async (req, res) => {
    try {
        const { userId, level, accent, type, duration } = req.body;
        if (!userId) {
            res.status(400).json({
                success: false,
                error: 'userId is required',
            });
            return;
        }
        const session = await listeningService.createSession(userId, {
            level: level || 'A1',
            accent: accent || 'US',
            speed: 1.0,
            exerciseCount: 10,
        });
        res.json({
            success: true,
            data: session,
        });
    }
    catch (error) {
        console.error('Listening session error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create listening session',
        });
    }
});
/**
 * POST /api/v1/listening/check-answer
 * Check user's answer for a listening exercise
 */
router.post('/check-answer', async (req, res) => {
    try {
        const { exerciseId, userAnswer, correctAnswer, playbackSpeed } = req.body;
        if (!userAnswer || !correctAnswer) {
            res.status(400).json({
                success: false,
                error: 'userAnswer and correctAnswer are required',
            });
            return;
        }
        const result = await listeningService.checkDictation(exerciseId || 'default', userAnswer, correctAnswer, playbackSpeed || 1.0);
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        console.error('Check answer error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check answer',
        });
    }
});
/**
 * POST /api/v1/listening/comprehension
 * Generate comprehension questions
 */
router.post('/comprehension', async (req, res) => {
    try {
        const { text, level, questionCount } = req.body;
        if (!text) {
            res.status(400).json({
                success: false,
                error: 'text is required',
            });
            return;
        }
        const questions = await listeningService.generateComprehensionQuestions(text, level || 'A1', questionCount || 5);
        res.json({
            success: true,
            data: questions,
        });
    }
    catch (error) {
        console.error('Comprehension generation error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate comprehension questions',
        });
    }
});
/**
 * POST /api/v1/listening/track-progress
 * Track user's listening progress
 */
router.post('/track-progress', async (req, res) => {
    try {
        const { userId, sessionId, finalScore } = req.body;
        if (!userId || !sessionId) {
            res.status(400).json({
                success: false,
                error: 'userId and sessionId are required',
            });
            return;
        }
        const progress = await listeningService.trackProgress(userId, sessionId, finalScore || 0);
        res.json({
            success: true,
            data: progress,
        });
    }
    catch (error) {
        console.error('Progress tracking error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track progress',
        });
    }
});
exports.default = router;
//# sourceMappingURL=listening.routes.js.map