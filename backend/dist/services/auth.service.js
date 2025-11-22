"use strict";
/**
 * AUTH SERVICE - AprendaInglesGratis
 *
 * Complete authentication system with JWT and bcrypt
 *
 * Features:
 * - User registration with email verification
 * - Login with JWT access + refresh tokens
 * - Token refresh mechanism
 * - Password hashing with bcrypt
 * - Password reset flow
 * - Session management
 *
 * @module AuthService
 * @version 1.0.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
exports.getAuthService = getAuthService;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const cache_service_1 = require("./cache.service");
// ==================== CONFIGURATION ====================
const config = {
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    jwtExpiresIn: 15 * 60, // Access token expires in 15 minutes (in seconds)
    refreshTokenExpiresIn: 7 * 24 * 60 * 60, // Refresh token expires in 7 days (in seconds)
    bcryptRounds: 12,
};
// ==================== AUTH SERVICE CLASS ====================
class AuthService {
    prisma;
    cache;
    constructor() {
        this.prisma = new client_1.PrismaClient();
        this.cache = (0, cache_service_1.getCacheService)();
    }
    // ==================== REGISTRATION ====================
    /**
     * Register a new user
     */
    async register(input) {
        const { email, password, name, acceptTerms } = input;
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        if (!acceptTerms) {
            throw new Error('You must accept the terms and conditions');
        }
        // Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, config.bcryptRounds);
        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: email.toLowerCase(),
                password: hashedPassword,
                name,
                level: 'A1',
                subscriptionStatus: 'free',
            },
        });
        // Create gamification profile
        await this.prisma.gamification.create({
            data: {
                userId: user.id,
                xp: 0,
                level: 1,
                xpToNextLevel: 100,
                coins: 50, // Welcome bonus
                gems: 5, // Welcome bonus
                streak: 0,
                maxStreak: 0,
                rank: 'Bronze',
            },
        });
        // Generate tokens
        const tokens = this.generateTokens(user);
        // Save refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    // ==================== LOGIN ====================
    /**
     * Login user and return tokens
     */
    async login(input) {
        const { email, password } = input;
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check password
        const isValidPassword = await bcrypt_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        // Update last login
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        // Generate tokens
        const tokens = this.generateTokens(user);
        // Save refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return {
            user: this.sanitizeUser(user),
            tokens,
        };
    }
    // ==================== TOKEN REFRESH ====================
    /**
     * Refresh access token using refresh token
     */
    async refreshToken(refreshToken) {
        // Verify refresh token
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(refreshToken, config.jwtSecret);
        }
        catch {
            throw new Error('Invalid refresh token');
        }
        // Check if token is in database
        const user = await this.prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!user || user.refreshToken !== refreshToken) {
            throw new Error('Invalid refresh token');
        }
        // Generate new tokens
        const tokens = this.generateTokens(user);
        // Save new refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }
    // ==================== LOGOUT ====================
    /**
     * Logout user and invalidate refresh token
     */
    async logout(userId) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        // Clear user cache
        await this.cache.delete(`user:${userId}`);
    }
    // ==================== PASSWORD RESET ====================
    /**
     * Request password reset
     */
    async requestPasswordReset(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user) {
            // Don't reveal if user exists
            return { message: 'If the email exists, a reset link has been sent' };
        }
        // Generate reset token
        const resetToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'password-reset' }, config.jwtSecret, { expiresIn: '1h' });
        // Save reset token in cache (expires in 1 hour)
        await this.cache.set(`password-reset:${user.id}`, resetToken, { ttl: 3600 });
        // TODO: Send email with reset link
        console.log(`Password reset token for ${email}: ${resetToken}`);
        return { message: 'If the email exists, a reset link has been sent' };
    }
    /**
     * Reset password with token
     */
    async resetPassword(token, newPassword) {
        // Verify token
        let payload;
        try {
            payload = jsonwebtoken_1.default.verify(token, config.jwtSecret);
        }
        catch {
            throw new Error('Invalid or expired reset token');
        }
        if (payload.type !== 'password-reset') {
            throw new Error('Invalid reset token');
        }
        // Check token in cache
        const cachedToken = await this.cache.get(`password-reset:${payload.userId}`);
        if (cachedToken !== token) {
            throw new Error('Invalid or expired reset token');
        }
        // Hash new password
        const hashedPassword = await bcrypt_1.default.hash(newPassword, config.bcryptRounds);
        // Update password
        await this.prisma.user.update({
            where: { id: payload.userId },
            data: {
                password: hashedPassword,
                refreshToken: null, // Invalidate all sessions
            },
        });
        // Remove reset token from cache
        await this.cache.delete(`password-reset:${payload.userId}`);
    }
    // ==================== TOKEN VERIFICATION ====================
    /**
     * Verify access token and return user payload
     */
    verifyAccessToken(token) {
        try {
            const payload = jsonwebtoken_1.default.verify(token, config.jwtSecret);
            return {
                id: payload.userId,
                email: payload.email,
                name: payload.name,
                level: payload.level,
                subscriptionStatus: payload.subscriptionStatus,
            };
        }
        catch {
            throw new Error('Invalid access token');
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        // Try cache first
        const cached = await this.cache.get(`user:${userId}`);
        if (cached) {
            return cached;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            return null;
        }
        const sanitized = this.sanitizeUser(user);
        // Cache for 5 minutes
        await this.cache.set(`user:${userId}`, sanitized, { ttl: 300 });
        return sanitized;
    }
    // ==================== PRIVATE METHODS ====================
    /**
     * Generate access and refresh tokens
     */
    generateTokens(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            name: user.name,
            level: user.level,
            subscriptionStatus: user.subscriptionStatus,
        };
        const accessToken = jsonwebtoken_1.default.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn,
        });
        const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id, type: 'refresh' }, config.jwtSecret, { expiresIn: config.refreshTokenExpiresIn });
        return {
            accessToken,
            refreshToken,
            expiresIn: 15 * 60, // 15 minutes in seconds
        };
    }
    /**
     * Save refresh token to database
     */
    async saveRefreshToken(userId, refreshToken) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken },
        });
    }
    /**
     * Remove sensitive data from user object
     */
    sanitizeUser(user) {
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            level: user.level,
            subscriptionStatus: user.subscriptionStatus,
        };
    }
}
exports.AuthService = AuthService;
// ==================== SINGLETON ====================
let authServiceInstance = null;
function getAuthService() {
    if (!authServiceInstance) {
        authServiceInstance = new AuthService();
    }
    return authServiceInstance;
}
exports.default = getAuthService;
//# sourceMappingURL=auth.service.js.map