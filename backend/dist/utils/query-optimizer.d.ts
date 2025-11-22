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
/**
 * Generic DataLoader for batching and caching
 * Solves the N+1 query problem
 */
export declare class DataLoader<K, V> {
    private batchLoadFn;
    private cache;
    private batch;
    private options;
    constructor(batchLoadFn: (keys: K[]) => Promise<V[]>, options?: BatchLoadOptions);
    load(key: K): Promise<V>;
    loadMany(keys: K[]): Promise<V[]>;
    clear(key?: K): void;
}
export declare class QueryOptimizer {
    private prisma;
    private cache;
    private metrics;
    private slowQueryThreshold;
    constructor(prisma: PrismaClient);
    /**
     * Create a DataLoader for Prisma model
     */
    createLoader<T>(model: string, field?: string): DataLoader<string, T>;
    /**
     * User DataLoader
     */
    createUserLoader(): DataLoader<string, any>;
    /**
     * Phrase DataLoader
     */
    createPhraseLoader(): DataLoader<string, any>;
    /**
     * Eager load relationships to prevent N+1
     */
    withIncludes<T extends Record<string, any>>(query: T, includes: string[]): T;
    /**
     * Optimize findMany queries with cursor pagination
     */
    optimizedFindMany<T>(model: string, options: {
        where?: any;
        cursor?: string;
        take?: number;
        orderBy?: any;
        include?: any;
    }): Promise<T[]>;
    /**
     * Batch update optimization
     */
    batchUpdate(model: string, updates: Array<{
        id: string;
        data: any;
    }>): Promise<number>;
    /**
     * Batch delete optimization
     */
    batchDelete(model: string, ids: string[]): Promise<number>;
    /**
     * Analyze query and provide optimization suggestions
     */
    analyzeQuery(model: string, query: any): QuerySuggestion[];
    /**
     * Track query execution
     */
    private trackQuery;
    /**
     * Get query metrics
     */
    getMetrics(): QueryMetrics & {
        avgTime: number;
    };
    /**
     * Reset metrics
     */
    resetMetrics(): void;
    private hasRelations;
    private isInefficientWhereClause;
    private hasManyFields;
    /**
     * Suggest database indexes based on query patterns
     */
    suggestIndexes(): Array<{
        table: string;
        columns: string[];
        reason: string;
    }>;
}
/**
 * Pre-built optimized queries for common use cases
 */
export declare class CommonQueries {
    private prisma;
    private cache;
    constructor(prisma: PrismaClient);
    /**
     * Get user with full profile (optimized)
     */
    getUserProfile(userId: string): Promise<any>;
    /**
     * Get lesson with phrases (optimized)
     */
    getLessonWithPhrases(categorySlug: string): Promise<any>;
    /**
     * Get leaderboard (optimized with cursor pagination)
     */
    getLeaderboard(type: 'global' | 'friends', cursor?: string, take?: number): Promise<any[]>;
    /**
     * Get user progress with spaced repetition
     */
    getDueReviews(userId: string): Promise<any[]>;
}
export declare function getQueryOptimizer(prisma: PrismaClient): QueryOptimizer;
export declare function getCommonQueries(prisma: PrismaClient): CommonQueries;
export default getQueryOptimizer;
//# sourceMappingURL=query-optimizer.d.ts.map