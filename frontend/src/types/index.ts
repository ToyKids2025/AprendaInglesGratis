// ==================== USER TYPES ====================

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  level: CEFRLevel;
  subscriptionStatus: SubscriptionStatus;
}

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type SubscriptionStatus = 'free' | 'premium' | 'vip';

// ==================== AUTH TYPES ====================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  acceptTerms: boolean;
}

// ==================== GAMIFICATION TYPES ====================

export interface Gamification {
  userId: string;
  xp: number;
  level: number;
  xpToNextLevel: number;
  coins: number;
  gems: number;
  streak: number;
  maxStreak: number;
  rank: Rank;
}

export type Rank = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  xpReward: number;
  coinsReward: number;
  gemsReward: number;
  requirement: number;
  isSecret: boolean;
}

export type AchievementCategory = 'streak' | 'pronunciation' | 'listening' | 'completion' | 'social';

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: Date;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  level: number;
  xp: number;
  streak: number;
  isCurrentUser: boolean;
}

export interface DailyChallenge {
  id: string;
  type: string;
  description: string;
  goal: number;
  progress: number;
  rewards: Reward[];
  completed: boolean;
}

export interface Reward {
  type: 'xp' | 'coins' | 'gems';
  amount: number;
}

// ==================== LEARNING TYPES ====================

export interface Phrase {
  id: string;
  text: string;
  translation: string;
  audioUrl?: string;
  level: CEFRLevel;
  category: string;
  difficulty: number;
  ipaTranscription?: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  level: CEFRLevel;
  duration: string;
  phrases: Phrase[];
  completed: boolean;
  progress?: number;
  score?: number;
}

export interface UserProgress {
  phraseId: string;
  mastery: number;
  attempts: number;
  successes: number;
  lastScore: number;
  bestScore: number;
  nextReview: Date;
}

// ==================== SPEAKING TYPES ====================

export interface PronunciationAnalysis {
  overallScore: number;
  accuracy: number;
  fluency: number;
  completeness: number;
  prosody: number;
  transcription: string;
  feedback: PronunciationFeedback;
  mistakes: Mistake[];
}

export interface PronunciationFeedback {
  general: string;
  tips: string[];
  encouragement: string;
}

export interface Mistake {
  word: string;
  expected: string;
  actual: string;
  type: 'pronunciation' | 'missing' | 'extra';
  suggestion: string;
}

// ==================== LISTENING TYPES ====================

export interface ListeningSession {
  id: string;
  type: ListeningType;
  accent: Accent;
  speed: number;
  exercises: ListeningExercise[];
  score?: number;
}

export type ListeningType = 'dictation' | 'comprehension' | 'fill-blanks' | 'multiple-choice';
export type Accent = 'US' | 'UK' | 'AU' | 'CA' | 'IN';

export interface ListeningExercise {
  id: string;
  audioUrl: string;
  question?: string;
  options?: string[];
  answer: string;
  userAnswer?: string;
  correct?: boolean;
}

// ==================== TEACHER TYPES ====================

export interface Teacher {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  certifications: string[];
  specializations: string[];
  languages: string[];
  rating: number;
  totalLessons: number;
  experience: number;
  hourlyRate: number;
  timezone: string;
  availability: WeeklySchedule;
}

export interface WeeklySchedule {
  [day: string]: string[];
}

export interface TeacherLesson {
  id: string;
  teacherId: string;
  studentId: string;
  scheduledAt: Date;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingUrl?: string;
  price: number;
}

// ==================== API RESPONSE TYPES ====================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
