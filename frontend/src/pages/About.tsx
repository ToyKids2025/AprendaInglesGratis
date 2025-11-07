/**
 * ABOUT PAGE
 * About English Flow - Mission, Vision, Team
 */

import { Link } from 'react-router-dom'
import { Target, Eye, Heart, Users, Zap, TrendingUp } from 'lucide-react'

export default function About() {
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
        <div className="text-center mb-20">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Sobre o English Flow
          </h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Tornando o aprendizado de inglês <span className="text-primary-600 font-semibold">10x mais rápido</span> e <span className="text-primary-600 font-semibold">10x mais acessível</span> para todos os brasileiros.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Nossa História</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="text-xl leading-relaxed mb-6">
              O English Flow nasceu de uma frustração comum: <strong>por que aprender inglês precisa ser tão caro e demorado?</strong>
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Enquanto escolas tradicionais cobram mais de <strong>R$ 600 por mês</strong> e prometem fluência em 4-5 anos, percebemos que a tecnologia poderia mudar completamente esse jogo. Com inteligência artificial disponível 24 horas por dia, não há motivo para depender de horários fixos de aula ou pagar fortunas por um professor particular.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Nossa missão é democratizar o acesso ao inglês, oferecendo uma plataforma de qualidade por <strong>apenas R$ 39,90/mês</strong> - menos que o preço de duas pizzas! Com IA conversacional avançada, gamificação viciante e um sistema de repetição espaçada cientificamente comprovado, você pode alcançar a fluência em <strong>12 meses</strong>, não em 5 anos.
            </p>
            <p className="text-lg leading-relaxed">
              Acreditamos que o inglês não deveria ser um privilégio, mas sim uma ferramenta acessível para todos que desejam expandir seus horizontes profissionais e pessoais. 🚀
            </p>
          </div>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Mission */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Missão</h3>
            <p className="text-gray-600">
              Democratizar o acesso ao aprendizado de inglês através da tecnologia, tornando-o 10x mais rápido e acessível para todos os brasileiros.
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Visão</h3>
            <p className="text-gray-600">
              Ser a principal plataforma de ensino de inglês do Brasil até 2026, ajudando 100.000+ alunos a alcançarem fluência.
            </p>
          </div>

          {/* Values */}
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-pink-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Valores</h3>
            <p className="text-gray-600">
              Acessibilidade, inovação, excelência educacional e foco total no sucesso do aluno.
            </p>
          </div>
        </div>

        {/* Why We're Different */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-12 mb-16 text-white">
          <h2 className="text-4xl font-bold mb-8 text-center">Por Que Somos Diferentes?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex items-start gap-4">
              <Zap className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">IA Conversacional 24/7</h3>
                <p className="text-purple-100">
                  Pratique conversação com nossa IA avançada a qualquer hora, sem julgamentos ou constrangimento. É como ter um professor particular sempre disponível.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <TrendingUp className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Repetição Espaçada Científica</h3>
                <p className="text-purple-100">
                  Nosso algoritmo identifica suas dificuldades e programa revisões no momento exato para maximizar a retenção de memória.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Users className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Gamificação Viciante</h3>
                <p className="text-purple-100">
                  XP, níveis, conquistas, streaks e leaderboards transformam o aprendizado em um jogo divertido que você quer jogar todos os dias.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Heart className="w-8 h-8 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold mb-2">Preço Justo</h3>
                <p className="text-purple-100">
                  R$ 39,90/mês vs R$ 600/mês das escolas tradicionais. Economize mais de R$ 28.000 em 4 anos e ainda aprenda mais rápido.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-8 mb-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2">10,000+</div>
            <div className="text-gray-600 font-semibold">Frases</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2">8</div>
            <div className="text-gray-600 font-semibold">Níveis</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2">24/7</div>
            <div className="text-gray-600 font-semibold">IA Disponível</div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="text-5xl font-bold text-primary-600 mb-2">12</div>
            <div className="text-gray-600 font-semibold">Meses para Fluência</div>
          </div>
        </div>

        {/* Team Section */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Nosso Time
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-3xl mx-auto">
            Somos uma equipe apaixonada por educação e tecnologia, trabalhando 24/7 para oferecer a melhor experiência de aprendizado de inglês do Brasil.
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                A
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Alexandre</h3>
              <p className="text-primary-600 font-semibold mb-2">Co-Fundador & CEO</p>
              <p className="text-gray-600 text-sm">
                Investidor apaixonado por educação e inovação. Responsável por marketing e crescimento.
              </p>
            </div>

            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                D
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Dev Team</h3>
              <p className="text-purple-600 font-semibold mb-2">Co-Fundador & CTO</p>
              <p className="text-gray-600 text-sm">
                Engenheiro full-stack especializado em IA e educação. Responsável por produto e tecnologia.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Pronto para começar sua jornada?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Junte-se a milhares de alunos que já estão aprendendo inglês de forma rápida e acessível.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
            >
              Criar Conta Grátis
            </Link>
            <Link
              to="/pricing"
              className="inline-block bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary-600 transition"
            >
              Ver Planos
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-xl font-bold mb-4">English Flow</h4>
              <p className="text-gray-400">
                Aprenda inglês 10x mais rápido e 10x mais barato com IA.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/pricing" className="text-gray-400 hover:text-white transition">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-gray-400 hover:text-white transition">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-gray-400 hover:text-white transition">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition">
                    Sobre Nós
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-gray-400 hover:text-white transition">
                    Blog
                  </Link>
                </li>
                <li>
                  <a href="mailto:contato@englishflow.com" className="text-gray-400 hover:text-white transition">
                    Contato
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition">
                    Termos de Uso
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-gray-400 hover:text-white transition">
                    Privacidade
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2024 English Flow. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
