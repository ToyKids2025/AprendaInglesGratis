/**
 * PLACEMENT TEST SERVICE - AprendaInglesGratis
 *
 * Adaptive placement test using Item Response Theory (IRT)
 * to accurately determine student's English proficiency level
 *
 * Features:
 * - Adaptive questioning (CAT - Computerized Adaptive Testing)
 * - IRT algorithm for precise level detection
 * - CEFR-aligned scoring (A1-C2)
 * - Multi-skill assessment (grammar, vocabulary, reading, listening)
 * - Detailed diagnostic report
 * - Recommendation engine
 * - Progress prediction
 *
 * @module PlacementService
 * @version 1.0.0
 */
interface PlacementTest {
    id: string;
    userId: string;
    status: TestStatus;
    currentQuestion: number;
    totalQuestions: number;
    estimatedLevel: CEFRLevel | null;
    confidence: number;
    startedAt: Date;
    completedAt?: Date;
    questions: PlacementQuestion[];
    answers: Answer[];
    result?: PlacementResult;
}
type TestStatus = 'in_progress' | 'completed' | 'abandoned';
type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type SkillType = 'grammar' | 'vocabulary' | 'reading' | 'listening' | 'writing';
interface PlacementQuestion {
    id: string;
    type: QuestionType;
    skill: SkillType;
    difficulty: number;
    discrimination: number;
    guessing: number;
    content: QuestionContent;
    targetLevel: CEFRLevel;
}
type QuestionType = 'multiple_choice' | 'fill_blank' | 'true_false' | 'matching';
interface QuestionContent {
    prompt: string;
    options?: string[];
    correctAnswer: string | number;
    explanation?: string;
    context?: string;
}
interface Answer {
    questionId: string;
    userAnswer: string | number;
    isCorrect: boolean;
    timeSpent: number;
    timestamp: Date;
}
interface PlacementResult {
    overallLevel: CEFRLevel;
    confidence: number;
    abilityEstimate: number;
    standardError: number;
    skillBreakdown: Map<SkillType, SkillScore>;
    strengths: string[];
    weaknesses: string[];
    recommendations: Recommendation[];
    detailedReport: string;
    nextSteps: string[];
}
interface SkillScore {
    skill: SkillType;
    level: CEFRLevel;
    score: number;
    confidence: number;
}
interface Recommendation {
    type: 'course' | 'practice' | 'focus_area';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
}
export declare class PlacementService {
    private cache;
    private openai;
    private questionBank;
    constructor();
    /**
     * Start a new placement test
     */
    startTest(userId: string, previousLevel?: CEFRLevel): Promise<PlacementTest>;
    /**
     * Submit an answer and get next question
     */
    submitAnswer(testId: string, questionId: string, userAnswer: string | number, timeSpent: number): Promise<{
        test: PlacementTest;
        nextQuestion?: PlacementQuestion;
        completed: boolean;
    }>;
    /**
     * Calculate ability (theta) using Maximum Likelihood Estimation
     */
    private calculateAbility;
    /**
     * Calculate probability of correct answer using 3PL IRT model
     */
    private probabilityCorrect;
    /**
     * Select next question using Maximum Information
     */
    private selectNextQuestion;
    /**
     * Calculate Fisher Information
     */
    private calculateInformation;
    /**
     * Convert theta to CEFR level
     */
    private thetaToLevel;
    /**
     * Convert CEFR level to theta (midpoint)
     */
    private levelToTheta;
    /**
     * Calculate confidence from standard error
     */
    private calculateConfidence;
    /**
     * Generate comprehensive placement result
     */
    private generateResult;
    /**
     * Calculate skill-specific scores
     */
    private calculateSkillBreakdown;
    /**
     * Analyze performance to identify strengths and weaknesses
     */
    private analyzePerformance;
    /**
     * Generate personalized recommendations
     */
    private generateRecommendations;
    /**
     * Generate detailed report using AI
     */
    private generateDetailedReport;
    /**
     * Generate actionable next steps
     */
    private generateNextSteps;
    /**
     * Generate a question dynamically using AI
     */
    private generateQuestion;
    /**
     * Check if answer is correct
     */
    private checkAnswer;
    private skillToString;
    private generateId;
}
export declare function getPlacementService(): PlacementService;
export default getPlacementService;
//# sourceMappingURL=placement.service.d.ts.map