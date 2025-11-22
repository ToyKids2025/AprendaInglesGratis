"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListeningService = void 0;
exports.getListeningService = getListeningService;
const cache_service_1 = require("./cache.service");
const openai_1 = __importDefault(require("openai"));
// ==================== LISTENING SERVICE CLASS ====================
class ListeningService {
    cache;
    openai;
    constructor() {
        this.cache = (0, cache_service_1.getCacheService)();
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    // ==================== SESSION MANAGEMENT ====================
    /**
     * Create a new listening session
     */
    async createSession(userId, settings) {
        // Get exercises based on settings
        const exercises = await this.getExercises(settings);
        const session = {
            id: this.generateId(),
            userId,
            exercises,
            currentIndex: 0,
            totalScore: 0,
            startedAt: new Date(),
            settings,
        };
        // Cache session
        await this.cache.set(`listening:session:${session.id}`, session, {
            ttl: 3600,
        });
        return session;
    }
    /**
     * Get exercises based on session settings
     */
    async getExercises(settings) {
        // In production, fetch from database
        // For now, return mock data
        const exercises = [];
        for (let i = 0; i < settings.exerciseCount; i++) {
            exercises.push({
                id: this.generateId(),
                phraseId: this.generateId(),
                phrase: 'Sample phrase for listening practice',
                translation: 'Frase de exemplo para prática de audição',
                audioUrl: '/audio/sample.mp3',
                accent: settings.accent === 'mixed' ? this.randomAccent() : settings.accent,
                difficulty: settings.level,
                category: 'general',
                duration: 5,
                type: this.randomExerciseType(),
            });
        }
        return exercises;
    }
    // ==================== DICTATION EXERCISES ====================
    /**
     * Check dictation answer
     */
    async checkDictation(_exerciseId, userAnswer, correctAnswer, playbackSpeed) {
        // Normalize text
        const userNorm = this.normalizeText(userAnswer);
        const correctNorm = this.normalizeText(correctAnswer);
        // Calculate word-level accuracy
        const userWords = userNorm.split(' ');
        const correctWords = correctNorm.split(' ');
        let correctCount = 0;
        const mistakes = [];
        // Compare word by word
        for (let i = 0; i < correctWords.length; i++) {
            const correctWord = correctWords[i];
            const userWord = userWords[i] || '';
            if (correctWord === userWord) {
                correctCount++;
            }
            else {
                mistakes.push(this.analyzeMistake(correctWord, userWord, correctWords));
            }
        }
        const accuracy = (correctCount / correctWords.length) * 100;
        // Adjust score based on playback speed
        const speedMultiplier = this.getSpeedMultiplier(playbackSpeed);
        const finalAccuracy = Math.min(100, accuracy * speedMultiplier);
        // Analyze weak areas
        const weakAreas = this.identifyWeakAreas(mistakes);
        const strongAreas = this.identifyStrongAreas(correctCount, correctWords);
        // Generate feedback
        const feedback = await this.generateFeedback({
            accuracy: finalAccuracy,
            mistakes,
            playbackSpeed,
            weakAreas,
        });
        return {
            accuracy: finalAccuracy,
            comprehensionScore: accuracy,
            weakAreas,
            strongAreas,
            recommendedLevel: this.determineLevel(finalAccuracy),
            feedback,
            mistakes,
        };
    }
    /**
     * Analyze individual mistake
     */
    analyzeMistake(expected, actual, context) {
        // Determine mistake type
        let type = 'misheard';
        if (!actual || actual === '') {
            type = 'missing';
        }
        else if (this.isSimilarSound(expected, actual)) {
            type = 'misheard';
        }
        else if (this.isGrammarError(expected, actual)) {
            type = 'grammar';
        }
        else if (this.isSpellingError(expected, actual)) {
            type = 'spelling';
        }
        return {
            type,
            expected,
            actual,
            context: context.join(' '),
            suggestion: this.getSuggestion(type, expected, actual),
        };
    }
    /**
     * Check if words sound similar (common mishearing)
     */
    isSimilarSound(word1, word2) {
        const similarPairs = [
            ['they', 'there', 'their'],
            ['to', 'too', 'two'],
            ['your', "you're"],
            ['its', "it's"],
            ['then', 'than'],
        ];
        return similarPairs.some((pair) => pair.includes(word1) && pair.includes(word2));
    }
    /**
     * Check if it's a grammar error
     */
    isGrammarError(expected, actual) {
        // Common grammar confusions
        const grammarPairs = [
            ['is', 'are'],
            ['was', 'were'],
            ['have', 'has'],
            ['do', 'does'],
        ];
        return grammarPairs.some(([a, b]) => (expected === a && actual === b) || (expected === b && actual === a));
    }
    /**
     * Check if it's just a spelling error
     */
    isSpellingError(expected, actual) {
        if (Math.abs(expected.length - actual.length) > 2)
            return false;
        // Levenshtein distance
        const distance = this.levenshteinDistance(expected, actual);
        return distance <= 2;
    }
    /**
     * Get suggestion based on mistake type
     */
    getSuggestion(type, expected, actual) {
        switch (type) {
            case 'misheard':
                return `Listen carefully to distinguish "${expected}" from "${actual}"`;
            case 'missing':
                return `You missed the word "${expected}" - try slowing down the audio`;
            case 'grammar':
                return `Grammar: "${expected}" is correct here, not "${actual}"`;
            case 'spelling':
                return `Spelling: "${expected}" not "${actual}"`;
            default:
                return `The correct word is "${expected}"`;
        }
    }
    // ==================== COMPREHENSION QUESTIONS ====================
    /**
     * Generate comprehension questions using AI
     */
    async generateComprehensionQuestions(phrase, difficulty, count = 3) {
        try {
            const prompt = `
Generate ${count} comprehension questions for this English phrase:
"${phrase}"

Difficulty level: ${difficulty}

For each question, provide:
1. The question
2. 4 multiple choice options
3. Correct answer index (0-3)
4. Brief explanation

Format as JSON array.
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an English teacher creating listening comprehension questions.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                response_format: { type: 'json_object' },
            });
            const content = response.choices[0].message.content;
            if (!content)
                throw new Error('No response from AI');
            const questions = JSON.parse(content);
            return questions.questions || [];
        }
        catch (error) {
            console.error('Error generating questions:', error);
            return [];
        }
    }
    /**
     * Check comprehension answer
     */
    checkComprehensionAnswer(question, userAnswer) {
        const isCorrect = userAnswer === question.correctAnswer;
        return {
            isCorrect,
            explanation: isCorrect
                ? 'Correct! ' + question.explanation
                : `Incorrect. ${question.explanation}`,
        };
    }
    // ==================== FILL IN THE BLANKS ====================
    /**
     * Generate fill-in-the-blank exercise
     */
    generateFillBlanks(phrase, difficulty) {
        const words = phrase.split(' ');
        const blanks = [];
        // Determine how many blanks based on difficulty
        const blankCount = this.getBlankCount(words.length, difficulty);
        // Choose words to blank out (avoid first and last word)
        const indices = this.selectBlankIndices(words.length, blankCount);
        let phraseWithBlanks = phrase;
        indices.forEach((index, blankNum) => {
            const word = words[index];
            blanks.push({
                position: index,
                word: word,
                hints: this.generateHints(word),
            });
            // Replace word with blank
            const blankPlaceholder = `___${blankNum + 1}___`;
            phraseWithBlanks = phraseWithBlanks.replace(word, blankPlaceholder);
        });
        return {
            phraseWithBlanks,
            blanks,
        };
    }
    /**
     * Determine number of blanks based on difficulty
     */
    getBlankCount(wordCount, difficulty) {
        const ratios = {
            A1: 0.2, // 20% of words
            A2: 0.25,
            B1: 0.3,
            B2: 0.35,
            C1: 0.4,
            C2: 0.5,
        };
        return Math.ceil(wordCount * ratios[difficulty]);
    }
    /**
     * Select which words to blank out
     */
    selectBlankIndices(wordCount, blankCount) {
        const indices = [];
        const available = Array.from({ length: wordCount - 2 }, (_, i) => i + 1);
        // Randomly select indices
        for (let i = 0; i < blankCount && available.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            indices.push(available[randomIndex]);
            available.splice(randomIndex, 1);
        }
        return indices.sort((a, b) => a - b);
    }
    /**
     * Generate hints for a word
     */
    generateHints(word) {
        const hints = [];
        // Hint 1: First letter
        hints.push(`Starts with "${word[0].toUpperCase()}"`);
        // Hint 2: Word length
        hints.push(`${word.length} letters`);
        // Hint 3: Last letter
        if (word.length > 2) {
            hints.push(`Ends with "${word[word.length - 1]}"`);
        }
        return hints;
    }
    /**
     * Check fill-in-the-blank answer
     */
    checkFillBlanks(blanks, userAnswers) {
        let correctCount = 0;
        const results = [];
        blanks.forEach((blank, index) => {
            const userAnswer = this.normalizeText(userAnswers[index] || '');
            const correctAnswer = this.normalizeText(blank.word);
            const correct = userAnswer === correctAnswer;
            if (correct)
                correctCount++;
            results.push({
                correct,
                expected: blank.word,
                actual: userAnswers[index] || '',
            });
        });
        return {
            score: (correctCount / blanks.length) * 100,
            results,
        };
    }
    // ==================== PROGRESS TRACKING ====================
    /**
     * Track user listening progress
     */
    async trackProgress(userId, attempt, analysis) {
        const cacheKey = `listening:progress:${userId}`;
        const progress = (await this.cache.get(cacheKey)) ||
            this.initializeProgress(userId);
        // Update stats
        progress.totalExercises++;
        progress.averageAccuracy =
            (progress.averageAccuracy * (progress.totalExercises - 1) +
                analysis.accuracy) /
                progress.totalExercises;
        // Update accent familiarity
        const exercise = await this.getExercise(attempt.exerciseId);
        if (exercise) {
            const currentFamiliarity = progress.accentFamiliarity.get(exercise.accent) || 50;
            const newFamiliarity = currentFamiliarity * 0.9 + analysis.accuracy * 0.1;
            progress.accentFamiliarity.set(exercise.accent, newFamiliarity);
        }
        // Update speed progress
        const speedAccuracy = progress.speedProgress.get(attempt.playbackSpeed) || 0;
        progress.speedProgress.set(attempt.playbackSpeed, speedAccuracy * 0.8 + analysis.accuracy * 0.2);
        // Update weak/strong categories
        progress.weakCategories = analysis.weakAreas;
        progress.strongCategories = analysis.strongAreas;
        // Update streak
        const today = new Date().toDateString();
        const lastDay = progress.lastPracticed.toDateString();
        if (today !== lastDay) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            progress.streak =
                lastDay === yesterday.toDateString() ? progress.streak + 1 : 1;
        }
        progress.lastPracticed = new Date();
        // Adjust level based on performance
        progress.currentLevel = analysis.recommendedLevel;
        // Cache updated progress
        await this.cache.set(cacheKey, progress, { ttl: 86400 });
        return progress;
    }
    /**
     * Initialize new user progress
     */
    initializeProgress(userId) {
        return {
            userId,
            currentLevel: 'A1',
            totalExercises: 0,
            averageAccuracy: 0,
            accentFamiliarity: new Map([
                ['US', 50],
                ['UK', 50],
                ['AU', 50],
                ['CA', 50],
                ['IN', 50],
            ]),
            speedProgress: new Map([
                [0.75, 0],
                [1.0, 0],
                [1.25, 0],
                [1.5, 0],
            ]),
            weakCategories: [],
            strongCategories: [],
            lastPracticed: new Date(),
            streak: 0,
        };
    }
    // ==================== AI FEEDBACK ====================
    /**
     * Generate personalized feedback
     */
    async generateFeedback(context) {
        try {
            const prompt = `
Student listening exercise result:
- Accuracy: ${context.accuracy}%
- Playback speed: ${context.playbackSpeed}x
- Common mistakes: ${context.mistakes.slice(0, 3).map((m) => m.type).join(', ')}
- Weak areas: ${context.weakAreas.join(', ')}

Provide encouraging feedback (2-3 sentences) with specific tips to improve.
`;
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4-turbo-preview',
                messages: [
                    {
                        role: 'system',
                        content: 'You are a supportive English listening coach.',
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
                temperature: 0.7,
                max_tokens: 150,
            });
            return (response.choices[0].message.content ||
                'Good effort! Keep practicing daily.');
        }
        catch (error) {
            console.error('Error generating feedback:', error);
            return 'Great work! Continue practicing to improve your listening skills.';
        }
    }
    // ==================== UTILITIES ====================
    normalizeText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .trim()
            .replace(/\s+/g, ' ');
    }
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++)
            matrix[i] = [i];
        for (let j = 0; j <= str1.length; j++)
            matrix[0][j] = j;
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    identifyWeakAreas(mistakes) {
        const areas = new Set();
        mistakes.forEach((mistake) => {
            switch (mistake.type) {
                case 'misheard':
                    areas.add('Sound discrimination');
                    break;
                case 'missing':
                    areas.add('Speech segmentation');
                    break;
                case 'grammar':
                    areas.add('Grammar structures');
                    break;
                case 'spelling':
                    areas.add('Spelling accuracy');
                    break;
            }
        });
        return Array.from(areas);
    }
    identifyStrongAreas(correctCount, totalWords) {
        const areas = [];
        if (correctCount / totalWords.length > 0.8) {
            areas.push('Overall comprehension');
        }
        return areas;
    }
    determineLevel(accuracy) {
        if (accuracy >= 90)
            return 'C2';
        if (accuracy >= 80)
            return 'C1';
        if (accuracy >= 70)
            return 'B2';
        if (accuracy >= 60)
            return 'B1';
        if (accuracy >= 50)
            return 'A2';
        return 'A1';
    }
    getSpeedMultiplier(speed) {
        // Bonus for faster speeds
        if (speed >= 1.5)
            return 1.2;
        if (speed >= 1.25)
            return 1.1;
        if (speed >= 1.0)
            return 1.0;
        return 0.9; // Slight penalty for slower speeds
    }
    randomAccent() {
        const accents = ['US', 'UK', 'AU', 'CA', 'IN'];
        return accents[Math.floor(Math.random() * accents.length)];
    }
    randomExerciseType() {
        const types = [
            'dictation',
            'comprehension',
            'fill_blanks',
            'multiple_choice',
        ];
        return types[Math.floor(Math.random() * types.length)];
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    async getExercise(_exerciseId) {
        // In production, fetch from database
        return null;
    }
}
exports.ListeningService = ListeningService;
// ==================== SINGLETON ====================
let listeningServiceInstance = null;
function getListeningService() {
    if (!listeningServiceInstance) {
        listeningServiceInstance = new ListeningService();
    }
    return listeningServiceInstance;
}
exports.default = getListeningService;
//# sourceMappingURL=listening.service.js.map