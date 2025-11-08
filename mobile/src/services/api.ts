/**
 * API SERVICE
 * Mobile app API client
 */

import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const API_URL = process.env.API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor - Add auth token
 */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor - Handle errors
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - logout
      await AsyncStorage.removeItem('auth_token')
      // TODO: Navigate to login screen
    }
    return Promise.reject(error)
  }
)

/**
 * Authentication
 */
export const auth = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  register: async (email: string, password: string, name: string) => {
    const response = await api.post('/api/auth/register', { email, password, name })
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token)
    }
    return response.data
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token')
  },
}

/**
 * Phrases
 */
export const phrases = {
  getDailyPhrases: () => api.get('/api/phrases/daily'),
  getPhraseById: (id: string) => api.get(`/api/phrases/${id}`),
  reviewPhrase: (id: string, mastery: number) =>
    api.post(`/api/phrases/${id}/review`, { mastery }),
}

/**
 * Progress
 */
export const progress = {
  getProgress: () => api.get('/api/progress'),
  getStats: () => api.get('/api/progress/stats'),
}

/**
 * Achievements
 */
export const achievements = {
  getAchievements: () => api.get('/api/achievements'),
  getAvailable: () => api.get('/api/achievements/available'),
}

/**
 * Social
 */
export const social = {
  getFriends: () => api.get('/api/social/friends'),
  getLeaderboard: (type: string = 'xp') =>
    api.get('/api/social/leaderboard', { params: { type } }),
  sendFriendRequest: (friendId: string) =>
    api.post(`/api/social/friends/request/${friendId}`),
}

/**
 * Gamification
 */
export const gamification = {
  getChallenges: () => api.get('/api/gamification/challenges'),
  joinChallenge: (id: string) => api.post(`/api/gamification/challenges/${id}/join`),
  getDailyGoal: () => api.get('/api/gamification/daily-goal'),
}

export { api }
export default {
  auth,
  phrases,
  progress,
  achievements,
  social,
  gamification,
}
