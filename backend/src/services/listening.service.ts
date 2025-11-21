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

import { getCacheService, CacheKeys } from './cache.service';
import OpenAI from 'openai';

// ==================== TYPES ====================

interface ListeningExercise {
  id: string;
  phraseId: string;
  phrase: string;
  translation: string;
  audioUrl: string;
  accent: Accent;
  difficulty: Difficulty;
  category: string;
  duration: number; // seconds
  type: ExerciseType;
  questions?: ComprehensionQuestion[];
  fillInBlanks?: BlankPosition[];
}

type Accent = 'US' | 'UK' | 'AU' | 'CA' | 'IN';
type Difficulty = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type ExerciseType =
  | 'dictation'
  | 'comprehension'
  | 'fill_blanks'
  | 'multiple_choice'
  | 'true_false';

interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface BlankPosition {
  position: number; // Word index
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
  score: number; // 0-100
  playbackSpeed: number;
  attempts: number;
  timeSpent: number; // seconds
  hintsUsed: number;
  timestamp: Date;
}

interface ListeningAnalysis {
  accuracy: number; // 0-100
  comprehensionScore: number;
  weakAreas: string[]; // Grammar structures, vocabulary, etc.
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
  accentFamiliarity: Map<Accent, number>; // 0-100
  speedProgress: Map<number, number>; // speed -> accuracy
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

// ==================== LISTENING SERVICE CLASS ====================

export class ListeningService {
  private cache: ReturnType<typeof getCacheService>;
  private openai: OpenAI;

