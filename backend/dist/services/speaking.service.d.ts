/**
 * SPEAKING & PRONUNCIATION SERVICE - AprendaInglesGratis
 *
 * Advanced speech analysis and pronunciation feedback system
 *
 * Features:
 * - Speech-to-Text (STT) with multiple engines
 * - Phonetic analysis and scoring
 * - Pronunciation feedback with specific corrections
 * - Fluency assessment
 * - Accent detection
 * - Progress tracking
 * - AI-powered feedback generation
 * - Waveform analysis
 *
 * Algorithms:
 * - Levenshtein Distance (text similarity)
 * - Phoneme comparison (IPA)
 * - Dynamic Time Warping (DTW) for audio
 * - Confidence scoring
 *
 * @module SpeakingService
 * @version 1.0.0
 */
interface PronunciationAnalysis {
    overallScore: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    prosody: number;
    transcription: string;
    expectedText: string;
    feedback: PronunciationFeedback;
    phonemes: PhonemeAnalysis[];
    mistakes: Mistake[];
    recommendations: string[];
}
interface PronunciationFeedback {
    overall: string;
    strengths: string[];
    improvements: string[];
    specificTips: string[];
}
interface PhonemeAnalysis {
    expected: string;
    actual: string;
    score: number;
    position: number;
    word: string;
}
interface Mistake {
    type: 'omission' | 'substitution' | 'insertion' | 'stress' | 'intonation';
    word: string;
    expected: string;
    actual: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
}
interface SpeakingProgress {
    userId: string;
    totalAttempts: number;
    averageScore: number;
    improvementRate: number;
    commonMistakes: Map<string, number>;
    strongPhonemes: string[];
    weakPhonemes: string[];
    lastPracticed: Date;
}
export declare class SpeakingService {
    private cache;
    private openai;
    constructor();
    /**
     * Analyze pronunciation from audio blob
     */
    analyzePronunciation(userId: string, phraseId: string, audioBlob: Buffer | string, expectedText: string): Promise<PronunciationAnalysis>;
    /**
     * Convert audio to text using OpenAI Whisper
     */
    private speechToText;
    /**
     * Calculate pronunciation accuracy using Levenshtein distance
     */
    private calculateAccuracy;
    /**
     * Levenshtein distance algorithm
     */
    private levenshteinDistance;
    /**
     * Analyze individual phonemes
     */
    private analyzePhonemes;
    /**
     * Convert text to IPA phonemes (simplified)
     */
    private textToPhonemes;
    /**
     * Calculate similarity between two phonemes
     */
    private calculatePhonemeScore;
    /**
     * Detect specific pronunciation mistakes
     */
    private detectMistakes;
    /**
     * Align expected and actual words for comparison
     */
    private alignWords;
    /**
     * Calculate mistake severity
     */
    private calculateMistakeSeverity;
    /**
     * Calculate fluency score
     */
    private calculateFluency;
    /**
     * Calculate completeness (did they say everything?)
     */
    private calculateCompleteness;
    /**
     * Analyze prosody (intonation, rhythm, stress)
     */
    private analyzeProsody;
    /**
     * Calculate weighted overall score
     */
    private calculateOverallScore;
    /**
     * Generate personalized feedback using GPT-4
     */
    private generateFeedback;
    /**
     * Generate specific recommendations
     */
    private generateRecommendations;
    /**
     * Track user speaking progress
     */
    trackProgress(userId: string, analysis: PronunciationAnalysis): Promise<SpeakingProgress>;
    /**
     * Normalize text for comparison
     */
    private normalizeText;
}
export declare function getSpeakingService(): SpeakingService;
export default getSpeakingService;
//# sourceMappingURL=speaking.service.d.ts.map