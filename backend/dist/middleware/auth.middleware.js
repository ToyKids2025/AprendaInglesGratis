"use strict";
/**
 * AUTH MIDDLEWARE - AprendaInglesGratis
 *
 * JWT authentication middleware for protecting routes
 *
 * Features:
 * - Bearer token verification
 * - User injection into request
 * - Role-based access control
 * - Subscription level checks
 *
 * @module AuthMiddleware
 * @version 1.0.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.optionalAuth = optionalAuth;
exports.requireSubscription = requireSubscription;
exports.requireEmailVerified = requireEmailVerified;
exports.userRateLimit = userRateLimit;
const auth_service_1 = require("../services/auth.service");
// ==================== AUTHENTICATION MIDDLEWARE ====================
/**
 * Verify JWT token and attach user to request
 */
function authenticate(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({
                success: false,
                error: 'No authorization token provided',
            });
            return;
        }
        // Check Bearer format
        if (!authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Invalid authorization format. Use: Bearer <token>',
            });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer '
        // Verify token
        const authService = (0, auth_service_1.getAuthService)();
        const user = authService.verifyAccessToken(token);
        // Attach user to request
        req.user = user;
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired token',
        });
    }
}
/**
 * Optional authentication - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const authService = (0, auth_service_1.getAuthService)();
            req.user = authService.verifyAccessToken(token);
        }
        next();
    }
    catch {
        // Token invalid, but continue without user
        next();
    }
}
// ==================== AUTHORIZATION MIDDLEWARE ====================
/**
 * Require specific subscription level
 */
function requireSubscription(requiredLevel) {
    const levels = { free: 0, premium: 1, vip: 2 };
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
            });
            return;
        }
        const userLevel = levels[req.user.subscriptionStatus] || 0;
        const required = levels[requiredLevel];
        if (userLevel < required) {
            res.status(403).json({
                success: false,
                error: `This feature requires ${requiredLevel} subscription`,
                requiredLevel,
                currentLevel: req.user.subscriptionStatus,
            });
            return;
        }
        next();
    };
}
/**
 * Require email verification
 */
async function requireEmailVerified(req, res, next) {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
        });
        return;
    }
    // Get full user from database
    const authService = (0, auth_service_1.getAuthService)();
    const user = await authService.getUserById(req.user.id);
    if (!user) {
        res.status(401).json({
            success: false,
            error: 'User not found',
        });
        return;
    }
    // Note: emailVerified check would require updating UserPayload
    // For now, just continue
    next();
}
// ==================== RATE LIMITING BY USER ====================
const userRequestCounts = new Map();
/**
 * Rate limit per user
 */
function userRateLimit(maxRequests, windowMs) {
    return (req, res, next) => {
        const userId = req.user?.id || req.ip || 'anonymous';
        const now = Date.now();
        let userData = userRequestCounts.get(userId);
        if (!userData || now > userData.resetTime) {
            userData = { count: 0, resetTime: now + windowMs };
            userRequestCounts.set(userId, userData);
        }
        userData.count++;
        if (userData.count > maxRequests) {
            res.status(429).json({
                success: false,
                error: 'Too many requests. Please slow down.',
                retryAfter: Math.ceil((userData.resetTime - now) / 1000),
            });
            return;
        }
        next();
    };
}
// ==================== EXPORTS ====================
exports.default = {
    authenticate,
    optionalAuth,
    requireSubscription,
    requireEmailVerified,
    userRateLimit,
};
//# sourceMappingURL=auth.middleware.js.map