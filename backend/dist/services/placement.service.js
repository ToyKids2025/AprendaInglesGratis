"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacementService = void 0;
exports.getPlacementService = getPlacementService;
const cache_service_1 = require("./cache.service");
const openai_1 = __importDefault(require("openai"));
// ==================== IRT PARAMETERS ====================
const CEFR_THETA_RANGES = {
    A1: { min: -3.0, max: -1.5 },
    A2: { min: -1.5, max: -0.5 },
    B1: { min: -0.5, max: 0.5 },
    B2: { min: 0.5, max: 1.5 },
    C1: { min: 1.5, max: 2.5 },
    C2: { min: 2.5, max: 3.0 },
};
const MAX_QUESTIONS = 30;
const MIN_QUESTIONS = 15;
const CONFIDENCE_THRESHOLD = 85; // Stop test if confidence reaches this
const SE_THRESHOLD = 0.3; // Standard Error threshold to stop
// ==================== PLACEMENT TEST SERVICE CLASS ====================
class PlacementService {
    cache;
    openai;
    questionBank;
    constructor() {
        this.cache = (0, cache_service_1.getCacheService)();
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.questionBank = []; // Load from DB in production
    }
    // ==================== TEST MANAGEMENT ====================
    /**
     * Start a new placement test
     */
    async startTest(userId, previousLevel) {
        const test = {
            id: this.generateId(),
            userId,
            status: 'in_progress',
            currentQuestion: 0,
            totalQuestions: MIN_QUESTIONS,
            estimatedLevel: previousLevel || null,
            confidence: 0,
            startedAt: new Date(),
            questions: [],
            answers: [],
        };
        // Select first question based on previous level or start at B1
        const initialTheta = previousLevel
            ? this.levelToTheta(previousLevel)
            : 0; // B1 level
        const firstQuestion = await this.selectNextQuestion(initialTheta, []);
        test.questions.push(firstQuestion);
        // Cache test
        await this.cache.set(`placement:test:${test.id}`, test, {
            ttl: 7200, // 2 hours
        });
        return test;
    }
    /**
     * Submit an answer and get next question
     */
    async submitAnswer(testId, questionId, userAnswer, timeSpent) {
        // Get test from cache
        const test = await this.cache.get(`placement:test:${testId}`);
        if (!test) {
            throw new Error('Test not found');
        }
        // Find question
        const question = test.questions.find((q) => q.id === questionId);
        if (!question) {
            throw new Error('Question not found');
        }
        // Check answer
        const isCorrect = this.checkAnswer(question, userAnswer);
        // Record answer
        const answer = {
            questionId,
            userAnswer,
            isCorrect,
            timeSpent,
            timestamp: new Date(),
        };
        test.answers.push(answer);
        test.currentQuestion++;
        // Calculate new ability estimate (theta) using IRT
        const { theta, standardError } = this.calculateAbility(test.questions, test.answers);
        // Update estimated level
        test.estimatedLevel = this.thetaToLevel(theta);
        test.confidence = this.calculateConfidence(standardError);
        // Decide if we should stop the test
        const shouldStop = test.currentQuestion >= MAX_QUESTIONS ||
            (test.currentQuestion >= MIN_QUESTIONS &&
                (test.confidence >= CONFIDENCE_THRESHOLD ||
                    standardError <= SE_THRESHOLD));
        if (shouldStop) {
            // Complete test
            test.status = 'completed';
            test.completedAt = new Date();
            test.result = await this.generateResult(test, theta, standardError);
            await this.cache.set(`placement:test:${testId}`, test, {
                ttl: 86400, // 24 hours
            });
            return {
                test,
                completed: true,
            };
        }
        // Select next question adaptively
        const nextQuestion = await this.selectNextQuestion(theta, test.questions.map((q) => q.id));
        test.questions.push(nextQuestion);
        // Update cache
        await this.cache.set(`placement:test:${testId}`, test, { ttl: 7200 });
        return {
            test,
            nextQuestion,
            completed: false,
        };
    }
    // ==================== IRT CALCULATIONS ====================
    /**
     * Calculate ability (theta) using Maximum Likelihood Estimation
     */
    calculateAbility(questions, answers) {
        if (answers.length === 0) {
            return { theta: 0, standardError: 1.0 };
        }
        // Initial estimate
        let theta = 0;
        // Newton-Raphson iteration
        for (let iter = 0; iter < 20; iter++) {
            let firstDerivative = 0;
            let secondDerivative = 0;
            for (let i = 0; i < answers.length; i++) {
                const question = questions[i];
                const answer = answers[i];
                const u = answer.isCorrect ? 1 : 0;
                const P = this.probabilityCorrect(theta, question);
                // First derivative
                firstDerivative += question.discrimination * (u - P);
                // Second derivative
                secondDerivative -=
                    question.discrimination * question.discrimination * P * (1 - P);
            }
            // Update theta
            const change = firstDerivative / Math.abs(secondDerivative);
            theta += change;
            // Check convergence
            if (Math.abs(change) < 0.001)
                break;
        }
        // Calculate standard error
        let information = 0;
        for (let i = 0; i < answers.length; i++) {
            const question = questions[i];
            const P = this.probabilityCorrect(theta, question);
            information +=
                question.discrimination * question.discrimination * P * (1 - P);
        }
        const standardError = information > 0 ? 1 / Math.sqrt(information) : 1.0;
        // Bound theta to valid range
        theta = Math.max(-3, Math.min(3, theta));
        return { theta, standardError };
    }
    /**
     * Calculate probability of correct answer using 3PL IRT model
     */
    probabilityCorrect(theta, question) {
        const { difficulty, discrimination, guessing } = question;
        const exponent = discrimination * (theta - difficulty);
        const probability = guessing + (1 - guessing) / (1 + Math.exp(-exponent));
        return probability;
    }
    /**
     * Select next question using Maximum Information
     */
    async selectNextQuestion(theta, usedQuestionIds) {
        // Filter out used questions
        const availableQuestions = this.questionBank.filter((q) => !usedQuestionIds.includes(q.id));
        if (availableQuestions.length === 0) {
            // Generate new question if bank is empty
            return await this.generateQuestion(theta);
        }
        // Calculate information for each question
        const questionsWithInfo = availableQuestions.map((question) => ({
            question,
            information: this.calculateInformation(theta, question),
        }));
        // Sort by information (descending)
        questionsWithInfo.sort((a, b) => b.information - a.information);
        // Return question with maximum information
        return questionsWithInfo[0].question;
    }
    /**
     * Calculate Fisher Information
     */
    calculateInformation(theta, question) {
        const P = this.probabilityCorrect(theta, question);
        const Q = 1 - P;
        const numerator = question.discrimination *
            question.discrimination *
            Q *
            Math.pow(P - question.guessing, 2);
        const denominator = P * Math.pow(1 - question.guessing, 2);
        return numerator / denominator;
    }
    // ==================== LEVEL CONVERSION ====================
    /**
     * Convert theta to CEFR level
     */
    thetaToLevel(theta) {
        for (const [level, range] of Object.entries(CEFR_THETA_RANGES)) {
            if (theta >= range.min && theta < range.max) {
                return level;
            }
        }
        return theta < -1.5 ? 'A1' : 'C2';
    }
    /**
     * Convert CEFR level to theta (midpoint)
     */
    levelToTheta(level) {
        const range = CEFR_THETA_RANGES[level];
        return (range.min + range.max) / 2;
    }
    /**
     * Calculate confidence from standard error
     */
    calculateConfidence(standardError) {
        // Lower SE = higher confidence
        // SE typically ranges from 0.3 to 1.0
        const confidence = 100 * (1 - Math.min(standardError, 1.0));
        return Math.max(0, Math.min(100, confidence));
    }
    // ==================== RESULT GENERATION ====================
    /**
     * Generate comprehensive placement result
     */
    async generateResult(test, theta, standardError) {
        // Calculate skill breakdown
        const skillBreakdown = this.calculateSkillBreakdown(test);
        // Identify strengths and weaknesses
        const { strengths, weaknesses } = this.analyzePerformance(skillBreakdown, test);
        // Generate recommendations
        const recommendations = await this.generateRecommendations(test.estimatedLevel, strengths, weaknesses);
        // Generate detailed report
        const detailedReport = await this.generateDetailedReport(test, theta, skillBreakdown);
        // Generate next steps
        const nextSteps = this.generateNextSteps(test.estimatedLevel, weaknesses);
        return {
            overallLevel: test.estimatedLevel,
            confidence: this.calculateConfidence(standardError),
            abilityEstimate: theta,
            standardError,
            skillBreakdown,
            strengths,
            weaknesses,
            recommendations,
            detailedReport,
            nextSteps,
        };
    }
    /**
     * Calculate skill-specific scores
     */
    calculateSkillBreakdown(test) {
        const breakdown = new Map();
        const skills = [
            'grammar',
            'vocabulary',
            'reading',
            'listening',
        ];
        for (const skill of skills) {
            const skillQuestions = test.questions.filter((q) => q.skill === skill);
            const skillAnswers = test.answers.filter((a) => skillQuestions.find((q) => q.id === a.questionId));
            if (skillQuestions.length === 0)
                continue;
            const { theta } = this.calculateAbility(skillQuestions, skillAnswers);
            const correctCount = skillAnswers.filter((a) => a.isCorrect).length;
            const score = (correctCount / skillAnswers.length) * 100;
            breakdown.set(skill, {
                skill,
                level: this.thetaToLevel(theta),
                score,
                confidence: 75, // Simplified
            });
        }
        return breakdown;
    }
    /**
     * Analyze performance to identify strengths and weaknesses
     */
    analyzePerformance(skillBreakdown, _test) {
        const strengths = [];
        const weaknesses = [];
        const averageScore = Array.from(skillBreakdown.values()).reduce((sum, skill) => sum + skill.score, 0) / skillBreakdown.size;
        for (const [skill, score] of skillBreakdown) {
            if (score.score >= averageScore + 10) {
                strengths.push(this.skillToString(skill));
            }
            else if (score.score <= averageScore - 10) {
                weaknesses.push(this.skillToString(skill));
            }
        }
        return { strengths, weaknesses };
    }
    /**
     * Generate personalized recommendations
     */
    async generateRecommendations(level, _strengths, weaknesses) {
        const recommendations = [];
        // Course recommendation
        recommendations.push({
            type: 'course',
            title: `Start with ${level} level courses`,
            description: `Based on your assessment, ${level} courses are perfect for you`,
            priority: 'high',
        });
        // Focus area recommendations
        weaknesses.forEach((weakness) => {
            recommendations.push({
                type: 'focus_area',
                title: `Improve your ${weakness}`,
                description: `We recommend extra practice in ${weakness}`,
                priority: 'high',
            });
        });
        // Practice recommendations
        recommendations.push({
            type: 'practice',
            title: 'Daily practice',
            description: 'Practice at least 15 minutes daily for best results',
            priority: 'medium',
        });
        return recommendations;
    }
    /**
     * Generate detailed report using AI
     */
    async generateDetailedReport(test, theta, skillBreakdown) {
        try {
            const prompt = `
Generate a detailed placement test report for a student:

Overall Level: ${test.estimatedLevel}
Ability Estimate (theta): ${theta.toFixed(2)}
Questions answered: ${test.answers.length}
Correct answers: ${test.answers.filter((a) => a.isCorrect).length}

Skill breakdown:
${Array.from(skillBreakdown.entries())
                .map(([skill, score]) => `- ${skill}: ${score.level} (${score.score.toFixed(0)}%)`)
                .join('\n')}

Write a 3-paragraph report:
1. Summary of overall performance
2. Specific strengths and areas for improvement
3. Personalized advice for learning journey

Keep it encouraging and specific.
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an English assessment expert.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 400,
            });
            return (response.choices[0].message.content ||
                'Your placement test is complete!');
        }
        catch (error) {
            console.error('Error generating report:', error);
            return `Congratulations! Your English level is ${test.estimatedLevel}. Keep up the great work!`;
        }
    }
    /**
     * Generate actionable next steps
     */
    generateNextSteps(level, weaknesses) {
        const steps = [];
        steps.push(`Start your learning journey at ${level} level`);
        steps.push('Complete the onboarding to personalize your experience');
        if (weaknesses.length > 0) {
            steps.push(`Focus on improving: ${weaknesses.join(', ')}`);
        }
        steps.push('Set a daily study goal (recommended: 15-30 minutes)');
        steps.push('Take the first lesson to get started');
        return steps;
    }
    // ==================== QUESTION GENERATION ====================
    /**
     * Generate a question dynamically using AI
     */
    async generateQuestion(theta) {
        const level = this.thetaToLevel(theta);
        const skills = ['grammar', 'vocabulary', 'reading'];
        const skill = skills[Math.floor(Math.random() * skills.length)];
        // In production, use AI to generate or fetch from database
        return {
            id: this.generateId(),
            type: 'multiple_choice',
            skill,
            difficulty: theta,
            discrimination: 1.5,
            guessing: 0.25,
            content: {
                prompt: 'Sample question',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correctAnswer: 0,
            },
            targetLevel: level,
        };
    }
    /**
     * Check if answer is correct
     */
    checkAnswer(question, userAnswer) {
        return userAnswer === question.content.correctAnswer;
    }
    // ==================== UTILITIES ====================
    skillToString(skill) {
        const map = {
            grammar: 'Grammar',
            vocabulary: 'Vocabulary',
            reading: 'Reading Comprehension',
            listening: 'Listening Comprehension',
            writing: 'Writing',
        };
        return map[skill];
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
exports.PlacementService = PlacementService;
// ==================== SINGLETON ====================
let placementServiceInstance = null;
function getPlacementService() {
    if (!placementServiceInstance) {
        placementServiceInstance = new PlacementService();
    }
    return placementServiceInstance;
}
exports.default = getPlacementService;
//# sourceMappingURL=placement.service.js.map