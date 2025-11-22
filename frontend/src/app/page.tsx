'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Mic,
  Headphones,
  Trophy,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  Flame,
  Target
} from 'lucide-react';

const features = [
  {
    icon: Mic,
    title: 'Pratica de Conversacao',
    description: 'Fale com IA e melhore sua pronuncia com feedback em tempo real.',
    color: 'bg-blue-500',
  },
  {
    icon: Headphones,
    title: 'Exercicios de Listening',
    description: 'Treine seu ouvido com diferentes sotaques e velocidades.',
    color: 'bg-purple-500',
  },
  {
    icon: Trophy,
    title: 'Gamificacao',
    description: 'Ganhe XP, suba de nivel e compita no ranking global.',
    color: 'bg-yellow-500',
  },
  {
    icon: Users,
    title: 'Professores Nativos',
    description: 'Aulas particulares com professores certificados.',
    color: 'bg-green-500',
  },
];

const levels = [
  { name: 'A1', label: 'Iniciante', color: 'bg-emerald-500' },
  { name: 'A2', label: 'Basico', color: 'bg-teal-500' },
  { name: 'B1', label: 'Intermediario', color: 'bg-blue-500' },
  { name: 'B2', label: 'Avancado', color: 'bg-indigo-500' },
  { name: 'C1', label: 'Proficiente', color: 'bg-purple-500' },
  { name: 'C2', label: 'Fluente', color: 'bg-pink-500' },
];

const stats = [
  { value: '100k+', label: 'Alunos Ativos' },
  { value: '50+', label: 'Professores' },
  { value: '1000+', label: 'Licoes' },
  { value: '95%', label: 'Satisfacao' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">AprendaIngles</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#features" className="text-gray-600 hover:text-primary-600 transition">
                Recursos
              </Link>
              <Link href="#levels" className="text-gray-600 hover:text-primary-600 transition">
                Niveis
              </Link>
              <Link href="#pricing" className="text-gray-600 hover:text-primary-600 transition">
                Precos
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <Link
                href="/auth/login"
                className="text-gray-700 hover:text-primary-600 font-medium transition"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="btn-primary flex items-center gap-2"
              >
                Comecar Gratis
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Mais de 100.000 alunos ja aprenderam conosco
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Aprenda Ingles de forma
              <br />
              <span className="text-primary-600">divertida e eficiente</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Plataforma completa com gamificacao, inteligencia artificial e
              professores nativos. Comece gratis e evolua do A1 ao C2.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <Flame className="w-5 h-5" />
                Comecar Agora - Gratis
              </Link>
              <Link
                href="#demo"
                className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
              >
                <Target className="w-5 h-5" />
                Ver Demonstracao
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Tudo que voce precisa para ser fluente
            </h2>
            <p className="text-xl text-gray-600">
              Recursos avancados para acelerar seu aprendizado
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-lg transition-shadow"
              >
                <div
                  className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-4`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Levels Section */}
      <section id="levels" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Do iniciante ao fluente
            </h2>
            <p className="text-xl text-gray-600">
              Trilha completa seguindo o padrao CEFR europeu
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card flex items-center gap-4 hover:shadow-lg transition-all cursor-pointer"
              >
                <div
                  className={`w-12 h-12 ${level.color} rounded-xl flex items-center justify-center text-white font-bold text-lg`}
                >
                  {level.name}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{level.label}</div>
                  <div className="text-sm text-gray-500">Nivel {level.name}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Pronto para comecar sua jornada?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Junte-se a milhares de brasileiros que ja estao aprendendo ingles conosco.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-primary-600 font-bold text-lg px-8 py-4 rounded-xl hover:bg-gray-100 transition"
          >
            <Star className="w-5 h-5" />
            Criar Conta Gratuita
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">AprendaIngles</span>
              </div>
              <p className="text-sm">
                A melhor plataforma para aprender ingles de forma gratuita e divertida.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Recursos</Link></li>
                <li><Link href="#" className="hover:text-white transition">Precos</Link></li>
                <li><Link href="#" className="hover:text-white transition">Professores</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Sobre</Link></li>
                <li><Link href="#" className="hover:text-white transition">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition">Contato</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition">Privacidade</Link></li>
                <li><Link href="#" className="hover:text-white transition">Termos</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} AprendaInglesGratis. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
