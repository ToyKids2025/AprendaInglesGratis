/**
 * Gamification Service Tests - AprendaInglesGratis
 */

// Mock cache service
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../../services/cache.service', () => ({
  getCacheService: () => mockCache,
}));

import { GamificationService } from '../../services/gamification.service';

describe('GamificationService', () => {
  let gamificationService: GamificationService;

  beforeEach(() => {
    jest.clearAllMocks();
    gamificationService = new GamificationService();
  });

  describe('addXP', () => {
    it('should add XP to user and return newXP', async () => {
      const mockGamification = {
        userId: 'user-123',
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
        totalXP: 50,
        rank: 'Bronze',
        streak: 3,
        longestStreak: 5,
        lastActiveDate: new Date(),
        coins: 100,
        gems: 10,
        achievements: [],
        badges: [],
      };

      // Mock getUserGamification via cache
      mockCache.get.mockResolvedValue(mockGamification);
      mockCache.set.mockResolvedValue(undefined);

      const result = await gamificationService.addXP('user-123', 30, 'activity');

      // Result should have newXP property
      expect(result).toHaveProperty('newXP');
      expect(result).toHaveProperty('leveledUp');
      expect(typeof result.newXP).toBe('number');
    });

    it('should return leveledUp true when XP exceeds threshold', async () => {
      const mockGamification = {
        userId: 'user-123',
        level: 1,
        xp: 90,
        xpToNextLevel: 100,
        totalXP: 90,
        rank: 'Bronze',
        streak: 3,
        longestStreak: 5,
        lastActiveDate: new Date(),
        coins: 100,
        gems: 10,
        achievements: [],
        badges: [],
      };

      mockCache.get.mockResolvedValue(mockGamification);
      mockCache.set.mockResolvedValue(undefined);

      const result = await gamificationService.addXP('user-123', 20, 'activity');

      expect(result.leveledUp).toBe(true);
      expect(result.newLevel).toBeDefined();
    });
  });

  describe('getLeaderboard', () => {
    it('should return leaderboard with entries', async () => {
      const mockLeaderboard = {
        type: 'xp',
        period: 'weekly',
        entries: [
          { rank: 1, userId: 'user-1', username: 'User 1', level: 5, xp: 500, streak: 10, isCurrentUser: false },
          { rank: 2, userId: 'user-2', username: 'User 2', level: 4, xp: 400, streak: 5, isCurrentUser: false },
        ],
        totalParticipants: 100,
      };

      mockCache.get.mockResolvedValue(mockLeaderboard);

      // LeaderboardType is 'xp' | 'streak' | 'weekly' | 'friends'
      const result = await gamificationService.getLeaderboard('xp', 'weekly', '', 10);

      expect(result).toHaveProperty('entries');
      expect(result).toHaveProperty('totalParticipants');
    });

    it('should accept valid leaderboard types', async () => {
      mockCache.get.mockResolvedValue({
        type: 'streak',
        period: 'weekly',
        entries: [],
        totalParticipants: 0,
      });

      // These should not throw - using valid LeaderboardType values
      await gamificationService.getLeaderboard('xp', 'weekly', 'user-123', 10);
      await gamificationService.getLeaderboard('streak', 'daily', 'user-123', 10);
      await gamificationService.getLeaderboard('weekly', 'weekly', 'user-123', 10);
      await gamificationService.getLeaderboard('friends', 'all_time', 'user-123', 10);

      expect(mockCache.get).toHaveBeenCalled();
    });
  });

  describe('updateStreak', () => {
    it('should return currentStreak for consecutive days', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockGamification = {
        userId: 'user-123',
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
        totalXP: 50,
        rank: 'Bronze',
        streak: 5,
        longestStreak: 10,
        lastActiveDate: yesterday,
        coins: 100,
        gems: 10,
        achievements: [],
        badges: [],
      };

      mockCache.get.mockResolvedValue(mockGamification);
      mockCache.set.mockResolvedValue(undefined);

      const result = await gamificationService.updateStreak('user-123');

      expect(result).toHaveProperty('currentStreak');
      expect(result).toHaveProperty('streakBroken');
      expect(typeof result.currentStreak).toBe('number');
    });

    it('should set streakBroken true if more than a day has passed', async () => {
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      const mockGamification = {
        userId: 'user-123',
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
        totalXP: 50,
        rank: 'Bronze',
        streak: 5,
        longestStreak: 10,
        lastActiveDate: threeDaysAgo,
        coins: 100,
        gems: 10,
        achievements: [],
        badges: [],
      };

      mockCache.get.mockResolvedValue(mockGamification);
      mockCache.set.mockResolvedValue(undefined);

      const result = await gamificationService.updateStreak('user-123');

      expect(result.streakBroken).toBe(true);
      expect(result.currentStreak).toBe(1);
    });
  });

  describe('checkAchievements', () => {
    it('should return array of achievements', async () => {
      const mockGamification = {
        userId: 'user-123',
        level: 5,
        xp: 500,
        xpToNextLevel: 600,
        totalXP: 2500,
        rank: 'Bronze',
        streak: 7,
        longestStreak: 15,
        lastActiveDate: new Date(),
        coins: 500,
        gems: 50,
        achievements: [
          {
            achievementId: 'ach-1',
            progress: 100,
            unlocked: true,
            unlockedAt: new Date(),
          },
        ],
        badges: [],
      };

      mockCache.get.mockResolvedValue(mockGamification);

      const result = await gamificationService.checkAchievements('user-123');

      // Result should be an array
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getDailyChallenge', () => {
    it('should return daily challenge', async () => {
      const mockGamification = {
        userId: 'user-123',
        level: 1,
        xp: 50,
        xpToNextLevel: 100,
        totalXP: 50,
        rank: 'Bronze',
        streak: 3,
        longestStreak: 5,
        lastActiveDate: new Date(),
        coins: 100,
        gems: 10,
        achievements: [],
        badges: [],
        dailyChallenge: {
          id: 'dc-1',
          date: new Date(),
          type: 'complete_lessons',
          description: 'Complete 3 lessons today',
          goal: 3,
          progress: 1,
          rewards: [{ type: 'xp', amount: 100 }],
          completed: false,
        },
      };

      mockCache.get.mockResolvedValue(mockGamification);

      const result = await gamificationService.getDailyChallenge('user-123');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('goal');
      expect(result).toHaveProperty('progress');
    });
  });
});
