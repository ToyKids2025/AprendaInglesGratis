/**
 * GAMIFICATION SERVICE - AprendaInglesGratis
 *
 * Comprehensive gamification system to boost engagement and retention
 *
 * Features:
 * - XP and leveling system
 * - Achievements and badges
 * - Streaks and daily challenges
 * - Leaderboards (global, friends, regional)
 * - Rewards and virtual currency
 * - Battle pass / Season system
 * - Social features (duels, teams)
 * - Progress milestones
 *
 * Psychology principles:
 * - Variable rewards
 * - Loss aversion (streaks)
 * - Social proof (leaderboards)
 * - Progress feedback
 * - Autonomy and mastery
 *
 * @module GamificationService
 * @version 1.0.0
 */

import { getCacheService } from './cache.service';

// ==================== TYPES ====================

interface UserGamification {
  userId: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXP: number;
  rank: string; // Bronze, Silver, Gold, Platinum, Diamond
  streak: number;
  longestStreak: number;
  lastActiveDate: Date;
  coins: number; // Virtual currency
  gems: number; // Premium currency
  achievements: AchievementProgress[];
  badges: Badge[];
  dailyChallenge?: DailyChallenge;
  weeklyChallenge?: WeeklyChallenge;
}

interface Achievement {
  id: string;
  category: AchievementCategory;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  requirements: AchievementRequirement[];
  rewards: Reward[];
  isSecret: boolean;
}

type AchievementCategory =
  | 'learning'
  | 'social'
  | 'streak'
  | 'mastery'
  | 'speed'
  | 'collection';

type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

interface AchievementRequirement {
  type: RequirementType;
  value: number;
  current?: number;
}

type RequirementType =
  | 'xp_earned'
  | 'lessons_completed'
  | 'days_streak'
  | 'perfect_scores'
  | 'speaking_hours'
  | 'phrases_mastered'
  | 'level_reached';

interface AchievementProgress {
  achievementId: string;
  progress: number; // 0-100
  unlocked: boolean;
  unlockedAt?: Date;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
  earnedAt: Date;
}

interface Reward {
  type: RewardType;
  amount: number;
  item?: string;
}

type RewardType = 'xp' | 'coins' | 'gems' | 'badge' | 'item';

interface DailyChallenge {
  id: string;
  date: Date;
  type: ChallengeType;
  description: string;
  goal: number;
  progress: number;
  rewards: Reward[];
  completed: boolean;
}

interface WeeklyChallenge {
  id: string;
  week: number;
  year: number;
  tasks: ChallengeTask[];
  totalProgress: number; // 0-100
  rewards: Reward[];
}

interface ChallengeTask {
  id: string;
  description: string;
  goal: number;
  progress: number;
  completed: boolean;
}

type ChallengeType =
  | 'complete_lessons'
  | 'practice_speaking'
  | 'maintain_streak'
  | 'earn_xp'
  | 'perfect_scores';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

interface Leaderboard {
  type: LeaderboardType;
  period: LeaderboardPeriod;
  entries: LeaderboardEntry[];
  userRank?: number;
  totalParticipants: number;
}

type LeaderboardType = 'xp' | 'streak' | 'weekly' | 'friends';
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'all_time';

// ==================== XP CONFIGURATION ====================

const XP_REWARDS = {
  // Learning activities
  complete_lesson: 50,
  perfect_lesson: 100,
  speaking_exercise: 30,
  listening_exercise: 25,
  grammar_exercise: 20,
  phrase_mastered: 40,

  // Engagement
  daily_login: 10,
  maintain_streak: 20,
  complete_daily_challenge: 100,
  complete_weekly_challenge: 500,

  // Social
  invite_friend: 200,
  help_other_user: 50,
  win_duel: 75,

  // Milestones
  reach_level: 500,
  unlock_achievement: 150,
};

