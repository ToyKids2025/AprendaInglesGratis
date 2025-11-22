'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ArrowLeft,
  Lock,
  CheckCircle,
  Star,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { cn, getLevelColor } from '@/lib/utils';

const categories = [
  { id: 'all', name: 'Todas' },
  { id: 'greetings', name: 'Saudacoes' },
  { id: 'food', name: 'Comida' },
  { id: 'travel', name: 'Viagem' },
  { id: 'work', name: 'Trabalho' },
  { id: 'shopping', name: 'Compras' },
];

const lessons = [
  {
    id: 1,
    title: 'Saudacoes basicas',
    description: 'Aprenda a cumprimentar pessoas em ingles',
    category: 'greetings',
    level: 'A1',
    duration: '15 min',
    phrases: 10,
    completed: true,
    score: 95,
  },
  {
    id: 2,
    title: 'Apresentando-se',
    description: 'Como se apresentar em diferentes situacoes',
    category: 'greetings',
    level: 'A1',
    duration: '20 min',
    phrases: 12,
    completed: true,
    score: 88,
  },
  {
    id: 3,
    title: 'No restaurante',
    description: 'Peca comida e bebida como um nativo',
    category: 'food',
    level: 'A1',
    duration: '25 min',
    phrases: 15,
    completed: false,
    progress: 75,
  },
  {
    id: 4,
    title: 'Fazendo compras',
    description: 'Vocabulario essencial para ir as compras',
    category: 'shopping',
    level: 'A1',
    duration: '20 min',
    phrases: 14,
    locked: false,
  },
  {
    id: 5,
    title: 'No aeroporto',
    description: 'Tudo que voce precisa saber para viajar',
    category: 'travel',
    level: 'A2',
    duration: '30 min',
    phrases: 18,
    locked: false,
  },
  {
    id: 6,
    title: 'Reuniao de negocios',
    description: 'Ingles profissional para reunioes',
    category: 'work',
    level: 'B1',
    duration: '35 min',
    phrases: 20,
    locked: true,
  },
];

export default function LessonsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredLessons = lessons.filter(
    (lesson) => selectedCategory === 'all' || lesson.category === selectedCategory
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <ArrowLeft className="w-5 h-5" />
              Voltar
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Licoes</h1>
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                'px-4 py-2 rounded-full whitespace-nowrap transition-all',
                selectedCategory === cat.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                href={lesson.locked ? '#' : `/lessons/${lesson.id}`}
                className={cn(
                  'card block group hover:shadow-lg transition-all',
                  lesson.locked && 'opacity-60 cursor-not-allowed'
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold', getLevelColor(lesson.level))}>
                    {lesson.level}
                  </div>
                  {lesson.completed ? (
                    <div className="flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">{lesson.score}%</span>
                    </div>
                  ) : lesson.locked ? (
                    <Lock className="w-5 h-5 text-gray-400" />
                  ) : lesson.progress !== undefined ? (
                    <span className="text-sm text-primary-600 font-medium">{lesson.progress}%</span>
                  ) : null}
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition">
                  {lesson.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{lesson.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <span>{lesson.duration}</span>
                    <span>{lesson.phrases} frases</span>
                  </div>
                  {!lesson.locked && (
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  )}
                </div>

                {lesson.progress !== undefined && !lesson.completed && (
                  <div className="mt-4">
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full"
                        style={{ width: `${lesson.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Achievement CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white text-center"
        >
          <Star className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-2xl font-bold mb-2">Continue aprendendo!</h2>
          <p className="text-primary-100 mb-4">
            Complete mais 3 licoes para desbloquear a conquista &quot;Estudante Dedicado&quot;
          </p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-32 h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '66%' }} />
            </div>
            <span className="text-sm">2/3</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