  constructor() {
    this.cache = getCacheService();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // ==================== SESSION MANAGEMENT ====================

  /**
   * Create a new listening session
   */
  async createSession(
    userId: string,
    settings: SessionSettings
  ): Promise<ListeningSession> {
    // Get exercises based on settings
    const exercises = await this.getExercises(settings);

    const session: ListeningSession = {
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
  private async getExercises(
    settings: SessionSettings
  ): Promise<ListeningExercise[]> {
    // In production, fetch from database
    // For now, return mock data
    const exercises: ListeningExercise[] = [];

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
  async checkDictation(
    exerciseId: string,
    userAnswer: string,
    correctAnswer: string,
    playbackSpeed: number
  ): Promise<ListeningAnalysis> {
    // Normalize text
    const userNorm = this.normalizeText(userAnswer);
    const correctNorm = this.normalizeText(correctAnswer);

    // Calculate word-level accuracy
    const userWords = userNorm.split(' ');
    const correctWords = correctNorm.split(' ');

    let correctCount = 0;
    const mistakes: ListeningMistake[] = [];

    // Compare word by word
    for (let i = 0; i < correctWords.length; i++) {
      const correctWord = correctWords[i];
      const userWord = userWords[i] || '';

      if (correctWord === userWord) {
        correctCount++;
      } else {
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
  private analyzeMistake(
    expected: string,
    actual: string,
    context: string[]
  ): ListeningMistake {
    // Determine mistake type
    let type: ListeningMistake['type'] = 'misheard';

    if (!actual || actual === '') {
      type = 'missing';
    } else if (this.isSimilarSound(expected, actual)) {
      type = 'misheard';
    } else if (this.isGrammarError(expected, actual)) {
      type = 'grammar';
    } else if (this.isSpellingError(expected, actual)) {
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
  private isSimilarSound(word1: string, word2: string): boolean {
    const similarPairs = [
      ['they', 'there', 'their'],
      ['to', 'too', 'two'],
      ['your', "you're"],
      ['its', "it's"],
      ['then', 'than'],
    ];

    return similarPairs.some(
      (pair) => pair.includes(word1) && pair.includes(word2)
    );
  }

  /**
   * Check if it's a grammar error
   */
  private isGrammarError(expected: string, actual: string): boolean {
    // Common grammar confusions
    const grammarPairs = [
      ['is', 'are'],
      ['was', 'were'],
      ['have', 'has'],
      ['do', 'does'],
    ];

    return grammarPairs.some(
      ([a, b]) =>
        (expected === a && actual === b) || (expected === b && actual === a)
    );
  }

  /**
   * Check if it's just a spelling error
   */
  private isSpellingError(expected: string, actual: string): boolean {
    if (Math.abs(expected.length - actual.length) > 2) return false;

    // Levenshtein distance
    const distance = this.levenshteinDistance(expected, actual);
    return distance <= 2;
  }

  /**
   * Get suggestion based on mistake type
   */
  private getSuggestion(
    type: ListeningMistake['type'],
    expected: string,
    actual: string
  ): string {
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
  async generateComprehensionQuestions(
    phrase: string,
    difficulty: Difficulty,
    count: number = 3
  ): Promise<ComprehensionQuestion[]> {
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
            content:
              'You are an English teacher creating listening comprehension questions.',
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
      if (!content) throw new Error('No response from AI');

      const questions = JSON.parse(content);
      return questions.questions || [];
    } catch (error) {
      console.error('Error generating questions:', error);
      return [];
    }
  }

  /**
   * Check comprehension answer
   */
  checkComprehensionAnswer(
    question: ComprehensionQuestion,
    userAnswer: number
  ): {
    isCorrect: boolean;
    explanation: string;
  } {
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
  generateFillBlanks(
    phrase: string,
    difficulty: Difficulty
  ): {
    phraseWithBlanks: string;
    blanks: BlankPosition[];
  } {
    const words = phrase.split(' ');
    const blanks: BlankPosition[] = [];

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
  private getBlankCount(wordCount: number, difficulty: Difficulty): number {
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
  private selectBlankIndices(wordCount: number, blankCount: number): number[] {
    const indices: number[] = [];
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
  private generateHints(word: string): string[] {
    const hints: string[] = [];

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
  checkFillBlanks(
    blanks: BlankPosition[],
    userAnswers: string[]
  ): {
    score: number;
    results: Array<{
      correct: boolean;
      expected: string;
      actual: string;
    }>;
  } {
    let correctCount = 0;
    const results: Array<{
      correct: boolean;
      expected: string;
      actual: string;
    }> = [];

    blanks.forEach((blank, index) => {
      const userAnswer = this.normalizeText(userAnswers[index] || '');
      const correctAnswer = this.normalizeText(blank.word);
      const correct = userAnswer === correctAnswer;

      if (correct) correctCount++;

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
  async trackProgress(
    userId: string,
    attempt: ListeningAttempt,
    analysis: ListeningAnalysis
  ): Promise<ListeningProgress> {
    const cacheKey = `listening:progress:${userId}`;

    const progress: ListeningProgress =
      (await this.cache.get(cacheKey)) ||
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
      const currentFamiliarity =
        progress.accentFamiliarity.get(exercise.accent) || 50;
      const newFamiliarity =
        currentFamiliarity * 0.9 + analysis.accuracy * 0.1;
      progress.accentFamiliarity.set(exercise.accent, newFamiliarity);
    }

    // Update speed progress
    const speedAccuracy =
      progress.speedProgress.get(attempt.playbackSpeed) || 0;
    progress.speedProgress.set(
      attempt.playbackSpeed,
      speedAccuracy * 0.8 + analysis.accuracy * 0.2
    );

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
  private initializeProgress(userId: string): ListeningProgress {
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
  private async generateFeedback(context: {
    accuracy: number;
    mistakes: ListeningMistake[];
    playbackSpeed: number;
    weakAreas: string[];
  }): Promise<string> {
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

      return (
        response.choices[0].message.content ||
        'Good effort! Keep practicing daily.'
      );
    } catch (error) {
      console.error('Error generating feedback:', error);
      return 'Great work! Continue practicing to improve your listening skills.';
    }
  }

  // ==================== UTILITIES ====================

  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()
      .replace(/\s+/g, ' ');
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) matrix[i] = [i];
    for (let j = 0; j <= str1.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private identifyWeakAreas(mistakes: ListeningMistake[]): string[] {
    const areas = new Set<string>();

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

  private identifyStrongAreas(
    correctCount: number,
    totalWords: string[]
  ): string[] {
    const areas: string[] = [];

    if (correctCount / totalWords.length > 0.8) {
      areas.push('Overall comprehension');
    }

    return areas;
  }

  private determineLevel(accuracy: number): Difficulty {
    if (accuracy >= 90) return 'C2';
    if (accuracy >= 80) return 'C1';
    if (accuracy >= 70) return 'B2';
    if (accuracy >= 60) return 'B1';
    if (accuracy >= 50) return 'A2';
    return 'A1';
  }

  private getSpeedMultiplier(speed: number): number {
    // Bonus for faster speeds
    if (speed >= 1.5) return 1.2;
    if (speed >= 1.25) return 1.1;
    if (speed >= 1.0) return 1.0;
    return 0.9; // Slight penalty for slower speeds
  }

  private randomAccent(): Accent {
    const accents: Accent[] = ['US', 'UK', 'AU', 'CA', 'IN'];
    return accents[Math.floor(Math.random() * accents.length)];
  }

  private randomExerciseType(): ExerciseType {
    const types: ExerciseType[] = [
      'dictation',
      'comprehension',
      'fill_blanks',
      'multiple_choice',
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getExercise(
    exerciseId: string
  ): Promise<ListeningExercise | null> {
    // In production, fetch from database
    return null;
  }
}

// ==================== SINGLETON ====================

let listeningServiceInstance: ListeningService | null = null;

export function getListeningService(): ListeningService {
  if (!listeningServiceInstance) {
    listeningServiceInstance = new ListeningService();
  }
  return listeningServiceInstance;
}

export default getListeningService;
