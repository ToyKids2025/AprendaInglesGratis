/**
 * VALIDATION MIDDLEWARE - AprendaInglesGratis
 *
 * Comprehensive input validation, sanitization, and security middleware
 *
 * Features:
 * - Zod schema validation
 * - XSS protection
 * - SQL injection prevention
 * - Rate limiting
 * - CSRF protection
 * - Request sanitization
 * - File upload validation
 * - Custom validators
 *
 * @module ValidationMiddleware
 * @version 1.0.0
 */
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { z } from 'zod';
type ValidationType = 'body' | 'query' | 'params' | 'headers';
/**
 * Common Zod schemas for reuse
 */
export declare const CommonSchemas: {
    email: z.ZodString;
    password: z.ZodString;
    uuid: z.ZodString;
    objectId: z.ZodString;
    url: z.ZodString;
    phone: z.ZodString;
    pagination: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
    }>;
    cursorPagination: z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        cursor?: string | undefined;
    }, {
        cursor?: string | undefined;
        limit?: number | undefined;
    }>;
    dateRange: z.ZodObject<{
        startDate: z.ZodDate;
        endDate: z.ZodDate;
    }, "strip", z.ZodTypeAny, {
        startDate: Date;
        endDate: Date;
    }, {
        startDate: Date;
        endDate: Date;
    }>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    languageCode: z.ZodEnum<["en", "pt", "es", "fr", "de"]>;
    cefrLevel: z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>;
};
/**
 * Validation schemas for API endpoints
 */
