/**
 * CACHE SERVICE
 * In-memory caching with TTL for improved performance
 * For production, consider Redis or Memcached
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private cleanupInterval: NodeJS.Timeout

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanup()
    }, 5 * 60 * 1000)
  }

  /**
   * Get value from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  /**
   * Set value in cache
   */
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + ttlSeconds * 1000

    this.cache.set(key, {
      data,
      expiresAt,
    })
  }

  /**
   * Delete value from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  /**
   * Delete multiple keys matching pattern
   */
  deletePattern(pattern: string): number {
    let count = 0
    const regex = new RegExp(pattern)

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
        count++
      }
    }

    return count
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    let cleaned = 0

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key)
        cleaned++
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`)
    }
  }

  /**
   * Get or set value (lazy loading)
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    // Try to get from cache
    const cached = this.get<T>(key)
    if (cached !== null) {
      return cached
    }

    // Fetch data
    const data = await fetcher()

    // Store in cache
    this.set(key, data, ttlSeconds)

    return data
  }

  /**
   * Stop cleanup interval
   */
  destroy(): void {
    clearInterval(this.cleanupInterval)
    this.clear()
  }
}

// Create singleton instance
export const cache = new CacheService()

/**
 * Cache key generators for common patterns
 */
export const cacheKeys = {
  user: (userId: string) => `user:${userId}`,
  userProgress: (userId: string) => `progress:${userId}`,
  category: (categoryId: number) => `category:${categoryId}`,
  level: (levelId: number) => `level:${levelId}`,
  phrase: (phraseId: number) => `phrase:${phraseId}`,
  leaderboard: (limit: number) => `leaderboard:${limit}`,
  analytics: (days: number) => `analytics:${days}`,
  categories: () => 'categories:all',
  levels: () => 'levels:all',
}

/**
 * Cache TTL presets (in seconds)
 */
export const cacheTTL = {
  short: 60, // 1 minute
  medium: 300, // 5 minutes
  long: 900, // 15 minutes
  hour: 3600, // 1 hour
  day: 86400, // 24 hours
}

/**
 * Invalidate cache patterns
 */
export const invalidateCache = {
  user: (userId: string) => {
    cache.deletePattern(`user:${userId}*`)
    cache.deletePattern(`progress:${userId}*`)
  },
  category: (categoryId: number) => {
    cache.delete(cacheKeys.category(categoryId))
    cache.delete(cacheKeys.categories())
  },
  phrase: (categoryId?: number) => {
    if (categoryId) {
      cache.delete(cacheKeys.category(categoryId))
    }
    cache.deletePattern('phrase:*')
  },
  leaderboard: () => {
    cache.deletePattern('leaderboard:*')
  },
  analytics: () => {
    cache.deletePattern('analytics:*')
  },
}

export default {
  cache,
  cacheKeys,
  cacheTTL,
  invalidateCache,
}
