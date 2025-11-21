/**
 * TEACHERS 1-ON-1 SERVICE - AprendaInglesGratis
 *
 * Teacher marketplace and 1-on-1 lesson booking system
 *
 * Features:
 * - Teacher profiles with ratings and reviews
 * - Intelligent matching algorithm
 * - Real-time availability management
 * - Lesson booking and scheduling
 * - Video conferencing integration (Daily.co/Zoom)
 * - Payment processing (Stripe)
 * - Review and rating system
 * - Lesson history and analytics
 * - Automated reminders
 *
 * @module TeachersService
 * @version 1.0.0
 */

import { getCacheService } from './cache.service';
import OpenAI from 'openai';

// ==================== TYPES ====================

interface Teacher {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  bio: string;
  headline: string;
  languages: Language[];
  specializations: Specialization[];
  certifications: Certification[];
  experience: number; // years
  hourlyRate: number; // in cents
  availability: Availability[];
  rating: number; // 0-5
  totalReviews: number;
  totalLessons: number;
  responseTime: number; // avg in minutes
  acceptanceRate: number; // 0-100
  status: TeacherStatus;
  createdAt: Date;
}

type TeacherStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';

interface Language {
  code: string; // ISO 639-1
  name: string;
  level: 'native' | 'fluent' | 'intermediate';
}

type Specialization =
  | 'business_english'
  | 'conversation'
  | 'exam_prep'
  | 'grammar'
  | 'pronunciation'
  | 'writing'
  | 'kids'
  | 'academic';

interface Certification {
  name: string;
  issuer: string;
  year: number;
  verified: boolean;
}

interface Availability {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:MM format
  endTime: string;
  timezone: string;
}

interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  status: LessonStatus;
  scheduledAt: Date;
  duration: number; // minutes
  topic?: string;
  notes?: string;
  meetingUrl?: string;
  price: number; // in cents
  paymentStatus: PaymentStatus;
  completedAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

type LessonStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

type PaymentStatus = 'pending' | 'paid' | 'refunded';

interface LessonReview {
  id: string;
  lessonId: string;
  teacherId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  helpful: number; // upvotes
  createdAt: Date;
}

interface TeacherSearchFilters {
  specializations?: Specialization[];
  minRating?: number;
  maxRate?: number; // hourly rate in cents
  languages?: string[];
  availability?: {
    day: number;
    time: string;
  };
  sortBy?: 'rating' | 'price' | 'experience' | 'popularity';
  page?: number;
  limit?: number;
}

interface TeacherMatch {
  teacher: Teacher;
  matchScore: number; // 0-100
  reasons: string[];
}

// ==================== TEACHERS SERVICE CLASS ====================

export class TeachersService {
  private cache: ReturnType<typeof getCacheService>;
  private openai: OpenAI;