export declare const ValidationSchemas: {
    register: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
        acceptTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
        name: string;
        acceptTerms: boolean;
    }, {
        email: string;
        password: string;
        name: string;
        acceptTerms: boolean;
    }>;
    login: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
        password: string;
    }, {
        email: string;
        password: string;
    }>;
    refreshToken: z.ZodObject<{
        refreshToken: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        refreshToken: string;
    }, {
        refreshToken: string;
    }>;
    resetPassword: z.ZodObject<{
        email: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        email: string;
    }, {
        email: string;
    }>;
    changePassword: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        currentPassword: string;
        newPassword: string;
    }, {
        currentPassword: string;
        newPassword: string;
    }>;
    updateProfile: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        bio: z.ZodOptional<z.ZodString>;
        avatar: z.ZodOptional<z.ZodString>;
        language: z.ZodOptional<z.ZodEnum<["en", "pt", "es", "fr", "de"]>>;
    }, "strip", z.ZodTypeAny, {
        name?: string | undefined;
        avatar?: string | undefined;
        bio?: string | undefined;
        language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
    }, {
        name?: string | undefined;
        avatar?: string | undefined;
        bio?: string | undefined;
        language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
    }>;
    updateSettings: z.ZodObject<{
        emailNotifications: z.ZodOptional<z.ZodBoolean>;
        pushNotifications: z.ZodOptional<z.ZodBoolean>;
        weeklyReport: z.ZodOptional<z.ZodBoolean>;
        dailyReminder: z.ZodOptional<z.ZodBoolean>;
        reminderTime: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        weeklyReport?: boolean | undefined;
        dailyReminder?: boolean | undefined;
        reminderTime?: string | undefined;
    }, {
        emailNotifications?: boolean | undefined;
        pushNotifications?: boolean | undefined;
        weeklyReport?: boolean | undefined;
        dailyReminder?: boolean | undefined;
        reminderTime?: string | undefined;
    }>;
    getLessons: z.ZodObject<{
        cursor: z.ZodOptional<z.ZodString>;
        limit: z.ZodDefault<z.ZodNumber>;
        levelId: z.ZodOptional<z.ZodString>;
        categoryId: z.ZodOptional<z.ZodString>;
        difficulty: z.ZodOptional<z.ZodEnum<["EASY", "MEDIUM", "HARD"]>>;
    }, "strip", z.ZodTypeAny, {
        limit: number;
        cursor?: string | undefined;
        levelId?: string | undefined;
        categoryId?: string | undefined;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }, {
        cursor?: string | undefined;
        limit?: number | undefined;
        levelId?: string | undefined;
        categoryId?: string | undefined;
        difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
    }>;
    submitProgress: z.ZodObject<{
        phraseId: z.ZodString;
        mastery: z.ZodNumber;
        timeSpent: z.ZodNumber;
        isCorrect: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        phraseId: string;
        mastery: number;
        timeSpent: number;
        isCorrect: boolean;
    }, {
        phraseId: string;
        mastery: number;
        timeSpent: number;
        isCorrect: boolean;
    }>;
    analyzePronunciation: z.ZodObject<{
        phraseId: z.ZodString;
        audioData: z.ZodString;
        duration: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        phraseId: string;
        audioData: string;
        duration: number;
    }, {
        phraseId: string;
        audioData: string;
        duration: number;
    }>;
    speakingSession: z.ZodObject<{
        phraseIds: z.ZodArray<z.ZodString, "many">;
        mode: z.ZodEnum<["practice", "test", "challenge"]>;
    }, "strip", z.ZodTypeAny, {
        phraseIds: string[];
        mode: "practice" | "test" | "challenge";
    }, {
        phraseIds: string[];
        mode: "practice" | "test" | "challenge";
    }>;
    submitListeningAnswer: z.ZodObject<{
        phraseId: z.ZodString;
        userAnswer: z.ZodString;
        audioSpeed: z.ZodDefault<z.ZodNumber>;
        attempts: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        phraseId: string;
        userAnswer: string;
        audioSpeed: number;
        attempts: number;
    }, {
        phraseId: string;
        userAnswer: string;
        attempts: number;
        audioSpeed?: number | undefined;
    }>;
    listeningSession: z.ZodObject<{
        level: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>>;
        category: z.ZodOptional<z.ZodString>;
        duration: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
        category?: string | undefined;
    }, {
        level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
        category?: string | undefined;
        duration?: number | undefined;
    }>;
    startPlacementTest: z.ZodObject<{
        previousLevel: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>>;
    }, "strip", z.ZodTypeAny, {
        previousLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
    }, {
        previousLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
    }>;
    submitPlacementAnswer: z.ZodObject<{
        questionId: z.ZodString;
        answer: z.ZodString;
        timeSpent: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        timeSpent: number;
        questionId: string;
        answer: string;
    }, {
        timeSpent: number;
        questionId: string;
        answer: string;
    }>;
    searchTeachers: z.ZodObject<{
        page: z.ZodDefault<z.ZodNumber>;
        limit: z.ZodDefault<z.ZodNumber>;
        specialization: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        priceMin: z.ZodOptional<z.ZodNumber>;
        priceMax: z.ZodOptional<z.ZodNumber>;
        availability: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "night"]>>;
        language: z.ZodOptional<z.ZodEnum<["en", "pt", "es", "fr", "de"]>>;
        rating: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        page: number;
        limit: number;
        language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
        specialization?: string[] | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        availability?: "morning" | "afternoon" | "evening" | "night" | undefined;
        rating?: number | undefined;
    }, {
        page?: number | undefined;
        limit?: number | undefined;
        language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
        specialization?: string[] | undefined;
        priceMin?: number | undefined;
        priceMax?: number | undefined;
        availability?: "morning" | "afternoon" | "evening" | "night" | undefined;
        rating?: number | undefined;
    }>;
    bookLesson: z.ZodObject<{
        teacherId: z.ZodString;
        startTime: z.ZodDate;
        duration: z.ZodNumber;
        topic: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        duration: number;
        teacherId: string;
        startTime: Date;
        topic?: string | undefined;
    }, {
        duration: number;
        teacherId: string;
        startTime: Date;
        topic?: string | undefined;
    }>;
    claimReward: z.ZodObject<{
        rewardId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        rewardId: string;
    }, {
        rewardId: string;
    }>;
    joinChallenge: z.ZodObject<{
        challengeId: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        challengeId: string;
    }, {
        challengeId: string;
    }>;
    createSubscription: z.ZodObject<{
        plan: z.ZodEnum<["MONTHLY", "ANNUAL", "LIFETIME"]>;
        paymentMethodId: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        plan: "MONTHLY" | "ANNUAL" | "LIFETIME";
        paymentMethodId?: string | undefined;
    }, {
        plan: "MONTHLY" | "ANNUAL" | "LIFETIME";
        paymentMethodId?: string | undefined;
    }>;
    cancelSubscription: z.ZodObject<{
        reason: z.ZodOptional<z.ZodString>;
        feedback: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        reason?: string | undefined;
        feedback?: string | undefined;
    }, {
        reason?: string | undefined;
        feedback?: string | undefined;
    }>;
};
/**
 * Main validation middleware factory
 */
