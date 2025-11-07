/**
 * FAQ PAGE
 * Frequently Asked Questions
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  // Sobre a Plataforma
  {
    question: 'O que é o English Flow?',
    answer:
      'English Flow é uma plataforma de aprendizado de inglês com IA conversacional disponível 24/7. Oferecemos 10.000+ frases organizadas em 8 níveis, gamificação completa e um método cientificamente comprovado para você alcançar fluência em 12 meses por apenas R$ 39,90/mês.',
    category: 'plataforma',
  },
  {
    question: 'Como funciona a IA conversacional?',
    answer:
      'Nossa IA utiliza tecnologia GPT-4 para conversar com você em inglês de forma natural. Ela corrige seus erros, sugere melhorias, adapta-se ao seu nível e está disponível 24 horas por dia. É como ter um professor particular sempre disponível, sem julgamentos.',
    category: 'plataforma',
  },
  {
    question: 'Qual é a diferença para o Duolingo?',
    answer:
      'Enquanto o Duolingo foca em gamificação simples com frases isoladas, o English Flow oferece conversação real com IA avançada, 10.000+ frases contextualizadas, sistema de repetição espaçada personalizado e certificados oficiais. Somos focados em fluência real, não apenas em streaks.',
    category: 'plataforma',
  },

  // Preços e Pagamento
  {
    question: 'Quanto custa?',
    answer:
      'Temos 3 planos: Gratuito (R$ 0 para sempre com 50 frases), Pro (R$ 39,90/mês com acesso completo) e Business (R$ 299/mês para até 10 alunos). Não há contratos anuais e você pode cancelar quando quiser.',
    category: 'pagamento',
  },
  {
    question: 'Posso cancelar a qualquer momento?',
    answer:
      'Sim! Não há contratos, multas ou taxas de cancelamento. Você pode cancelar sua assinatura a qualquer momento diretamente no seu perfil. Seu acesso continua até o final do período pago.',
    category: 'pagamento',
  },
  {
    question: 'Oferecem garantia de reembolso?',
    answer:
      'Sim! Oferecemos garantia de 7 dias. Se você não gostar da plataforma por qualquer motivo, devolvemos 100% do seu dinheiro, sem perguntas. Basta entrar em contato com nosso suporte.',
    category: 'pagamento',
  },
  {
    question: 'Quais formas de pagamento vocês aceitam?',
    answer:
      'Aceitamos cartão de crédito (Visa, Mastercard, Elo, Amex) e PIX. O pagamento é processado de forma segura através do Stripe/MercadoPago. Seus dados estão 100% protegidos.',
    category: 'pagamento',
  },

  // Aprendizado
  {
    question: 'Em quanto tempo vou ficar fluente?',
    answer:
      'Com dedicação diária de 20-30 minutos, a maioria dos alunos alcança fluência conversacional em 12 meses. Isso é 4x mais rápido que escolas tradicionais (4-5 anos). O tempo varia conforme seu nível inicial e dedicação.',
    category: 'aprendizado',
  },
  {
    question: 'Preciso ter conhecimento prévio de inglês?',
    answer:
      'Não! Nosso Nível 1 (Survival) começa do absoluto zero, ensinando desde "Hello" até frases básicas de sobrevivência. Temos alunos de todos os níveis, desde iniciantes até avançados buscando fluência nativa.',
    category: 'aprendizado',
  },
  {
    question: 'Como funciona o sistema de repetição espaçada?',
    answer:
      'Nosso algoritmo identifica automaticamente suas dificuldades e programa revisões no momento exato (1, 3, 7, 14, 30 dias) para maximizar retenção de memória. Você não precisa se preocupar com o que revisar - nós cuidamos disso.',
    category: 'aprendizado',
  },
  {
    question: 'Posso praticar pronúncia?',
    answer:
      'Sim! Usamos reconhecimento de voz avançado para avaliar sua pronúncia em tempo real. Você pode praticar cada frase quantas vezes quiser e receber feedback instantâneo sobre sua precisão.',
    category: 'aprendizado',
  },
  {
    question: 'Recebo certificado?',
    answer:
      'Sim! No plano Pro, você recebe certificados oficiais ao completar cada um dos 8 níveis. Os certificados são profissionais, incluem seu nome, nível alcançado, XP total e um ID único de verificação.',
    category: 'aprendizado',
  },

  // Técnico
  {
    question: 'Funciona offline?',
    answer:
      'Sim! English Flow é um PWA (Progressive Web App). Depois de acessar uma vez, você pode usar offline para revisar frases já estudadas. A conversação com IA requer conexão, mas o core da plataforma funciona sem internet.',
    category: 'tecnico',
  },
  {
    question: 'Funciona no celular?',
    answer:
      'Sim! Nossa plataforma é responsiva e funciona perfeitamente em qualquer dispositivo (celular, tablet, computador). Você pode até instalar como app no seu celular através do navegador.',
    category: 'tecnico',
  },
  {
    question: 'Preciso baixar algum aplicativo?',
    answer:
      'Não! English Flow roda direto no navegador (Chrome, Safari, Firefox, Edge). Mas você pode adicionar à tela inicial do seu celular para ter acesso rápido como se fosse um app nativo.',
    category: 'tecnico',
  },

  // Conta e Privacidade
  {
    question: 'Meus dados estão seguros?',
    answer:
      'Sim! Usamos criptografia de ponta a ponta (SSL/TLS), autenticação JWT segura e nunca compartilhamos seus dados pessoais. Estamos em conformidade com a LGPD (Lei Geral de Proteção de Dados).',
    category: 'privacidade',
  },
  {
    question: 'Posso usar em múltiplos dispositivos?',
    answer:
      'Sim! Seu progresso é sincronizado automaticamente na nuvem. Você pode estudar no celular, continuar no tablet e revisar no computador sem perder nada.',
    category: 'privacidade',
  },
  {
    question: 'Como faço para deletar minha conta?',
    answer:
      'Você pode deletar sua conta a qualquer momento em Perfil > Configurações > Deletar Conta. Todos os seus dados serão permanentemente removidos em até 30 dias conforme a LGPD.',
    category: 'privacidade',
  },

  // Plano Business
  {
    question: 'O que inclui no plano Business?',
    answer:
      'O plano Business (R$ 299/mês) inclui até 10 alunos, dashboard administrativo B2B com relatórios detalhados, API de integração, suporte prioritário e onboarding dedicado. Perfeito para empresas e escolas.',
    category: 'business',
  },
  {
    question: 'Posso adicionar mais de 10 alunos?',
    answer:
      'Sim! Para mais de 10 alunos, oferecemos planos customizados. Entre em contato com nossa equipe de vendas através do email comercial@englishflow.com para receber uma proposta personalizada.',
    category: 'business',
  },
]

const categories = [
  { id: 'all', name: 'Todas' },
  { id: 'plataforma', name: 'Plataforma' },
  { id: 'pagamento', name: 'Preços & Pagamento' },
  { id: 'aprendizado', name: 'Aprendizado' },
  { id: 'tecnico', name: 'Técnico' },
  { id: 'privacidade', name: 'Conta & Privacidade' },
  { id: 'business', name: 'Business' },
]

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filteredFAQs =
    selectedCategory === 'all'
      ? faqs
      : faqs.filter((faq) => faq.category === selectedCategory)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary-600">
            English Flow
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/pricing"
              className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition"
            >
              Preços
            </Link>
            <Link
              to="/about"
              className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition"
            >
              Sobre
            </Link>
            <Link
              to="/login"
              className="px-4 py-2 text-primary-600 font-semibold hover:bg-primary-50 rounded-lg transition"
            >
              Entrar
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Perguntas Frequentes
          </h1>
          <p className="text-xl text-gray-600">
            Tudo o que você precisa saber sobre o English Flow
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-16">
          {filteredFAQs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition"
              >
                <span className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-primary-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5 pt-2">
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions? */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ainda tem dúvidas?</h2>
          <p className="text-xl mb-8 text-purple-100">
            Nossa equipe está pronta para ajudar você!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:suporte@englishflow.com"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Enviar Email
            </a>
            <Link
              to="/register"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 transition"
            >
              Criar Conta Grátis
            </Link>
          </div>
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
            <Link to="/about" className="text-gray-400 hover:text-white transition">
              Sobre
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
