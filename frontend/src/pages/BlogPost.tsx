/**
 * BLOG POST TEMPLATE
 * Individual blog post page with SEO optimization
 */

import { Link, useParams } from 'react-router-dom'
import { Calendar, Clock, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react'

// This would come from a CMS or database in production
const blogPosts: Record<string, any> = {
  'como-aprender-ingles-sozinho-em-2024': {
    title: 'Como Aprender Inglês Sozinho em 2024: Guia Completo',
    excerpt:
      'Descubra as melhores estratégias e ferramentas para aprender inglês de forma autodidata em 2024, incluindo IA, apps e métodos cientificamente comprovados.',
    category: 'Aprendizado',
    author: 'Equipe English Flow',
    date: '2024-11-07',
    readTime: '8 min',
    content: `
      <p className="lead">Aprender inglês sozinho não é apenas possível, mas pode ser mais eficaz e econômico do que métodos tradicionais. Com as ferramentas certas e um plano estruturado, você pode alcançar fluência em 12 meses estudando apenas 30 minutos por dia.</p>

      <h2>Por Que Aprender Inglês Sozinho?</h2>
      <p>O aprendizado autodidata de inglês oferece vantagens únicas:</p>
      <ul>
        <li><strong>Flexibilidade total:</strong> Estude quando e onde quiser, sem horários fixos</li>
        <li><strong>Economia de até 90%:</strong> Apps modernos custam R$ 40/mês vs. R$ 600/mês de cursinhos</li>
        <li><strong>Personalização:</strong> Foque exatamente no que você precisa (conversação, business, técnico)</li>
        <li><strong>Velocidade:</strong> Avance no seu ritmo, sem esperar pela turma</li>
        <li><strong>Tecnologia avançada:</strong> IA conversacional, reconhecimento de voz, repetição espaçada</li>
      </ul>

      <h2>1. Estabeleça Metas SMART</h2>
      <p>Antes de começar, defina objetivos claros e mensuráveis:</p>
      <ul>
        <li><strong>Específico:</strong> "Quero conversar fluentemente sobre tecnologia" (não apenas "aprender inglês")</li>
        <li><strong>Mensurável:</strong> "Completar 50 frases por semana" ou "Atingir nível B2 no CEFR"</li>
        <li><strong>Atingível:</strong> 30 minutos diários é realista para a maioria das pessoas</li>
        <li><strong>Relevante:</strong> Alinhe com seus objetivos (carreira, viagem, estudos)</li>
        <li><strong>Temporal:</strong> "Alcançar fluência conversacional em 12 meses"</li>
      </ul>

      <div className="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
        <h3 className="text-lg font-bold text-blue-900 mb-2">💡 Dica Importante</h3>
        <p className="text-blue-800">Estudos mostram que <strong>30 minutos diários</strong> de estudo consistente são mais eficazes do que 3 horas aos sábados. A chave é a consistência, não a intensidade.</p>
      </div>

      <h2>2. Escolha as Ferramentas Certas</h2>
      <p>A combinação ideal de ferramentas para aprender inglês sozinho em 2024:</p>

      <h3>Apps de Aprendizado (Base)</h3>
      <ul>
        <li><strong>English Flow (R$ 39,90/mês):</strong> IA conversacional 24/7, 10.000+ frases, certificados oficiais</li>
        <li><strong>Anki (Gratuito):</strong> Flashcards com repetição espaçada para vocabulário</li>
        <li><strong>Duolingo (Gratuito/R$ 40/mês):</strong> Gamificação, ótimo para iniciantes</li>
      </ul>

      <h3>Prática de Conversação</h3>
      <ul>
        <li><strong>IA conversacional:</strong> English Flow, ChatGPT (sem julgamento, disponível 24/7)</li>
        <li><strong>Italki (R$ 30-80/aula):</strong> Professores nativos para conversação</li>
        <li><strong>HelloTalk (Gratuito):</strong> Intercâmbio de idiomas com nativos</li>
      </ul>

      <h3>Imersão e Consumo de Conteúdo</h3>
      <ul>
        <li><strong>YouTube:</strong> Canais como English with Lucy, BBC Learning English</li>
        <li><strong>Podcasts:</strong> All Ears English, The English We Speak (BBC)</li>
        <li><strong>Netflix:</strong> Séries com legendas em inglês (não português!)</li>
        <li><strong>Kindle:</strong> Livros em inglês com dicionário integrado</li>
      </ul>

      <h2>3. Método de Repetição Espaçada (Spaced Repetition)</h2>
      <p>A técnica mais comprovada cientificamente para retenção de longo prazo:</p>

      <h3>Como Funciona</h3>
      <p>O método de repetição espaçada agenda revisões em intervalos crescentes:</p>
      <ul>
        <li><strong>Dia 1:</strong> Aprenda 10 frases novas</li>
        <li><strong>Dia 2:</strong> Revise as 10 frases + 10 novas</li>
        <li><strong>Dia 4:</strong> Revise as primeiras 10 frases novamente</li>
        <li><strong>Dia 8:</strong> Terceira revisão (agora mais fácil)</li>
        <li><strong>Dia 16, 32, 64:</strong> Revisões cada vez mais espaçadas</li>
      </ul>

      <p>Resultado: <strong>Retenção de 90%+ após 6 meses</strong> vs. 20-30% com estudo tradicional.</p>

      <h2>4. Cronograma de Estudos (30 min/dia)</h2>
      <p>Divida seus 30 minutos diários estrategicamente:</p>

      <div className="bg-gray-50 rounded-lg p-6 my-8">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📅 Rotina Diária Ideal</h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="font-bold text-primary-600">10 min:</span>
            <span>Revisão de vocabulário (Anki ou English Flow)</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-primary-600">10 min:</span>
            <span>Frases novas com áudio e pronúncia</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="font-bold text-primary-600">10 min:</span>
            <span>Conversação com IA ou podcast em inglês</span>
          </li>
        </ul>
      </div>

      <h3>Fins de Semana (Opcional - 1-2 horas)</h3>
      <ul>
        <li><strong>Sábado:</strong> Assistir filme/série em inglês (com legendas em inglês)</li>
        <li><strong>Domingo:</strong> Ler artigos, escrever pequenos textos, aula com nativo (opcional)</li>
      </ul>

      <h2>5. IA para Conversação: Game Changer de 2024</h2>
      <p>A Inteligência Artificial revolucionou o aprendizado de idiomas em 2024:</p>

      <h3>Vantagens da IA Conversacional</h3>
      <ul>
        <li><strong>Disponível 24/7:</strong> Pratique às 2h da manhã se quiser</li>
        <li><strong>Sem julgamento:</strong> Erre à vontade, sem constrangimento</li>
        <li><strong>Feedback instantâneo:</strong> Correções em tempo real</li>
        <li><strong>Custo baixo:</strong> R$ 40/mês vs. R$ 80-150/aula com professor particular</li>
        <li><strong>Personalização:</strong> A IA se adapta ao seu nível e interesses</li>
        <li><strong>Variedade infinita:</strong> Pratique qualquer situação (entrevista, viagem, negócios)</li>
      </ul>

      <div className="bg-green-50 border-l-4 border-green-400 p-6 my-8">
        <h3 className="text-lg font-bold text-green-900 mb-2">✅ Resultado Comprovado</h3>
        <p className="text-green-800">Usuários do English Flow que praticam 30 min/dia com IA conversacional alcançam fluência <strong>4x mais rápido</strong> que métodos tradicionais (12 meses vs. 4-5 anos).</p>
      </div>

      <h2>6. Níveis de Proficiência: Roadmap Completo</h2>
      <p>Entenda os níveis do CEFR (Common European Framework) e quanto tempo leva cada um:</p>

      <div className="space-y-4 my-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">A1 - Iniciante</h3>
          <p className="text-gray-600 mb-3">Frases básicas, apresentações simples, compreensão de conversas lentas</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 1-2 meses (30 min/dia)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">A2 - Básico</h3>
          <p className="text-gray-600 mb-3">Conversas cotidianas, viagens, compras, rotina</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 3-4 meses (acumulado: 4-6 meses)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">B1 - Intermediário</h3>
          <p className="text-gray-600 mb-3">Discussões sobre temas conhecidos, textos simples, expressão de opiniões</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 4-5 meses (acumulado: 8-11 meses)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">B2 - Intermediário-Avançado (Fluência Conversacional)</h3>
          <p className="text-gray-600 mb-3">Conversas fluentes, compreensão de filmes/séries, leitura de textos complexos</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 3-4 meses (acumulado: 11-15 meses)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">C1 - Avançado</h3>
          <p className="text-gray-600 mb-3">Inglês profissional, apresentações, negociações, textos acadêmicos</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 6-12 meses (acumulado: 17-27 meses)</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-2">C2 - Proficiência Nativa</h3>
          <p className="text-gray-600 mb-3">Praticamente nativo, sutilezas culturais, todos os contextos</p>
          <p className="text-primary-600 font-semibold">⏱️ Tempo: 12-24 meses (acumulado: 29-51 meses)</p>
        </div>
      </div>

      <h2>7. Erros Comuns ao Aprender Sozinho (E Como Evitar)</h2>

      <h3>❌ Erro #1: Estudar Gramática Isolada</h3>
      <p><strong>Solução:</strong> Aprenda gramática através de frases reais, não regras abstratas. Use frases contextualizadas.</p>

      <h3>❌ Erro #2: Não Praticar Conversação</h3>
      <p><strong>Solução:</strong> Use IA conversacional diariamente. Falar (mesmo sozinho) é essencial para fluência.</p>

      <h3>❌ Erro #3: Perder a Consistência (Quebrar Streak)</h3>
      <p><strong>Solução:</strong> Use gamificação (streaks, XP, níveis) para manter motivação. Apps como English Flow tornam estudo viciante.</p>

      <h3>❌ Erro #4: Traduzir Mentalmente</h3>
      <p><strong>Solução:</strong> Pense em inglês desde o início. Use imagens, não traduções. Associe "apple" à imagem da maçã, não à palavra "maçã".</p>

      <h3>❌ Erro #5: Focar Apenas em uma Habilidade</h3>
      <p><strong>Solução:</strong> Balance listening, speaking, reading e writing. Todos são importantes para fluência real.</p>

      <h2>8. Ferramentas Gratuitas vs. Pagas: Vale a Pena?</h2>

      <div className="overflow-x-auto my-8">
        <table className="w-full bg-white rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-4 text-left font-bold text-gray-900">Recurso</th>
              <th className="px-6 py-4 text-left font-bold text-gray-900">Gratuito</th>
              <th className="px-6 py-4 text-left font-bold text-gray-900">Pago (Apps)</th>
              <th className="px-6 py-4 text-left font-bold text-gray-900">Cursinho Tradicional</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            <tr>
              <td className="px-6 py-4 font-semibold">Custo</td>
              <td className="px-6 py-4 text-green-600">R$ 0</td>
              <td className="px-6 py-4 text-blue-600">R$ 40/mês</td>
              <td className="px-6 py-4 text-red-600">R$ 600/mês</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-semibold">IA Conversacional</td>
              <td className="px-6 py-4">Limitado</td>
              <td className="px-6 py-4 text-green-600">✅ 24/7</td>
              <td className="px-6 py-4">❌ Não</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-semibold">Flexibilidade</td>
              <td className="px-6 py-4 text-green-600">✅ Total</td>
              <td className="px-6 py-4 text-green-600">✅ Total</td>
              <td className="px-6 py-4">❌ Horário fixo</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-semibold">Certificado</td>
              <td className="px-6 py-4">❌ Não</td>
              <td className="px-6 py-4 text-green-600">✅ Oficial</td>
              <td className="px-6 py-4 text-green-600">✅ Sim</td>
            </tr>
            <tr>
              <td className="px-6 py-4 font-semibold">Tempo para fluência</td>
              <td className="px-6 py-4">18-24 meses</td>
              <td className="px-6 py-4 text-green-600">12-15 meses</td>
              <td className="px-6 py-4 text-red-600">4-5 anos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p><strong>Veredicto:</strong> Apps pagos oferecem o melhor custo-benefício para autodidatas sérios. Gratuito funciona, mas leva mais tempo e exige mais disciplina.</p>

      <h2>9. Checklist: Você Está Pronto para Começar?</h2>

      <div className="bg-gray-50 rounded-lg p-6 my-8">
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Definiu metas SMART (específicas, mensuráveis, atingíveis)</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Escolheu app principal (English Flow, Duolingo, etc.)</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Configurou repetição espaçada (Anki ou nativo do app)</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Reservou 30 minutos diários na agenda (com alarme)</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Instalou app de conversação com IA</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Escolheu 2-3 séries/podcasts em inglês para imersão</span>
          </li>
          <li className="flex items-start gap-3">
            <input type="checkbox" className="mt-1" />
            <span>Configurou sistema de gamificação (streaks, XP, recompensas)</span>
          </li>
        </ul>
      </div>

      <h2>Conclusão: A Jornada Vale a Pena</h2>
      <p>Aprender inglês sozinho em 2024 é não apenas possível, mas <strong>mais eficaz e econômico</strong> que nunca. Com as ferramentas certas (especialmente IA conversacional), método comprovado (repetição espaçada) e consistência (30 min/dia), você pode alcançar fluência conversacional em <strong>12 meses</strong>.</p>

      <p>A diferença entre sucesso e desistência? <strong>Começar hoje</strong> e manter a consistência. Não espere o momento perfeito. O melhor momento para começar foi ontem. O segundo melhor momento é agora.</p>

      <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-xl p-8 text-center text-white my-12">
        <h3 className="text-2xl font-bold mb-4">Pronto para Começar Sua Jornada?</h3>
        <p className="text-purple-100 mb-6">Junte-se a milhares de estudantes que já estão aprendendo inglês com IA. Primeiros 7 dias grátis!</p>
        <a href="/register" className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
          Criar Conta Grátis →
        </a>
      </div>

      <h2>Perguntas Frequentes</h2>

      <div className="space-y-6 my-8">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">É possível aprender inglês sozinho sem gastar nada?</h3>
          <p className="text-gray-700">Sim! Com YouTube, podcasts gratuitos, Duolingo Free e apps como HelloTalk, é possível alcançar fluência. Porém, apps pagos (R$ 40/mês) aceleram o processo em 50%+ através de IA conversacional e repetição espaçada personalizada.</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Quanto tempo por dia preciso estudar?</h3>
          <p className="text-gray-700">30 minutos diários são suficientes para fluência em 12-15 meses. Mais importante que quantidade é consistência - 30 min todo dia > 3 horas aos sábados.</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">IA realmente funciona para aprender inglês?</h3>
          <p className="text-gray-700">Sim! Estudos mostram que prática com IA conversacional (disponível 24/7, sem julgamento) acelera fluência em 4x comparado a métodos tradicionais. A chave é praticar diariamente.</p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Devo começar pela gramática ou vocabulário?</h3>
          <p className="text-gray-700">Nem um nem outro isoladamente. Comece com frases completas contextualizadas. Isso ensina gramática e vocabulário juntos, da forma como nativos aprendem.</p>
        </div>
      </div>
    `,
  },
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? blogPosts[slug] : null

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Post não encontrado</h1>
          <Link to="/blog" className="text-primary-600 hover:underline">
            ← Voltar para o blog
          </Link>
        </div>
      </div>
    )
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
              to="/blog"
              className="px-4 py-2 text-gray-700 font-semibold hover:text-primary-600 transition"
            >
              Blog
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
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Back Link */}
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar para o blog</span>
        </Link>

        {/* Article */}
        <article className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
          {/* Category Badge */}
          <span className="inline-block bg-primary-100 text-primary-600 px-4 py-2 rounded-full text-sm font-bold mb-6">
            {post.category}
          </span>

          {/* Title */}
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{new Date(post.date).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              <span>{post.readTime} de leitura</span>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <Share2 className="w-5 h-5" />
              <span className="font-semibold">Compartilhar:</span>
              <button className="text-blue-600 hover:text-blue-700 transition">
                <Facebook className="w-5 h-5" />
              </button>
              <button className="text-blue-400 hover:text-blue-500 transition">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="text-blue-700 hover:text-blue-800 transition">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Featured Image Placeholder */}
          <div className="h-96 bg-gradient-to-br from-primary-400 to-purple-600 rounded-xl flex items-center justify-center mb-12">
            <span className="text-white text-9xl">📚</span>
          </div>

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </article>

        {/* Related Posts CTA */}
        <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Gostou do artigo?
          </h3>
          <p className="text-gray-600 mb-6">
            Inscreva-se na newsletter para receber conteúdo exclusivo toda semana.
          </p>
          <Link
            to="/blog"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
          >
            Ver Mais Artigos
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
            <Link to="/privacy" className="text-gray-400 hover:text-white transition">
              Privacidade
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-white transition">
              Contato
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
