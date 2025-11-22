'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  ArrowLeft,
  Volume2,
  RotateCcw,
  CheckCircle,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const phrases = [
  { id: 1, text: 'Hello, how are you?', translation: 'Ola, como voce esta?', level: 'A1' },
  { id: 2, text: 'Nice to meet you!', translation: 'Prazer em conhece-lo!', level: 'A1' },
  { id: 3, text: 'What is your name?', translation: 'Qual e o seu nome?', level: 'A1' },
  { id: 4, text: 'I am learning English.', translation: 'Eu estou aprendendo ingles.', level: 'A1' },
  { id: 5, text: 'Where do you live?', translation: 'Onde voce mora?', level: 'A2' },
];

export default function SpeakingPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const currentPhrase = phrases[currentIndex];

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording and simulate analysis
      setIsRecording(false);
      setTimeout(() => {
        setScore(Math.floor(Math.random() * 30) + 70); // Random score 70-100
        setShowResult(true);
      }, 1500);
    } else {
      setIsRecording(true);
      setShowResult(false);
      setScore(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < phrases.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowResult(false);
      setScore(null);
    }
  };

  const handleReset = () => {
    setShowResult(false);
    setScore(null);
  };

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-green-500';
    if (s >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreIcon = (s: number) => {
    if (s >= 70) return CheckCircle;
    return XCircle;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <div className="text-sm text-gray-500">
              {currentIndex + 1} / {phrases.length}
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-gray-200">
        <div
          className="h-full bg-primary-500 transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / phrases.length) * 100}%` }}
        />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          {/* Phrase Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium mb-6">
              Nivel {currentPhrase.level}
            </div>

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {currentPhrase.text}
            </h2>
            <p className="text-gray-500">{currentPhrase.translation}</p>

            <button className="mt-6 flex items-center gap-2 mx-auto text-primary-600 hover:text-primary-700 transition">
              <Volume2 className="w-5 h-5" />
              Ouvir pronuncia
            </button>
          </div>

          {/* Recording Section */}
          {!showResult ? (
            <div className="space-y-6">
              <motion.button
                onClick={handleRecord}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg',
                  isRecording
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-primary-600 hover:bg-primary-700'
                )}
              >
                {isRecording ? (
                  <MicOff className="w-10 h-10 text-white" />
                ) : (
                  <Mic className="w-10 h-10 text-white" />
                )}
              </motion.button>
              <p className="text-gray-600">
                {isRecording ? 'Gravando... Clique para parar' : 'Clique para gravar sua voz'}
              </p>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              {/* Result */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className={cn('flex items-center justify-center gap-3 mb-4', getScoreColor(score!))}>
                  {(() => {
                    const ScoreIcon = getScoreIcon(score!);
                    return <ScoreIcon className="w-12 h-12" />;
                  })()}
                  <span className="text-5xl font-bold">{score}%</span>
                </div>
                <p className="text-gray-600">
                  {score! >= 90
                    ? 'Excelente! Sua pronuncia esta otima!'
                    : score! >= 70
                    ? 'Muito bom! Continue praticando!'
                    : 'Precisa melhorar. Tente novamente!'}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition"
                >
                  <RotateCcw className="w-5 h-5" />
                  Tentar novamente
                </button>
                {currentIndex < phrases.length - 1 && (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition"
                  >
                    Proxima
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