export declare function validate(schema: ZodSchema, type?: ValidationType): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate multiple parts of the request
 */
export declare function validateMultiple(validations: {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
}): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Rate limiters for different endpoints
 */
export declare const RateLimiters: {
    auth: import("express-rate-limit").RateLimitRequestHandler;
    api: import("express-rate-limit").RateLimitRequestHandler;
    public: import("express-rate-limit").RateLimitRequestHandler;
    passwordReset: import("express-rate-limit").RateLimitRequestHandler;
    upload: import("express-rate-limit").RateLimitRequestHandler;
};
/**
 * Sanitize request data to prevent XSS
 */
export declare function sanitizeInput(req: Request, _res: Response, next: NextFunction): void;
export declare const FileValidation: {
    image: {
        maxSize: number;
        allowedTypes: string[];
        allowedExtensions: string[];
    };
    audio: {
        maxSize: number;
        allowedTypes: string[];
        allowedExtensions: string[];
    };
    document: {
        maxSize: number;
        allowedTypes: string[];
        allowedExtensions: string[];
    };
};
interface MulterFile {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
export declare function validateFileUpload(type: 'image' | 'audio' | 'document'): (req: Request & {
    file?: MulterFile;
}, res: Response, next: NextFunction) => void;
/**
 * Validate user owns resource
 */
export declare function validateOwnership(_resourceType: string, paramName?: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate subscription access
 */
export declare function validateSubscription(_requiredPlan: string): (req: Request, res: Response, next: NextFunction) => Promise<void>;
declare const _default: {
    validate: typeof validate;
    validateMultiple: typeof validateMultiple;
    ValidationSchemas: {
        register: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
            name: z.ZodString;
            acceptTerms: z.ZodEffects<z.ZodBoolean, boolean, boolean>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
            name: string;
            acceptTerms: boolean;
        }, {
            email: string;
            password: string;
            name: string;
            acceptTerms: boolean;
        }>;
        login: z.ZodObject<{
            email: z.ZodString;
            password: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
            password: string;
        }, {
            email: string;
            password: string;
        }>;
        refreshToken: z.ZodObject<{
            refreshToken: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            refreshToken: string;
        }, {
            refreshToken: string;
        }>;
        resetPassword: z.ZodObject<{
            email: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            email: string;
        }, {
            email: string;
        }>;
        changePassword: z.ZodObject<{
            currentPassword: z.ZodString;
            newPassword: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            currentPassword: string;
            newPassword: string;
        }, {
            currentPassword: string;
            newPassword: string;
        }>;
        updateProfile: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            bio: z.ZodOptional<z.ZodString>;
            avatar: z.ZodOptional<z.ZodString>;
            language: z.ZodOptional<z.ZodEnum<["en", "pt", "es", "fr", "de"]>>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            avatar?: string | undefined;
            bio?: string | undefined;
            language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
        }, {
            name?: string | undefined;
            avatar?: string | undefined;
            bio?: string | undefined;
            language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
        }>;
        updateSettings: z.ZodObject<{
            emailNotifications: z.ZodOptional<z.ZodBoolean>;
            pushNotifications: z.ZodOptional<z.ZodBoolean>;
            weeklyReport: z.ZodOptional<z.ZodBoolean>;
            dailyReminder: z.ZodOptional<z.ZodBoolean>;
            reminderTime: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            emailNotifications?: boolean | undefined;
            pushNotifications?: boolean | undefined;
            weeklyReport?: boolean | undefined;
            dailyReminder?: boolean | undefined;
            reminderTime?: string | undefined;
        }, {
            emailNotifications?: boolean | undefined;
            pushNotifications?: boolean | undefined;
            weeklyReport?: boolean | undefined;
            dailyReminder?: boolean | undefined;
            reminderTime?: string | undefined;
        }>;
        getLessons: z.ZodObject<{
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
            levelId: z.ZodOptional<z.ZodString>;
            categoryId: z.ZodOptional<z.ZodString>;
            difficulty: z.ZodOptional<z.ZodEnum<["EASY", "MEDIUM", "HARD"]>>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            cursor?: string | undefined;
            levelId?: string | undefined;
            categoryId?: string | undefined;
            difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
        }, {
            cursor?: string | undefined;
            limit?: number | undefined;
            levelId?: string | undefined;
            categoryId?: string | undefined;
            difficulty?: "EASY" | "MEDIUM" | "HARD" | undefined;
        }>;
        submitProgress: z.ZodObject<{
            phraseId: z.ZodString;
            mastery: z.ZodNumber;
            timeSpent: z.ZodNumber;
            isCorrect: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            phraseId: string;
            mastery: number;
            timeSpent: number;
            isCorrect: boolean;
        }, {
            phraseId: string;
            mastery: number;
            timeSpent: number;
            isCorrect: boolean;
        }>;
        analyzePronunciation: z.ZodObject<{
            phraseId: z.ZodString;
            audioData: z.ZodString;
            duration: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            phraseId: string;
            audioData: string;
            duration: number;
        }, {
            phraseId: string;
            audioData: string;
            duration: number;
        }>;
        speakingSession: z.ZodObject<{
            phraseIds: z.ZodArray<z.ZodString, "many">;
            mode: z.ZodEnum<["practice", "test", "challenge"]>;
        }, "strip", z.ZodTypeAny, {
            phraseIds: string[];
            mode: "practice" | "test" | "challenge";
        }, {
            phraseIds: string[];
            mode: "practice" | "test" | "challenge";
        }>;
        submitListeningAnswer: z.ZodObject<{
            phraseId: z.ZodString;
            userAnswer: z.ZodString;
            audioSpeed: z.ZodDefault<z.ZodNumber>;
            attempts: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            phraseId: string;
            userAnswer: string;
            audioSpeed: number;
            attempts: number;
        }, {
            phraseId: string;
            userAnswer: string;
            attempts: number;
            audioSpeed?: number | undefined;
        }>;
        listeningSession: z.ZodObject<{
            level: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>>;
            category: z.ZodOptional<z.ZodString>;
            duration: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
            category?: string | undefined;
        }, {
            level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
            category?: string | undefined;
            duration?: number | undefined;
        }>;
        startPlacementTest: z.ZodObject<{
            previousLevel: z.ZodOptional<z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>>;
        }, "strip", z.ZodTypeAny, {
            previousLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
        }, {
            previousLevel?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2" | undefined;
        }>;
        submitPlacementAnswer: z.ZodObject<{
            questionId: z.ZodString;
            answer: z.ZodString;
            timeSpent: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            timeSpent: number;
            questionId: string;
            answer: string;
        }, {
            timeSpent: number;
            questionId: string;
            answer: string;
        }>;
        searchTeachers: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
            specialization: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
            priceMin: z.ZodOptional<z.ZodNumber>;
            priceMax: z.ZodOptional<z.ZodNumber>;
            availability: z.ZodOptional<z.ZodEnum<["morning", "afternoon", "evening", "night"]>>;
            language: z.ZodOptional<z.ZodEnum<["en", "pt", "es", "fr", "de"]>>;
            rating: z.ZodOptional<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
            language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
            specialization?: string[] | undefined;
            priceMin?: number | undefined;
            priceMax?: number | undefined;
            availability?: "morning" | "afternoon" | "evening" | "night" | undefined;
            rating?: number | undefined;
        }, {
            page?: number | undefined;
            limit?: number | undefined;
            language?: "en" | "pt" | "es" | "fr" | "de" | undefined;
            specialization?: string[] | undefined;
            priceMin?: number | undefined;
            priceMax?: number | undefined;
            availability?: "morning" | "afternoon" | "evening" | "night" | undefined;
            rating?: number | undefined;
        }>;
        bookLesson: z.ZodObject<{
            teacherId: z.ZodString;
            startTime: z.ZodDate;
            duration: z.ZodNumber;
            topic: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            duration: number;
            teacherId: string;
            startTime: Date;
            topic?: string | undefined;
        }, {
            duration: number;
            teacherId: string;
            startTime: Date;
            topic?: string | undefined;
        }>;
        claimReward: z.ZodObject<{
            rewardId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            rewardId: string;
        }, {
            rewardId: string;
        }>;
        joinChallenge: z.ZodObject<{
            challengeId: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            challengeId: string;
        }, {
            challengeId: string;
        }>;
        createSubscription: z.ZodObject<{
            plan: z.ZodEnum<["MONTHLY", "ANNUAL", "LIFETIME"]>;
            paymentMethodId: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            plan: "MONTHLY" | "ANNUAL" | "LIFETIME";
            paymentMethodId?: string | undefined;
        }, {
            plan: "MONTHLY" | "ANNUAL" | "LIFETIME";
            paymentMethodId?: string | undefined;
        }>;
        cancelSubscription: z.ZodObject<{
            reason: z.ZodOptional<z.ZodString>;
            feedback: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            reason?: string | undefined;
            feedback?: string | undefined;
        }, {
            reason?: string | undefined;
            feedback?: string | undefined;
        }>;
    };
    CommonSchemas: {
        email: z.ZodString;
        password: z.ZodString;
        uuid: z.ZodString;
        objectId: z.ZodString;
        url: z.ZodString;
        phone: z.ZodString;
        pagination: z.ZodObject<{
            page: z.ZodDefault<z.ZodNumber>;
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            page: number;
            limit: number;
        }, {
            page?: number | undefined;
            limit?: number | undefined;
        }>;
        cursorPagination: z.ZodObject<{
            cursor: z.ZodOptional<z.ZodString>;
            limit: z.ZodDefault<z.ZodNumber>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            cursor?: string | undefined;
        }, {
            cursor?: string | undefined;
            limit?: number | undefined;
        }>;
        dateRange: z.ZodObject<{
            startDate: z.ZodDate;
            endDate: z.ZodDate;
        }, "strip", z.ZodTypeAny, {
            startDate: Date;
            endDate: Date;
        }, {
            startDate: Date;
            endDate: Date;
        }>;
        sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
        languageCode: z.ZodEnum<["en", "pt", "es", "fr", "de"]>;
        cefrLevel: z.ZodEnum<["A1", "A2", "B1", "B2", "C1", "C2"]>;
    };
    RateLimiters: {
        auth: import("express-rate-limit").RateLimitRequestHandler;
        api: import("express-rate-limit").RateLimitRequestHandler;
        public: import("express-rate-limit").RateLimitRequestHandler;
        passwordReset: import("express-rate-limit").RateLimitRequestHandler;
        upload: import("express-rate-limit").RateLimitRequestHandler;
    };
    sanitizeInput: typeof sanitizeInput;
    validateFileUpload: typeof validateFileUpload;
    validateOwnership: typeof validateOwnership;
    validateSubscription: typeof validateSubscription;
};
export default _default;
//# sourceMappingURL=validation.middleware.d.ts.map