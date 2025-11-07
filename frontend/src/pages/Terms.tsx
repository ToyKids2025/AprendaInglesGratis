/**
 * TERMS OF SERVICE PAGE
 * Legal terms and conditions for using English Flow
 */

import { Link } from 'react-router-dom'
import { Scale, Shield, AlertCircle } from 'lucide-react'

export default function Terms() {
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
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
            <Scale className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Termos de Serviço
          </h1>
          <p className="text-xl text-gray-600">
            Atualizado em 7 de novembro de 2024
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 mb-12 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-yellow-900 mb-2">
              Importante: Leia com Atenção
            </h3>
            <p className="text-yellow-800">
              Ao usar o English Flow, você concorda com estes termos. Se não
              concordar, não use nossos serviços. Recomendamos que imprima ou
              salve uma cópia deste documento para referência futura.
            </p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              1. Aceitação dos Termos
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Estes Termos de Serviço ("Termos") regem o uso da plataforma
                English Flow ("Plataforma", "Serviço", "nós", "nosso") operada
                por English Flow Tecnologia Educacional Ltda., inscrita no CNPJ
                sob o nº XX.XXX.XXX/0001-XX.
              </p>
              <p>
                Ao criar uma conta, acessar ou usar nossos serviços, você
                ("Usuário", "você", "seu") concorda em cumprir estes Termos e
                nossa Política de Privacidade. Se você não concordar com
                qualquer parte destes Termos, não poderá usar nossos serviços.
              </p>
              <p>
                Reservamo-nos o direito de modificar estes Termos a qualquer
                momento. Notificaremos você sobre mudanças significativas via
                email ou através da Plataforma. O uso continuado após as
                alterações constitui aceitação dos novos Termos.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2. Descrição do Serviço
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                O English Flow é uma plataforma online de aprendizado de inglês
                que oferece:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Acesso a mais de 10.000 frases organizadas em 8 níveis de
                  dificuldade
                </li>
                <li>
                  IA conversacional para prática de diálogos em inglês (planos
                  pagos)
                </li>
                <li>
                  Sistema de repetição espaçada para otimização do aprendizado
                </li>
                <li>Gamificação com XP, níveis, conquistas e leaderboards</li>
                <li>Certificados oficiais de conclusão (planos pagos)</li>
                <li>Dashboard de progresso e estatísticas detalhadas</li>
                <li>Reconhecimento de voz para prática de pronúncia</li>
              </ul>
              <p>
                Oferecemos três planos: <strong>Gratuito</strong> (acesso
                limitado a 50 frases do Nível 1), <strong>Pro</strong> (acesso
                completo por R$ 39,90/mês) e <strong>Business</strong> (para
                empresas e escolas por R$ 299/mês).
              </p>
              <p>
                Não garantimos resultados específicos de aprendizado, pois o
                progresso depende do esforço individual, dedicação e prática
                consistente do usuário.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              3. Cadastro e Conta de Usuário
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>3.1 Elegibilidade:</strong> Você deve ter pelo menos 13
                anos de idade para usar nossos serviços. Menores de 18 anos
                devem ter consentimento dos pais ou responsáveis legais.
              </p>
              <p>
                <strong>3.2 Informações da Conta:</strong> Ao criar uma conta,
                você deve fornecer informações precisas, completas e atualizadas
                (nome, email, senha). Você é responsável por manter a
                confidencialidade da sua senha e por todas as atividades
                realizadas em sua conta.
              </p>
              <p>
                <strong>3.3 Responsabilidade:</strong> Você deve notificar-nos
                imediatamente sobre qualquer uso não autorizado da sua conta.
                Não nos responsabilizamos por perdas decorrentes do uso não
                autorizado da sua conta sem notificação prévia.
              </p>
              <p>
                <strong>3.4 Uma Conta por Usuário:</strong> Cada usuário pode
                criar apenas uma conta gratuita. Contas múltiplas ou
                fraudulentas serão suspensas ou deletadas sem aviso prévio.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              4. Planos e Pagamentos
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>4.1 Plano Gratuito:</strong> Oferece acesso vitalício a
                50 frases do Nível 1 (Survival) sem necessidade de pagamento.
              </p>
              <p>
                <strong>4.2 Planos Pagos:</strong> Os planos Pro (R$ 39,90/mês)
                e Business (R$ 299/mês) são cobrados mensalmente de forma
                recorrente. O pagamento é processado automaticamente no mesmo
                dia de cada mês, a partir da data da primeira assinatura.
              </p>
              <p>
                <strong>4.3 Formas de Pagamento:</strong> Aceitamos cartão de
                crédito (Visa, Mastercard, Elo, Amex) e PIX. Os pagamentos são
                processados por provedores terceiros confiáveis (Stripe,
                MercadoPago).
              </p>
              <p>
                <strong>4.4 Aumento de Preços:</strong> Reservamo-nos o direito
                de ajustar os preços dos planos com notificação prévia de 30
                dias. Você pode cancelar sua assinatura antes da data de
                vigência do novo preço se não concordar.
              </p>
              <p>
                <strong>4.5 Cancelamento:</strong> Você pode cancelar sua
                assinatura a qualquer momento através do seu perfil, sem multas
                ou taxas de cancelamento. Seu acesso aos recursos pagos
                continuará até o final do período já pago.
              </p>
              <p>
                <strong>4.6 Reembolso:</strong> Oferecemos garantia de reembolso
                de 7 dias a partir da primeira compra. Após esse período, não
                oferecemos reembolsos proporcionais por cancelamentos
                antecipados, exceto em casos excepcionais analisados
                individualmente.
              </p>
              <p>
                <strong>4.7 Inadimplência:</strong> Em caso de falha no
                pagamento, tentaremos cobrar novamente por até 3 vezes. Se não
                for bem-sucedido, sua assinatura será automaticamente
                cancelada e o acesso aos recursos pagos será removido.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              5. Uso Aceitável e Proibições
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>Você concorda em NÃO:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Usar o serviço para qualquer finalidade ilegal ou não
                  autorizada
                </li>
                <li>
                  Copiar, distribuir, modificar ou criar trabalhos derivados do
                  nosso conteúdo sem permissão
                </li>
                <li>
                  Fazer engenharia reversa, descompilar ou desmontar qualquer
                  parte da plataforma
                </li>
                <li>
                  Usar bots, scripts ou ferramentas automatizadas para acessar
                  o serviço
                </li>
                <li>
                  Compartilhar sua conta com outras pessoas ou vender acesso à
                  sua conta
                </li>
                <li>
                  Tentar obter acesso não autorizado a sistemas, contas ou redes
                  conectadas ao serviço
                </li>
                <li>
                  Carregar ou transmitir vírus, malware ou qualquer código
                  malicioso
                </li>
                <li>
                  Coletar dados de outros usuários sem consentimento (scraping)
                </li>
                <li>
                  Usar o serviço de maneira que possa sobrecarregar ou
                  prejudicar nossos servidores
                </li>
                <li>
                  Publicar conteúdo ofensivo, difamatório, discriminatório ou
                  ilegal
                </li>
              </ul>
              <p>
                A violação destas regras pode resultar na suspensão ou
                encerramento imediato da sua conta sem reembolso.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              6. Propriedade Intelectual
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Todo o conteúdo da plataforma English Flow, incluindo mas não
                limitado a textos, gráficos, logos, ícones, imagens, áudios,
                vídeos, frases, exercícios, algoritmos e software, é de
                propriedade exclusiva do English Flow ou de seus licenciadores e
                está protegido por leis de direitos autorais brasileiras e
                internacionais.
              </p>
              <p>
                Você recebe uma licença limitada, não exclusiva, não
                transferível e revogável para acessar e usar o serviço apenas
                para fins pessoais e educacionais. Esta licença não permite:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Revenda ou uso comercial do conteúdo</li>
                <li>
                  Download ou cópia de informações de contas para benefício de
                  terceiros
                </li>
                <li>Uso de data mining, robots ou ferramentas similares</li>
                <li>
                  Reprodução, duplicação, cópia ou exploração de qualquer parte
                  do serviço sem autorização
                </li>
              </ul>
              <p>
                As marcas "English Flow", "EnglishFlow" e todos os logos
                relacionados são marcas registradas do English Flow. Você não
                pode usá-las sem nossa permissão prévia por escrito.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              7. Conteúdo do Usuário
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Você pode fornecer conteúdo através da plataforma, como
                gravações de áudio, conversas com IA e feedback. Ao fazer isso,
                você concede ao English Flow uma licença mundial, não exclusiva,
                livre de royalties, transferível e sublicenciável para usar,
                reproduzir, distribuir, preparar trabalhos derivados e exibir
                esse conteúdo, exclusivamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Fornecer e melhorar o serviço</li>
                <li>
                  Desenvolver novos recursos e treinar modelos de IA (de forma
                  anonimizada)
                </li>
                <li>Fins de pesquisa e desenvolvimento educacional</li>
              </ul>
              <p>
                Você declara e garante que possui todos os direitos necessários
                sobre o conteúdo que envia e que ele não viola direitos de
                terceiros ou leis aplicáveis.
              </p>
              <p>
                Não somos responsáveis pelo conteúdo enviado pelos usuários e
                não endossamos qualquer opinião expressa por eles.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              8. Privacidade e Proteção de Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Sua privacidade é importante para nós. Consulte nossa{' '}
                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Política de Privacidade
                </Link>{' '}
                para entender como coletamos, usamos e protegemos seus dados
                pessoais.
              </p>
              <p>
                Estamos em conformidade com a Lei Geral de Proteção de Dados
                (LGPD - Lei nº 13.709/2018). Você tem direito a:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Acessar seus dados pessoais</li>
                <li>Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>Solicitar a anonimização, bloqueio ou eliminação de dados</li>
                <li>Revogar o consentimento</li>
                <li>Portabilidade dos dados</li>
              </ul>
              <p>
                Para exercer esses direitos, entre em contato através de
                privacidade@englishflow.com.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              9. Disponibilidade e Modificações
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>9.1 Disponibilidade:</strong> Nos esforçamos para manter
                o serviço disponível 24/7, mas não garantimos acesso
                ininterrupto ou livre de erros. Podemos realizar manutenções
                programadas com notificação prévia sempre que possível.
              </p>
              <p>
                <strong>9.2 Modificações:</strong> Reservamo-nos o direito de
                modificar, suspender ou descontinuar qualquer parte do serviço a
                qualquer momento, temporária ou permanentemente, com ou sem
                aviso prévio. Não seremos responsáveis por qualquer modificação,
                suspensão ou descontinuação do serviço.
              </p>
              <p>
                <strong>9.3 Atualizações:</strong> Podemos lançar atualizações,
                novos recursos ou mudanças na plataforma. Seu uso continuado
                após essas mudanças constitui aceitação das novas versões.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              10. Limitação de Responsabilidade
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                O serviço é fornecido "como está" e "conforme disponível", sem
                garantias de qualquer tipo, expressas ou implícitas, incluindo
                mas não limitadas a garantias de comercialização, adequação a um
                propósito específico ou não violação.
              </p>
              <p>
                Na extensão máxima permitida pela lei aplicável, o English Flow
                e seus diretores, funcionários, parceiros e licenciadores não
                serão responsáveis por:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Danos indiretos, incidentais, especiais, consequenciais ou
                  punitivos
                </li>
                <li>
                  Perda de lucros, receitas, dados, uso ou goodwill
                </li>
                <li>
                  Interrupção de negócios ou falhas no sistema
                </li>
                <li>Custo de serviços substitutos</li>
              </ul>
              <p>
                Nossa responsabilidade total não excederá o valor pago por você
                nos últimos 12 meses (ou R$ 100, o que for maior).
              </p>
              <p>
                Não nos responsabilizamos por resultados de aprendizado, falhas
                em exames ou certificações externas, ou quaisquer consequências
                do seu uso ou incapacidade de usar o serviço.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              11. Indenização
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Você concorda em indenizar, defender e isentar o English Flow,
                suas subsidiárias, afiliadas, parceiros, diretores, funcionários
                e agentes de qualquer reclamação, responsabilidade, dano, perda
                e despesa (incluindo honorários advocatícios razoáveis)
                decorrentes de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seu uso ou incapacidade de usar o serviço</li>
                <li>Violação destes Termos</li>
                <li>
                  Violação de qualquer direito de terceiros, incluindo direitos
                  de propriedade intelectual
                </li>
                <li>
                  Qualquer conteúdo que você enviar através da plataforma
                </li>
                <li>Seu comportamento em conexão com o serviço</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              12. Rescisão
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>12.1 Por Você:</strong> Você pode encerrar sua conta a
                qualquer momento através das configurações do seu perfil ou
                entrando em contato com suporte@englishflow.com.
              </p>
              <p>
                <strong>12.2 Por Nós:</strong> Reservamo-nos o direito de
                suspender ou encerrar sua conta imediatamente, sem aviso prévio
                ou responsabilidade, se você violar estes Termos ou se o uso do
                serviço for considerado prejudicial aos nossos interesses ou aos
                de outros usuários.
              </p>
              <p>
                <strong>12.3 Efeitos:</strong> Após o encerramento, seu direito
                de usar o serviço cessará imediatamente. Seus dados pessoais
                serão tratados de acordo com nossa Política de Privacidade e a
                LGPD. Podemos reter certas informações para fins legais,
                contábeis ou de auditoria.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              13. Lei Aplicável e Jurisdição
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis
                da República Federativa do Brasil, sem consideração aos
                princípios de conflito de leis.
              </p>
              <p>
                Quaisquer disputas relacionadas a estes Termos ou ao uso do
                serviço serão submetidas à jurisdição exclusiva do foro da
                Comarca de [Cidade], [Estado], Brasil, renunciando as partes a
                qualquer outro foro, por mais privilegiado que seja.
              </p>
              <p>
                Antes de iniciar qualquer ação judicial, as partes concordam em
                tentar resolver amigavelmente a disputa através de negociação
                direta por um período de 30 dias.
              </p>
            </div>
          </section>

          {/* Section 14 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              14. Disposições Gerais
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>14.1 Acordo Completo:</strong> Estes Termos, juntamente
                com nossa Política de Privacidade, constituem o acordo completo
                entre você e o English Flow.
              </p>
              <p>
                <strong>14.2 Renúncia:</strong> Nossa falha em exercer qualquer
                direito ou disposição destes Termos não constituirá uma renúncia
                a esse direito.
              </p>
              <p>
                <strong>14.3 Divisibilidade:</strong> Se qualquer disposição
                destes Termos for considerada inválida ou inexequível, as
                disposições restantes permanecerão em pleno vigor e efeito.
              </p>
              <p>
                <strong>14.4 Cessão:</strong> Você não pode ceder ou transferir
                estes Termos sem nossa permissão prévia por escrito. Podemos
                ceder nossos direitos a qualquer afiliada ou sucessora.
              </p>
              <p>
                <strong>14.5 Idioma:</strong> A versão em português destes
                Termos é a versão oficial. Qualquer tradução é fornecida apenas
                para conveniência.
              </p>
            </div>
          </section>

          {/* Section 15 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              15. Contato
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Se você tiver dúvidas, comentários ou preocupações sobre estes
                Termos, entre em contato conosco:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="font-semibold">
                  English Flow Tecnologia Educacional Ltda.
                </p>
                <p>Email: legal@englishflow.com</p>
                <p>Suporte: suporte@englishflow.com</p>
                <p>Website: https://englishflow.vercel.app</p>
              </div>
              <p className="text-sm text-gray-600 italic">
                Última atualização: 7 de novembro de 2024
              </p>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Você leu e concordou com os termos?
          </h2>
          <p className="text-xl mb-6 text-purple-100">
            Crie sua conta gratuita agora e comece a aprender inglês hoje!
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-primary-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
          >
            Criar Conta Grátis
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
            <Link
              to="/privacy"
              className="text-gray-400 hover:text-white transition"
            >
              Privacidade
            </Link>
            <Link to="/faq" className="text-gray-400 hover:text-white transition">
              FAQ
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
