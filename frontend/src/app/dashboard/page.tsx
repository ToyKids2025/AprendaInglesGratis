'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Mic,
  Headphones,
  Trophy,
  Flame,
  Target,
  Zap,
  ChevronRight,
  LogOut,
  User,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn, getLevelColor, formatNumber } from '@/lib/utils';

const quickActions = [
  {
    icon: Mic,
    title: 'Praticar Speaking',
    description: 'Melhore sua pronuncia',
    href: '/speaking',
    color: 'bg-blue-500',
  },
  {
    icon: Headphones,
    title: 'Listening',
    description: 'Treine seu ouvido',
    href: '/listening',
    color: 'bg-purple-500',
  },
  {
    icon: BookOpen,
    title: 'Licoes',
    description: 'Aprenda novas frases',
    href: '/lessons',
    color: 'bg-green-500',
  },
  {
    icon: Trophy,
    title: 'Ranking',
    description: 'Veja sua posicao',
    href: '/leaderboard',
    color: 'bg-yellow-500',
  },
];

const mockStats = {
  xp: 1500,
  level: 5,
  streak: 7,
  maxStreak: 15,
  lessonsCompleted: 45,
  minutesPracticed: 320,
  rank: 'Silver',
  position: 234,
};

const recentLessons = [
  { id: 1, title: 'Saudacoes basicas', category: 'Greetings', progress: 100 },
  { id: 2, title: 'No restaurante', category: 'Food', progress: 75 },
  { id: 3, title: 'Viagem de aviao', category: 'Travel', progress: 30 },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AprendaIngles</span>
            </Link>

            <div className="flex items-center gap-4">
              {/* Streak */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 rounded-full">
                <Flame className="w-5 h-5 text-orange-500" />
                <span className="font-bold text-orange-600">{mockStats.streak}</span>
              </div>

              {/* XP */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 rounded-full">
                <Zap className="w-5 h-5 text-primary-500" />
                <span className="font-bold text-primary-600">{formatNumber(mockStats.xp)}</span>
              </div>

              {/* User Menu */}
              <div className="relative group">
                <button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition">
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white', getLevelColor(user.level))}>
                    {user.name[0].toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-4 border-b border-gray-100">
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                      <User className="w-4 h-4" />
                      Perfil
                    </Link>
                    <Link href="/settings" className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
                      <Settings className="w-4 h-4" />
                      Configuracoes
                    </Link>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                      <LogOut className="w-4 h-4" />
                      Sair
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ola, {user.name.split(' ')[0]}!
          </h1>
          <p className="text-gray-600">
            Continue sua jornada de aprendizado. Voce esta no nivel {user.level}.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid sm:grid-cols-3 gap-4"
            >
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Sequencia</span>
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.streak} dias</div>
                <p className="text-xs text-gray-500">Recorde: {mockStats.maxStreak} dias</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Licoes</span>
                  <BookOpen className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.lessonsCompleted}</div>
                <p className="text-xs text-gray-500">Completadas</p>
              </div>
              <div className="card">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-500 text-sm">Tempo</span>
                  <Target className="w-5 h-5 text-purple-500" />
                </div>
                <div className="text-2xl font-bold text-gray-900">{mockStats.minutesPracticed} min</div>
                <p className="text-xs text-gray-500">Esta semana</p>
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Acoes rapidas</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="card group hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', action.color)}>
                        <action.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition">
                          {action.title}
                        </h3>
                        <p className="text-sm text-gray-500">{action.description}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Recent Lessons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Continuar aprendendo</h2>
                <Link href="/lessons" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Ver todas
                </Link>
              </div>
              <div className="space-y-3">
                {recentLessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/lessons/${lesson.id}`}
                    className="card group hover:shadow-md transition-all p-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-primary-600 transition">
                          {lesson.title}
                        </h3>
                        <p className="text-sm text-gray-500">{lesson.category}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 rounded-full transition-all"
                            style={{ width: `${lesson.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-12">{lesson.progress}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="card"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Seu nivel</h3>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn('w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold', getLevelColor(user.level))}>
                  {user.level}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Nivel {mockStats.level}</p>
                  <p className="text-sm text-gray-500">{formatNumber(mockStats.xp)} XP</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Proximo nivel</span>
                  <span className="font-medium">2000 XP</span>
                </div>
                <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                    style={{ width: '75%' }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Daily Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="card bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
            >
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5" />
                <h3 className="font-semibold">Desafio diario</h3>
              </div>
              <p className="mb-4">Complete 3 licoes de speaking hoje!</p>
              <div className="flex items-center justify-between">
                <span className="text-sm opacity-90">Progresso: 1/3</span>
                <span className="text-sm font-bold">+100 XP</span>
              </div>
              <div className="mt-3 w-full h-2 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '33%' }} />
              </div>
            </motion.div>

            {/* Ranking Position */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="card"
            >
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-900">Ranking</h3>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">#{mockStats.position}</p>
                  <p className="text-sm text-gray-500">Posicao global</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-500">{mockStats.rank}</p>
                  <Link href="/leaderboard" className="text-sm text-primary-600 hover:underline">
                    Ver ranking
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
