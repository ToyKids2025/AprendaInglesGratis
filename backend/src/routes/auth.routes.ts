/**
 * Auth Routes - AprendaInglesGratis
 * Authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { getAuthService } from '../services/auth.service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.middleware';
import { validate, ValidationSchemas, RateLimiters } from '../middleware/validation.middleware';

const router = Router();
const authService = getAuthService();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  RateLimiters.auth,
  validate(ValidationSchemas.register),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name, acceptTerms } = req.body;

      const result = await authService.register({
        email,
        password,
        name,
        acceptTerms,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Login and get tokens
 */
router.post(
  '/login',
  RateLimiters.auth,
  validate(ValidationSchemas.login),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  }
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post(
  '/refresh',
  validate(ValidationSchemas.refreshToken),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      const tokens = await authService.refreshToken(refreshToken);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: tokens,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Token refresh failed';
      res.status(401).json({
        success: false,
        error: message,
      });
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout and invalidate refresh token
 */
router.post(
  '/logout',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      await authService.logout(req.user.id);

      res.json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Logout failed';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
);

/**
 * POST /api/v1/auth/forgot-password
 * Request password reset
 */
router.post(
  '/forgot-password',
  RateLimiters.passwordReset,
  validate(ValidationSchemas.resetPassword),
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      const result = await authService.requestPasswordReset(email);

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Don't reveal errors for security
      res.json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
    }
  }
);

/**
 * POST /api/v1/auth/reset-password
 * Reset password with token
 */
router.post(
  '/reset-password',
  RateLimiters.passwordReset,
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        res.status(400).json({
          success: false,
          error: 'Token and new password are required',
        });
        return;
      }

      await authService.resetPassword(token, newPassword);

      res.json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Password reset failed';
      res.status(400).json({
        success: false,
        error: message,
      });
    }
  }
);

/**
 * GET /api/v1/auth/me
 * Get current user profile
 */
router.get(
  '/me',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
        return;
      }

      const user = await authService.getUserById(req.user.id);

      if (!user) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to get user';
      res.status(500).json({
        success: false,
        error: message,
      });
    }
  }
);

export default router;
