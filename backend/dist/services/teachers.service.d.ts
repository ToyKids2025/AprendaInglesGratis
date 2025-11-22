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
    experience: number;
    hourlyRate: number;
    availability: Availability[];
    rating: number;
    totalReviews: number;
    totalLessons: number;
    responseTime: number;
    acceptanceRate: number;
    status: TeacherStatus;
    createdAt: Date;
}
type TeacherStatus = 'active' | 'inactive' | 'pending_approval' | 'suspended';
interface Language {
    code: string;
    name: string;
    level: 'native' | 'fluent' | 'intermediate';
}
type Specialization = 'business_english' | 'conversation' | 'exam_prep' | 'grammar' | 'pronunciation' | 'writing' | 'kids' | 'academic';
interface Certification {
    name: string;
    issuer: string;
    year: number;
    verified: boolean;
}
interface Availability {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone: string;
}
interface Lesson {
    id: string;
    teacherId: string;
    studentId: string;
    status: LessonStatus;
    scheduledAt: Date;
    duration: number;
    topic?: string;
    notes?: string;
    meetingUrl?: string;
    price: number;
    paymentStatus: PaymentStatus;
    completedAt?: Date;
    cancelledAt?: Date;
    cancellationReason?: string;
}
type LessonStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
type PaymentStatus = 'pending' | 'paid' | 'refunded';
interface LessonReview {
    id: string;
    lessonId: string;
    teacherId: string;
    studentId: string;
    rating: number;
    comment: string;
    helpful: number;
    createdAt: Date;
}
interface TeacherSearchFilters {
    specializations?: Specialization[];
    minRating?: number;
    maxRate?: number;
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
    matchScore: number;
    reasons: string[];
}
export declare class TeachersService {
    private cache;
    private openai;
    constructor();
    /**
     * Search teachers with filters
     */
    searchTeachers(filters: TeacherSearchFilters): Promise<{
        teachers: Teacher[];
        total: number;
        page: number;
    }>;
    /**
     * Sort teachers by criteria
     */
    private sortTeachers;
    /**
     * Find best matching teachers for student
     */
    findMatchingTeachers(studentId: string, limit?: number): Promise<TeacherMatch[]>;
    /**
     * Calculate match score between student and teacher
     */
    private calculateMatchScore;
    /**
     * Check if teacher has availability at specific time
     */
    private hasAvailability;
    /**
     * Book a lesson with teacher
     */
    bookLesson(studentId: string, teacherId: string, scheduledAt: Date, duration: number, topic?: string): Promise<Lesson>;
    /**
     * Check if teacher is available
     */
    private checkTeacherAvailability;
    /**
     * Create video meeting room
     */
    private createMeetingRoom;
    /**
     * Send lesson notifications
     */
    private sendLessonNotifications;
    /**
     * Cancel lesson
     */
    cancelLesson(lessonId: string, _userId: string, reason: string): Promise<Lesson>;
    /**
     * Complete lesson
     */
    completeLesson(lessonId: string): Promise<Lesson>;
    /**
     * Submit lesson review
     */
    submitReview(lessonId: string, studentId: string, rating: number, comment: string): Promise<LessonReview>;
    /**
     * Update teacher's overall rating
     */
    private updateTeacherRating;
    /**
     * Process lesson payment
     */
    private processPayment;
    /**
     * Refund lesson payment
     */
    private refundLesson;
    /**
     * Get teacher analytics
     */
    getTeacherAnalytics(teacherId: string): Promise<{
        totalLessons: number;
        totalEarnings: number;
        averageRating: number;
        completionRate: number;
        popularTimes: string[];
        studentRetention: number;
    }>;
    private getAllTeachers;
    private getTeacher;
    private saveTeacher;
    private getStudentProfile;
    private getLesson;
    private saveLesson;
    private getTeacherLessons;
    private saveReview;
    private getTeacherReviews;
    private generateId;
}
export declare function getTeachersService(): TeachersService;
export default getTeachersService;
//# sourceMappingURL=teachers.service.d.ts.map