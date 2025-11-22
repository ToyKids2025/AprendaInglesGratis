/**
 * GRAMMAR SERVICE - AprendaInglesGratis
 *
 * Intelligent grammar learning and correction system
 *
 * Features:
 * - Grammar rule explanations (adaptive to user level)
 * - Interactive exercises (fill-in-blank, correction, transformation)
 * - AI-powered error correction with explanations
 * - Pattern recognition for common mistakes
 * - Personalized practice based on weak areas
 * - Contextual learning (grammar in real sentences)
 * - Progress tracking by grammar topic
 *
 * Grammar Topics Covered:
 * - Tenses (12 tenses + conditionals)
 * - Articles (a, an, the)
 * - Prepositions
 * - Modals
 * - Passive voice
 * - Reported speech
 * - Relative clauses
 * - Phrasal verbs
 *
 * @module GrammarService
 * @version 1.0.0
 */
interface GrammarTopic {
    id: string;
    name: string;
    slug: string;
    category: GrammarCategory;
    level: CEFRLevel;
    description: string;
    explanation: string;
    examples: GrammarExample[];
    commonMistakes: CommonMistake[];
    rules: GrammarRule[];
}
type GrammarCategory = 'tenses' | 'articles' | 'prepositions' | 'modals' | 'clauses' | 'voice' | 'speech';
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
interface GrammarExample {
    correct: string;
    incorrect?: string;
    explanation: string;
    translation?: string;
}
interface CommonMistake {
    mistake: string;
    correction: string;
    why: string;
    frequency: number;
}
interface GrammarRule {
    rule: string;
    formula?: string;
    exceptions?: string[];
    tips: string[];
}
interface GrammarExercise {
    id: string;
    topicId: string;
    type: ExerciseType;
    difficulty: CEFRLevel;
    question: string;
    options?: string[];
    correctAnswer: string | number;
    explanation: string;
    hint?: string;
}
type ExerciseType = 'fill_blank' | 'multiple_choice' | 'correction' | 'transformation' | 'ordering';
interface GrammarCorrection {
    originalText: string;
    correctedText: string;
    errors: GrammarError[];
    overallScore: number;
    suggestions: string[];
}
interface GrammarError {
    type: ErrorType;
    incorrect: string;
    correct: string;
    explanation: string;
    position: {
        start: number;
        end: number;
    };
    severity: 'low' | 'medium' | 'high';
    rule: string;
}
type ErrorType = 'tense' | 'agreement' | 'article' | 'preposition' | 'word_order' | 'spelling' | 'punctuation';
interface UserGrammarProgress {
    userId: string;
    topicProgress: Map<string, TopicProgress>;
    commonErrors: Map<ErrorType, number>;
    strongTopics: string[];
    weakTopics: string[];
    lastPracticed: Date;
}
interface TopicProgress {
    topicId: string;
    masteryLevel: number;
    exercisesCompleted: number;
    correctRate: number;
    lastPracticed: Date;
}
export declare class GrammarService {
    private cache;
    private openai;
    constructor();
    /**
     * Get all grammar topics for a level
     */
    getTopicsByLevel(level: CEFRLevel): Promise<GrammarTopic[]>;
    /**
     * Get topic details with adaptive explanation
     */
    getTopicDetails(topicId: string, userLevel: CEFRLevel): Promise<GrammarTopic>;
    /**
     * Adapt explanation to user's level
     */
    private adaptExplanation;
    /**
     * Generate exercises for a topic
     */
    generateExercises(topicId: string, difficulty: CEFRLevel, count?: number): Promise<GrammarExercise[]>;
    /**
     * Generate single exercise using AI
     */
    private generateExercise;
    /**
     * Fallback exercise if AI fails
     */
    private getFallbackExercise;
    /**
     * Check exercise answer
     */
    checkExerciseAnswer(exercise: GrammarExercise, userAnswer: string | number): {
        isCorrect: boolean;
        explanation: string;
        feedback: string;
    };
    /**
     * Correct text and identify grammar errors
     */
    correctText(text: string): Promise<GrammarCorrection>;
    /**
     * Apply corrections to text
     */
    private applyCorrestions;
    /**
     * Explain specific grammar mistake
     */
    explainMistake(incorrectText: string, correctText: string): Promise<string>;
    /**
     * Get personalized exercises based on user's weak areas
     */
    getPersonalizedExercises(userId: string, count?: number): Promise<GrammarExercise[]>;
    /**
     * Generate random exercises for variety
     */
    private generateRandomExercises;
    /**
     * Update user grammar progress
     */
    updateProgress(userId: string, exerciseId: string, isCorrect: boolean): Promise<UserGrammarProgress>;
    /**
     * Categorize topics as strong/weak
     */
    private categorizeTopics;
    private getTopic;
    private getExercise;
    private getUserProgress;
    private initializeUserProgress;
    private initializeTopicProgress;
    private saveUserProgress;
    /**
     * Get default grammar topics
     */
    private getDefaultTopics;
    private normalizeAnswer;
    private generateId;
}
export declare function getGrammarService(): GrammarService;
export default getGrammarService;
//# sourceMappingURL=grammar.service.d.ts.map