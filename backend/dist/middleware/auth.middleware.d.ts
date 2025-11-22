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
import { Request, Response, NextFunction } from 'express';
export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        name: string;
        level: string;
        subscriptionStatus: string;
    };
}
/**
 * Verify JWT token and attach user to request
 */
export declare function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Optional authentication - doesn't fail if no token
 */
export declare function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
/**
 * Require specific subscription level
 */
export declare function requireSubscription(requiredLevel: 'free' | 'premium' | 'vip'): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
/**
 * Require email verification
 */
export declare function requireEmailVerified(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
/**
 * Rate limit per user
 */
export declare function userRateLimit(maxRequests: number, windowMs: number): (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
declare const _default: {
    authenticate: typeof authenticate;
    optionalAuth: typeof optionalAuth;
    requireSubscription: typeof requireSubscription;
    requireEmailVerified: typeof requireEmailVerified;
    userRateLimit: typeof userRateLimit;
};
export default _default;
//# sourceMappingURL=auth.middleware.d.ts.map