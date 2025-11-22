/**
 * API Routes - AprendaInglesGratis
 */

import { Router } from 'express';
import authRoutes from './auth.routes';
import speakingRoutes from './speaking.routes';
import listeningRoutes from './listening.routes';
import placementRoutes from './placement.routes';
import gamificationRoutes from './gamification.routes';
import grammarRoutes from './grammar.routes';
import teachersRoutes from './teachers.routes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/auth', authRoutes);
router.use('/speaking', speakingRoutes);
router.use('/listening', listeningRoutes);
router.use('/placement', placementRoutes);
router.use('/gamification', gamificationRoutes);
router.use('/grammar', grammarRoutes);
router.use('/teachers', teachersRoutes);

export default router;
