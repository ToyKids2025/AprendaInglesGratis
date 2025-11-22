'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Headphones,
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronRight,
  Volume2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const exercises = [
  {
    id: 1,
    audio: '/audio/exercise1.mp3',
    type: 'dictation',
    expectedText: 'Hello, my name is John.',
    level: 'A1',
  },
  {
    id: 2,
    audio: '/audio/exercise2.mp3',
    type: 'multiple-choice',
    question: 'Where is the speaker going?',
    options: ['To the store', 'To the airport', 'To the office', 'To the restaurant'],
    answer: 'To the airport',
    level: 'A1',
  },
  {
    id: 3,
    audio: '/audio/exercise3.mp3',
    type: 'fill-blanks',
    text: 'I would like to ___ a table for two people.',
    answer: 'book',
    level: 'A2',
  },
];

export default function ListeningPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentExercise = exercises[currentIndex];

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
    // In a real app, this would control audio playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleSubmit = () => {
    let correct = false;

    if (currentExercise.type === 'dictation') {
      correct = userAnswer.toLowerCase().trim() === currentExercise.expectedText?.toLowerCase().trim();
    } else if (currentExercise.type === 'multiple-choice') {
      correct = userAnswer === currentExercise.answer;
    } else if (currentExercise.type === 'fill-blanks') {
      correct = userAnswer.toLowerCase().trim() === currentExercise.answer?.toLowerCase().trim();
    }

    setIsCorrect(correct);
    setShowResult(true);
  };

  const handleNext = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowResult(false);
      setIsCorrect(null);
    }
  };

  const handleReset = () => {
    setUserAnswer('');
    setShowResult(false);
    setIsCorrect(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <div className="flex items-center gap-2">
              <Headphones className="w-5 h-5 text-purple-500" />
              <span className="font-medium">Listening</span>
            </div>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {exercises.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-purple-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Exercise Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                Nivel {currentExercise.level}
              </div>
              <span className="text-sm text-gray-500 capitalize">{currentExercise.type.replace('-', ' ')}</span>
            </div>

            {/* Audio Player */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                onClick={handlePlay}
                className={cn(
                  'w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg',
                  isPlaying ? 'bg-purple-600' : 'bg-purple-500 hover:bg-purple-600'
                )}
              >
                {isPlaying ? (
                  <Pause className="w-10 h-10 text-white" />
                ) : (
                  <Play className="w-10 h-10 text-white ml-1" />
                )}
              </button>
              <button className="p-3 text-gray-400 hover:text-gray-600 transition">
                <RotateCcw className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2 text-gray-400">
                <Volume2 className="w-5 h-5" />
                <div className="w-24 h-2 bg-gray-200 rounded-full">
                  <div className="w-3/4 h-full bg-purple-500 rounded-full" />
                </div>
              </div>
            </div>

            {/* Question/Instructions */}
            {currentExercise.type === 'dictation' && (
              <p className="text-center text-gray-600 mb-6">
                Ouca o audio e escreva exatamente o que voce ouvir
              </p>
            )}

            {currentExercise.type === 'multiple-choice' && (
              <p className="text-center text-lg font-medium text-gray-900 mb-6">
                {currentExercise.question}
              </p>
            )}

            {currentExercise.type === 'fill-blanks' && (
              <p className="text-center text-lg text-gray-900 mb-6">
                {currentExercise.text?.split('___')[0]}
                <span className="px-2 py-1 bg-purple-100 rounded mx-1">___</span>
                {currentExercise.text?.split('___')[1]}
              </p>
            )}

            {/* Answer Input */}
            {!showResult ? (
              <div className="space-y-4">
                {currentExercise.type === 'multiple-choice' ? (
                  <div className="grid gap-3">
                    {currentExercise.options?.map((option) => (
                      <button
                        key={option}
                        onClick={() => setUserAnswer(option)}
                        className={cn(
                          'p-4 rounded-xl border-2 text-left transition-all',
                          userAnswer === option
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder={
                      currentExercise.type === 'dictation'
                        ? 'Digite o que voce ouviu...'
                        : 'Digite a palavra que completa a frase...'
                    }
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={currentExercise.type === 'dictation' ? 3 : 1}
                  />
                )}

                <button
                  onClick={handleSubmit}
                  disabled={!userAnswer}
                  className="w-full py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Verificar
                </button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Result */}
                <div className={cn(
                  'flex items-center justify-center gap-3 p-6 rounded-xl',
                  isCorrect ? 'bg-green-50' : 'bg-red-50'
                )}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-10 h-10 text-green-500" />
                      <span className="text-xl font-bold text-green-700">Correto!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-10 h-10 text-red-500" />
                      <span className="text-xl font-bold text-red-700">Incorreto</span>
                    </>
                  )}
                </div>

                {!isCorrect && (
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-500 mb-1">Resposta correta:</p>
                    <p className="font-medium text-gray-900">
                      {currentExercise.expectedText || currentExercise.answer}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={handleReset}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Tentar novamente
                  </button>
                  {currentIndex < exercises.length - 1 && (
                    <button
                      onClick={handleNext}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                    >
                      Proximo
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
}
