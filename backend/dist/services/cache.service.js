"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheKeys = exports.CacheService = void 0;
exports.getCacheService = getCacheService;
const ioredis_1 = __importDefault(require("ioredis"));
const util_1 = require("util");
const zlib_1 = __importDefault(require("zlib"));
// Promisify compression functions
const gzip = (0, util_1.promisify)(zlib_1.default.gzip);
const gunzip = (0, util_1.promisify)(zlib_1.default.gunzip);
// ==================== CONFIGURATION ====================
const REDIS_CONFIG = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    maxRetriesPerRequest: 3,
};
const DEFAULT_TTL = 3600; // 1 hour
const COMPRESSION_THRESHOLD = 1024; // 1KB - compress items larger than this
const L1_CACHE_MAX_ITEMS = 1000; // Max items in memory cache
const L1_CACHE_MAX_SIZE = 50 * 1024 * 1024; // 50MB max memory cache size
// ==================== L1 CACHE (IN-MEMORY) ====================
class L1Cache {
    cache;
    size = 0;
    maxItems;
    maxSize;
    constructor(maxItems = L1_CACHE_MAX_ITEMS, maxSize = L1_CACHE_MAX_SIZE) {
        this.cache = new Map();
        this.maxItems = maxItems;
        this.maxSize = maxSize;
    }
    get(key) {
        const item = this.cache.get(key);
        if (!item)
            return null;
        // Check if expired
        const now = Date.now();
        if (now - item.cachedAt > item.ttl * 1000) {
            this.delete(key);
            return null;
        }
        return item.value;
    }
    set(key, value, ttl) {
        const size = this.estimateSize(value);
        // Evict if needed
        if (this.cache.size >= this.maxItems || this.size + size > this.maxSize) {
            this.evictLRU();
        }
        this.cache.set(key, {
            value,
            cachedAt: Date.now(),
            ttl,
        });
        this.size += size;
    }
    delete(key) {
        const item = this.cache.get(key);
        if (item) {
            this.size -= this.estimateSize(item.value);
            return this.cache.delete(key);
        }
        return false;
    }
    clear() {
        this.cache.clear();
        this.size = 0;
    }
    evictLRU() {
        // Simple LRU: remove oldest item
        const firstKey = this.cache.keys().next().value;
        if (firstKey) {
            this.delete(firstKey);
        }
    }
    estimateSize(value) {
        try {
            return JSON.stringify(value).length;
        }
        catch {
            return 1024; // Default estimate
        }
    }
    getStats() {
        return {
            items: this.cache.size,
            size: this.size,
        };
    }
}
// ==================== CACHE SERVICE CLASS ====================
class CacheService {
    redis;
    l1Cache;
    stats;
    isConnected = false;
    constructor() {
        this.redis = new ioredis_1.default(REDIS_CONFIG);
        this.l1Cache = new L1Cache();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            hitRate: 0,
        };
        this.setupRedisListeners();
    }
    // ==================== CONNECTION MANAGEMENT ====================
    setupRedisListeners() {
        this.redis.on('connect', () => {
            console.log('✅ Redis connected');
            this.isConnected = true;
        });
        this.redis.on('error', (error) => {
            console.error('❌ Redis error:', error);
            this.isConnected = false;
        });
        this.redis.on('close', () => {
            console.warn('⚠️  Redis connection closed');
            this.isConnected = false;
        });
    }
    async disconnect() {
        await this.redis.quit();
        this.isConnected = false;
    }
    // ==================== CORE CACHE METHODS ====================
    /**
     * Get value from cache (L1 -> L2)
     */
    async get(key, options = {}) {
        const fullKey = this.buildKey(key, options.namespace);
        // Try L1 cache first
        const l1Value = this.l1Cache.get(fullKey);
        if (l1Value !== null) {
            this.stats.hits++;
            this.updateHitRate();
            return l1Value;
        }
        // Try Redis (L2)
        if (!this.isConnected) {
            this.stats.misses++;
            return null;
        }
        try {
            const cached = await this.redis.get(fullKey);
            if (!cached) {
                this.stats.misses++;
                this.updateHitRate();
                return null;
            }
            // Decompress if needed
            const value = await this.deserialize(cached, options.compress);
            // Store in L1 cache
            const ttl = options.ttl || DEFAULT_TTL;
            this.l1Cache.set(fullKey, value, ttl);
            this.stats.hits++;
            this.updateHitRate();
            return value;
        }
        catch (error) {
            console.error('Cache get error:', error);
            this.stats.misses++;
            return null;
        }
    }
    /**
     * Set value in cache (L1 + L2)
     */
    async set(key, value, options = {}) {
        const fullKey = this.buildKey(key, options.namespace);
        const ttl = options.ttl || DEFAULT_TTL;
        // Store in L1
        this.l1Cache.set(fullKey, value, ttl);
        // Store in Redis (L2)
        if (!this.isConnected)
            return;
        try {
            const serialized = await this.serialize(value, options.compress);
            await this.redis.setex(fullKey, ttl, serialized);
            this.stats.sets++;
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    /**
     * Delete from cache (L1 + L2)
     */
    async delete(key, options = {}) {
        const fullKey = this.buildKey(key, options.namespace);
        // Delete from L1
        this.l1Cache.delete(fullKey);
        // Delete from Redis
        if (this.isConnected) {
            try {
                await this.redis.del(fullKey);
                this.stats.deletes++;
            }
            catch (error) {
                console.error('Cache delete error:', error);
            }
        }
    }
    /**
     * Get or Set pattern (cache-aside)
     */
    async getOrSet(key, factory, options = {}) {
        // Try to get from cache
        const cached = await this.get(key, options);
        if (cached !== null) {
            return cached;
        }
        // Not in cache, compute value
        const value = await factory();
        // Store in cache
        await this.set(key, value, options);
        return value;
    }
    // ==================== BATCH OPERATIONS ====================
    /**
     * Get multiple keys at once
     */
    async getMany(keys, options = {}) {
        const result = new Map();
        if (!this.isConnected)
            return result;
        try {
            const fullKeys = keys.map((k) => this.buildKey(k, options.namespace));
            const values = await this.redis.mget(...fullKeys);
            for (let i = 0; i < keys.length; i++) {
                if (values[i]) {
                    const deserialized = await this.deserialize(values[i], options.compress);
                    result.set(keys[i], deserialized);
                }
            }
        }
        catch (error) {
            console.error('Cache getMany error:', error);
        }
        return result;
    }
    /**
     * Set multiple keys at once
     */
    async setMany(items, options = {}) {
        if (!this.isConnected)
            return;
        const ttl = options.ttl || DEFAULT_TTL;
        const pipeline = this.redis.pipeline();
        for (const [key, value] of items) {
            const fullKey = this.buildKey(key, options.namespace);
            const serialized = await this.serialize(value, options.compress);
            pipeline.setex(fullKey, ttl, serialized);
        }
        try {
            await pipeline.exec();
            this.stats.sets += items.size;
        }
        catch (error) {
            console.error('Cache setMany error:', error);
        }
    }
    // ==================== PATTERN-BASED OPERATIONS ====================
    /**
     * Delete all keys matching pattern
     */
    async deletePattern(pattern, namespace) {
        if (!this.isConnected)
            return 0;
        const fullPattern = this.buildKey(pattern, namespace);
        try {
            const keys = await this.redis.keys(fullPattern);
            if (keys.length === 0)
                return 0;
            await this.redis.del(...keys);
            this.stats.deletes += keys.length;
            return keys.length;
        }
        catch (error) {
            console.error('Cache deletePattern error:', error);
            return 0;
        }
    }
    /**
     * Clear entire cache
     */
    async clear() {
        // Clear L1
        this.l1Cache.clear();
        // Clear Redis
        if (this.isConnected) {
            try {
                await this.redis.flushdb();
            }
            catch (error) {
                console.error('Cache clear error:', error);
            }
        }
    }
    // ==================== SERIALIZATION ====================
    async serialize(value, compress) {
        const json = JSON.stringify(value);
        // Compress if enabled and size exceeds threshold
        if (compress && json.length > COMPRESSION_THRESHOLD) {
            const compressed = await gzip(Buffer.from(json));
            return `gzip:${compressed.toString('base64')}`;
        }
        return json;
    }
    async deserialize(data, _compress) {
        // Check if compressed
        if (data.startsWith('gzip:')) {
            const compressed = Buffer.from(data.slice(5), 'base64');
            const decompressed = await gunzip(compressed);
            return JSON.parse(decompressed.toString());
        }
        return JSON.parse(data);
    }
    // ==================== UTILITIES ====================
    buildKey(key, namespace) {
        const prefix = namespace || 'app';
        return `${prefix}:${key}`;
    }
    updateHitRate() {
        const total = this.stats.hits + this.stats.misses;
        this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
    }
    /**
     * Get cache statistics
     */
    getStats() {
        return {
            ...this.stats,
            l1: this.l1Cache.getStats(),
        };
    }
    /**
     * Reset statistics
     */
    resetStats() {
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            hitRate: 0,
        };
    }
    // ==================== CACHE WARMING ====================
    /**
     * Pre-populate cache with frequently accessed data
     */
    async warm(data, options = {}) {
        await this.setMany(data, options);
    }
    // ==================== TTL MANAGEMENT ====================
    /**
     * Get remaining TTL for a key
     */
    async getTTL(key, namespace) {
        if (!this.isConnected)
            return -1;
        const fullKey = this.buildKey(key, namespace);
        try {
            return await this.redis.ttl(fullKey);
        }
        catch {
            return -1;
        }
    }
    /**
     * Extend TTL for a key
     */
    async extendTTL(key, seconds, namespace) {
        if (!this.isConnected)
            return false;
        const fullKey = this.buildKey(key, namespace);
        try {
            await this.redis.expire(fullKey, seconds);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.CacheService = CacheService;
// ==================== SINGLETON INSTANCE ====================
let cacheInstance = null;
function getCacheService() {
    if (!cacheInstance) {
        cacheInstance = new CacheService();
    }
    return cacheInstance;
}
// ==================== COMMONLY CACHED ITEMS ====================
exports.CacheKeys = {
    // User-related
    USER: (id) => `user:${id}`,
    USER_PROFILE: (id) => `user:${id}:profile`,
    USER_PROGRESS: (id) => `user:${id}:progress`,
    USER_ACHIEVEMENTS: (id) => `user:${id}:achievements`,
    USER_STATS: (id) => `user:${id}:stats`,
    // Lessons
    PHRASE: (id) => `phrase:${id}`,
    LESSON: (id) => `lesson:${id}`,
    CATEGORY: (slug) => `category:${slug}`,
    LEVEL: (id) => `level:${id}`,
    // Gamification
    LEADERBOARD: (type) => `leaderboard:${type}`,
    STREAK: (userId) => `streak:${userId}`,
    // Static data
    ALL_LEVELS: 'levels:all',
    ALL_CATEGORIES: 'categories:all',
    ALL_ACHIEVEMENTS: 'achievements:all',
};
exports.default = getCacheService;
//# sourceMappingURL=cache.service.js.map