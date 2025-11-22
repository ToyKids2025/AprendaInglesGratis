/**
 * Auth Service Tests - AprendaInglesGratis
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock PrismaClient
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  gamification: {
    create: jest.fn(),
  },
};

// Mock cache service
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrisma),
}));

jest.mock('../../services/cache.service', () => ({
  getCacheService: () => mockCache,
}));

import { AuthService } from '../../services/auth.service';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        acceptTerms: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        email: input.email,
        name: input.name,
        level: 'A1',
        subscriptionStatus: 'free',
        password: 'hashed',
      });
      mockPrisma.gamification.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue({});

      const result = await authService.register(input);

      expect(result.user.email).toBe(input.email);
      expect(result.user.name).toBe(input.name);
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      const input = {
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        acceptTerms: true,
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: input.email,
      });

      await expect(authService.register(input)).rejects.toThrow(
        'User with this email already exists'
      );
    });

    it('should throw error if terms not accepted', async () => {
      const input = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        acceptTerms: false,
      };

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.register(input)).rejects.toThrow(
        'You must accept the terms and conditions'
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        level: 'A1',
        subscriptionStatus: 'free',
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.tokens.accessToken).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
      ).rejects.toThrow('Invalid email or password');
    });

    it('should throw error for invalid password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 12);

      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        password: hashedPassword,
        name: 'Test User',
        level: 'A1',
        subscriptionStatus: 'free',
      });

      await expect(
        authService.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        })
      ).rejects.toThrow('Invalid email or password');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify valid token', () => {
      const payload = {
        userId: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        level: 'A1',
        subscriptionStatus: 'free',
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET || 'test-secret', {
        expiresIn: '15m',
      });

      const result = authService.verifyAccessToken(token);

      expect(result.id).toBe(payload.userId);
      expect(result.email).toBe(payload.email);
    });

    it('should throw error for invalid token', () => {
      expect(() => authService.verifyAccessToken('invalid-token')).toThrow(
        'Invalid access token'
      );
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      mockPrisma.user.update.mockResolvedValue({});
      mockCache.delete.mockResolvedValue(undefined);

      await expect(authService.logout('user-123')).resolves.not.toThrow();
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { refreshToken: null },
      });
    });
  });
});
