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
interface RegisterInput {
    email: string;
    password: string;
    name: string;
    acceptTerms: boolean;
}
interface LoginInput {
    email: string;
    password: string;
}
interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
interface UserPayload {
    id: string;
    email: string;
    name: string;
    level: string;
    subscriptionStatus: string;
}
interface AuthResponse {
    user: UserPayload;
    tokens: AuthTokens;
}
export declare class AuthService {
    private prisma;
    private cache;
    constructor();
    /**
     * Register a new user
     */
    register(input: RegisterInput): Promise<AuthResponse>;
    /**
     * Login user and return tokens
     */
    login(input: LoginInput): Promise<AuthResponse>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(refreshToken: string): Promise<AuthTokens>;
    /**
     * Logout user and invalidate refresh token
     */
    logout(userId: string): Promise<void>;
    /**
     * Request password reset
     */
    requestPasswordReset(email: string): Promise<{
        message: string;
    }>;
    /**
     * Reset password with token
     */
    resetPassword(token: string, newPassword: string): Promise<void>;
    /**
     * Verify access token and return user payload
     */
    verifyAccessToken(token: string): UserPayload;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<UserPayload | null>;
    /**
     * Generate access and refresh tokens
     */
    private generateTokens;
    /**
     * Save refresh token to database
     */
    private saveRefreshToken;
    /**
     * Remove sensitive data from user object
     */
    private sanitizeUser;
}
export declare function getAuthService(): AuthService;
export default getAuthService;
//# sourceMappingURL=auth.service.d.ts.map