const LEVEL_XP_FORMULA = (level: number): number => {
  // Exponential growth: level^2 * 100
  return level * level * 100;
};

const RANKS = [
  { name: 'Bronze', minLevel: 1, color: '#CD7F32' },
  { name: 'Silver', minLevel: 10, color: '#C0C0C0' },
  { name: 'Gold', minLevel: 25, color: '#FFD700' },
  { name: 'Platinum', minLevel: 50, color: '#E5E4E2' },
  { name: 'Diamond', minLevel: 75, color: '#B9F2FF' },
  { name: 'Master', minLevel: 100, color: '#FF6B6B' },
];

// ==================== GAMIFICATION SERVICE CLASS ====================

export class GamificationService {
  private cache: ReturnType<typeof getCacheService>;

  constructor() {
    this.cache = getCacheService();
  }

  // ==================== XP AND LEVELING ====================

  /**
   * Add XP to user
   */
  async addXP(
    userId: string,
    amount: number,
    source: string
  ): Promise<{
    newXP: number;
    leveledUp: boolean;
    newLevel?: number;
    rewards?: Reward[];
  }> {
    const gamification = await this.getUserGamification(userId);

    // Store old level for potential future use in level-up notifications
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const oldLevel = gamification.level;
    gamification.xp += amount;
    gamification.totalXP += amount;

    // Check for level up
    const leveledUp = gamification.xp >= gamification.xpToNextLevel;
    let rewards: Reward[] = [];

    if (leveledUp) {
      // Level up!
      gamification.level++;
      gamification.xp -= gamification.xpToNextLevel;
      gamification.xpToNextLevel = LEVEL_XP_FORMULA(gamification.level);

      // Grant level-up rewards
      rewards = this.getLevelUpRewards(gamification.level);
      await this.grantRewards(userId, rewards);

      // Check for rank promotion
      const newRank = this.calculateRank(gamification.level);
      if (newRank !== gamification.rank) {
        gamification.rank = newRank;
        // Grant rank promotion bonus
        rewards.push({ type: 'coins', amount: 1000 });
      }
    }

    // Save updated gamification
    await this.saveUserGamification(gamification);

    // Log XP event
    await this.logXPEvent(userId, amount, source);

    return {
      newXP: gamification.xp,
      leveledUp,
      newLevel: leveledUp ? gamification.level : undefined,
      rewards: leveledUp ? rewards : undefined,
    };
  }

