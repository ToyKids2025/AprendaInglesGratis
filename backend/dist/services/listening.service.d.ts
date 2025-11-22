/**
 * LISTENING ADVANCED SERVICE - AprendaInglesGratis
 *
 * Comprehensive listening comprehension and training system
 *
 * Features:
 * - Multi-accent audio (US, UK, AU)
 * - Variable playback speeds (0.5x - 2.0x)
 * - Difficulty progression (A1-C2)
 * - Comprehension testing
 * - Dictation exercises
 * - Fill-in-the-blank challenges
 * - Audio analysis and insights
 * - Progress tracking with spaced repetition
 *
 * @module ListeningService
 * @version 1.0.0
 */
interface ListeningExercise {
    id: string;
    phraseId: string;
    phrase: string;
    translation: string;
    audioUrl: string;
    accent: Accent;
    difficulty: Difficulty;
    category: string;
    duration: number;
    type: ExerciseType;
    questions?: ComprehensionQuestion[];
    fillInBlanks?: BlankPosition[];
}
type Accent = 'US' | 'UK' | 'AU' | 'CA' | 'IN';
type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type ExerciseType = 'dictation' | 'comprehension' | 'fill_blanks' | 'multiple_choice' | 'true_false';
interface ComprehensionQuestion {
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
}
interface BlankPosition {
    position: number;
    word: string;
    hints?: string[];
}
interface ListeningAttempt {
    id: string;
    exerciseId: string;
    userId: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
    isCorrect: boolean;
    score: number;
    playbackSpeed: number;
    attempts: number;
    timeSpent: number;
    hintsUsed: number;
    timestamp: Date;
}
interface ListeningAnalysis {
    accuracy: number;
    comprehensionScore: number;
    weakAreas: string[];
    strongAreas: string[];
    recommendedLevel: Difficulty;
    feedback: string;
    mistakes: ListeningMistake[];
}
interface ListeningMistake {
    type: 'misheard' | 'missing' | 'grammar' | 'spelling';
    expected: string;
    actual: string;
    context: string;
    suggestion: string;
}
interface ListeningProgress {
    userId: string;
    currentLevel: Difficulty;
    totalExercises: number;
    averageAccuracy: number;
    accentFamiliarity: Map<Accent, number>;
    speedProgress: Map<number, number>;
    weakCategories: string[];
    strongCategories: string[];
    lastPracticed: Date;
    streak: number;
}
interface ListeningSession {
    id: string;
    userId: string;
    exercises: ListeningExercise[];
    currentIndex: number;
    totalScore: number;
    startedAt: Date;
    completedAt?: Date;
    settings: SessionSettings;
}
interface SessionSettings {
    level: Difficulty;
    accent: Accent | 'mixed';
    speed: number;
    exerciseCount: number;
    focusAreas?: string[];
}
export declare class ListeningService {
    private cache;
    private openai;
    constructor();
    /**
     * Create a new listening session
     */
    createSession(userId: string, settings: SessionSettings): Promise<ListeningSession>;
    /**
     * Get exercises based on session settings
     */
    private getExercises;
    /**
     * Check dictation answer
     */
    checkDictation(_exerciseId: string, userAnswer: string, correctAnswer: string, playbackSpeed: number): Promise<ListeningAnalysis>;
    /**
     * Analyze individual mistake
     */
    private analyzeMistake;
    /**
     * Check if words sound similar (common mishearing)
     */
    private isSimilarSound;
    /**
     * Check if it's a grammar error
     */
    private isGrammarError;
    /**
     * Check if it's just a spelling error
     */
    private isSpellingError;
    /**
     * Get suggestion based on mistake type
     */
    private getSuggestion;
    /**
     * Generate comprehension questions using AI
     */
    generateComprehensionQuestions(phrase: string, difficulty: Difficulty, count?: number): Promise<ComprehensionQuestion[]>;
    /**
     * Check comprehension answer
     */
    checkComprehensionAnswer(question: ComprehensionQuestion, userAnswer: number): {
        isCorrect: boolean;
        explanation: string;
    };
    /**
     * Generate fill-in-the-blank exercise
     */
    generateFillBlanks(phrase: string, difficulty: Difficulty): {
        phraseWithBlanks: string;
        blanks: BlankPosition[];
    };
    /**
     * Determine number of blanks based on difficulty
     */
    private getBlankCount;
    /**
     * Select which words to blank out
     */
    private selectBlankIndices;
    /**
     * Generate hints for a word
     */
    private generateHints;
    /**
     * Check fill-in-the-blank answer
     */
    checkFillBlanks(blanks: BlankPosition[], userAnswers: string[]): {
        score: number;
        results: Array<{
            correct: boolean;
            expected: string;
            actual: string;
        }>;
    };
    /**
     * Track user listening progress
     */
    trackProgress(userId: string, attempt: ListeningAttempt, analysis: ListeningAnalysis): Promise<ListeningProgress>;
    /**
     * Initialize new user progress
     */
    private initializeProgress;
    /**
     * Generate personalized feedback
     */
    private generateFeedback;
    private normalizeText;
    private levenshteinDistance;
    private identifyWeakAreas;
    private identifyStrongAreas;
    private determineLevel;
    private getSpeedMultiplier;
    private randomAccent;
    private randomExerciseType;
    private generateId;
    private getExercise;
}
export declare function getListeningService(): ListeningService;
export default getListeningService;
//# sourceMappingURL=listening.service.d.ts.map