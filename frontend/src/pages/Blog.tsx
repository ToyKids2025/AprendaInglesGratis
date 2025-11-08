/**
 * BLOG PAGE
 * Blog listing with articles for SEO and content marketing
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight, TrendingUp, Zap, Target } from 'lucide-react'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  image: string
  featured?: boolean
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'como-aprender-ingles-sozinho-em-2024',
    title: 'Como Aprender Inglês Sozinho em 2024: Guia Completo',
    excerpt:
      'Descubra as melhores estratégias e ferramentas para aprender inglês de forma autodidata em 2024, incluindo IA, apps e métodos cientificamente comprovados.',
    category: 'Aprendizado',
    author: 'Equipe English Flow',
    date: '2024-11-07',
    readTime: '8 min',
    image: '/blog/aprender-ingles-sozinho.jpg',
    featured: true,
  },
  {
    id: '2',
    slug: 'ia-para-aprender-ingles-revolucao',
    title: 'IA para Aprender Inglês: A Revolução do Ensino de Idiomas',
    excerpt:
      'Como a Inteligência Artificial está transformando o aprendizado de inglês. Veja as vantagens de praticar com IA 24/7 e por que é mais eficaz que métodos tradicionais.',
    category: 'Tecnologia',
    author: 'Equipe English Flow',
    date: '2024-11-06',
    readTime: '10 min',
    image: '/blog/ia-aprender-ingles.jpg',
    featured: true,
  },
  {
    id: '3',
    slug: 'quanto-tempo-leva-para-ficar-fluente-em-ingles',
    title: 'Quanto Tempo Leva para Ficar Fluente em Inglês? [Dados Reais]',
    excerpt:
      'Análise baseada em dados de quanto tempo realmente leva para alcançar fluência em inglês, fatores que aceleram o processo e comparação entre métodos.',
    category: 'Fluência',
    author: 'Equipe English Flow',
    date: '2024-11-05',
    readTime: '12 min',
    image: '/blog/tempo-fluencia-ingles.jpg',
    featured: true,
  },
  {
    id: '4',
    slug: 'ingles-para-programadores-guia-completo',
    title: 'Inglês para Programadores: Por Que é Essencial e Como Estudar',
    excerpt:
      'Guia definitivo de inglês técnico para desenvolvedores. Vocabulário essencial, certificações reconhecidas e como o inglês pode aumentar seu salário em 50%+.',
    category: 'Carreira',
    author: 'Equipe English Flow',
    date: '2024-11-04',
    readTime: '9 min',
    image: '/blog/ingles-programadores.jpg',
  },
  {
    id: '5',
    slug: 'metodo-repeticao-espacada-ingles',
    title: 'Método de Repetição Espaçada: Aprenda Inglês 3x Mais Rápido',
    excerpt:
      'Entenda a ciência por trás do spaced repetition e como essa técnica pode triplicar sua retenção de vocabulário em inglês. Inclui implementação prática.',
    category: 'Metodologia',
    author: 'Equipe English Flow',
    date: '2024-11-03',
    readTime: '11 min',
    image: '/blog/repeticao-espacada.jpg',
  },
  {
    id: '6',
    slug: 'ingles-vs-cursinho-tradicional-comparacao',
    title: 'App de Inglês vs. Cursinho Tradicional: Qual Vale Mais a Pena?',
    excerpt:
      'Comparação honesta entre apps de inglês e cursinhos tradicionais: custo, efetividade, tempo de fluência, flexibilidade e resultados comprovados.',
    category: 'Comparação',
    author: 'Equipe English Flow',
    date: '2024-11-02',
    readTime: '10 min',
    image: '/blog/app-vs-cursinho.jpg',
  },
]

const categories = ['Todos', 'Aprendizado', 'Tecnologia', 'Fluência', 'Carreira', 'Metodologia', 'Comparação']

export default function Blog() {
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [newsletterMessage, setNewsletterMessage] = useState('')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newsletterEmail.trim()) {
      setNewsletterStatus('error')
      setNewsletterMessage('Por favor, insira seu email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newsletterEmail)) {
      setNewsletterStatus('error')
      setNewsletterMessage('Por favor, insira um email válido')
      return
    }

    setNewsletterStatus('loading')

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/newsletter/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletterEmail }),
      })

      const data = await response.json()

      if (response.ok) {
        setNewsletterStatus('success')
        setNewsletterMessage(data.message || 'Inscrição realizada com sucesso! Confira seu email.')
        setNewsletterEmail('')
      } else {
        setNewsletterStatus('error')
        setNewsletterMessage(data.error || 'Erro ao processar inscrição')
      }
    } catch (error) {
      setNewsletterStatus('error')
      setNewsletterMessage('Erro ao conectar com o servidor')
    }
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
      <main className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Blog English Flow</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Dicas, estratégias e insights para acelerar seu aprendizado de inglês
            com tecnologia e ciência.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <TrendingUp className="w-10 h-10 text-primary-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">50+</div>
            <div className="text-gray-600">Artigos Publicados</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Zap className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">10k+</div>
            <div className="text-gray-600">Leitores por Mês</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Target className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900 mb-1">100%</div>
            <div className="text-gray-600">Conteúdo Gratuito</div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 mb-12 justify-center">
          {categories.map((category) => (
            <button
              key={category}
              className="px-6 py-3 rounded-lg font-semibold transition bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Posts (First 3) */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Artigos em Destaque</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {blogPosts
              .filter((post) => post.featured)
              .map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug}`}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition group"
                >
                  {/* Image Placeholder */}
                  <div className="h-48 bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-6xl">📚</span>
                  </div>

                  <div className="p-6">
                    {/* Category Badge */}
                    <span className="inline-block bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                      {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-primary-600 transition line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{post.readTime}</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-primary-600 font-semibold mt-4 group-hover:gap-4 transition-all">
                      <span>Ler artigo</span>
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>

        {/* All Posts */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Todos os Artigos</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition group flex"
              >
                {/* Image Placeholder (Smaller for list) */}
                <div className="w-32 h-32 bg-gradient-to-br from-primary-400 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-4xl">📚</span>
                </div>

                <div className="p-6 flex flex-col justify-between flex-1">
                  <div>
                    {/* Category Badge */}
                    <span className="inline-block bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-xs font-semibold mb-2">
                      {post.category}
                    </span>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition line-clamp-2">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Newsletter CTA */}
        <div className="mt-16 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Receba Conteúdo Exclusivo por Email
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Dicas semanais, estudos de caso e estratégias para acelerar seu inglês.
            100% gratuito, sem spam.
          </p>

          {newsletterStatus === 'success' ? (
            <div className="bg-green-100 text-green-800 px-6 py-4 rounded-lg max-w-xl mx-auto">
              <p className="font-semibold">✅ {newsletterMessage}</p>
            </div>
          ) : (
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="Seu melhor email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-6 py-4 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-300"
                disabled={newsletterStatus === 'loading'}
              />
              <button
                type="submit"
                className="bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={newsletterStatus === 'loading'}
              >
                {newsletterStatus === 'loading' ? 'Inscrevendo...' : 'Inscrever-se Grátis'}
              </button>
            </form>
          )}

          {newsletterStatus === 'error' && (
            <p className="text-red-200 mt-4 font-semibold">❌ {newsletterMessage}</p>
          )}

          {newsletterStatus !== 'success' && (
            <p className="text-sm text-purple-200 mt-4">
              Junte-se a 5.000+ estudantes que já recebem nossos emails.
            </p>
          )}
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
            <Link to="/contact" className="text-gray-400 hover:text-white transition">
              Contato
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
