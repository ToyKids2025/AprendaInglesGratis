"use strict";
/**
 * Speaking Routes - AprendaInglesGratis
 * Connects speaking endpoints to SpeakingService
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const speaking_service_1 = require("../services/speaking.service");
const router = (0, express_1.Router)();
const speakingService = (0, speaking_service_1.getSpeakingService)();
/**
 * POST /api/v1/speaking/analyze
 * Analyze pronunciation from audio
 */
router.post('/analyze', async (req, res) => {
    try {
        const { userId, phraseId, audioData, expectedText } = req.body;
        if (!userId || !audioData || !expectedText) {
            res.status(400).json({
                success: false,
                error: 'userId, audioData and expectedText are required',
            });
            return;
        }
        const analysis = await speakingService.analyzePronunciation(userId, phraseId || 'default', audioData, expectedText);
        res.json({
            success: true,
            data: analysis,
        });
    }
    catch (error) {
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
router.post('/track-progress', async (req, res) => {
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
    }
    catch (error) {
        console.error('Track progress error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to track progress',
        });
    }
});
exports.default = router;
//# sourceMappingURL=speaking.routes.js.map