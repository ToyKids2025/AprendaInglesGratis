"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonQueries = exports.QueryOptimizer = exports.DataLoader = void 0;
exports.getQueryOptimizer = getQueryOptimizer;
exports.getCommonQueries = getCommonQueries;
const cache_service_1 = require("../services/cache.service");
// ==================== DATALOADER IMPLEMENTATION ====================
/**
 * Generic DataLoader for batching and caching
 * Solves the N+1 query problem
 */
class DataLoader {
    batchLoadFn;
    cache;
    batch;
    options;
    constructor(batchLoadFn, options = {}) {
        this.batchLoadFn = batchLoadFn;
        this.cache = new Map();
        this.batch = new Map();
        this.options = {
            cache: options.cache !== false,
            cacheTTL: options.cacheTTL || 300, // 5 minutes default
        };
    }
    async load(key) {
        const cacheKey = JSON.stringify(key);
        // Check cache first
        if (this.options.cache && this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        // Check if already in current batch
        if (this.batch.has(cacheKey)) {
            return this.batch.get(cacheKey);
        }
        // Create promise for this key
        const promise = new Promise((resolve, reject) => {
            // Schedule batch execution
            process.nextTick(async () => {
                try {
                    const batchKeys = Array.from(this.batch.keys()).map((k) => JSON.parse(k));
                    const results = await this.batchLoadFn(batchKeys);
                    // Distribute results
                    batchKeys.forEach((k, index) => {
                        const key = JSON.stringify(k);
                        const value = results[index];
                        if (this.options.cache) {
                            this.cache.set(key, value);
                        }
                    });
                    resolve(this.cache.get(cacheKey));
                    this.batch.clear();
                }
                catch (error) {
                    reject(error);
                }
            });
        });
        this.batch.set(cacheKey, promise);
        return promise;
    }
    async loadMany(keys) {
        return Promise.all(keys.map((k) => this.load(k)));
    }
    clear(key) {
        if (key) {
            const cacheKey = JSON.stringify(key);
            this.cache.delete(cacheKey);
        }
        else {
            this.cache.clear();
        }
    }
}
exports.DataLoader = DataLoader;
// ==================== QUERY OPTIMIZER CLASS ====================
class QueryOptimizer {
    prisma;
    cache;
    metrics;
    slowQueryThreshold = 1000; // 1 second
    constructor(prisma) {
        this.prisma = prisma;
        this.cache = (0, cache_service_1.getCacheService)();
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
    createLoader(model, field = 'id') {
        return new DataLoader(async (ids) => {
            const records = await this.prisma[model].findMany({
                where: {
                    [field]: { in: ids },
                },
            });
            // Ensure order matches input
            const recordMap = new Map(records.map((r) => [r[field], r]));
            return ids.map((id) => recordMap.get(id));
        });
    }
    // ==================== COMMON LOADERS ====================
    /**
     * User DataLoader
     */
    createUserLoader() {
        return new DataLoader(async (userIds) => {
            // Try cache first
            const cacheKey = cache_service_1.CacheKeys.USER;
            const cached = await this.cache.getMany(userIds.map(cacheKey), { namespace: 'users' });
            const uncachedIds = userIds.filter((id) => !cached.has(cacheKey(id)));
            // Fetch uncached users
            if (uncachedIds.length > 0) {
                const users = await this.prisma.user.findMany({
                    where: { id: { in: uncachedIds } },
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        level: true,
                        gamification: {
                            select: {
                                xp: true,
                                streak: true,
                            },
                        },
                    },
                });
                // Cache users
                const cacheMap = new Map(users.map((u) => [cacheKey(u.id), u]));
                await this.cache.setMany(cacheMap, {
                    namespace: 'users',
                    ttl: 3600,
                });
                // Merge with cached
                users.forEach((u) => cached.set(cacheKey(u.id), u));
            }
            // Return in original order
            return userIds.map((id) => cached.get(cacheKey(id)));
        });
    }
    /**
     * Phrase DataLoader
     */
    createPhraseLoader() {
        return new DataLoader(async (phraseIds) => {
            const cacheKey = cache_service_1.CacheKeys.PHRASE;
            const cached = await this.cache.getMany(phraseIds.map(cacheKey), { namespace: 'phrases' });
            const uncachedIds = phraseIds.filter((id) => !cached.has(cacheKey(id)));
            if (uncachedIds.length > 0) {
                const phrases = await this.prisma.phrase.findMany({
                    where: { id: { in: uncachedIds } },
                    include: {
                        level: true,
                        category: true,
                    },
                });
                const cacheMap = new Map(phrases.map((p) => [cacheKey(p.id), p]));
                await this.cache.setMany(cacheMap, {
                    namespace: 'phrases',
                    ttl: 7200, // 2 hours
                });
                phrases.forEach((p) => cached.set(cacheKey(p.id), p));
            }
            return phraseIds.map((id) => cached.get(cacheKey(id)));
        });
    }
    // ==================== QUERY OPTIMIZATION HELPERS ====================
    /**
     * Eager load relationships to prevent N+1
     */
    withIncludes(query, includes) {
        const includeObj = {};
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
    async optimizedFindMany(model, options) {
        const startTime = Date.now();
        const query = {
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
        const results = await this.prisma[model].findMany(query);
        this.trackQuery(model, Date.now() - startTime);
        return results;
    }
    /**
     * Batch update optimization
     */
    async batchUpdate(model, updates) {
        const transaction = updates.map((update) => this.prisma[model].update({
            where: { id: update.id },
            data: update.data,
        }));
        const results = await this.prisma.$transaction(transaction);
        return results.length;
    }
    /**
     * Batch delete optimization
     */
    async batchDelete(model, ids) {
        const result = await this.prisma[model].deleteMany({
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
    analyzeQuery(model, query) {
        const suggestions = [];
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
        if (query.where && this.isInefficientWhereClause(query.where)) {
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
        if (!query.select && this.hasManyFields(model)) {
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
    trackQuery(model, duration) {
        this.metrics.queryCount++;
        this.metrics.totalTime += duration;
        if (duration > this.slowQueryThreshold) {
            this.metrics.slowQueries.push({
                query: model,
                duration,
                timestamp: new Date(),
            });
            console.warn(`⚠️  Slow query detected: ${model} took ${duration}ms`);
        }
    }
    /**
     * Get query metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            avgTime: this.metrics.queryCount > 0
                ? this.metrics.totalTime / this.metrics.queryCount
                : 0,
        };
    }
    /**
     * Reset metrics
     */
    resetMetrics() {
        this.metrics = {
            queryCount: 0,
            totalTime: 0,
            slowQueries: [],
        };
    }
    // ==================== HELPER METHODS ====================
    hasRelations(model) {
        // Simplified: In real app, check Prisma schema
        const modelsWithRelations = ['user', 'phrase', 'lesson'];
        return modelsWithRelations.includes(model.toLowerCase());
    }
    isInefficientWhereClause(where) {
        // Check for contains/startsWith without index
        if (where.contains || where.startsWith)
            return true;
        // Check for OR with many conditions
        if (where.OR && where.OR.length > 5)
            return true;
        return false;
    }
    hasManyFields(_model) {
        // Simplified: In real app, check Prisma schema
        return true;
    }
    // ==================== INDEX SUGGESTIONS ====================
    /**
     * Suggest database indexes based on query patterns
     */
    suggestIndexes() {
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
exports.QueryOptimizer = QueryOptimizer;
// ==================== COMMON QUERY PATTERNS ====================
/**
 * Pre-built optimized queries for common use cases
 */
class CommonQueries {
    prisma;
    cache;
    constructor(prisma) {
        this.prisma = prisma;
        this.cache = (0, cache_service_1.getCacheService)();
    }
    /**
     * Get user with full profile (optimized)
     */
    async getUserProfile(userId) {
        return this.cache.getOrSet(cache_service_1.CacheKeys.USER_PROFILE(userId), async () => {
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
                    gamification: true,
                },
            });
        }, { ttl: 600 } // 10 minutes
        );
    }
    /**
     * Get lesson with phrases (optimized)
     */
    async getLessonWithPhrases(categorySlug) {
        return this.cache.getOrSet(cache_service_1.CacheKeys.CATEGORY(categorySlug), async () => {
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
        }, { ttl: 3600 } // 1 hour
        );
    }
    /**
     * Get leaderboard (optimized with cursor pagination)
     */
    async getLeaderboard(type, cursor, take = 20) {
        const cacheKey = `${cache_service_1.CacheKeys.LEADERBOARD(type)}:${cursor || 'first'}`;
        return this.cache.getOrSet(cacheKey, async () => {
            const query = {
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
        }, { ttl: 300 } // 5 minutes
        );
    }
    /**
     * Get user progress with spaced repetition
     */
    async getDueReviews(userId) {
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
exports.CommonQueries = CommonQueries;
// ==================== SINGLETON INSTANCES ====================
let optimizerInstance = null;
let commonQueriesInstance = null;
function getQueryOptimizer(prisma) {
    if (!optimizerInstance) {
        optimizerInstance = new QueryOptimizer(prisma);
    }
    return optimizerInstance;
}
function getCommonQueries(prisma) {
    if (!commonQueriesInstance) {
        commonQueriesInstance = new CommonQueries(prisma);
    }
    return commonQueriesInstance;
}
exports.default = getQueryOptimizer;
//# sourceMappingURL=query-optimizer.js.map