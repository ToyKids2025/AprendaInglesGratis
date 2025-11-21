/**
 * QUERY OPTIMIZER - AprendaInglesGratis
 *
 * Database query optimization utilities to prevent N+1 problems,
 * optimize Prisma queries, and ensure efficient data access patterns
 *
 * Features:
 * - N+1 query detection
 * - Automatic query batching (DataLoader pattern)
 * - Query analysis and suggestions
 * - Eager loading helpers
 * - Query performance monitoring
 * - Index suggestions
 *
 * @module QueryOptimizer
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import { getCacheService, CacheKeys } from '../services/cache.service';

// ==================== TYPES ====================

interface QueryMetrics {
  queryCount: number;
  totalTime: number;
  slowQueries: Array<{
    query: string;
    duration: number;
    timestamp: Date;
  }>;
}

interface BatchLoadOptions {
  cache?: boolean;
  cacheTTL?: number;
}

interface QuerySuggestion {
  query: string;
  issue: string;
  suggestion: string;
  impact: 'high' | 'medium' | 'low';
}

// ==================== DATALOADER IMPLEMENTATION ====================

/**
 * Generic DataLoader for batching and caching
 * Solves the N+1 query problem
 */
export class DataLoader<K, V> {
  private batchLoadFn: (keys: K[]) => Promise<V[]>;
  private cache: Map<string, V>;
  private batch: Map<string, Promise<V>>;
  private options: BatchLoadOptions;

  constructor(
    batchLoadFn: (keys: K[]) => Promise<V[]>,
    options: BatchLoadOptions = {}
  ) {
    this.batchLoadFn = batchLoadFn;
    this.cache = new Map();
    this.batch = new Map();
    this.options = {
      cache: options.cache !== false,
      cacheTTL: options.cacheTTL || 300, // 5 minutes default
    };
  }

  async load(key: K): Promise<V> {
    const cacheKey = JSON.stringify(key);

    // Check cache first
    if (this.options.cache && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    // Check if already in current batch
    if (this.batch.has(cacheKey)) {
      return this.batch.get(cacheKey)!;
    }

    // Create promise for this key
    const promise = new Promise<V>((resolve, reject) => {
      // Schedule batch execution
      process.nextTick(async () => {
        try {
          const batchKeys = Array.from(this.batch.keys()).map((k) =>
            JSON.parse(k)
          );
          const results = await this.batchLoadFn(batchKeys);

          // Distribute results
          batchKeys.forEach((k, index) => {
            const key = JSON.stringify(k);
            const value = results[index];

            if (this.options.cache) {
              this.cache.set(key, value);
            }
          });

          resolve(this.cache.get(cacheKey)!);
          this.batch.clear();
        } catch (error) {
          reject(error);
        }
      });
    });

    this.batch.set(cacheKey, promise);
    return promise;
  }

  async loadMany(keys: K[]): Promise<V[]> {
    return Promise.all(keys.map((k) => this.load(k)));
  }

  clear(key?: K): void {
    if (key) {
      const cacheKey = JSON.stringify(key);
      this.cache.delete(cacheKey);
    } else {
      this.cache.clear();
    }
  }
}

// ==================== QUERY OPTIMIZER CLASS ====================

export class QueryOptimizer {
  private prisma: PrismaClient;
  private cache: ReturnType<typeof getCacheService>;
  private metrics: QueryMetrics;
  private slowQueryThreshold: number = 1000; // 1 second

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cache = getCacheService();
    this.metrics = {
      queryCount: 0,
      totalTime: 0,
      slowQueries: [],
    };
  }

  // ==================== BATCH LOADERS ====================

  /**
   * Create a DataLoader for Prisma model
   */
  createLoader<T>(
    model: string,
    field: string = 'id'
  ): DataLoader<string, T> {
    return new DataLoader<string, T>(async (ids) => {
      const records = await (this.prisma as any)[model].findMany({
        where: {
          [field]: { in: ids },
        },
      });

      // Ensure order matches input
      const recordMap = new Map(records.map((r: any) => [r[field], r]));
      return ids.map((id) => recordMap.get(id));
    });
  }

  // ==================== COMMON LOADERS ====================

  /**
   * User DataLoader
   */
  createUserLoader(): DataLoader<string, any> {
    return new DataLoader(async (userIds: string[]) => {
      // Try cache first
      const cacheKey = CacheKeys.USER;
      const cached = await this.cache.getMany(
        userIds.map(cacheKey),
        { namespace: 'users' }
      );

      const uncachedIds = userIds.filter(
        (id) => !cached.has(cacheKey(id))
      );

      // Fetch uncached users
      if (uncachedIds.length > 0) {
        const users = await this.prisma.user.findMany({
          where: { id: { in: uncachedIds } },
          select: {
            id: true,
            email: true,
            name: true,
            level: true,
            xp: true,
            streak: true,
          },
        });

        // Cache users
        const cacheMap = new Map(
          users.map((u) => [cacheKey(u.id), u])
        );
        await this.cache.setMany(cacheMap, {
          namespace: 'users',
          ttl: 3600,
        });

        // Merge with cached
        users.forEach((u) => cached.set(cacheKey(u.id), u));
      }

      // Return in original order
      return userIds.map((id) => cached.get(cacheKey(id))!);
    });
  }

