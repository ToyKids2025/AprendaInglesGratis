/**
 * ENHANCED SPEECH RECOGNITION HOOK
 * Provides advanced voice recognition with confidence scores and error handling
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface SpeechRecognitionResult {
  transcript: string
  confidence: number
  isFinal: boolean
  alternatives?: Array<{ transcript: string; confidence: number }>
}

interface UseSpeechRecognitionProps {
  lang?: string
  continuous?: boolean
  interimResults?: boolean
  maxAlternatives?: number
  onResult?: (result: SpeechRecognitionResult) => void
  onError?: (error: string) => void
}

interface SpeechRecognitionHook {
  isListening: boolean
  isSupported: boolean
  transcript: string
  confidence: number
  error: string | null
  start: () => void
  stop: () => void
  reset: () => void
}

export function useSpeechRecognition({
  lang = 'en-US',
  continuous = false,
  interimResults = true,
  maxAlternatives = 3,
  onResult,
  onError,
}: UseSpeechRecognitionProps = {}): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [confidence, setConfidence] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  // Check if speech recognition is supported
  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  // Initialize speech recognition
  useEffect(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser')
      return
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

    const recognition = new SpeechRecognition()
    recognition.lang = lang
    recognition.continuous = continuous
    recognition.interimResults = interimResults
    recognition.maxAlternatives = maxAlternatives

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      console.log('🎤 Speech recognition started')
    }

    recognition.onresult = (event: any) => {
      const results = event.results
      const lastResultIndex = results.length - 1
      const lastResult = results[lastResultIndex]

      const newTranscript = lastResult[0].transcript
      const newConfidence = lastResult[0].confidence

      // Get alternatives
      const alternatives: Array<{ transcript: string; confidence: number }> = []
      for (let i = 0; i < lastResult.length; i++) {
        alternatives.push({
          transcript: lastResult[i].transcript,
          confidence: lastResult[i].confidence,
        })
      }

      setTranscript(newTranscript)
      setConfidence(newConfidence)

      const result: SpeechRecognitionResult = {
        transcript: newTranscript,
        confidence: newConfidence,
        isFinal: lastResult.isFinal,
        alternatives: alternatives.slice(0, maxAlternatives),
      }

      if (onResult) {
        onResult(result)
      }

      console.log(
        `📝 Transcript: "${newTranscript}" (${(newConfidence * 100).toFixed(0)}% confidence)`
      )
    }

    recognition.onerror = (event: any) => {
      const errorMessage = getErrorMessage(event.error)
      setError(errorMessage)
      setIsListening(false)

      if (onError) {
        onError(errorMessage)
      }

      console.error('❌ Speech recognition error:', event.error)
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log('🎤 Speech recognition ended')
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
    }
  }, [lang, continuous, interimResults, maxAlternatives, isSupported, onResult, onError])

  const start = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported')
      return
    }

    if (isListening) {
      console.warn('Speech recognition is already active')
      return
    }

    try {
      recognitionRef.current?.start()
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to start speech recognition'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    }
  }, [isSupported, isListening, onError])

  const stop = useCallback(() => {
    if (!isListening) return

    try {
      recognitionRef.current?.stop()
    } catch (err: any) {
      console.error('Failed to stop speech recognition:', err)
    }
  }, [isListening])

  const reset = useCallback(() => {
    setTranscript('')
    setConfidence(0)
    setError(null)
  }, [])

  return {
    isListening,
    isSupported,
    transcript,
    confidence,
    error,
    start,
    stop,
    reset,
  }
}

/**
 * Convert speech recognition error codes to user-friendly messages
 */
function getErrorMessage(errorCode: string): string {
  const errorMessages: Record<string, string> = {
    'no-speech': 'No speech was detected. Please try again.',
    'audio-capture': 'No microphone was found. Please check your microphone.',
    'not-allowed': 'Microphone permission denied. Please allow microphone access.',
    'network': 'Network error occurred. Please check your connection.',
    'aborted': 'Speech recognition was aborted.',
    'service-not-allowed': 'Speech recognition service is not allowed.',
    'bad-grammar': 'Grammar error occurred.',
    'language-not-supported': 'Language is not supported.',
  }

  return errorMessages[errorCode] || `Speech recognition error: ${errorCode}`
}

/**
 * Calculate pronunciation similarity score (0-100)
 * Compares user input with expected phrase
 */
export function calculatePronunciationScore(
  userInput: string,
  expectedPhrase: string
): number {
  const normalize = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .trim()

  const normalizedInput = normalize(userInput)
  const normalizedExpected = normalize(expectedPhrase)

  // Exact match
  if (normalizedInput === normalizedExpected) {
    return 100
  }

  // Calculate Levenshtein distance
  const distance = levenshteinDistance(normalizedInput, normalizedExpected)
  const maxLength = Math.max(normalizedInput.length, normalizedExpected.length)

  if (maxLength === 0) return 0

  // Convert distance to similarity percentage
  const similarity = ((maxLength - distance) / maxLength) * 100

  return Math.max(0, Math.min(100, Math.round(similarity)))
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = []

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Get feedback message based on pronunciation score
 */
export function getPronunciationFeedback(score: number): {
  level: 'excellent' | 'good' | 'fair' | 'poor'
  message: string
  emoji: string
} {
  if (score >= 95) {
    return {
      level: 'excellent',
      message: 'Perfect pronunciation!',
      emoji: '🎉',
    }
  } else if (score >= 85) {
    return {
      level: 'excellent',
      message: 'Excellent pronunciation!',
      emoji: '🌟',
    }
  } else if (score >= 70) {
    return {
      level: 'good',
      message: 'Good pronunciation! Keep practicing.',
      emoji: '👍',
    }
  } else if (score >= 50) {
    return {
      level: 'fair',
      message: 'Fair pronunciation. Try to speak more clearly.',
      emoji: '🔄',
    }
  } else {
    return {
      level: 'poor',
      message: 'Keep practicing! Try speaking slower and clearer.',
      emoji: '💪',
    }
  }
}

export default useSpeechRecognition
