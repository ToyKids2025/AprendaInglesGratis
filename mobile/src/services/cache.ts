/**
 * CACHE SERVICE
 * Offline data storage and synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage'

const CACHE_PREFIX = '@EnglishFlow:'
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

interface CacheItem<T> {
  data: T
  timestamp: number
  expiresAt: number
}

/**
 * Save data to cache
 */
export async function setCache<T>(key: string, data: T, ttl: number = CACHE_EXPIRY): Promise<void> {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    }
    await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheItem))
  } catch (error) {
    console.error('Cache set error:', error)
  }
}

/**
 * Get data from cache
 */
export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`)
    if (!cached) return null

    const cacheItem: CacheItem<T> = JSON.parse(cached)

    // Check if expired
    if (Date.now() > cacheItem.expiresAt) {
      await removeCache(key)
      return null
    }

    return cacheItem.data
  } catch (error) {
    console.error('Cache get error:', error)
    return null
  }
}

/**
 * Remove cache entry
 */
export async function removeCache(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`)
  } catch (error) {
    console.error('Cache remove error:', error)
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX))
    await AsyncStorage.multiRemove(cacheKeys)
  } catch (error) {
    console.error('Cache clear error:', error)
  }
}

/**
 * Cache phrases for offline use
 */
export async function cachePhrases(phrases: any[]): Promise<void> {
  await setCache('phrases', phrases, 7 * 24 * 60 * 60 * 1000) // 7 days
}

/**
 * Get cached phrases
 */
export async function getCachedPhrases(): Promise<any[] | null> {
  return await getCache<any[]>('phrases')
}

/**
 * Cache user progress
 */
export async function cacheProgress(progress: any): Promise<void> {
  await setCache('progress', progress, 1 * 60 * 60 * 1000) // 1 hour
}

/**
 * Get cached progress
 */
export async function getCachedProgress(): Promise<any | null> {
  return await getCache('progress')
}

/**
 * Cache daily goal
 */
export async function cacheDailyGoal(goal: any): Promise<void> {
  await setCache('daily_goal', goal, 1 * 60 * 60 * 1000) // 1 hour
}

/**
 * Get cached daily goal
 */
export async function getCachedDailyGoal(): Promise<any | null> {
  return await getCache('daily_goal')
}

/**
 * Save offline actions for later sync
 */
export async function saveOfflineAction(action: any): Promise<void> {
  try {
    const actionsJson = await AsyncStorage.getItem(`${CACHE_PREFIX}offline_actions`)
    const actions = actionsJson ? JSON.parse(actionsJson) : []
    actions.push({
      ...action,
      timestamp: Date.now(),
    })
    await AsyncStorage.setItem(`${CACHE_PREFIX}offline_actions`, JSON.stringify(actions))
  } catch (error) {
    console.error('Save offline action error:', error)
  }
}

/**
 * Get pending offline actions
 */
export async function getOfflineActions(): Promise<any[]> {
  try {
    const actionsJson = await AsyncStorage.getItem(`${CACHE_PREFIX}offline_actions`)
    return actionsJson ? JSON.parse(actionsJson) : []
  } catch (error) {
    console.error('Get offline actions error:', error)
    return []
  }
}

/**
 * Clear synced offline actions
 */
export async function clearOfflineActions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(`${CACHE_PREFIX}offline_actions`)
  } catch (error) {
    console.error('Clear offline actions error:', error)
  }
}

/**
 * Check if data is cached
 */
export async function isCached(key: string): Promise<boolean> {
  const data = await getCache(key)
  return data !== null
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX))
    let totalSize = 0

    for (const key of cacheKeys) {
      const data = await AsyncStorage.getItem(key)
      if (data) {
        totalSize += data.length
      }
    }

    return totalSize // bytes
  } catch (error) {
    console.error('Get cache size error:', error)
    return 0
  }
}

export default {
  setCache,
  getCache,
  removeCache,
  clearAllCache,
  cachePhrases,
  getCachedPhrases,
  cacheProgress,
  getCachedProgress,
  cacheDailyGoal,
  getCachedDailyGoal,
  saveOfflineAction,
  getOfflineActions,
  clearOfflineActions,
  isCached,
  getCacheSize,
}