  /**
   * Phrase DataLoader
   */
  createPhraseLoader(): DataLoader<string, any> {
    return new DataLoader(async (phraseIds: string[]) => {
      const cacheKey = CacheKeys.PHRASE;
      const cached = await this.cache.getMany(
        phraseIds.map(cacheKey),
        { namespace: 'phrases' }
      );

      const uncachedIds = phraseIds.filter(
        (id) => !cached.has(cacheKey(id))
      );

      if (uncachedIds.length > 0) {
        const phrases = await this.prisma.phrase.findMany({
          where: { id: { in: uncachedIds } },
          include: {
            level: true,
            category: true,
          },
        });

        const cacheMap = new Map(
          phrases.map((p) => [cacheKey(p.id), p])
        );
        await this.cache.setMany(cacheMap, {
          namespace: 'phrases',
          ttl: 7200, // 2 hours
        });

        phrases.forEach((p) => cached.set(cacheKey(p.id), p));
      }

      return phraseIds.map((id) => cached.get(cacheKey(id))!);
    });
  }

  // ==================== QUERY OPTIMIZATION HELPERS ====================

  /**
   * Eager load relationships to prevent N+1
   */
  withIncludes<T extends Record<string, any>>(
    query: T,
    includes: string[]
  ): T {
    const includeObj: Record<string, boolean> = {};
    includes.forEach((inc) => {
      includeObj[inc] = true;
    });

    return {
      ...query,
      include: includeObj,
    };
  }

  /**
   * Optimize findMany queries with cursor pagination
   */
  async optimizedFindMany<T>(
    model: string,
    options: {
      where?: any;
      cursor?: string;
      take?: number;
      orderBy?: any;
      include?: any;
    }
  ): Promise<T[]> {
    const startTime = Date.now();

    const query: any = {
      where: options.where,
      take: options.take || 20,
      orderBy: options.orderBy || { createdAt: 'desc' },
    };

    if (options.cursor) {
      query.skip = 1;
      query.cursor = { id: options.cursor };
    }

    if (options.include) {
      query.include = options.include;
    }

    const results = await (this.prisma as any)[model].findMany(query);

    this.trackQuery(model, Date.now() - startTime);

    return results;
  }

  /**
   * Batch update optimization
   */
  async batchUpdate(
    model: string,
    updates: Array<{ id: string; data: any }>
  ): Promise<number> {
    const transaction = updates.map((update) =>
      (this.prisma as any)[model].update({
        where: { id: update.id },
        data: update.data,
      })
    );

    const results = await this.prisma.$transaction(transaction);

    return results.length;
  }

  /**
   * Batch delete optimization
   */
  async batchDelete(model: string, ids: string[]): Promise<number> {
    const result = await (this.prisma as any)[model].deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return result.count;
  }

  // ==================== QUERY ANALYSIS ====================

  /**
   * Analyze query and provide optimization suggestions
   */
  analyzeQuery(
    model: string,
    query: any
  ): QuerySuggestion[] {
    const suggestions: QuerySuggestion[] = [];

    // Check for missing includes (potential N+1)
    if (!query.include && this.hasRelations(model)) {
      suggestions.push({
        query: JSON.stringify(query),
        issue: 'Missing includes for related data',
        suggestion: 'Add include clause to prevent N+1 queries',
        impact: 'high',
      });
    }

    // Check for inefficient where clauses
    if (query.where && this.isInefficient WhereClause(query.where)) {
      suggestions.push({
        query: JSON.stringify(query),
        issue: 'Inefficient where clause',
        suggestion: 'Use indexed fields in where clause',
        impact: 'medium',
      });
    }

    // Check for missing pagination
    if (!query.take && !query.cursor) {
      suggestions.push({
        query: JSON.stringify(query),
        issue: 'No pagination',
        suggestion: 'Add cursor or offset pagination',
        impact: 'medium',
      });
    }

    // Check for SELECT *
    if (!query.select && this.hasMany Fields(model)) {
      suggestions.push({
        query: JSON.stringify(query),
        issue: 'Selecting all fields',
        suggestion: 'Select only needed fields',
        impact: 'low',
      });
    }

    return suggestions;
  }

  /**
   * Track query execution
   */
  private trackQuery(model: string, duration: number): void {
    this.metrics.queryCount++;
    this.metrics.totalTime += duration;

    if (duration > this.slowQueryThreshold) {
      this.metrics.slowQueries.push({
        query: model,
        duration,
        timestamp: new Date(),
      });

      console.warn(
        `⚠️  Slow query detected: ${model} took ${duration}ms`
      );
    }
  }

  /**
   * Get query metrics
   */
  getMetrics(): QueryMetrics & { avgTime: number } {
    return {
      ...this.metrics,
      avgTime:
        this.metrics.queryCount > 0
          ? this.metrics.totalTime / this.metrics.queryCount
          : 0,
    };
  }

