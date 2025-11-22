import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { tokens } = useAuthStore.getState();
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { tokens, setTokens, logout } = useAuthStore.getState();

      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken,
          });

          const newTokens = response.data.data;
          setTokens(newTokens);

          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
          return api(originalRequest);
        } catch {
          logout();
          window.location.href = '/auth/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; name: string; acceptTerms: boolean }) =>
    api.post('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),

  logout: () =>
    api.post('/auth/logout'),

  getProfile: () =>
    api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),
};

// Gamification API
export const gamificationApi = {
  addXP: (userId: string, amount: number, source: string) =>
    api.post('/gamification/xp', { userId, amount, source }),

  getLeaderboard: (type: string, period: string, limit: number) =>
    api.get('/gamification/leaderboard', { params: { type, period, limit } }),

  getAchievements: (userId: string) =>
    api.get(`/gamification/achievements/${userId}`),

  updateStreak: (userId: string) =>
    api.post('/gamification/streak', { userId }),

  getDailyChallenge: (userId: string) =>
    api.get(`/gamification/daily-challenge/${userId}`),
};

// Speaking API
export const speakingApi = {
  analyze: (userId: string, phraseId: string, audioData: string, expectedText: string) =>
    api.post('/speaking/analyze', { userId, phraseId, audioData, expectedText }),

  trackProgress: (userId: string, analysis: object) =>
    api.post('/speaking/track-progress', { userId, analysis }),
};

// Listening API
export const listeningApi = {
  createSession: (userId: string, settings: { level: string; accent: string; speed: number }) =>
    api.post('/listening/session', { userId, ...settings }),

  submitAnswer: (sessionId: string, exerciseId: string, answer: string) =>
    api.post('/listening/submit', { sessionId, exerciseId, answer }),
};

// Grammar API
export const grammarApi = {
  correctText: (text: string) =>
    api.post('/grammar/correct', { text }),

  explainMistake: (mistake: string, context: string) =>
    api.post('/grammar/explain', { mistake, context }),

  generateExercises: (topic: string, type: string, level: string) =>
    api.post('/grammar/exercises', { topic, type, level }),
};

// Teachers API
export const teachersApi = {
  findTeachers: (studentId: string, limit: number) =>
    api.get('/teachers/find', { params: { studentId, limit } }),

  getSchedule: (teacherId: string, weekStart: string, weekEnd: string) =>
    api.get(`/teachers/${teacherId}/schedule`, { params: { weekStart, weekEnd } }),

  bookLesson: (teacherId: string, studentId: string, date: string, duration: number) =>
    api.post('/teachers/book', { teacherId, studentId, date, duration }),
};

// Placement API
export const placementApi = {
  startTest: (userId: string) =>
    api.post('/placement/start', { userId }),

  submitAnswer: (testId: string, questionId: string, answer: string) =>
    api.post('/placement/answer', { testId, questionId, answer }),

  getResult: (testId: string) =>
    api.get(`/placement/result/${testId}`),
};

export default api;
