/**
 * AI CONVERSATION PAGE
 * Página para praticar conversação em inglês com IA
 */

import { useState, useEffect, useRef } from 'react'
import { Send, Mic, MicOff, Volume2, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { api } from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface Conversation {
  id: string
  scenario: string
  difficulty: number
  messages: Message[]
}

export default function AIConversation() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scenarios disponíveis
  const scenarios = [
    { id: 'restaurant', name: 'Restaurant Order', icon: '🍽️', difficulty: 1 },
    { id: 'airport', name: 'Airport Check-in', icon: '✈️', difficulty: 1 },
    { id: 'hotel', name: 'Hotel Reservation', icon: '🏨', difficulty: 1 },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', difficulty: 2 },
    { id: 'job-interview', name: 'Job Interview', icon: '💼', difficulty: 4 },
    { id: 'business', name: 'Business Meeting', icon: '🤝', difficulty: 5 },
  ]

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  // Load conversations on mount
  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const response = await api.get('/api/ai/conversations')
      if (response.data.success) {
        setConversations(response.data.data)
      }
    } catch (err) {
      console.error('Failed to load conversations:', err)
    }
  }

  const startNewConversation = async (scenario: string, difficulty: number) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/ai/conversation/start', {
        scenario,
        difficulty,
      })

      if (response.data.success) {
        const conversationId = response.data.data.conversationId
        const initialMessage = response.data.data.message

        const newConversation: Conversation = {
          id: conversationId,
          scenario,
          difficulty,
          messages: [
            {
              role: 'assistant',
              content: initialMessage,
              timestamp: new Date().toISOString(),
            },
          ],
        }

        setActiveConversation(newConversation)
        setConversations((prev) => [newConversation, ...prev])
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to start conversation')
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation || isLoading) return

    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    }

    // Add user message immediately
    setActiveConversation((prev) => {
      if (!prev) return prev
      return {
        ...prev,
        messages: [...prev.messages, userMessage],
      }
    })

    setMessage('')
    setIsLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/ai/conversation/message', {
        conversationId: activeConversation.id,
        message: message.trim(),
      })

      if (response.data.success) {
        const aiMessage: Message = {
          role: 'assistant',
          content: response.data.data.message,
          timestamp: new Date().toISOString(),
        }

        setActiveConversation((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            messages: [...prev.messages, aiMessage],
          }
        })

        // Speak AI response
        speakText(response.data.data.message)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setMessage(transcript)
      setIsListening(false)
    }

    recognition.onerror = (event: any) => {
      setError(`Voice recognition error: ${event.error}`)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = 0.9
      window.speechSynthesis.speak(utterance)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary-900 mb-2">
            🤖 AI Conversation Practice
          </h1>
          <p className="text-primary-600">
            Practice English with AI • Level: {user?.level || 1} • XP: {user?.xp || 0}
          </p>
        </div>

        {!activeConversation ? (
          /* Scenario Selection */
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-primary-900 mb-6">
              Choose a conversation scenario:
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => startNewConversation(scenario.name, scenario.difficulty)}
                  disabled={isLoading}
                  className="bg-white rounded-xl p-6 text-left hover:shadow-lg transition-all hover:scale-105 disabled:opacity-50"
                >
                  <div className="text-4xl mb-3">{scenario.icon}</div>
                  <h3 className="text-lg font-bold text-primary-900 mb-2">
                    {scenario.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-primary-600">
                    <span className="px-2 py-1 bg-primary-100 rounded">
                      Level {scenario.difficulty}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}
          </div>
        ) : (
          /* Active Conversation */
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-xl shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">{activeConversation.scenario}</h2>
                  <p className="text-primary-200 text-sm">
                    Level {activeConversation.difficulty} • {activeConversation.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={() => setActiveConversation(null)}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
                >
                  End Conversation
                </button>
              </div>

              {/* Messages */}
              <div className="h-[500px] overflow-y-auto p-6 bg-primary-50">
                {activeConversation.messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-primary-900 shadow'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => speakText(msg.content)}
                            className="text-primary-600 hover:text-primary-800 mt-1"
                            title="Listen"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <span className="text-xs opacity-70 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white rounded-2xl px-4 py-3 shadow">
                      <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 bg-white border-t border-primary-200">
                {error && (
                  <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                    {error}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message in English..."
                      className="w-full px-4 py-3 border border-primary-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={2}
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    onClick={startVoiceRecognition}
                    disabled={isLoading || isListening}
                    className={`p-3 rounded-lg transition ${
                      isListening
                        ? 'bg-red-500 text-white'
                        : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                    }`}
                    title="Voice input"
                  >
                    {isListening ? (
                      <MicOff className="w-5 h-5" />
                    ) : (
                      <Mic className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-primary-600 mt-2">
                  Press Enter to send • Shift + Enter for new line • Click mic for voice input
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
