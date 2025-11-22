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
type AchievementCategory = 'learning' | 'social' | 'streak' | 'mastery' | 'speed' | 'collection';
type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
interface AchievementRequirement {
    type: RequirementType;
    value: number;
    current?: number;
}
type RequirementType = 'xp_earned' | 'lessons_completed' | 'days_streak' | 'perfect_scores' | 'speaking_hours' | 'phrases_mastered' | 'level_reached';
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
type ChallengeType = 'complete_lessons' | 'practice_speaking' | 'maintain_streak' | 'earn_xp' | 'perfect_scores';
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
export declare class GamificationService {
    private cache;
    constructor();
    /**
     * Add XP to user
     */
    addXP(userId: string, amount: number, source: string): Promise<{
        newXP: number;
        leveledUp: boolean;
        newLevel?: number;
        rewards?: Reward[];
    }>;
    /**
     * Calculate user's rank based on level
     */
    private calculateRank;
    /**
     * Get level-up rewards
     */
    private getLevelUpRewards;
    /**
     * Update user streak
     */
    updateStreak(userId: string): Promise<{
        currentStreak: number;
        streakBroken: boolean;
        rewards?: Reward[];
    }>;
    /**
     * Get streak milestone rewards
     */
    private getStreakRewards;
    /**
     * Check and unlock achievements
     */
    checkAchievements(userId: string): Promise<Achievement[]>;
    /**
     * Check if user meets achievement requirements
     */
    private checkRequirements;
    /**
     * Get stat value for requirement check
     */
    private getStatValue;
    /**
     * Unlock achievement
     */
    private unlockAchievement;
    /**
     * Get or create daily challenge
     */
    getDailyChallenge(userId: string): Promise<DailyChallenge>;
    /**
     * Generate daily challenge
     */
    private generateDailyChallenge;
    /**
     * Update daily challenge progress
     */
    updateDailyChallengeProgress(userId: string, type: ChallengeType, amount: number): Promise<{
        completed: boolean;
        rewards?: Reward[];
    }>;
    /**
     * Get leaderboard
     */
    getLeaderboard(type: LeaderboardType, period: LeaderboardPeriod, userId: string, _limit?: number): Promise<Leaderboard>;
    /**
     * Format leaderboard with user rank
     */
    private formatLeaderboard;
    /**
     * Grant rewards to user
     */
    private grantRewards;
    /**
     * Add badge to user
     */
    private addBadge;
    /**
     * Get user gamification data
     */
    private getUserGamification;
    /**
     * Initialize new user gamification
     */
    private initializeUserGamification;
    /**
     * Save user gamification data
     */
    private saveUserGamification;
    /**
     * Get user stats
     */
    private getUserStats;
    /**
     * Get all achievements
     */
    private getAllAchievements;
    /**
     * Log XP event
     */
    private logXPEvent;
    private generateId;
}
export declare function getGamificationService(): GamificationService;
export default getGamificationService;
//# sourceMappingURL=gamification.service.d.ts.map