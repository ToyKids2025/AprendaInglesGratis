/**
 * PRONUNCIATION PRACTICE PAGE
 * Practice pronunciation with AI-powered feedback
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Mic, Volume2, RotateCcw, ArrowLeft, CheckCircle, XCircle, Trophy } from 'lucide-react'
import { api } from '../services/api'
import {
  useSpeechRecognition,
  calculatePronunciationScore,
  getPronunciationFeedback,
} from '../hooks/useSpeechRecognition'

interface Phrase {
  id: number
  en: string
  pt: string
  tip?: string
  difficulty: number
}

interface PracticeResult {
  phraseId: number
  userInput: string
  expectedPhrase: string
  score: number
  confidence: number
  attempts: number
}

export default function PronunciationPractice() {
  const { categorySlug } = useParams<{ categorySlug: string }>()
  const [phrases, setPhrases] = useState<Phrase[]>([])
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [results, setResults] = useState<PracticeResult[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showTranslation, setShowTranslation] = useState(false)
  const [showTip, setShowTip] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [lastScore, setLastScore] = useState<number | null>(null)

  const currentPhrase = phrases[currentPhraseIndex]

  // Speech recognition hook
  const {
    isListening,
    isSupported,
    transcript,
    confidence,
    error: speechError,
    start,
    stop,
    reset,
  } = useSpeechRecognition({
    lang: 'en-US',
    continuous: false,
    interimResults: false,
    maxAlternatives: 3,
    onResult: (result) => {
      if (result.isFinal && currentPhrase) {
        handlePronunciationResult(result.transcript, result.confidence)
      }
    },
  })

  // Load phrases for category
  useEffect(() => {
    loadPhrases()
  }, [categorySlug])

  const loadPhrases = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(`/api/lessons/categories/${categorySlug}`)
      if (response.data.phrases) {
        setPhrases(response.data.phrases.slice(0, 10)) // Limit to 10 phrases per session
      }
    } catch (error) {
      console.error('Failed to load phrases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePronunciationResult = (userInput: string, confidenceScore: number) => {
    if (!currentPhrase) return

    const score = calculatePronunciationScore(userInput, currentPhrase.en)
    setLastScore(score)
    setAttemptCount((prev) => prev + 1)

    const result: PracticeResult = {
      phraseId: currentPhrase.id,
      userInput,
      expectedPhrase: currentPhrase.en,
      score,
      confidence: confidenceScore,
      attempts: attemptCount + 1,
    }

    setResults((prev) => [...prev, result])

    // Auto-advance if score is good enough
    if (score >= 85) {
      setTimeout(() => {
        nextPhrase()
      }, 2000)
    }
  }

  const nextPhrase = () => {
    if (currentPhraseIndex < phrases.length - 1) {
      setCurrentPhraseIndex((prev) => prev + 1)
      reset()
      setLastScore(null)
      setAttemptCount(0)
      setShowTranslation(false)
      setShowTip(false)
    }
  }

  const previousPhrase = () => {
    if (currentPhraseIndex > 0) {
      setCurrentPhraseIndex((prev) => prev - 1)
      reset()
      setLastScore(null)
      setAttemptCount(0)
      setShowTranslation(false)
      setShowTip(false)
    }
  }

  const retry = () => {
    reset()
    setLastScore(null)
    setAttemptCount(0)
  }

  const speakPhrase = (text: string, rate: number = 0.9) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = rate
      window.speechSynthesis.speak(utterance)
    }
  }

  const completePractice = async () => {
    // Calculate average score
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length

    // Update progress
    try {
      for (const result of results) {
        await api.post('/api/lessons/progress', {
          phraseId: result.phraseId,
          correct: result.score >= 70,
          timeSpent: 30, // Approximate
        })
      }
    } catch (error) {
      console.error('Failed to update progress:', error)
    }

    // Show completion message
    alert(`Practice complete! Average score: ${Math.round(avgScore)}%`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!isSupported) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Speech Recognition Not Supported
          </h2>
          <p className="text-gray-600 mb-6">
            Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.
          </p>
          <Link
            to="/lessons"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    )
  }

  if (phrases.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md bg-white rounded-xl shadow-lg p-8 text-center">
          <p className="text-gray-600 mb-6">No phrases available for this category.</p>
          <Link
            to="/lessons"
            className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Back to Lessons
          </Link>
        </div>
      </div>
    )
  }

  // Session complete
  if (currentPhraseIndex >= phrases.length) {
    const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length
    const excellentCount = results.filter((r) => r.score >= 85).length
    const goodCount = results.filter((r) => r.score >= 70 && r.score < 85).length

    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <div className="bg-white rounded-xl shadow-xl p-8">
            <div className="text-center mb-8">
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Practice Complete!</h1>
              <p className="text-gray-600">Great job on completing the pronunciation practice!</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-primary-50 rounded-lg">
                <div className="text-3xl font-bold text-primary-600">{Math.round(avgScore)}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{excellentCount}</div>
                <div className="text-sm text-gray-600">Excellent</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{goodCount}</div>
                <div className="text-sm text-gray-600">Good</div>
              </div>
            </div>

            {/* Results List */}
            <div className="mb-8">
              <h3 className="font-bold text-gray-900 mb-4">Results:</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => {
                  const feedback = getPronunciationFeedback(result.score)
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{result.expectedPhrase}</div>
                        <div className="text-sm text-gray-500">{result.userInput}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-primary-600">
                          {result.score}% {feedback.emoji}
                        </div>
                        <div className="text-xs text-gray-500">{result.attempts} attempts</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Link
                to="/lessons"
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-center"
              >
                Back to Lessons
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                Practice Again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const feedback = lastScore !== null ? getPronunciationFeedback(lastScore) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/lessons" className="flex items-center gap-2 text-primary-700 hover:text-primary-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Lessons
          </Link>
          <div className="text-primary-700 font-semibold">
            {currentPhraseIndex + 1} / {phrases.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-white rounded-full h-3 shadow-inner">
            <div
              className="bg-primary-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentPhraseIndex + 1) / phrases.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Phrase Display */}
          <div className="p-8 text-center bg-gradient-to-br from-white to-primary-50">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentPhrase.en}</h2>

            {/* Listen Button */}
            <div className="flex gap-2 justify-center mb-6">
              <button
                onClick={() => speakPhrase(currentPhrase.en, 0.8)}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Listen (Slow)
              </button>
              <button
                onClick={() => speakPhrase(currentPhrase.en, 1.0)}
                className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition flex items-center gap-2"
              >
                <Volume2 className="w-5 h-5" />
                Listen (Normal)
              </button>
            </div>

            {/* Translation Toggle */}
            <button
              onClick={() => setShowTranslation(!showTranslation)}
              className="text-primary-600 hover:text-primary-800 text-sm mb-2"
            >
              {showTranslation ? 'Hide' : 'Show'} Translation
            </button>
            {showTranslation && <p className="text-gray-600 text-lg mb-4">{currentPhrase.pt}</p>}

            {/* Tip Toggle */}
            {currentPhrase.tip && (
              <>
                <button
                  onClick={() => setShowTip(!showTip)}
                  className="text-primary-600 hover:text-primary-800 text-sm"
                >
                  {showTip ? 'Hide' : 'Show'} Tip
                </button>
                {showTip && (
                  <p className="text-sm text-gray-500 italic mt-2">💡 {currentPhrase.tip}</p>
                )}
              </>
            )}
          </div>

          {/* Recording Area */}
          <div className="p-8 bg-white">
            {/* Microphone Button */}
            <div className="text-center mb-6">
              <button
                onClick={isListening ? stop : start}
                disabled={!isSupported}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all transform ${
                  isListening
                    ? 'bg-red-500 hover:bg-red-600 scale-110 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700 hover:scale-105'
                } text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <Mic className="w-12 h-12" />
              </button>
              <p className="text-sm text-gray-600 mt-4">
                {isListening ? 'Listening... Speak now!' : 'Click to start recording'}
              </p>
            </div>

            {/* Transcript */}
            {transcript && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">You said:</p>
                <p className="text-lg text-gray-900">{transcript}</p>
                {confidence > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Confidence: {Math.round(confidence * 100)}%
                  </p>
                )}
              </div>
            )}

            {/* Feedback */}
            {feedback && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  feedback.level === 'excellent'
                    ? 'bg-green-50 border-2 border-green-200'
                    : feedback.level === 'good'
                    ? 'bg-blue-50 border-2 border-blue-200'
                    : feedback.level === 'fair'
                    ? 'bg-yellow-50 border-2 border-yellow-200'
                    : 'bg-red-50 border-2 border-red-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl mb-2">{feedback.emoji}</p>
                    <p className="font-bold text-lg">{feedback.message}</p>
                    <p className="text-sm text-gray-600">Score: {lastScore}%</p>
                  </div>
                  {lastScore! >= 85 ? (
                    <CheckCircle className="w-12 h-12 text-green-500" />
                  ) : (
                    <RotateCcw className="w-12 h-12 text-gray-400" />
                  )}
                </div>
              </div>
            )}

            {/* Error */}
            {speechError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{speechError}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={retry}
                disabled={!transcript}
                className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Retry
              </button>
              <button
                onClick={previousPhrase}
                disabled={currentPhraseIndex === 0}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <button
                onClick={nextPhrase}
                disabled={currentPhraseIndex === phrases.length - 1}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next Phrase
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              Attempt {attemptCount} • Aim for 85% or higher to pass
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
