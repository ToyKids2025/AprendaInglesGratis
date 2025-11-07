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
        <div className="inline-block px-4 py-2 bg-yellow-400/20 border border-yellow-400/40 rounded-full text-yellow-300 text-sm font-semibold mb-6">
          🔥 +1.000 alunos já começaram • Lançamento Especial
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
          Fale inglês fluente<br />
          em <span className="text-yellow-400">12 meses</span>,<br />
          não em <span className="line-through text-red-400">3-5 anos</span>
        </h1>
        <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto leading-relaxed">
          Enquanto Wizard/Wise Up cobram <strong className="text-red-400">R$ 600/mês</strong> por 5 anos,
          nós te levamos à fluência por <strong className="text-green-400">R$ 39,90/mês</strong> em 1 ano.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <Link
            to="/register"
            className="px-10 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold text-lg shadow-2xl"
          >
            🚀 Começar Agora (7 Dias Grátis)
          </Link>
          <a
            href="#como-funciona"
            className="px-10 py-5 border-2 border-white text-white rounded-lg hover:bg-white hover:text-primary-700 transition font-bold text-lg"
          >
            Como Funciona?
          </a>
        </div>
        <div className="flex items-center justify-center gap-8 text-primary-200">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-xl">✓</span>
            <span>IA incluída</span>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="como-funciona" className="container mx-auto px-4 py-16 bg-white/5 backdrop-blur-sm rounded-3xl mb-20">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
          Escola Tradicional vs. English Flow
        </h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-red-900/30 border-2 border-red-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-red-300 mb-4">❌ Escolas Tradicionais</h3>
            <ul className="space-y-3 text-red-100">
              <li>• R$ 400-800/mês = R$ 28.800 em 3 anos</li>
              <li>• 3-5 anos até fluência</li>
              <li>• Horários fixos presenciais</li>
              <li>• Gramática teórica sem prática</li>
              <li>• Turmas lotadas (sem atenção)</li>
              <li>• Material desatualizado</li>
            </ul>
          </div>
          <div className="bg-green-900/30 border-2 border-green-500/50 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-300 mb-4">✅ English Flow</h3>
            <ul className="space-y-3 text-green-100">
              <li>• R$ 39,90/mês = R$ 479 em 1 ano</li>
              <li>• 12 meses até fluência</li>
              <li>• Estude quando e onde quiser</li>
              <li>• 100% conversação prática</li>
              <li>• IA dedicada 24/7 só pra você</li>
              <li>• +10.000 frases atualizadas</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-8">
          <p className="text-2xl font-bold text-yellow-300">
            💰 Economize R$ 28.000+ e aprenda 3x mais rápido!
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-4">
          Como o English Flow Funciona?
        </h2>
        <p className="text-xl text-primary-200 text-center mb-12 max-w-2xl mx-auto">
          Método científico baseado em spaced repetition + IA conversacional
        </p>
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

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16 bg-white/5 backdrop-blur-sm rounded-3xl mb-20">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          O que nossos alunos dizem
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <TestimonialCard
            name="Carlos Silva"
            role="Desenvolvedor"
            text="Em 3 meses já consigo conversar em inglês no trabalho. O método é incrível!"
            rating={5}
          />
          <TestimonialCard
            name="Ana Costa"
            role="Estudante"
            text="Paguei 5x menos que a Wizard e aprendi 3x mais rápido. Melhor decisão!"
            rating={5}
          />
          <TestimonialCard
            name="Ricardo Moura"
            role="Empreendedor"
            text="A IA conversacional é surreal. É como ter um professor particular 24/7."
            rating={5}
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 rounded-3xl">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para falar inglês fluente?
        </h2>
        <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
          Mais de <strong className="text-yellow-400">1.000 alunos</strong> já começaram.
          Não pague <strong className="text-red-400">R$ 28.000</strong> em escola tradicional.
        </p>
        <Link
          to="/register"
          className="inline-block px-12 py-5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-900 rounded-lg hover:from-yellow-500 hover:to-yellow-600 transition font-bold text-xl shadow-2xl"
        >
          🚀 Começar Grátis Agora
        </Link>
        <p className="text-primary-200 mt-6 text-lg">
          ✓ 7 dias grátis  •  ✓ Cancele quando quiser  •  ✓ Aprenda em 12 meses
        </p>
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

function TestimonialCard({ name, role, text, rating }: { name: string; role: string; text: string; rating: number }) {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6">
      <div className="flex gap-1 mb-4">
        {Array.from({ length: rating }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-xl">⭐</span>
        ))}
      </div>
      <p className="text-white mb-4 italic">"{text}"</p>
      <div>
        <p className="text-white font-semibold">{name}</p>
        <p className="text-primary-200 text-sm">{role}</p>
      </div>
    </div>
  )
}
