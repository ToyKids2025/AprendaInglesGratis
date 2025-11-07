import { Link } from 'react-router-dom'
import { Zap, DollarSign, Bot, Trophy, Clock, Globe } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-purple-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">
            English Flow
          </div>
          <div className="flex gap-4">
            <Link
              to="/login"
              className="px-6 py-2 text-white hover:text-primary-200 transition"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-6 py-2 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition font-semibold"
            >
              Criar Conta Grátis
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-6xl font-bold text-white mb-6">
          Aprenda inglês<br />
          <span className="text-primary-300">10x mais rápido</span>,{' '}
          <span className="text-primary-300">10x mais barato</span>
        </h1>
        <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Do zero à fluência em 12 meses com IA conversacional, gamificação e +5.000 frases práticas
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/register"
            className="px-8 py-4 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition font-bold text-lg"
          >
            Começar Grátis
          </Link>
          <button className="px-8 py-4 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-700 transition font-bold text-lg">
            Ver Demo
          </button>
        </div>
        <p className="text-primary-200 mt-4">
          7 dias grátis • Sem cartão de crédito • 100 frases incluídas
        </p>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Por que English Flow?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<DollarSign className="w-12 h-12" />}
            title="10x Mais Barato"
            description="R$ 39,90/mês vs R$ 600/mês das escolas tradicionais"
          />
          <FeatureCard
            icon={<Zap className="w-12 h-12" />}
            title="10x Mais Rápido"
            description="12 meses vs 3-5 anos das escolas convencionais"
          />
          <FeatureCard
            icon={<Bot className="w-12 h-12" />}
            title="IA 24/7"
            description="Pratique conversação com IA avançada quando quiser"
          />
          <FeatureCard
            icon={<Trophy className="w-12 h-12" />}
            title="Gamificação Total"
            description="XP, badges, streaks, ranking e desafios diários"
          />
          <FeatureCard
            icon={<Clock className="w-12 h-12" />}
            title="100% Flexível"
            description="Estude onde e quando quiser, no seu ritmo"
          />
          <FeatureCard
            icon={<Globe className="w-12 h-12" />}
            title="Foco em Conversação"
            description="5.000+ frases práticas, zero gramática teórica"
          />
        </div>
      </section>

      {/* Pricing */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-12">
          Planos Simples
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <PricingCard
            title="Freemium"
            price="R$ 0"
            period="/sempre"
            features={[
              '7 dias grátis premium',
              'Level 1 (100 frases)',
              'Exercícios básicos',
              'Sem IA conversacional',
            ]}
          />
          <PricingCard
            title="Premium Mensal"
            price="R$ 39,90"
            period="/mês"
            features={[
              'Tudo ilimitado',
              '5.000+ frases',
              'IA conversacional',
              'Sem anúncios',
              'Suporte prioritário',
            ]}
            highlighted
          />
          <PricingCard
            title="Vitalício"
            price="R$ 1.997"
            period="/único"
            features={[
              'Acesso perpétuo',
              'Tudo incluído',
              'Beta features',
              'Comunidade VIP',
              'Certificado',
            ]}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold text-white mb-6">
          Comece Hoje Mesmo!
        </h2>
        <p className="text-xl text-primary-100 mb-8">
          Junte-se a milhares de alunos que já estão aprendendo inglês mais rápido
        </p>
        <Link
          to="/register"
          className="inline-block px-12 py-4 bg-white text-primary-700 rounded-lg hover:bg-primary-50 transition font-bold text-lg"
        >
          Criar Conta Grátis
        </Link>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-primary-700">
        <div className="text-center text-primary-200">
          <p>&copy; 2024 English Flow. Todos os direitos reservados.</p>
          <p className="mt-2">Do zero à fluência em 12 meses! 🌊</p>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 text-center hover:bg-white/20 transition">
      <div className="text-primary-300 flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-primary-100">{description}</p>
    </div>
  )
}

function PricingCard({
  title,
  price,
  period,
  features,
  highlighted = false,
}: {
  title: string
  price: string
  period: string
  features: string[]
  highlighted?: boolean
}) {
  return (
    <div
      className={`rounded-xl p-8 ${
        highlighted
          ? 'bg-white text-primary-900 scale-105 shadow-2xl'
          : 'bg-white/10 backdrop-blur-lg text-white'
      }`}
    >
      <h3 className="text-2xl font-bold mb-2">{title}</h3>
      <div className="mb-6">
        <span className="text-4xl font-bold">{price}</span>
        <span className="text-lg">{period}</span>
      </div>
      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-green-500 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to="/register"
        className={`block text-center px-6 py-3 rounded-lg font-semibold transition ${
          highlighted
            ? 'bg-primary-600 text-white hover:bg-primary-700'
            : 'bg-white/20 hover:bg-white/30'
        }`}
      >
        Começar Agora
      </Link>
    </div>
  )
}