  /**
   * Reset metrics
   */
  resetMetrics(): void {
    this.metrics = {
      queryCount: 0,
      totalTime: 0,
      slowQueries: [],
    };
  }

  // ==================== HELPER METHODS ====================

  private hasRelations(model: string): boolean {
    // Simplified: In real app, check Prisma schema
    const modelsWithRelations = ['user', 'phrase', 'lesson'];
    return modelsWithRelations.includes(model.toLowerCase());
  }

  private isInefficientWhereClause(where: any): boolean {
    // Check for contains/startsWith without index
    if (where.contains || where.startsWith) return true;

    // Check for OR with many conditions
    if (where.OR && where.OR.length > 5) return true;

    return false;
  }

  private hasManyFields(model: string): boolean {
    // Simplified: In real app, check Prisma schema
    return true;
  }

  // ==================== INDEX SUGGESTIONS ====================

  /**
   * Suggest database indexes based on query patterns
   */
  suggestIndexes(): Array<{ table: string; columns: string[]; reason: string }> {
    return [
      {
        table: 'user_progress',
        columns: ['userId', 'nextReview'],
        reason: 'Frequent queries for spaced repetition',
      },
      {
        table: 'phrases',
        columns: ['levelId', 'categoryId'],
        reason: 'Filtered by level and category often',
      },
      {
        table: 'users',
        columns: ['xp'],
        reason: 'Leaderboard queries order by XP',
      },
      {
        table: 'user_progress',
        columns: ['userId', 'mastery'],
        reason: 'Progress tracking queries',
      },
    ];
  }
}

// ==================== COMMON QUERY PATTERNS ====================

/**
 * Pre-built optimized queries for common use cases
 */
export class CommonQueries {
  private prisma: PrismaClient;
  private cache: ReturnType<typeof getCacheService>;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.cache = getCacheService();
  }

  /**
   * Get user with full profile (optimized)
   */
  async getUserProfile(userId: string): Promise<any> {
    return this.cache.getOrSet(
      CacheKeys.USER_PROFILE(userId),
      async () => {
        return this.prisma.user.findUnique({
          where: { id: userId },
          include: {
            progress: {
              where: { mastery: { gte: 3 } },
              take: 10,
              orderBy: { lastPracticed: 'desc' },
            },
            achievements: {
              include: {
                achievement: true,
              },
              orderBy: { unlockedAt: 'desc' },
            },
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        });
      },
      { ttl: 600 } // 10 minutes
    );
  }

  /**
   * Get lesson with phrases (optimized)
   */
  async getLessonWithPhrases(categorySlug: string): Promise<any> {
    return this.cache.getOrSet(
      CacheKeys.CATEGORY(categorySlug),
      async () => {
        return this.prisma.category.findUnique({
          where: { slug: categorySlug },
          include: {
            phrases: {
              include: {
                level: true,
              },
              orderBy: { difficulty: 'asc' },
            },
          },
        });
      },
      { ttl: 3600 } // 1 hour
    );
  }

  /**
   * Get leaderboard (optimized with cursor pagination)
   */
  async getLeaderboard(
    type: 'global' | 'friends',
    cursor?: string,
    take = 20
  ): Promise<any[]> {
    const cacheKey = `${CacheKeys.LEADERBOARD(type)}:${cursor || 'first'}`;

    return this.cache.getOrSet(
      cacheKey,
      async () => {
        const query: any = {
          take,
          orderBy: { xp: 'desc' },
          select: {
            id: true,
            name: true,
            level: true,
            xp: true,
            streak: true,
          },
        };

        if (cursor) {
          query.skip = 1;
          query.cursor = { id: cursor };
        }

        return this.prisma.user.findMany(query);
      },
      { ttl: 300 } // 5 minutes
    );
  }

  /**
   * Get user progress with spaced repetition
   */
  async getDueReviews(userId: string): Promise<any[]> {
    const now = new Date();

    return this.prisma.userProgress.findMany({
      where: {
        userId,
        nextReview: {
          lte: now,
        },
      },
      include: {
        phrase: {
          include: {
            level: true,
            category: true,
          },
        },
      },
      orderBy: {
        nextReview: 'asc',
      },
      take: 20, // Limit to 20 reviews per session
    });
  }
}

// ==================== SINGLETON INSTANCES ====================

let optimizerInstance: QueryOptimizer | null = null;
let commonQueriesInstance: CommonQueries | null = null;

export function getQueryOptimizer(prisma: PrismaClient): QueryOptimizer {
  if (!optimizerInstance) {
    optimizerInstance = new QueryOptimizer(prisma);
  }
  return optimizerInstance;
}

export function getCommonQueries(prisma: PrismaClient): CommonQueries {
  if (!commonQueriesInstance) {
    commonQueriesInstance = new CommonQueries(prisma);
  }
  return commonQueriesInstance;
}

export default getQueryOptimizer;
