/**
 * PRIVACY POLICY PAGE
 * LGPD-compliant privacy policy for English Flow
 */

import { Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  Eye,
  Database,
  Cookie,
  Mail,
  UserX,
  AlertTriangle,
} from 'lucide-react'

export default function Privacy() {
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <Shield className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Política de Privacidade
          </h1>
          <p className="text-xl text-gray-600">
            Atualizado em 7 de novembro de 2024
          </p>
        </div>

        {/* LGPD Badge */}
        <div className="bg-green-50 border-l-4 border-green-400 rounded-lg p-6 mb-12 flex items-start gap-4">
          <Lock className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-bold text-green-900 mb-2">
              Conformidade com a LGPD
            </h3>
            <p className="text-green-800">
              Esta Política de Privacidade está em conformidade com a Lei Geral
              de Proteção de Dados (LGPD - Lei nº 13.709/2018). Seus dados
              estão seguros conosco e você tem controle total sobre suas
              informações pessoais.
            </p>
          </div>
        </div>

        {/* Privacy Icons Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Lock className="w-10 h-10 text-primary-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Criptografia</h3>
            <p className="text-sm text-gray-600">SSL/TLS</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Eye className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Transparência</h3>
            <p className="text-sm text-gray-600">Sem surpresas</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <Database className="w-10 h-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Seus Dados</h3>
            <p className="text-sm text-gray-600">Você controla</p>
          </div>
          <div className="bg-white rounded-xl shadow p-6 text-center">
            <UserX className="w-10 h-10 text-red-600 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900 mb-1">Sem Venda</h3>
            <p className="text-sm text-gray-600">Nunca vendemos</p>
          </div>
        </div>

        {/* Privacy Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 lg:p-12 space-y-8">
          {/* Section 1 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              1. Introdução
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                O English Flow ("nós", "nosso", "Plataforma") operado por
                English Flow Tecnologia Educacional Ltda., CNPJ
                XX.XXX.XXX/0001-XX, valoriza e respeita sua privacidade.
              </p>
              <p>
                Esta Política de Privacidade descreve como coletamos, usamos,
                armazenamos, compartilhamos e protegemos seus dados pessoais
                quando você usa nossos serviços. Ao usar o English Flow, você
                concorda com as práticas descritas nesta política.
              </p>
              <p>
                Se você não concordar com qualquer parte desta política, não use
                nossos serviços. Recomendamos que leia esta política
                cuidadosamente e entre em contato conosco se tiver dúvidas.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              2. Dados que Coletamos
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>Coletamos as seguintes categorias de dados pessoais:</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                2.1 Dados Fornecidos por Você
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Informações de Cadastro:</strong> Nome completo,
                  endereço de email, senha (criptografada), data de nascimento
                  (opcional), país/idioma preferido
                </li>
                <li>
                  <strong>Informações de Pagamento:</strong> Dados do cartão de
                  crédito (processados por terceiros - Stripe/MercadoPago), CPF
                  (para emissão de nota fiscal), endereço de cobrança
                </li>
                <li>
                  <strong>Informações de Perfil:</strong> Foto de perfil
                  (opcional), nível de inglês, objetivos de aprendizado,
                  preferências de estudo
                </li>
                <li>
                  <strong>Conteúdo do Usuário:</strong> Gravações de áudio para
                  prática de pronúncia, conversas com IA, feedback e
                  comentários, respostas a exercícios
                </li>
                <li>
                  <strong>Comunicações:</strong> Emails, mensagens de suporte,
                  pesquisas de satisfação
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                2.2 Dados Coletados Automaticamente
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Dados de Uso:</strong> Páginas visitadas, tempo gasto
                  em cada página, frases estudadas, progresso nas lições, XP
                  ganho, conquistas desbloqueadas, streak diário
                </li>
                <li>
                  <strong>Dados do Dispositivo:</strong> Tipo de dispositivo,
                  sistema operacional, navegador, versão do navegador, endereço
                  IP, identificadores únicos, resolução de tela
                </li>
                <li>
                  <strong>Dados de Localização:</strong> País e cidade (via IP),
                  fuso horário
                </li>
                <li>
                  <strong>Cookies e Tecnologias Similares:</strong> Cookies de
                  sessão, cookies de preferências, cookies de análise (Google
                  Analytics, Mixpanel)
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                2.3 Dados de Terceiros
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Redes Sociais:</strong> Se você optar por fazer login
                  via Google/Facebook, coletamos nome, email e foto de perfil
                  (com sua permissão)
                </li>
                <li>
                  <strong>Parceiros de Pagamento:</strong> Confirmações de
                  pagamento, status de transação (não armazenamos números
                  completos de cartão)
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              3. Como Usamos Seus Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>Usamos seus dados pessoais para os seguintes propósitos:</p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                3.1 Fornecimento do Serviço
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criar e gerenciar sua conta</li>
                <li>Fornecer acesso à plataforma e seus recursos</li>
                <li>Processar pagamentos e emitir notas fiscais</li>
                <li>
                  Personalizar sua experiência de aprendizado (recomendações,
                  repetição espaçada)
                </li>
                <li>Sincronizar seu progresso entre dispositivos</li>
                <li>Enviar certificados de conclusão</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                3.2 Comunicação
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Enviar emails transacionais (confirmação de cadastro,
                  recuperação de senha, recibos)
                </li>
                <li>
                  Enviar notificações sobre seu progresso, streak e lembretes de
                  estudo (com seu consentimento)
                </li>
                <li>Responder suas dúvidas e solicitações de suporte</li>
                <li>
                  Enviar newsletters e conteúdo educacional (com seu
                  consentimento, pode cancelar a qualquer momento)
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                3.3 Melhoria e Desenvolvimento
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Analisar o uso da plataforma para melhorar a experiência do
                  usuário
                </li>
                <li>
                  Desenvolver novos recursos e funcionalidades
                </li>
                <li>
                  Treinar e melhorar nossos modelos de IA (usando dados
                  anonimizados)
                </li>
                <li>Realizar pesquisas e análises educacionais</li>
                <li>Testar e depurar nossos sistemas</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                3.4 Segurança e Conformidade
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Detectar e prevenir fraudes, abusos e atividades ilegais</li>
                <li>
                  Proteger a segurança da plataforma e de outros usuários
                </li>
                <li>Cumprir obrigações legais e regulatórias</li>
                <li>Fazer cumprir nossos Termos de Serviço</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                3.5 Marketing (Apenas com Seu Consentimento)
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Enviar ofertas e promoções personalizadas</li>
                <li>Exibir anúncios relevantes (somente usuários gratuitos)</li>
                <li>Realizar campanhas de remarketing</li>
              </ul>

              <p className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <strong>Base Legal (LGPD):</strong> Processamos seus dados com
                base em: (1) execução de contrato, (2) consentimento, (3)
                interesses legítimos, (4) cumprimento de obrigações legais.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              4. Compartilhamento de Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                <strong>Nós NÃO vendemos seus dados pessoais.</strong> Podemos
                compartilhar seus dados nas seguintes situações:
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                4.1 Provedores de Serviços Terceirizados
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Hospedagem:</strong> Vercel (frontend), Railway
                  (backend), Supabase (banco de dados)
                </li>
                <li>
                  <strong>Pagamentos:</strong> Stripe, MercadoPago (processam
                  pagamentos de forma segura)
                </li>
                <li>
                  <strong>IA:</strong> OpenAI (para conversação com IA, dados
                  não são usados para treinar modelos públicos)
                </li>
                <li>
                  <strong>Email:</strong> SendGrid, AWS SES (envio de emails
                  transacionais)
                </li>
                <li>
                  <strong>Análise:</strong> Google Analytics, Mixpanel (dados
                  anonimizados)
                </li>
                <li>
                  <strong>CDN e Armazenamento:</strong> Cloudflare, AWS S3 (para
                  áudios e imagens)
                </li>
              </ul>
              <p>
                Todos os provedores assinam acordos de confidencialidade e
                processamento de dados (DPA) e estão obrigados a proteger seus
                dados.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                4.2 Parceiros de Negócio (Plano Business)
              </h3>
              <p>
                Se você usa o English Flow através de uma empresa ou escola (plano
                Business), compartilhamos dados de progresso e uso com o
                administrador da conta. Isso inclui XP, frases estudadas, tempo
                de uso, mas não inclui conversas privadas com IA.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                4.3 Cumprimento Legal
              </h3>
              <p>
                Podemos divulgar seus dados se exigido por lei, ordem judicial,
                ou solicitação governamental válida, ou para proteger nossos
                direitos, propriedade ou segurança.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                4.4 Transferência de Negócio
              </h3>
              <p>
                Em caso de fusão, aquisição ou venda de ativos, seus dados podem
                ser transferidos. Notificaremos você antes que seus dados sejam
                transferidos e fiquem sujeitos a uma política de privacidade
                diferente.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                4.5 Dados Agregados e Anonimizados
              </h3>
              <p>
                Podemos compartilhar dados estatísticos agregados e anonimizados
                (por exemplo, "70% dos usuários completam o Nível 1 em 30 dias")
                com parceiros, investidores e público em geral. Esses dados não
                identificam você individualmente.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              5. Cookies e Tecnologias de Rastreamento
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <div className="flex items-start gap-4 bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                <Cookie className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                <p>
                  Usamos cookies e tecnologias similares para melhorar sua
                  experiência, entender como você usa nosso serviço e
                  personalizar conteúdo.
                </p>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Tipos de Cookies que Usamos:
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Cookies Essenciais:</strong> Necessários para o
                  funcionamento básico (login, sessão, segurança). Não podem ser
                  desativados.
                </li>
                <li>
                  <strong>Cookies de Preferências:</strong> Lembram suas
                  escolhas (idioma, tema, configurações). Melhoram sua
                  experiência.
                </li>
                <li>
                  <strong>Cookies de Análise:</strong> Google Analytics,
                  Mixpanel para entender como você usa a plataforma. Podem ser
                  desativados.
                </li>
                <li>
                  <strong>Cookies de Marketing:</strong> Usados para exibir
                  anúncios relevantes e remarketing (apenas usuários gratuitos).
                  Podem ser desativados.
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Gerenciamento de Cookies:
              </h3>
              <p>
                Você pode controlar cookies através das configurações do seu
                navegador. Note que desativar cookies essenciais pode afetar a
                funcionalidade da plataforma. Você também pode usar ferramentas
                como:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Google Analytics Opt-out: tools.google.com/dlpage/gaoptout</li>
                <li>
                  Network Advertising Initiative: optout.networkadvertising.org
                </li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              6. Retenção de Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Mantemos seus dados pessoais apenas pelo tempo necessário para
                cumprir os propósitos descritos nesta política, a menos que seja
                exigido ou permitido um período de retenção mais longo por lei.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Períodos de Retenção:
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Dados de Conta Ativa:</strong> Enquanto sua conta
                  estiver ativa
                </li>
                <li>
                  <strong>Dados de Conta Deletada:</strong> 30 dias após
                  solicitação de exclusão (backup), depois deletados
                  permanentemente
                </li>
                <li>
                  <strong>Dados de Pagamento:</strong> 5 anos (obrigação fiscal
                  brasileira)
                </li>
                <li>
                  <strong>Logs de Segurança:</strong> 6 meses (Marco Civil da
                  Internet)
                </li>
                <li>
                  <strong>Dados Anonimizados:</strong> Indefinidamente (não são
                  dados pessoais)
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              7. Segurança dos Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Implementamos medidas técnicas e organizacionais rigorosas para
                proteger seus dados contra acesso não autorizado, alteração,
                divulgação ou destruição:
              </p>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Medidas de Segurança:
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Criptografia:</strong> SSL/TLS para transmissão de
                  dados, senhas com hash bcrypt, dados sensíveis criptografados
                  em repouso
                </li>
                <li>
                  <strong>Autenticação:</strong> JWT tokens, autenticação de
                  dois fatores (2FA) disponível, sessões com timeout automático
                </li>
                <li>
                  <strong>Controle de Acesso:</strong> Acesso baseado em funções
                  (RBAC), princípio do menor privilégio, logs de auditoria
                </li>
                <li>
                  <strong>Infraestrutura:</strong> Servidores em data centers
                  certificados (ISO 27001), firewall e proteção DDoS, backups
                  automáticos diários
                </li>
                <li>
                  <strong>Monitoramento:</strong> Detecção de intrusão, alertas
                  de segurança em tempo real, testes de penetração periódicos
                </li>
                <li>
                  <strong>Desenvolvimento:</strong> Code reviews, análise de
                  vulnerabilidades (OWASP), atualizações regulares de segurança
                </li>
              </ul>

              <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded flex items-start gap-4">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <p className="font-semibold text-orange-900">
                    Importante:
                  </p>
                  <p className="text-orange-800">
                    Nenhum sistema é 100% seguro. Embora usemos as melhores
                    práticas da indústria, não podemos garantir segurança
                    absoluta. Você também tem responsabilidade: use senhas
                    fortes, não compartilhe credenciais, faça logout em
                    dispositivos compartilhados.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              8. Seus Direitos (LGPD)
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                De acordo com a LGPD, você tem os seguintes direitos sobre seus
                dados pessoais:
              </p>

              <ul className="list-disc pl-6 space-y-3">
                <li>
                  <strong>Confirmação de Existência:</strong> Saber se
                  processamos seus dados
                </li>
                <li>
                  <strong>Acesso:</strong> Obter cópia dos seus dados pessoais
                </li>
                <li>
                  <strong>Correção:</strong> Corrigir dados incompletos, inexatos
                  ou desatualizados
                </li>
                <li>
                  <strong>Anonimização:</strong> Solicitar que seus dados sejam
                  anonimizados
                </li>
                <li>
                  <strong>Bloqueio:</strong> Bloquear dados desnecessários,
                  excessivos ou não conformes
                </li>
                <li>
                  <strong>Eliminação:</strong> Deletar seus dados (exceto quando
                  há obrigação legal de retenção)
                </li>
                <li>
                  <strong>Portabilidade:</strong> Receber seus dados em formato
                  estruturado e legível (JSON)
                </li>
                <li>
                  <strong>Revogação do Consentimento:</strong> Cancelar
                  consentimentos dados anteriormente
                </li>
                <li>
                  <strong>Informação sobre Compartilhamento:</strong> Saber com
                  quem compartilhamos seus dados
                </li>
                <li>
                  <strong>Oposição:</strong> Opor-se a tratamentos realizados
                  sem seu consentimento
                </li>
              </ul>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Como Exercer Seus Direitos:
              </h3>
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <p>
                  <strong>1. Através do Perfil:</strong> A maioria dos direitos
                  pode ser exercida diretamente em Perfil → Configurações →
                  Privacidade e Dados
                </p>
                <p>
                  <strong>2. Por Email:</strong> Entre em contato com
                  privacidade@englishflow.com
                </p>
                <p>
                  <strong>3. Prazo de Resposta:</strong> Responderemos sua
                  solicitação em até 15 dias
                </p>
                <p>
                  <strong>4. Gratuito:</strong> O exercício desses direitos é
                  gratuito (primeira solicitação)
                </p>
              </div>

              <p className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <strong>Encarregado de Dados (DPO):</strong> Para questões
                relacionadas à LGPD, entre em contato com nosso Encarregado de
                Dados através de dpo@englishflow.com
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              9. Transferência Internacional de Dados
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Alguns de nossos provedores de serviços estão localizados fora
                do Brasil (EUA, Europa). Quando transferimos seus dados
                internacionalmente, garantimos que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Os dados estão protegidos por cláusulas contratuais padrão
                  (Standard Contractual Clauses)
                </li>
                <li>
                  Os provedores atendem aos requisitos de segurança da LGPD
                </li>
                <li>
                  Você tem os mesmos direitos independentemente da localização
                  dos dados
                </li>
              </ul>
              <p>
                Principais transferências internacionais: OpenAI (EUA), Stripe
                (EUA), Google Analytics (EUA), AWS (EUA). Todos aderentes ao EU-US
                Data Privacy Framework.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              10. Menores de Idade
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Nossa plataforma pode ser usada por menores de 18 anos com
                consentimento dos pais ou responsáveis legais. Não coletamos
                intencionalmente dados de crianças menores de 13 anos.
              </p>
              <p>
                <strong>Para pais e responsáveis:</strong> Se você acredita que
                seu filho forneceu dados pessoais sem seu consentimento, entre
                em contato conosco imediatamente através de
                suporte@englishflow.com e deletaremos essas informações.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              11. Alterações nesta Política
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente
                para refletir mudanças em nossas práticas ou por razões legais.
              </p>
              <p>
                Notificaremos você sobre mudanças significativas através de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email para o endereço cadastrado</li>
                <li>Notificação na plataforma</li>
                <li>Banner destacado no site</li>
              </ul>
              <p>
                A versão atualizada entrará em vigor 15 dias após a notificação
                (para mudanças significativas) ou imediatamente (para mudanças
                menores). O uso continuado após as alterações constitui
                aceitação da nova política.
              </p>
              <p>
                <strong>Data da última atualização:</strong> 7 de novembro de
                2024
              </p>
            </div>
          </section>

          {/* Section 12 */}
          <section>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              12. Contato e Reclamações
            </h2>
            <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
              <p>
                Se você tiver dúvidas, preocupações ou quiser exercer seus
                direitos, entre em contato:
              </p>

              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <p className="font-semibold">
                  English Flow Tecnologia Educacional Ltda.
                </p>
                <p>
                  <Mail className="inline w-5 h-5 mr-2" />
                  <strong>Email Geral:</strong> suporte@englishflow.com
                </p>
                <p>
                  <Shield className="inline w-5 h-5 mr-2" />
                  <strong>Privacidade:</strong> privacidade@englishflow.com
                </p>
                <p>
                  <Lock className="inline w-5 h-5 mr-2" />
                  <strong>Encarregado (DPO):</strong> dpo@englishflow.com
                </p>
                <p>
                  <strong>Website:</strong> https://englishflow.vercel.app
                </p>
                <p>
                  <strong>Prazo de Resposta:</strong> Até 15 dias úteis
                </p>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">
                Reclamações à ANPD:
              </h3>
              <p>
                Se você não estiver satisfeito com nossa resposta, tem o direito
                de apresentar uma reclamação à Autoridade Nacional de Proteção
                de Dados (ANPD):
              </p>
              <div className="bg-blue-50 rounded-lg p-4">
                <p>
                  <strong>ANPD:</strong> https://www.gov.br/anpd
                </p>
                <p>
                  <strong>Email:</strong> atendimento@anpd.gov.br
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl shadow-xl p-8 text-center text-white">
          <Shield className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            Seus dados estão seguros conosco
          </h2>
          <p className="text-xl mb-6 text-green-100">
            Conformidade total com a LGPD. Criptografia de ponta a ponta. Você
            tem controle total.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-green-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition"
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
            <Link to="/terms" className="text-gray-400 hover:text-white transition">
              Termos de Uso
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
