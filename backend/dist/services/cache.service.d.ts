/**
 * CACHE SERVICE - AprendaInglesGratis
 *
 * Multi-layer caching system for optimal performance
 *
 * Features:
 * - In-memory cache (L1)
 * - Redis distributed cache (L2)
 * - Intelligent cache invalidation
 * - Cache warming
 * - Compression for large objects
 * - TTL management
 * - Cache statistics
 *
 * @module CacheService
 * @version 1.0.0
 */
interface CacheOptions {
    ttl?: number;
    compress?: boolean;
    namespace?: string;
}
interface CacheStats {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    hitRate: number;
}
export declare class CacheService {
    private redis;
    private l1Cache;
    private stats;
    private isConnected;
    constructor();
    private setupRedisListeners;
    disconnect(): Promise<void>;
    /**
     * Get value from cache (L1 -> L2)
     */
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    /**
     * Set value in cache (L1 + L2)
     */
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    /**
     * Delete from cache (L1 + L2)
     */
    delete(key: string, options?: CacheOptions): Promise<void>;
    /**
     * Get or Set pattern (cache-aside)
     */
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    /**
     * Get multiple keys at once
     */
    getMany<T>(keys: string[], options?: CacheOptions): Promise<Map<string, T>>;
    /**
     * Set multiple keys at once
     */
    setMany<T>(items: Map<string, T>, options?: CacheOptions): Promise<void>;
    /**
     * Delete all keys matching pattern
     */
    deletePattern(pattern: string, namespace?: string): Promise<number>;
    /**
     * Clear entire cache
     */
    clear(): Promise<void>;
    private serialize;
    private deserialize;
    private buildKey;
    private updateHitRate;
    /**
     * Get cache statistics
     */
    getStats(): CacheStats & {
        l1: {
            items: number;
            size: number;
        };
    };
    /**
     * Reset statistics
     */
    resetStats(): void;
    /**
     * Pre-populate cache with frequently accessed data
     */
    warm(data: Map<string, any>, options?: CacheOptions): Promise<void>;
    /**
     * Get remaining TTL for a key
     */
    getTTL(key: string, namespace?: string): Promise<number>;
    /**
     * Extend TTL for a key
     */
    extendTTL(key: string, seconds: number, namespace?: string): Promise<boolean>;
}
export declare function getCacheService(): CacheService;
export declare const CacheKeys: {
    USER: (id: string) => string;
    USER_PROFILE: (id: string) => string;
    USER_PROGRESS: (id: string) => string;
    USER_ACHIEVEMENTS: (id: string) => string;
    USER_STATS: (id: string) => string;
    PHRASE: (id: string) => string;
    LESSON: (id: string) => string;
    CATEGORY: (slug: string) => string;
    LEVEL: (id: string) => string;
    LEADERBOARD: (type: string) => string;
    STREAK: (userId: string) => string;
    ALL_LEVELS: string;
    ALL_CATEGORIES: string;
    ALL_ACHIEVEMENTS: string;
};
export default getCacheService;
//# sourceMappingURL=cache.service.d.ts.map