  constructor() {
    this.cache = getCacheService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ==================== TEACHER SEARCH ====================

  /**
   * Search teachers with filters
   */
  async searchTeachers(
    filters: TeacherSearchFilters
  ): Promise<{
    teachers: Teacher[];
    total: number;
    page: number;
  }> {
    // Build cache key
    const cacheKey = `teachers:search:${JSON.stringify(filters)}`;
    const cached = await this.cache.get<any>(cacheKey);

    if (cached) return cached;

    // In production, query database with filters
    let teachers = await this.getAllTeachers();

    // Apply filters
    if (filters.specializations) {
      teachers = teachers.filter((t) =>
        t.specializations.some((s) =>
          filters.specializations!.includes(s)
        )
      );
    }

    if (filters.minRating) {
      teachers = teachers.filter((t) => t.rating >= filters.minRating!);
    }

    if (filters.maxRate) {
      teachers = teachers.filter((t) => t.hourlyRate <= filters.maxRate!);
    }

    // Sort
    teachers = this.sortTeachers(teachers, filters.sortBy || 'rating');

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const start = (page - 1) * limit;
    const paginatedTeachers = teachers.slice(start, start + limit);

    const result = {
      teachers: paginatedTeachers,
      total: teachers.length,
      page,
    };

    // Cache results
    await this.cache.set(cacheKey, result, { ttl: 300 }); // 5 minutes

    return result;
  }

  /**
   * Sort teachers by criteria
   */
  private sortTeachers(
    teachers: Teacher[],
    sortBy: string
  ): Teacher[] {
    const sorted = [...teachers];

    switch (sortBy) {
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        sorted.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case 'experience':
        sorted.sort((a, b) => b.experience - a.experience);
        break;
      case 'popularity':
        sorted.sort((a, b) => b.totalLessons - a.totalLessons);
        break;
    }

    return sorted;
  }

  // ==================== INTELLIGENT MATCHING ====================

  /**
   * Find best matching teachers for student
   */
  async findMatchingTeachers(
    studentId: string,
    limit: number = 5
  ): Promise<TeacherMatch[]> {
    // Get student preferences and learning history
    const studentProfile = await this.getStudentProfile(studentId);
    const allTeachers = await this.getAllTeachers();

    // Calculate match score for each teacher
    const matches: TeacherMatch[] = allTeachers.map((teacher) => {
      const { score, reasons } = this.calculateMatchScore(
        studentProfile,
        teacher
      );

      return {
        teacher,
        matchScore: score,
        reasons,
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, limit);
  }

  /**
   * Calculate match score between student and teacher
   */
  private calculateMatchScore(
    student: any,
    teacher: Teacher
  ): {
    score: number;
    reasons: string[];
  } {
    let score = 0;
    const reasons: string[] = [];

    // Specialization match (30 points)
    if (student.goals) {
      const matchingSpecs = teacher.specializations.filter((s) =>
        student.goals.includes(s)
      );

      if (matchingSpecs.length > 0) {
        score += 30;
        reasons.push(
          `Specializes in ${matchingSpecs.join(', ')}`
        );
      }
    }

    // Rating (25 points)
    score += teacher.rating * 5;
    if (teacher.rating >= 4.5) {
      reasons.push('Highly rated by students');
    }

    // Experience (20 points)
    if (teacher.experience >= 5) {
      score += 20;
      reasons.push(`${teacher.experience}+ years of experience`);
    } else if (teacher.experience >= 2) {
      score += 10;
    }

    // Availability match (15 points)
    if (student.preferredTime && this.hasAvailability(teacher, student.preferredTime)) {
      score += 15;
      reasons.push('Available at your preferred time');
    }

    // Language match (10 points)
    if (student.nativeLanguage) {
      const speaksNativeLanguage = teacher.languages.some(
        (l) => l.code === student.nativeLanguage
      );

      if (speaksNativeLanguage) {
        score += 10;
        reasons.push(`Speaks ${student.nativeLanguage}`);
      }
    }

    return { score, reasons };
  }

  /**
   * Check if teacher has availability at specific time
   */
  private hasAvailability(teacher: Teacher, preferredTime: any): boolean {
    // Simplified: In production, check actual availability slots
    return teacher.availability.length > 0;
  }

  // ==================== LESSON BOOKING ====================

  /**
   * Book a lesson with teacher
   */
  async bookLesson(
    studentId: string,
    teacherId: string,
    scheduledAt: Date,
    duration: number,
    topic?: string
  ): Promise<Lesson> {
    // Validate teacher availability
    const isAvailable = await this.checkTeacherAvailability(
      teacherId,
      scheduledAt,
      duration
    );

    if (!isAvailable) {
      throw new Error('Teacher is not available at this time');
    }

    // Get teacher for pricing
    const teacher = await this.getTeacher(teacherId);
    const price = (teacher.hourlyRate * duration) / 60; // Price for duration

    // Create lesson
    const lesson: Lesson = {
      id: this.generateId(),
      teacherId,
      studentId,
      status: 'pending',
      scheduledAt,
      duration,
      topic,
      price,
      paymentStatus: 'pending',
    };

    // In production, save to database
    await this.saveLesson(lesson);

    // Create meeting room
    lesson.meetingUrl = await this.createMeetingRoom(lesson);

    // Send notifications
    await this.sendLessonNotifications(lesson);

    return lesson;
  }

  /**
   * Check if teacher is available
   */
  private async checkTeacherAvailability(
    teacherId: string,
    scheduledAt: Date,
    duration: number
  ): Promise<boolean> {
    // In production, check against existing bookings
    const existingLessons = await this.getTeacherLessons(teacherId);

    const endTime = new Date(scheduledAt.getTime() + duration * 60000);

    for (const lesson of existingLessons) {
      const lessonEnd = new Date(
        lesson.scheduledAt.getTime() + lesson.duration * 60000
      );

      // Check for overlap
      if (
        (scheduledAt >= lesson.scheduledAt && scheduledAt < lessonEnd) ||
        (endTime > lesson.scheduledAt && endTime <= lessonEnd)
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Create video meeting room
   */
  private async createMeetingRoom(lesson: Lesson): Promise<string> {
    // Integration with Daily.co or Zoom
    // For now, return placeholder
    return `https://meet.aprendaingles.com/lesson-${lesson.id}`;
  }

  /**
   * Send lesson notifications
   */
  private async sendLessonNotifications(lesson: Lesson): Promise<void> {
    // In production, send emails/push notifications
    console.log(`Sending notifications for lesson ${lesson.id}`);
  }

  // ==================== LESSON MANAGEMENT ====================

  /**
   * Cancel lesson
   */
  async cancelLesson(
    lessonId: string,
    userId: string,
    reason: string
  ): Promise<Lesson> {
    const lesson = await this.getLesson(lessonId);

    // Check cancellation policy (24 hours before)
    const hoursUntilLesson =
      (lesson.scheduledAt.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursUntilLesson < 24) {
      // Late cancellation - no refund
      lesson.paymentStatus = 'paid';
    } else {
      // Can refund
      if (lesson.paymentStatus === 'paid') {
        await this.refundLesson(lesson);
        lesson.paymentStatus = 'refunded';
      }
    }

    lesson.status = 'cancelled';
    lesson.cancelledAt = new Date();
    lesson.cancellationReason = reason;

    await this.saveLesson(lesson);

    return lesson;
  }

  /**
   * Complete lesson
   */
  async completeLesson(lessonId: string): Promise<Lesson> {
    const lesson = await this.getLesson(lessonId);

    lesson.status = 'completed';
    lesson.completedAt = new Date();

    // Process payment if not yet paid
    if (lesson.paymentStatus === 'pending') {
      await this.processPayment(lesson);
      lesson.paymentStatus = 'paid';
    }

    await this.saveLesson(lesson);

    return lesson;
  }

  // ==================== REVIEWS AND RATINGS ====================

  /**
   * Submit lesson review
   */
  async submitReview(
    lessonId: string,
    studentId: string,
    rating: number,
    comment: string
  ): Promise<LessonReview> {
    const lesson = await this.getLesson(lessonId);

    // Validate student can review
    if (lesson.studentId !== studentId) {
      throw new Error('Only the student can review this lesson');
    }

    if (lesson.status !== 'completed') {
      throw new Error('Can only review completed lessons');
    }

    const review: LessonReview = {
      id: this.generateId(),
      lessonId,
      teacherId: lesson.teacherId,
      studentId,
      rating,
      comment,
      helpful: 0,
      createdAt: new Date(),
    };

    // Save review
    await this.saveReview(review);

    // Update teacher rating
    await this.updateTeacherRating(lesson.teacherId);

    return review;
  }

  /**
   * Update teacher's overall rating
   */
  private async updateTeacherRating(teacherId: string): Promise<void> {
    const reviews = await this.getTeacherReviews(teacherId);

    if (reviews.length === 0) return;

    const avgRating =
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    // Update teacher
    const teacher = await this.getTeacher(teacherId);
    teacher.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    teacher.totalReviews = reviews.length;

    await this.saveTeacher(teacher);
  }

  // ==================== PAYMENT PROCESSING ====================

  /**
   * Process lesson payment
   */
  private async processPayment(lesson: Lesson): Promise<void> {
    // Integration with Stripe
    // For now, just log
    console.log(`Processing payment for lesson ${lesson.id}: $${lesson.price / 100}`);
  }

  /**
   * Refund lesson payment
   */
  private async refundLesson(lesson: Lesson): Promise<void> {
    // Integration with Stripe refunds
    console.log(`Refunding lesson ${lesson.id}: $${lesson.price / 100}`);
  }

  // ==================== ANALYTICS ====================

  /**
   * Get teacher analytics
   */
  async getTeacherAnalytics(teacherId: string): Promise<{
    totalLessons: number;
    totalEarnings: number;
    averageRating: number;
    completionRate: number;
    popularTimes: string[];
    studentRetention: number;
  }> {
    const lessons = await this.getTeacherLessons(teacherId);
    const reviews = await this.getTeacherReviews(teacherId);

    const completedLessons = lessons.filter(
      (l) => l.status === 'completed'
    );

    const totalEarnings = completedLessons.reduce(
      (sum, l) => sum + l.price,
      0
    );

    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const completionRate =
      lessons.length > 0
        ? (completedLessons.length / lessons.length) * 100
        : 0;

    return {
      totalLessons: lessons.length,
      totalEarnings,
      averageRating: avgRating,
      completionRate,
      popularTimes: [], // Calculate from lesson times
      studentRetention: 0, // Calculate from repeat students
    };
  }

  // ==================== DATA MANAGEMENT ====================

  private async getAllTeachers(): Promise<Teacher[]> {
    // In production, fetch from database
    return [];
  }

  private async getTeacher(teacherId: string): Promise<Teacher> {
    // In production, fetch from database
    throw new Error('Teacher not found');
  }

  private async saveTeacher(teacher: Teacher): Promise<void> {
    // In production, save to database
  }

  private async getStudentProfile(studentId: string): Promise<any> {
    // In production, fetch student preferences and history
    return {
      goals: ['conversation', 'business_english'],
      nativeLanguage: 'pt',
      preferredTime: null,
    };
  }

  private async getLesson(lessonId: string): Promise<Lesson> {
    // In production, fetch from database
    throw new Error('Lesson not found');
  }

  private async saveLesson(lesson: Lesson): Promise<void> {
    // In production, save to database
    await this.cache.set(`lesson:${lesson.id}`, lesson, { ttl: 3600 });
  }

  private async getTeacherLessons(teacherId: string): Promise<Lesson[]> {
    // In production, query from database
    return [];
  }

  private async saveReview(review: LessonReview): Promise<void> {
    // In production, save to database
  }

  private async getTeacherReviews(
    teacherId: string
  ): Promise<LessonReview[]> {
    // In production, query from database
    return [];
  }

  // ==================== UTILITIES ====================

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ==================== SINGLETON ====================

let teachersServiceInstance: TeachersService | null = null;

export function getTeachersService(): TeachersService {
  if (!teachersServiceInstance) {
    teachersServiceInstance = new TeachersService();
  }
  return teachersServiceInstance;
}

export default getTeachersService;
