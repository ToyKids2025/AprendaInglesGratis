/**
 * PRICING PAGE
 * Pricing plans and comparison
 */

import { Check, X } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PricingPlan {
  name: string
  price: string
  period: string
  description: string
  features: { name: string; included: boolean }[]
  highlighted?: boolean
  cta: string
  ctaLink: string
}

const plans: PricingPlan[] = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: 'para sempre',
    description: 'Experimente a plataforma gratuitamente',
    features: [
      { name: '50 frases básicas', included: true },
      { name: 'Nível 1 (Survival)', included: true },
      { name: 'Prática de pronúncia', included: true },
      { name: 'Dashboard básico', included: true },
      { name: 'IA conversacional', included: false },
      { name: 'Certificados', included: false },
      { name: 'Todos os níveis', included: false },
      { name: 'Suporte prioritário', included: false },
    ],
    cta: 'Começar Grátis',
    ctaLink: '/register',
  },
  {
    name: 'Pro',
    price: 'R$ 39,90',
    period: '/mês',
    description: 'Plano completo para fluência em 12 meses',
    features: [
      { name: '10.000+ frases', included: true },
      { name: 'Todos os 8 níveis', included: true },
      { name: 'IA conversacional 24/7', included: true },
      { name: 'Certificados oficiais', included: true },
      { name: 'Gamificação completa', included: true },
      { name: 'Estatísticas avançadas', included: true },
      { name: 'Conquistas e badges', included: true },
      { name: 'Suporte por email', included: true },
    ],
    highlighted: true,
    cta: 'Assinar Agora',
    ctaLink: '/register',
  },
  {
    name: 'Business',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para empresas e escolas (até 10 alunos)',
    features: [
      { name: 'Tudo do plano Pro', included: true },
      { name: 'Dashboard admin B2B', included: true },
      { name: 'Até 10 alunos', included: true },
      { name: 'Relatórios detalhados', included: true },
      { name: 'API de integração', included: true },
      { name: 'Suporte prioritário', included: true },
      { name: 'Onboarding dedicado', included: true },
      { name: 'White label (sob consulta)', included: true },
    ],
    cta: 'Falar com Vendas',
    ctaLink: '/register',
  },
]

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            English Flow
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition"
          >
            Entrar
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Escolha seu plano
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            10x mais rápido. 10x mais barato. Sem contratos anuais.
          </p>

          {/* Comparison with competitors */}
          <div className="inline-flex items-center gap-4 bg-white rounded-xl p-6 shadow-lg">
            <div className="text-left">
              <p className="text-sm text-gray-500">Escolas tradicionais</p>
              <p className="text-3xl font-bold text-gray-400 line-through">
                R$ 600/mês
              </p>
            </div>
            <div className="text-4xl text-gray-300">→</div>
            <div className="text-left">
              <p className="text-sm text-primary-600 font-semibold">
                English Flow
              </p>
              <p className="text-3xl font-bold text-primary-600">R$ 39,90/mês</p>
            </div>
          </div>

          <p className="mt-4 text-lg text-gray-700 font-semibold">
            💰 Economize mais de <span className="text-primary-600">R$ 28.000</span>{' '}
            em 4 anos!
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-transform hover:scale-105 ${
                plan.highlighted ? 'ring-4 ring-primary-500 relative' : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 right-0 bg-primary-600 text-white px-4 py-1 text-sm font-semibold rounded-bl-lg">
                  Mais Popular
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-6">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-2">{plan.period}</span>
                  </div>
                </div>

                {/* CTA Button */}
                <Link
                  to={plan.ctaLink}
                  className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition mb-8 ${
                    plan.highlighted
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {plan.cta}
                </Link>

                {/* Features List */}
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature.name} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span
                        className={
                          feature.included ? 'text-gray-700' : 'text-gray-400'
                        }
                      >
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Perguntas Frequentes
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso cancelar a qualquer momento?
              </h3>
              <p className="text-gray-600">
                Sim! Não há contratos anuais. Você pode cancelar quando quiser sem
                multas ou taxas.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Qual a diferença para cursos tradicionais?
              </h3>
              <p className="text-gray-600">
                Somos 10x mais baratos e você aprende 10x mais rápido com IA
                disponível 24/7, enquanto cursos tradicionais custam R$ 600/mês.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                O plano gratuito é para sempre?
              </h3>
              <p className="text-gray-600">
                Sim! O plano gratuito é vitalício e você pode usar para sempre, com
                acesso ao Nível 1 completo.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Recebo certificado?
              </h3>
              <p className="text-gray-600">
                Sim! No plano Pro você recebe certificados oficiais ao completar
                cada nível, validando seu progresso.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Como funciona o pagamento?
              </h3>
              <p className="text-gray-600">
                Aceitamos cartão de crédito e PIX. O pagamento é mensal e renovado
                automaticamente.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Posso testar antes de assinar?
              </h3>
              <p className="text-gray-600">
                Sim! Crie uma conta gratuita e experimente a plataforma antes de
                decidir fazer upgrade.
              </p>
            </div>
          </div>
        </div>

        {/* Guarantee Section */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Garantia de 7 dias ou seu dinheiro de volta
          </h2>
          <p className="text-xl mb-6 text-purple-100">
            Experimente sem riscos. Se não gostar, devolvemos 100% do seu dinheiro.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Começar Agora - É Grátis
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 English Flow. Todos os direitos reservados.
          </p>
          <div className="mt-4 space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-white transition">
              Termos de Uso
            </Link>
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition"
            >
              Privacidade
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition">
              FAQ
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