  /**
   * Calculate user's rank based on level
   */
  private calculateRank(level: number): string {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (level >= RANKS[i].minLevel) {
        return RANKS[i].name;
      }
    }
    return RANKS[0].name;
  }

  /**
   * Get level-up rewards
   */
  private getLevelUpRewards(level: number): Reward[] {
    const rewards: Reward[] = [
      { type: 'coins', amount: level * 100 },
      { type: 'gems', amount: level * 10 },
    ];

    // Milestone rewards
    if (level % 10 === 0) {
      rewards.push({ type: 'gems', amount: 500 });
    }

    if (level % 25 === 0) {
      rewards.push({ type: 'badge', amount: 1, item: `level_${level}` });
    }

    return rewards;
  }

  // ==================== STREAKS ====================

  /**
   * Update user streak
   */
  async updateStreak(userId: string): Promise<{
    currentStreak: number;
    streakBroken: boolean;
    rewards?: Reward[];
  }> {
    const gamification = await this.getUserGamification(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastActive = new Date(gamification.lastActiveDate);
    lastActive.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
    );

    let streakBroken = false;
    let rewards: Reward[] = [];

    if (daysDiff === 0) {
      // Same day, no change
    } else if (daysDiff === 1) {
      // Consecutive day
      gamification.streak++;

      // Check for streak milestones
      if (gamification.streak > gamification.longestStreak) {
        gamification.longestStreak = gamification.streak;
      }

      // Streak rewards
      rewards = this.getStreakRewards(gamification.streak);
      if (rewards.length > 0) {
        await this.grantRewards(userId, rewards);
      }

      // Add streak XP
      await this.addXP(userId, XP_REWARDS.maintain_streak, 'streak');
    } else {
      // Streak broken
      streakBroken = true;
      gamification.streak = 1; // Start new streak
    }

    gamification.lastActiveDate = new Date();
    await this.saveUserGamification(gamification);

    return {
      currentStreak: gamification.streak,
      streakBroken,
      rewards: rewards.length > 0 ? rewards : undefined,
    };
  }

  /**
   * Get streak milestone rewards
   */
  private getStreakRewards(streak: number): Reward[] {
    const rewards: Reward[] = [];

    // Milestone rewards
    if (streak === 7) {
      rewards.push({ type: 'coins', amount: 500 });
      rewards.push({ type: 'badge', amount: 1, item: 'week_warrior' });
    } else if (streak === 30) {
      rewards.push({ type: 'gems', amount: 1000 });
      rewards.push({ type: 'badge', amount: 1, item: 'month_champion' });
    } else if (streak === 100) {
      rewards.push({ type: 'gems', amount: 5000 });
      rewards.push({ type: 'badge', amount: 1, item: 'streak_legend' });
    } else if (streak === 365) {
      rewards.push({ type: 'gems', amount: 10000 });
      rewards.push({ type: 'badge', amount: 1, item: 'year_master' });
    }

    return rewards;
  }

  // ==================== ACHIEVEMENTS ====================

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId: string): Promise<Achievement[]> {
    const allAchievements = await this.getAllAchievements();
    const gamification = await this.getUserGamification(userId);

    const unlockedAchievements: Achievement[] = [];

    for (const achievement of allAchievements) {
      const progress = gamification.achievements.find(
        (a) => a.achievementId === achievement.id
      );

      if (progress && progress.unlocked) {
        continue; // Already unlocked
      }

      // Check requirements
      const meetsRequirements = await this.checkRequirements(
        userId,
        achievement.requirements
      );

      if (meetsRequirements) {
        // Unlock achievement
        await this.unlockAchievement(userId, achievement);
        unlockedAchievements.push(achievement);
      }
    }

    return unlockedAchievements;
  }

  /**
   * Check if user meets achievement requirements
   */
  private async checkRequirements(
    userId: string,
    requirements: AchievementRequirement[]
  ): Promise<boolean> {
    const stats = await this.getUserStats(userId);

    for (const req of requirements) {
      const currentValue = this.getStatValue(stats, req.type);
      if (currentValue < req.value) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get stat value for requirement check
   */
  private getStatValue(stats: any, type: RequirementType): number {
    const map: Record<RequirementType, string> = {
      xp_earned: 'totalXP',
      lessons_completed: 'lessonsCompleted',
      days_streak: 'longestStreak',
      perfect_scores: 'perfectScores',
      speaking_hours: 'speakingHours',
      phrases_mastered: 'phrasesMastered',
      level_reached: 'level',
    };

    return stats[map[type]] || 0;
  }

  /**
   * Unlock achievement
   */
  private async unlockAchievement(
    userId: string,
    achievement: Achievement
  ): Promise<void> {
    const gamification = await this.getUserGamification(userId);

    // Add achievement progress
    const progressIndex = gamification.achievements.findIndex(
      (a) => a.achievementId === achievement.id
    );

    if (progressIndex >= 0) {
      gamification.achievements[progressIndex].unlocked = true;
      gamification.achievements[progressIndex].unlockedAt = new Date();
      gamification.achievements[progressIndex].progress = 100;
    } else {
      gamification.achievements.push({
        achievementId: achievement.id,
        progress: 100,
        unlocked: true,
        unlockedAt: new Date(),
      });
    }

    // Grant rewards
    await this.grantRewards(userId, achievement.rewards);

    // Add achievement unlock XP
    await this.addXP(userId, XP_REWARDS.unlock_achievement, 'achievement');

    await this.saveUserGamification(gamification);
  }

  // ==================== DAILY CHALLENGES ====================

  /**
   * Get or create daily challenge
   */
  async getDailyChallenge(userId: string): Promise<DailyChallenge> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const gamification = await this.getUserGamification(userId);

    // Check if current challenge is still valid
    if (gamification.dailyChallenge) {
      const challengeDate = new Date(gamification.dailyChallenge.date);
      challengeDate.setHours(0, 0, 0, 0);

      if (challengeDate.getTime() === today.getTime()) {
        return gamification.dailyChallenge;
      }
    }

    // Create new daily challenge
    const newChallenge = this.generateDailyChallenge(today);
    gamification.dailyChallenge = newChallenge;
    await this.saveUserGamification(gamification);

    return newChallenge;
  }

  /**
   * Generate daily challenge
   */
  private generateDailyChallenge(date: Date): DailyChallenge {
    const challenges: Omit<DailyChallenge, 'id' | 'date' | 'progress' | 'completed'>[] =
      [
        {
          type: 'complete_lessons',
          description: 'Complete 5 lessons',
          goal: 5,
          rewards: [
            { type: 'xp', amount: 100 },
            { type: 'coins', amount: 200 },
          ],
        },
        {
          type: 'practice_speaking',
          description: 'Practice 10 phrases with speaking',
          goal: 10,
          rewards: [
            { type: 'xp', amount: 150 },
            { type: 'gems', amount: 50 },
          ],
        },
        {
          type: 'earn_xp',
          description: 'Earn 500 XP',
          goal: 500,
          rewards: [{ type: 'coins', amount: 300 }],
        },
        {
          type: 'perfect_scores',
          description: 'Get 3 perfect scores',
          goal: 3,
          rewards: [
            { type: 'xp', amount: 200 },
            { type: 'gems', amount: 100 },
          ],
        },
      ];

    const challenge =
      challenges[Math.floor(Math.random() * challenges.length)];

    return {
      id: this.generateId(),
      date,
      ...challenge,
      progress: 0,
      completed: false,
    };
  }

  /**
   * Update daily challenge progress
   */
  async updateDailyChallengeProgress(
    userId: string,
    type: ChallengeType,
    amount: number
  ): Promise<{ completed: boolean; rewards?: Reward[] }> {
    const challenge = await this.getDailyChallenge(userId);

    if (challenge.type !== type || challenge.completed) {
      return { completed: false };
    }

    challenge.progress = Math.min(challenge.progress + amount, challenge.goal);

    if (challenge.progress >= challenge.goal && !challenge.completed) {
      challenge.completed = true;
      await this.grantRewards(userId, challenge.rewards);

      const gamification = await this.getUserGamification(userId);
      gamification.dailyChallenge = challenge;
      await this.saveUserGamification(gamification);

      return { completed: true, rewards: challenge.rewards };
    }

    const gamification = await this.getUserGamification(userId);
    gamification.dailyChallenge = challenge;
    await this.saveUserGamification(gamification);

    return { completed: false };
  }

  // ==================== LEADERBOARDS ====================

  /**
   * Get leaderboard
   */
  async getLeaderboard(
    type: LeaderboardType,
    period: LeaderboardPeriod,
    userId: string,
    _limit = 100
  ): Promise<Leaderboard> {
    const cacheKey = `leaderboard:${type}:${period}`;

    // Try cache first
    const cached = await this.cache.get<LeaderboardEntry[]>(cacheKey);
    if (cached) {
      return this.formatLeaderboard(cached, userId, type, period);
    }

    // Generate leaderboard (in production, query from database)
    const entries: LeaderboardEntry[] = [];

    // Cache leaderboard
    await this.cache.set(cacheKey, entries, { ttl: 300 }); // 5 minutes

    return this.formatLeaderboard(entries, userId, type, period);
  }

  /**
   * Format leaderboard with user rank
   */
  private formatLeaderboard(
    entries: LeaderboardEntry[],
    userId: string,
    type: LeaderboardType,
    period: LeaderboardPeriod
  ): Leaderboard {
    // Find user rank
    const userRank = entries.findIndex((e) => e.userId === userId) + 1;

    // Mark current user
    entries.forEach((entry) => {
      entry.isCurrentUser = entry.userId === userId;
    });

    return {
      type,
      period,
      entries,
      userRank: userRank > 0 ? userRank : undefined,
      totalParticipants: entries.length,
    };
  }

  // ==================== REWARDS ====================

  /**
   * Grant rewards to user
   */
  private async grantRewards(userId: string, rewards: Reward[]): Promise<void> {
    const gamification = await this.getUserGamification(userId);

    for (const reward of rewards) {
      switch (reward.type) {
        case 'xp':
          // XP already handled separately
          break;
        case 'coins':
          gamification.coins += reward.amount;
          break;
        case 'gems':
          gamification.gems += reward.amount;
          break;
        case 'badge':
          if (reward.item) {
            this.addBadge(gamification, reward.item);
          }
          break;
      }
    }

    await this.saveUserGamification(gamification);
  }

  /**
   * Add badge to user
   */
  private addBadge(gamification: UserGamification, badgeId: string): void {
    if (!gamification.badges.find((b) => b.id === badgeId)) {
      gamification.badges.push({
        id: badgeId,
        name: badgeId.replace(/_/g, ' ').toUpperCase(),
        icon: `/badges/${badgeId}.png`,
        color: '#FFD700',
        earnedAt: new Date(),
      });
    }
  }

  // ==================== DATA MANAGEMENT ====================

  /**
   * Get user gamification data
   */
  private async getUserGamification(
    userId: string
  ): Promise<UserGamification> {
    const cacheKey = `gamification:${userId}`;
    const cached = await this.cache.get<UserGamification>(cacheKey);

    if (cached) return cached;

    // Initialize new user gamification
    return this.initializeUserGamification(userId);
  }

  /**
   * Initialize new user gamification
   */
  private initializeUserGamification(userId: string): UserGamification {
    return {
      userId,
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_XP_FORMULA(1),
      totalXP: 0,
      rank: 'Bronze',
      streak: 0,
      longestStreak: 0,
      lastActiveDate: new Date(),
      coins: 0,
      gems: 0,
      achievements: [],
      badges: [],
    };
  }

  /**
   * Save user gamification data
   */
  private async saveUserGamification(
    gamification: UserGamification
  ): Promise<void> {
    const cacheKey = `gamification:${gamification.userId}`;
    await this.cache.set(cacheKey, gamification, { ttl: 3600 });

    // In production, also save to database
  }

  /**
   * Get user stats
   */
  private async getUserStats(_userId: string): Promise<any> {
    // In production, aggregate from database
    return {
      totalXP: 0,
      lessonsCompleted: 0,
      longestStreak: 0,
      perfectScores: 0,
      speakingHours: 0,
      phrasesMastered: 0,
      level: 1,
    };
  }

  /**
   * Get all achievements
   */
  private async getAllAchievements(): Promise<Achievement[]> {
    // In production, fetch from database
    return [];
  }

  /**
   * Log XP event
   */
  private async logXPEvent(
    userId: string,
    amount: number,
    source: string
  ): Promise<void> {
    // In production, log to analytics
    console.log(`User ${userId} earned ${amount} XP from ${source}`);
  }

  // ==================== UTILITIES ====================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== SINGLETON ====================

let gamificationServiceInstance: GamificationService | null = null;

export function getGamificationService(): GamificationService {
  if (!gamificationServiceInstance) {
    gamificationServiceInstance = new GamificationService();
  }
  return gamificationServiceInstance;
}

export default getGamificationService;
