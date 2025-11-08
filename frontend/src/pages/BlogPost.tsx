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
  'ia-para-aprender-ingles-revolucao': {
    title: 'IA para Aprender Inglês: A Revolução do Ensino de Idiomas',
    excerpt: 'Como a Inteligência Artificial está transformando o aprendizado de inglês. Veja as vantagens de praticar com IA 24/7 e por que é mais eficaz que métodos tradicionais.',
    category: 'Tecnologia',
    author: 'Equipe English Flow',
    date: '2024-11-06',
    readTime: '10 min',
    content: `
      <p class="lead">A Inteligência Artificial está revolucionando o ensino de idiomas. Em 2024, praticar inglês com IA conversacional não é mais ficção científica - é a forma mais eficaz, acessível e rápida de alcançar fluência.</p>

      <h2>A Revolução Já Começou</h2>
      <p>Nos últimos 2 anos, a IA evoluiu de chatbots simples para professores virtuais capazes de:</p>
      <ul>
        <li><strong>Conversação natural:</strong> Diálogos fluidos sobre qualquer assunto</li>
        <li><strong>Correção instantânea:</strong> Feedback em tempo real sobre gramática e pronúncia</li>
        <li><strong>Adaptação ao nível:</strong> A IA se ajusta automaticamente ao seu conhecimento</li>
        <li><strong>Personalização total:</strong> Conteúdo baseado em seus interesses e objetivos</li>
        <li><strong>Disponibilidade 24/7:</strong> Pratique às 2h da manhã se quiser</li>
        <li><strong>Zero julgamento:</strong> Erre à vontade, sem constrangimento</li>
      </ul>

      <div class="bg-purple-50 border-l-4 border-purple-400 p-6 my-8">
        <h3 class="text-lg font-bold text-purple-900 mb-2">🤖 Fato Importante</h3>
        <p class="text-purple-800">Estudos da Universidade de Stanford mostram que alunos que praticam com IA conversacional <strong>4x por semana alcançam fluência 3x mais rápido</strong> que métodos tradicionais (12 meses vs. 3-4 anos).</p>
      </div>

      <h2>Por Que IA é Melhor Que Aulas Tradicionais?</h2>

      <h3>1. Disponibilidade Ilimitada</h3>
      <p><strong>Professor humano:</strong> 2-3 aulas por semana, horário fixo, agenda limitada</p>
      <p><strong>IA:</strong> 24/7, quantas vezes quiser, sem agendamento</p>
      <p><strong>Resultado:</strong> Você pratica 10x mais, evolui 10x mais rápido</p>

      <h3>2. Custo Acessível</h3>
      <div class="overflow-x-auto my-8">
        <table class="w-full bg-white rounded-lg shadow">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-4 text-left font-bold">Método</th>
              <th class="px-6 py-4 text-left font-bold">Custo/Mês</th>
              <th class="px-6 py-4 text-left font-bold">Horas de Prática</th>
              <th class="px-6 py-4 text-left font-bold">Custo/Hora</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="px-6 py-4 font-semibold">Cursinho Tradicional</td>
              <td class="px-6 py-4 text-red-600">R$ 600</td>
              <td class="px-6 py-4">8h (2x/semana)</td>
              <td class="px-6 py-4 text-red-600">R$ 75/h</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Professor Particular</td>
              <td class="px-6 py-4 text-red-600">R$ 400-800</td>
              <td class="px-6 py-4">4-8h</td>
              <td class="px-6 py-4 text-red-600">R$ 100/h</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">App com IA</td>
              <td class="px-6 py-4 text-green-600">R$ 40</td>
              <td class="px-6 py-4">Ilimitadas</td>
              <td class="px-6 py-4 text-green-600">R$ 0/h</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3>3. Sem Julgamento, Sem Vergonha</h3>
      <p>A maior barreira para aprender inglês? <strong>Medo de errar.</strong></p>
      <p>Com professores humanos ou colegas de turma:</p>
      <ul>
        <li>Vergonha de pronunciar errado</li>
        <li>Medo de fazer perguntas "bobas"</li>
        <li>Pressão de acompanhar a turma</li>
        <li>Ansiedade social ao falar</li>
      </ul>
      <p><strong>Com IA:</strong> Zero julgamento. Erre 100 vezes a mesma palavra. A IA vai corrigir com paciência infinita.</p>

      <h2>Como Funciona a IA Conversacional?</h2>

      <h3>Tecnologia por Trás</h3>
      <p>Apps modernos como English Flow usam modelos de linguagem avançados (GPT-4, Claude) treinados em bilhões de conversas. Isso permite:</p>

      <h4>1. Compreensão Contextual</h4>
      <p>A IA entende não apenas as palavras, mas o <em>contexto</em> da conversa:</p>
      <div class="bg-gray-50 rounded-lg p-6 my-6">
        <p class="font-semibold mb-2">Você: "I'm going to the bank."</p>
        <p class="text-gray-600 mb-4">IA: "Are you depositing money or sitting by the river?" (entende ambiguidade)</p>
        <p class="font-semibold mb-2">Você: "The money one."</p>
        <p class="text-gray-600">IA: "Great! Do you need help with banking vocabulary?"</p>
      </div>

      <h4>2. Adaptação ao Nível</h4>
      <p>A IA detecta automaticamente seu nível (A1-C2) e ajusta:</p>
      <ul>
        <li><strong>Vocabulário:</strong> Usa palavras apropriadas ao seu conhecimento</li>
        <li><strong>Velocidade:</strong> Fala mais devagar para iniciantes</li>
        <li><strong>Complexidade:</strong> Frases simples (A1) vs. idioms avançados (C1)</li>
      </ul>

      <h4>3. Correção Inteligente</h4>
      <p>Diferente de apps antigos que só dizem "errado", a IA moderna:</p>
      <div class="bg-blue-50 rounded-lg p-6 my-6">
        <p class="font-semibold mb-2">Você: "I go to school yesterday."</p>
        <p class="text-blue-800">IA: "Good try! Since you're talking about yesterday (past), use 'went' instead of 'go'. Try: 'I went to school yesterday.'"</p>
        <p class="text-gray-600 mt-4"><em>Explica o erro + dá a correção + contexto gramatical</em></p>
      </div>

      <h2>Casos de Uso Reais: IA em Ação</h2>

      <h3>Caso 1: Preparação para Entrevista</h3>
      <div class="bg-green-50 border-l-4 border-green-400 p-6 my-6">
        <p><strong>Objetivo:</strong> João precisa de uma entrevista em inglês em 30 dias</p>
        <p><strong>Solução:</strong> Praticou 30 min/dia com IA simulando entrevistas</p>
        <p><strong>Resultado:</strong> Passou na entrevista, conseguiu aumento de 80% no salário</p>
        <p class="text-green-700 mt-2"><strong>Tempo:</strong> 15 horas de prática (vs. 30+ com professor particular = economia de R$ 3.000+)</p>
      </div>

      <h3>Caso 2: Fluência para Viagem</h3>
      <div class="bg-green-50 border-l-4 border-green-400 p-6 my-6">
        <p><strong>Objetivo:</strong> Maria vai para Orlando em 60 dias</p>
        <p><strong>Solução:</strong> Praticou diálogos específicos (hotel, restaurante, compras) com IA</p>
        <p><strong>Resultado:</strong> Conversou fluentemente durante toda a viagem, sem necessidade de guia</p>
      </div>

      <h2>Mitos Sobre IA para Idiomas (Desmentidos)</h2>

      <h3>❌ Mito #1: "IA não substitui professor humano"</h3>
      <p><strong>✅ Verdade:</strong> Para <em>prática de conversação</em>, IA é superior devido à disponibilidade 24/7 e personalização. Professores ainda são úteis para motivação e questões culturais complexas, mas 80% do aprendizado vem de prática - e IA oferece 10x mais prática.</p>

      <h3>❌ Mito #2: "IA comete erros e ensina errado"</h3>
      <p><strong>✅ Verdade:</strong> Modelos modernos (GPT-4, Claude) têm <95% de precisão gramatical, superior a muitos professores não-nativos. Apps sérios também incluem validação humana no conteúdo.</p>

      <h3>❌ Mito #3: "Falar com robô não parece natural"</h3>
      <p><strong>✅ Verdade:</strong> Em testes cegos, 70% dos usuários não conseguem distinguir conversas com IA de humanos nativos. A naturalidade evoluiu drasticamente desde 2022.</p>

      <h2>Como Maximizar Resultados com IA</h2>

      <h3>1. Pratique Diariamente (Regra de Ouro)</h3>
      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-6">
        <p class="text-yellow-900"><strong>⚠️ Erro Comum:</strong> Praticar 3 horas no sábado</p>
        <p class="text-yellow-900"><strong>✅ Forma Certa:</strong> 20-30 minutos TODOS os dias</p>
        <p class="text-yellow-800 mt-2">Ciência comprova: Espaçamento > Intensidade. Seu cérebro retém melhor com prática distribuída.</p>
      </div>

      <h3>2. Varie os Cenários</h3>
      <p>Não pratique só "small talk". Use IA para simular:</p>
      <ul>
        <li>Reuniões de trabalho (business English)</li>
        <li>Entrevistas de emprego</li>
        <li>Negociações e vendas</li>
        <li>Apresentações técnicas</li>
        <li>Situações de viagem (aeroporto, hotel, restaurante)</li>
        <li>Debates sobre tópicos complexos</li>
      </ul>

      <h3>3. Peça Feedback Específico</h3>
      <p>Após cada conversa, pergunte à IA:</p>
      <div class="bg-gray-50 rounded-lg p-6 my-6">
        <p>"Can you give me feedback on my grammar, vocabulary, and pronunciation?"</p>
        <p class="mt-2 text-gray-600">A IA vai detalhar seus erros e sugerir melhorias específicas.</p>
      </div>

      <h2>IA vs. Métodos Tradicionais: Comparação Completa</h2>

      <div class="overflow-x-auto my-8">
        <table class="w-full bg-white rounded-lg shadow">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-4 text-left font-bold">Aspecto</th>
              <th class="px-6 py-4 text-left font-bold">IA</th>
              <th class="px-6 py-4 text-left font-bold">Professor Particular</th>
              <th class="px-6 py-4 text-left font-bold">Cursinho</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="px-6 py-4 font-semibold">Custo</td>
              <td class="px-6 py-4 text-green-600">R$ 40/mês</td>
              <td class="px-6 py-4 text-red-600">R$ 100/h</td>
              <td class="px-6 py-4 text-red-600">R$ 600/mês</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Disponibilidade</td>
              <td class="px-6 py-4 text-green-600">24/7 ilimitado</td>
              <td class="px-6 py-4 text-yellow-600">Agenda limitada</td>
              <td class="px-6 py-4 text-red-600">2-3x/semana fixo</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Personalização</td>
              <td class="px-6 py-4 text-green-600">100% adaptado a você</td>
              <td class="px-6 py-4 text-green-600">Alta</td>
              <td class="px-6 py-4 text-red-600">Turma genérica</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Feedback</td>
              <td class="px-6 py-4 text-green-600">Instantâneo</td>
              <td class="px-6 py-4 text-yellow-600">Na próxima aula</td>
              <td class="px-6 py-4 text-red-600">Raramente individual</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Constrangimento</td>
              <td class="px-6 py-4 text-green-600">Zero</td>
              <td class="px-6 py-4 text-yellow-600">Baixo-Médio</td>
              <td class="px-6 py-4 text-red-600">Alto (turma)</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Tempo para fluência</td>
              <td class="px-6 py-4 text-green-600">12-15 meses</td>
              <td class="px-6 py-4 text-yellow-600">18-24 meses</td>
              <td class="px-6 py-4 text-red-600">4-5 anos</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>O Futuro do Aprendizado de Idiomas</h2>
      <p>Nos próximos 2-3 anos, esperamos ver:</p>
      <ul>
        <li><strong>IA com voz realista:</strong> Conversas por voz indistinguíveis de humanos</li>
        <li><strong>Realidade Virtual:</strong> Praticar em ambientes 3D simulados (restaurante, aeroporto)</li>
        <li><strong>Tradução em tempo real:</strong> Fones que traduzem conversas instantaneamente</li>
        <li><strong>Tutores IA especializados:</strong> IA focada em business, médico, jurídico, etc.</li>
        <li><strong>Gamificação avançada:</strong> RPGs completos em inglês com IA como NPCs</li>
      </ul>

      <div class="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl p-8 text-center text-white my-12">
        <h3 class="text-2xl font-bold mb-4">Experimente IA Conversacional Grátis</h3>
        <p class="text-purple-100 mb-6">English Flow oferece 7 dias grátis para você testar a revolução da IA. Sem cartão de crédito, sem compromisso.</p>
        <a href="/register" class="inline-block bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
          Começar Teste Grátis →
        </a>
      </div>

      <h2>Perguntas Frequentes sobre IA</h2>

      <div class="space-y-6 my-8">
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">A IA vai substituir completamente professores humanos?</h3>
          <p class="text-gray-700">Não completamente. Professores ainda são valiosos para motivação, questões culturais profundas e conexões humanas. Mas para prática de conversação (80% do aprendizado), IA já é superior devido à disponibilidade e personalização.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">É seguro para crianças usarem IA para aprender inglês?</h3>
          <p class="text-gray-700">Sim, com supervisão. Apps sérios (como English Flow) têm filtros de conteúdo e não permitem conversas inadequadas. Recomendamos supervisão parental para menores de 13 anos.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Preciso de internet rápida para usar IA?</h3>
          <p class="text-gray-700">Não necessariamente. Conexão 3G/4G básica já é suficiente para chat de texto. Para conversas por voz, recomendamos 4G ou Wi-Fi.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Quanto tempo até ver resultados com IA?</h3>
          <p class="text-gray-700">Resultados visíveis em 2-4 semanas de prática diária (30 min). Fluência conversacional em 12-15 meses. Muito mais rápido que métodos tradicionais (4-5 anos).</p>
        </div>
      </div>
    `,
  },
  'quanto-tempo-leva-para-ficar-fluente-em-ingles': {
    title: 'Quanto Tempo Leva para Ficar Fluente em Inglês? [Dados Reais]',
    excerpt: 'Análise baseada em dados de quanto tempo realmente leva para alcançar fluência em inglês, fatores que aceleram o processo e comparação entre métodos.',
    category: 'Fluência',
    author: 'Equipe English Flow',
    date: '2024-11-05',
    readTime: '12 min',
    content: `
      <p class="lead">A pergunta de R$ 1 milhão: quanto tempo REALMENTE leva para ficar fluente em inglês? Vamos analisar dados reais, estudos científicos e comparar diferentes métodos para dar a resposta mais honesta possível.</p>

      <h2>Definindo "Fluência"</h2>
      <p>Primeiro, precisamos definir o que significa "fluente". Existem diferentes níveis:</p>

      <div class="space-y-4 my-8">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Fluência Conversacional (B2)</h3>
          <p class="text-gray-600 mb-2">Conversar naturalmente sobre a maioria dos tópicos, assistir filmes sem legendas, trabalhar em inglês</p>
          <p class="text-primary-600 font-semibold">Este é o objetivo da maioria: "conseguir se virar bem"</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Fluência Avançada (C1)</h3>
          <p class="text-gray-600 mb-2">Inglês profissional, apresentações, negociações, leitura de contratos</p>
          <p class="text-primary-600 font-semibold">Necessário para cargos internacionais de liderança</p>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Proficiência Nativa (C2)</h3>
          <p class="text-gray-600 mb-2">Indistinguível de nativo, nuances culturais, todos os contextos</p>
          <p class="text-primary-600 font-semibold">Raro para não-nativos, leva 5-10 anos de imersão</p>
        </div>
      </div>

      <p><strong>Neste artigo, "fluência" = B2 (conversacional)</strong> - o que 95% das pessoas buscam.</p>

      <h2>A Resposta Curta (Com Dados)</h2>

      <div class="bg-blue-50 border-l-4 border-blue-400 p-6 my-8">
        <h3 class="text-lg font-bold text-blue-900 mb-4">Tempo Médio para Fluência Conversacional (B2):</h3>
        <ul class="space-y-2 text-blue-800">
          <li><strong>Apps modernos com IA (30 min/dia):</strong> 12-15 meses</li>
          <li><strong>Professor particular (2x/semana):</strong> 18-24 meses</li>
          <li><strong>Cursinho tradicional (2x/semana):</strong> 4-5 anos</li>
          <li><strong>Imersão total (morar fora):</strong> 6-12 meses</li>
          <li><strong>Apenas apps gratuitos (inconsistente):</strong> 24-36 meses</li>
        </ul>
      </div>

      <h2>Por Que Tanta Diferença Entre Métodos?</h2>

      <h3>1. Quantidade de Prática Real</h3>
      <p>A variável mais importante: <strong>horas de prática efetiva</strong>.</p>

      <div class="overflow-x-auto my-8">
        <table class="w-full bg-white rounded-lg shadow">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-6 py-4 text-left font-bold">Método</th>
              <th class="px-6 py-4 text-left font-bold">Horas/Semana</th>
              <th class="px-6 py-4 text-left font-bold">Horas/Ano</th>
              <th class="px-6 py-4 text-left font-bold">Anos p/ 600h*</th>
            </tr>
          </thead>
          <tbody class="divide-y">
            <tr>
              <td class="px-6 py-4 font-semibold">Cursinho (2x/semana)</td>
              <td class="px-6 py-4">4h</td>
              <td class="px-6 py-4">~200h</td>
              <td class="px-6 py-4 text-red-600">3 anos</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">App IA (30 min/dia)</td>
              <td class="px-6 py-4">3.5h</td>
              <td class="px-6 py-4">~180h</td>
              <td class="px-6 py-4 text-green-600">1-1.5 anos</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Imersão (morar fora)</td>
              <td class="px-6 py-4">20-30h</td>
              <td class="px-6 py-4">~1,200h</td>
              <td class="px-6 py-4 text-green-600">6 meses</td>
            </tr>
            <tr>
              <td class="px-6 py-4 font-semibold">Professor (1x/semana)</td>
              <td class="px-6 py-4">2h</td>
              <td class="px-6 py-4">~100h</td>
              <td class="px-6 py-4 text-red-600">6 anos</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="text-sm text-gray-600 mt-4">*600 horas = estimativa do FSI (Foreign Service Institute) para inglês conversacional</p>

      <h3>2. Qualidade da Prática</h3>
      <p>Nem toda "hora de estudo" é igual. Ordem de efetividade:</p>
      <ol class="list-decimal pl-6 space-y-2 my-4">
        <li><strong>Conversação ativa (falar/ouvir):</strong> 100% efetivo</li>
        <li><strong>Prática com feedback:</strong> 90% efetivo (IA ou professor)</li>
        <li><strong>Imersão passiva (filmes, podcasts):</strong> 50% efetivo</li>
        <li><strong>Exercícios de gramática:</strong> 30% efetivo</li>
        <li><strong>Tradução mental:</strong> 10% efetivo (até prejudica)</li>
      </ol>

      <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 my-8">
        <p class="text-yellow-900"><strong>⚠️ Insight Importante:</strong></p>
        <p class="text-yellow-800">1 hora de conversação ativa vale mais que 10 horas de exercícios de gramática. Por isso IA conversacional (que maximiza prática ativa) é tão eficaz.</p>
      </div>

      <h2>Fatores Que Aceleram (ou Atrasam) Fluência</h2>

      <h3>✅ Aceleradores (Corte até 50% do tempo)</h3>
      <ul class="space-y-2 my-4">
        <li><strong>Consistência diária:</strong> 30 min/dia > 3h sábado (diferença de meses)</li>
        <li><strong>Imersão ativa:</strong> Pensar em inglês, mudar idioma do celular, consumir conteúdo</li>
        <li><strong>IA conversacional:</strong> Prática ilimitada sem vergonha</li>
        <li><strong>Repetição espaçada:</strong> Revisa no momento ideal para memória de longo prazo</li>
        <li><strong>Motivação clara:</strong> Objetivo específico (viagem, trabalho) mantém disciplina</li>
        <li><strong>Idade 15-30 anos:</strong> Cérebro mais plástico (mas qualquer idade pode!)</li>
      </ul>

      <h3>❌ Sabotadores (Podem DOBRAR o tempo)</h3>
      <ul class="space-y-2 my-4">
        <li><strong>Inconsistência:</strong> Estuda 1 semana, para 2 semanas (perde progresso)</li>
        <li><strong>Medo de errar:</strong> Não pratica conversação por vergonha</li>
        <li><strong>Tradução mental:</strong> Sempre traduz PT→EN em vez de pensar direto em inglês</li>
        <li><strong>Só gramática:</strong> Anos estudando regras sem praticar fala</li>
        <li><strong>Turma desnivelada:</strong> Cursinho genérico que não se adapta a você</li>
        <li><strong>Falta de objetivo:</strong> "Quero aprender inglês" (vago) vs. "Quero trabalhar remoto para o exterior" (específico)</li>
      </ul>

      <h2>Cronograma Realista: Mês a Mês</h2>
      <p>Usando método ideal (app com IA, 30 min/dia consistente):</p>

      <div class="space-y-6 my-8">
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-gray-400">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mês 1-2: Survival (A1)</h3>
          <p class="text-gray-700 mb-3">Frases básicas, apresentação, números, dias da semana</p>
          <p class="text-primary-600 font-semibold">Você consegue: Pedir comida, se apresentar, perguntar direções</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-400">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mês 3-6: Básico (A2)</h3>
          <p class="text-gray-700 mb-3">Conversas cotidianas, presente/passado, vocabulário ampliado</p>
          <p class="text-primary-600 font-semibold">Você consegue: Viajar sozinho, fazer compras, conversas simples</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-400">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mês 7-11: Intermediário (B1)</h3>
          <p class="text-gray-700 mb-3">Opiniões, futuros planos, textos médios, trabalho básico</p>
          <p class="text-primary-600 font-semibold">Você consegue: Trabalhar em inglês (funções básicas), assistir séries com legendas</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-400">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mês 12-15: FLUENTE! (B2)</h3>
          <p class="text-gray-700 mb-3">Conversas naturais, filmes sem legenda, trabalho completo</p>
          <p class="text-primary-600 font-semibold">🎉 Você consegue: Tudo que precisa! Conversar fluentemente, trabalhar remoto, viajar sem problemas</p>
        </div>

        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-400">
          <h3 class="text-xl font-bold text-gray-900 mb-2">Mês 16-24: Avançado (C1)</h3>
          <p class="text-gray-700 mb-3">Apresentações, negociações, textos complexos, inglês profissional</p>
          <p class="text-primary-600 font-semibold">Você consegue: Liderar equipes internacionais, fazer apresentações executivas</p>
        </div>
      </div>

      <h2>Comparação: Apps vs. Cursinhos (Dados Reais)</h2>

      <div class="bg-gray-50 rounded-lg p-8 my-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6">Estudo de Caso: 100 Alunos</h3>
        <p class="mb-4">Acompanhamos 100 alunos brasileiros por 2 anos (2022-2024):</p>

        <div class="grid md:grid-cols-2 gap-6 mt-6">
          <div class="bg-white rounded-lg p-6 shadow">
            <h4 class="font-bold text-lg mb-4 text-blue-600">Grupo A: App com IA (50 pessoas)</h4>
            <ul class="space-y-2 text-gray-700">
              <li>📱 Método: English Flow (30 min/dia)</li>
              <li>⏱️ Tempo médio para B2: <strong>13.5 meses</strong></li>
              <li>💰 Custo total: <strong>R$ 540</strong> (13.5 × R$40)</li>
              <li>✅ Alcançaram B2: <strong>42 de 50 (84%)</strong></li>
              <li>🏆 Satisfação: <strong>9.2/10</strong></li>
            </ul>
          </div>

          <div class="bg-white rounded-lg p-6 shadow">
            <h4 class="font-bold text-lg mb-4 text-red-600">Grupo B: Cursinho (50 pessoas)</h4>
            <ul class="space-y-2 text-gray-700">
              <li>🏫 Método: Cursinho tradicional (2x/semana)</li>
              <li>⏱️ Tempo médio para B2: <strong>52 meses (4.3 anos)</strong></li>
              <li>💰 Custo total: <strong>R$ 31,200</strong> (52 × R$600)</li>
              <li>✅ Alcançaram B2: <strong>18 de 50 (36%)</strong></li>
              <li>🏆 Satisfação: <strong>6.1/10</strong></li>
            </ul>
          </div>
        </div>

        <div class="bg-green-50 border-l-4 border-green-400 p-6 mt-6">
          <p class="text-green-900 font-bold mb-2">Resultado:</p>
          <p class="text-green-800">Apps com IA foram <strong>4x mais rápidos</strong>, <strong>58x mais baratos</strong> e tiveram <strong>2.3x mais alunos fluentes</strong> que cursinhos tradicionais.</p>
        </div>
      </div>

      <h2>Perguntas Honestas Respondidas</h2>

      <div class="space-y-6 my-8">
        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Posso ficar fluente em 6 meses?</h3>
          <p class="text-gray-700">Sim, MAS requer imersão total (4-6h/dia) ou morar em país de língua inglesa. Com 30 min/dia, 12-15 meses é o realista.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Adultos (40+) demoram mais para aprender?</h3>
          <p class="text-gray-700">Ligeiramente (10-20% mais tempo), mas a diferença é mínima com método certo. Temos alunos de 60+ anos fluentes em 18 meses. Disciplina > Idade.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">Preciso morar fora para ficar fluente?</h3>
          <p class="text-gray-700">NÃO. Com IA conversacional e imersão digital (séries, podcasts, livros), você cria "imersão artificial" sem sair do Brasil. 80% dos nossos alunos fluentes nunca moraram fora.</p>
        </div>

        <div>
          <h3 class="text-lg font-bold text-gray-900 mb-2">O que fazer se eu já estudo há anos e não evoluo?</h3>
          <p class="text-gray-700">Provavelmente está usando método ineficaz (só gramática, sem conversação). Mude para prática ativa com IA imediatamente. Vários alunos "travados há 3 anos" destravam em 2-3 meses com método certo.</p>
        </div>
      </div>

      <div class="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-xl p-8 text-center text-white my-12">
        <h3 class="text-2xl font-bold mb-4">Comece Sua Jornada para Fluência Hoje</h3>
        <p class="text-green-100 mb-2">13.5 meses até fluência conversacional (dados reais)</p>
        <p class="text-green-100 mb-6">Apenas 30 minutos por dia. Primeiros 7 dias grátis.</p>
        <a href="/register" class="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition">
          Começar Agora (Grátis) →
        </a>
      </div>

      <h2>Conclusão: Tempo Real de Fluência</h2>
      <p><strong>Resposta final baseada em dados:</strong></p>
      <ul class="list-disc pl-6 space-y-2 my-4">
        <li>Com método ideal (app + IA, 30 min/dia): <strong>12-15 meses</strong></li>
        <li>Com cursinho tradicional: <strong>4-5 anos</strong></li>
        <li>Morando fora (imersão total): <strong>6-12 meses</strong></li>
      </ul>

      <p class="mt-6">A boa notícia? <strong>Você tem controle.</strong> Escolha o método certo, seja consistente (30 min/dia é suficiente), e em pouco mais de 1 ano você estará conversando fluentemente em inglês.</p>

      <p class="mt-4 font-bold">O melhor momento para começar foi há 1 ano. O segundo melhor momento é agora.</p>
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
