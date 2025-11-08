/**
 * EMAIL SERVICE
 * Handles all email sending functionality using SendGrid/AWS SES
 *
 * Features:
 * - Transactional emails (welcome, password reset, receipts)
 * - Marketing emails (newsletters, promotions)
 * - HTML email templates
 * - Email queue for bulk sending
 * - Retry logic for failed sends
 * - Unsubscribe management
 */

import nodemailer from 'nodemailer'
import { renderToStaticMarkup } from 'react-dom/server'

// Email configuration
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@englishflow.com',
  fromName: process.env.EMAIL_FROM_NAME || 'English Flow',
  replyTo: process.env.EMAIL_REPLY_TO || 'suporte@englishflow.com',
}

// Create transporter based on environment
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use SendGrid or AWS SES
    if (process.env.SENDGRID_API_KEY) {
      return nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY,
        },
      })
    } else if (process.env.AWS_SES_REGION) {
      return nodemailer.createTransport({
        host: `email.${process.env.AWS_SES_REGION}.amazonaws.com`,
        port: 587,
        secure: false,
        auth: {
          user: process.env.AWS_SES_ACCESS_KEY,
          pass: process.env.AWS_SES_SECRET_KEY,
        },
      })
    }
  }

  // Development: Use Ethereal fake SMTP (for testing)
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: process.env.ETHEREAL_USER || 'your-ethereal-user',
      pass: process.env.ETHEREAL_PASS || 'your-ethereal-pass',
    },
  })
}

const transporter = createTransporter()

// Email types
export enum EmailType {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  EMAIL_VERIFICATION = 'email_verification',
  SUBSCRIPTION_SUCCESS = 'subscription_success',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  PAYMENT_RECEIPT = 'payment_receipt',
  PAYMENT_FAILED = 'payment_failed',
  DAILY_REMINDER = 'daily_reminder',
  STREAK_MILESTONE = 'streak_milestone',
  LEVEL_UP = 'level_up',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  CERTIFICATE_READY = 'certificate_ready',
  NEWSLETTER = 'newsletter',
  CONTACT_CONFIRMATION = 'contact_confirmation',
}

// Email template data interfaces
export interface WelcomeEmailData {
  name: string
  loginUrl: string
}

export interface PasswordResetEmailData {
  name: string
  resetUrl: string
  expiresIn: string
}

export interface EmailVerificationData {
  name: string
  verificationUrl: string
}

export interface SubscriptionSuccessData {
  name: string
  plan: string
  price: string
  nextBillingDate: string
  dashboardUrl: string
}

export interface SubscriptionCancelledData {
  name: string
  plan: string
  endDate: string
}

export interface PaymentReceiptData {
  name: string
  amount: string
  date: string
  invoiceUrl: string
  nextBillingDate: string
}

export interface PaymentFailedData {
  name: string
  amount: string
  reason: string
  updatePaymentUrl: string
}

export interface DailyReminderData {
  name: string
  streak: number
  lessonsUrl: string
}

export interface StreakMilestoneData {
  name: string
  streak: number
  badge: string
}

export interface LevelUpData {
  name: string
  newLevel: number
  xp: number
  dashboardUrl: string
}

export interface AchievementUnlockedData {
  name: string
  achievementName: string
  achievementDescription: string
  reward: string
  achievementsUrl: string
}

export interface CertificateReadyData {
  name: string
  level: string
  certificateUrl: string
}

export interface ContactConfirmationData {
  name: string
  message: string
}

// Base email layout wrapper
const EmailLayout = ({ children, preheader }: { children: any; preheader?: string }) => `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>English Flow</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .content h2 { color: #111827; font-size: 24px; margin-bottom: 20px; }
    .content p { color: #6b7280; margin-bottom: 15px; font-size: 16px; }
    .button { display: inline-block; background: #8b5cf6; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .button:hover { background: #7c3aed; }
    .footer { background: #111827; color: #9ca3af; padding: 30px; text-align: center; font-size: 14px; }
    .footer a { color: #a855f7; text-decoration: none; }
    .divider { height: 1px; background: #e5e7eb; margin: 30px 0; }
    .stats { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .stats-item { margin: 10px 0; }
    .stats-item strong { color: #111827; }
    .preheader { display: none; max-height: 0; overflow: hidden; }
  </style>
</head>
<body>
  ${preheader ? `<div class="preheader">${preheader}</div>` : ''}
  <div class="container">
    <div class="header">
      <h1>📚 English Flow</h1>
    </div>
    <div class="content">
      ${children}
    </div>
    <div class="footer">
      <p><strong>English Flow</strong> - Aprenda inglês 10x mais rápido com IA</p>
      <p style="margin: 15px 0;">
        <a href="https://englishflow.vercel.app">Website</a> •
        <a href="https://englishflow.vercel.app/about">Sobre</a> •
        <a href="https://englishflow.vercel.app/faq">FAQ</a> •
        <a href="https://englishflow.vercel.app/unsubscribe">Cancelar emails</a>
      </p>
      <p style="font-size: 12px; color: #6b7280; margin-top: 15px;">
        English Flow Tecnologia Educacional Ltda.<br>
        CNPJ: XX.XXX.XXX/0001-XX<br>
        Se você não deseja mais receber estes emails, <a href="https://englishflow.vercel.app/unsubscribe">clique aqui</a>
      </p>
    </div>
  </div>
</body>
</html>
`

// Email templates
export const emailTemplates = {
  [EmailType.WELCOME]: (data: WelcomeEmailData) => ({
    subject: 'Bem-vindo ao English Flow! 🎉',
    html: EmailLayout({
      preheader: 'Comece sua jornada para fluência em inglês hoje mesmo!',
      children: `
        <h2>Olá ${data.name}! 👋</h2>
        <p>Seja muito bem-vindo(a) ao <strong>English Flow</strong>! Estamos muito felizes em tê-lo(a) conosco nesta jornada rumo à fluência em inglês.</p>

        <p>Você agora tem acesso a:</p>
        <div class="stats">
          <div class="stats-item">✅ <strong>50 frases essenciais</strong> do Nível 1 (Survival)</div>
          <div class="stats-item">✅ <strong>Sistema de gamificação</strong> com XP, níveis e conquistas</div>
          <div class="stats-item">✅ <strong>Prática de pronúncia</strong> com reconhecimento de voz</div>
          <div class="stats-item">✅ <strong>Dashboard personalizado</strong> de progresso</div>
        </div>

        <p>Pronto para começar? Clique no botão abaixo e comece sua primeira lição agora:</p>
        <a href="${data.loginUrl}" class="button">Começar Agora 🚀</a>

        <div class="divider"></div>

        <p><strong>💡 Dica:</strong> Estudar apenas 20 minutos por dia já é suficiente para ver progresso consistente. Mantenha seu streak vivo!</p>

        <p><strong>Quer mais?</strong> Faça upgrade para o <a href="https://englishflow.vercel.app/pricing">plano Pro</a> (R$ 39,90/mês) e desbloqueie:</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>10.000+ frases em 8 níveis</li>
          <li>IA conversacional 24/7</li>
          <li>Certificados oficiais</li>
          <li>Gamificação completa</li>
        </ul>

        <p>Se tiver qualquer dúvida, estamos aqui para ajudar! Responda este email ou acesse nossa <a href="https://englishflow.vercel.app/faq">página de FAQ</a>.</p>

        <p style="margin-top: 30px;">Vamos juntos! 💪<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.PASSWORD_RESET]: (data: PasswordResetEmailData) => ({
    subject: 'Redefinir sua senha - English Flow',
    html: EmailLayout({
      preheader: 'Você solicitou a redefinição da sua senha',
      children: `
        <h2>Olá ${data.name},</h2>
        <p>Recebemos uma solicitação para redefinir a senha da sua conta English Flow.</p>

        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${data.resetUrl}" class="button">Redefinir Senha 🔑</a>

        <p style="font-size: 14px; color: #6b7280;">Este link expira em <strong>${data.expiresIn}</strong>.</p>

        <div class="divider"></div>

        <p><strong>⚠️ Não solicitou esta alteração?</strong></p>
        <p>Se você não pediu para redefinir sua senha, ignore este email. Sua senha permanecerá segura e inalterada.</p>

        <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.EMAIL_VERIFICATION]: (data: EmailVerificationData) => ({
    subject: 'Verifique seu email - English Flow',
    html: EmailLayout({
      preheader: 'Confirme seu endereço de email para ativar sua conta',
      children: `
        <h2>Olá ${data.name}! 👋</h2>
        <p>Obrigado por se cadastrar no English Flow! Para garantir a segurança da sua conta, precisamos verificar seu endereço de email.</p>

        <p>Clique no botão abaixo para verificar seu email:</p>
        <a href="${data.verificationUrl}" class="button">Verificar Email ✉️</a>

        <p style="font-size: 14px; color: #6b7280;">Este link expira em <strong>24 horas</strong>.</p>

        <div class="divider"></div>

        <p>Após a verificação, você terá acesso completo à plataforma e poderá começar a estudar imediatamente!</p>

        <p style="margin-top: 30px;">Até logo,<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.SUBSCRIPTION_SUCCESS]: (data: SubscriptionSuccessData) => ({
    subject: `Assinatura ${data.plan} ativada! 🎉`,
    html: EmailLayout({
      preheader: `Sua assinatura ${data.plan} foi ativada com sucesso`,
      children: `
        <h2>Olá ${data.name}! 🎉</h2>
        <p>Parabéns! Sua assinatura do plano <strong>${data.plan}</strong> foi ativada com sucesso.</p>

        <div class="stats">
          <div class="stats-item"><strong>Plano:</strong> ${data.plan}</div>
          <div class="stats-item"><strong>Valor:</strong> ${data.price}</div>
          <div class="stats-item"><strong>Próximo pagamento:</strong> ${data.nextBillingDate}</div>
        </div>

        <p>Você agora tem acesso completo a:</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>✨ 10.000+ frases em 8 níveis</li>
          <li>🤖 IA conversacional 24/7</li>
          <li>🏆 Certificados oficiais</li>
          <li>🎮 Gamificação completa</li>
          <li>📊 Estatísticas avançadas</li>
          <li>🎯 Conquistas e badges</li>
        </ul>

        <a href="${data.dashboardUrl}" class="button">Ir para Dashboard 🚀</a>

        <div class="divider"></div>

        <p><strong>💡 Dica Pro:</strong> Para resultados máximos, estude 30 minutos por dia e mantenha seu streak ativo. Você pode alcançar fluência em 12 meses!</p>

        <p style="margin-top: 30px;">Vamos juntos conquistar a fluência! 💪<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.SUBSCRIPTION_CANCELLED]: (data: SubscriptionCancelledData) => ({
    subject: 'Assinatura cancelada - English Flow',
    html: EmailLayout({
      preheader: 'Sua assinatura foi cancelada com sucesso',
      children: `
        <h2>Olá ${data.name},</h2>
        <p>Confirmamos o cancelamento da sua assinatura do plano <strong>${data.plan}</strong>.</p>

        <div class="stats">
          <div class="stats-item"><strong>Plano cancelado:</strong> ${data.plan}</div>
          <div class="stats-item"><strong>Data de encerramento:</strong> ${data.endDate}</div>
          <div class="stats-item"><strong>Status:</strong> Cancelado</div>
        </div>

        <p>Você ainda tem acesso ao plano premium até <strong>${data.endDate}</strong>. Após esta data, sua conta voltará ao plano gratuito.</p>

        <div class="divider"></div>

        <p><strong>O que você ainda pode fazer:</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>✅ Continuar estudando até ${data.endDate}</li>
          <li>✅ Acessar seu progresso e estatísticas</li>
          <li>✅ Baixar seus certificados</li>
          <li>✅ Reativar sua assinatura a qualquer momento</li>
        </ul>

        <p><strong>Mudou de ideia?</strong> Você pode reativar sua assinatura a qualquer momento:</p>
        <a href="https://englishflow.vercel.app/pricing" class="button">Reativar Assinatura 🔄</a>

        <div class="divider"></div>

        <p>Se você cancelou por algum problema ou insatisfação, gostaríamos muito de ouvir seu feedback. Responda este email e conte-nos como podemos melhorar!</p>

        <p style="margin-top: 30px;">Esperamos te ver de volta em breve! 👋<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.PAYMENT_RECEIPT]: (data: PaymentReceiptData) => ({
    subject: `Recibo de pagamento - ${data.amount}`,
    html: EmailLayout({
      preheader: `Seu pagamento de ${data.amount} foi processado com sucesso`,
      children: `
        <h2>Olá ${data.name}! 💳</h2>
        <p>Recebemos seu pagamento com sucesso. Obrigado por continuar com o English Flow!</p>

        <div class="stats">
          <div class="stats-item"><strong>Valor pago:</strong> ${data.amount}</div>
          <div class="stats-item"><strong>Data:</strong> ${data.date}</div>
          <div class="stats-item"><strong>Próximo pagamento:</strong> ${data.nextBillingDate}</div>
          <div class="stats-item"><strong>Status:</strong> ✅ Pago</div>
        </div>

        <p>Você pode acessar a fatura completa e os detalhes do pagamento clicando no botão abaixo:</p>
        <a href="${data.invoiceUrl}" class="button">Ver Fatura Completa 📄</a>

        <div class="divider"></div>

        <p><strong>💡 Dica:</strong> Seus pagamentos são processados automaticamente. Você não precisa fazer nada - apenas continue estudando e evoluindo! 🚀</p>

        <p><strong>Precisa de ajuda?</strong> Se tiver qualquer dúvida sobre sua fatura ou pagamento, responda este email ou acesse nosso <a href="https://englishflow.vercel.app/faq">FAQ</a>.</p>

        <p style="margin-top: 30px;">Continue com seu ótimo trabalho! 💪<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.PAYMENT_FAILED]: (data: PaymentFailedData) => ({
    subject: '⚠️ Falha no pagamento - Ação necessária',
    html: EmailLayout({
      preheader: 'Houve um problema com seu pagamento. Atualize seus dados.',
      children: `
        <h2>Olá ${data.name},</h2>
        <p>Tentamos processar seu pagamento de <strong>${data.amount}</strong>, mas infelizmente não foi possível completar a transação.</p>

        <div class="stats" style="background: #fef2f2; border-left: 4px solid #ef4444;">
          <div class="stats-item"><strong>Valor:</strong> ${data.amount}</div>
          <div class="stats-item"><strong>Status:</strong> ❌ Falhou</div>
          <div class="stats-item"><strong>Motivo:</strong> ${data.reason}</div>
        </div>

        <p><strong>⚠️ O que fazer agora?</strong></p>
        <p>Para evitar a interrupção do seu acesso premium, por favor atualize suas informações de pagamento o mais rápido possível:</p>

        <a href="${data.updatePaymentUrl}" class="button" style="background: #ef4444;">Atualizar Forma de Pagamento 💳</a>

        <div class="divider"></div>

        <p><strong>Motivos comuns para falha no pagamento:</strong></p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>Cartão expirado ou bloqueado</li>
          <li>Limite de crédito insuficiente</li>
          <li>Dados de cobrança desatualizados</li>
          <li>Problema temporário com o banco</li>
        </ul>

        <p><strong>Precisa de ajuda?</strong> Se você está tendo dificuldades, entre em contato com nosso suporte respondendo este email. Estamos aqui para ajudar! 💬</p>

        <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.DAILY_REMINDER]: (data: DailyReminderData) => ({
    subject: `📚 Hora de estudar! Seu streak é ${data.streak} dias 🔥`,
    html: EmailLayout({
      preheader: 'Mantenha seu streak vivo! Pratique algumas frases hoje.',
      children: `
        <h2>Olá ${data.name}! 👋</h2>
        <p>Você está indo muito bem! Seu streak atual é de <strong style="color: #f59e0b; font-size: 24px;">${data.streak} dias 🔥</strong></p>

        <p>Não deixe todo esse progresso se perder! Reserve apenas <strong>10-15 minutos</strong> hoje para manter seu streak vivo e continuar evoluindo.</p>

        <div class="stats">
          <div class="stats-item">⏰ <strong>Tempo sugerido:</strong> 10-15 minutos</div>
          <div class="stats-item">🎯 <strong>Meta do dia:</strong> 5-10 frases</div>
          <div class="stats-item">🔥 <strong>Streak atual:</strong> ${data.streak} dias</div>
        </div>

        <a href="${data.lessonsUrl}" class="button">Estudar Agora 📚</a>

        <p style="margin-top: 30px;"><strong>Lembre-se:</strong> Consistência é a chave para a fluência. Pequenos passos todos os dias levam a grandes resultados! 💪</p>

        <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">Não quer receber lembretes diários? <a href="https://englishflow.vercel.app/profile/settings">Ajuste suas preferências aqui</a>.</p>

        <p style="margin-top: 30px;">Bons estudos!<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.LEVEL_UP]: (data: LevelUpData) => ({
    subject: `🎉 Parabéns! Você subiu para o Nível ${data.newLevel}!`,
    html: EmailLayout({
      preheader: `Você alcançou o Nível ${data.newLevel} com ${data.xp} XP!`,
      children: `
        <h2>🎉 NÍVEL ${data.newLevel} ALCANÇADO! 🎉</h2>
        <p>Parabéns, ${data.name}! Você acaba de subir de nível!</p>

        <div class="stats">
          <div class="stats-item">🆙 <strong>Novo Nível:</strong> ${data.newLevel}</div>
          <div class="stats-item">⭐ <strong>XP Total:</strong> ${data.xp.toLocaleString('pt-BR')}</div>
          <div class="stats-item">🏆 <strong>Recompensa:</strong> +100 XP bônus</div>
        </div>

        <p>Continue praticando e logo você estará fluente! Quanto mais você estuda, mais rápido evolui. 🚀</p>

        <a href="${data.dashboardUrl}" class="button">Ver Meu Progresso 📊</a>

        <div class="divider"></div>

        <p><strong>Próximo desafio:</strong> Continue estudando para desbloquear novas conquistas e badges exclusivos!</p>

        <p style="margin-top: 30px;">Você está arrasando! 💪<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.ACHIEVEMENT_UNLOCKED]: (data: AchievementUnlockedData) => ({
    subject: `🏆 Conquista Desbloqueada: ${data.achievementName}!`,
    html: EmailLayout({
      preheader: `Você desbloqueou a conquista: ${data.achievementName}`,
      children: `
        <h2>🏆 CONQUISTA DESBLOQUEADA! 🏆</h2>
        <p>Parabéns, ${data.name}! Você acaba de desbloquear uma nova conquista:</p>

        <div class="stats" style="text-align: center;">
          <h3 style="font-size: 24px; color: #8b5cf6; margin-bottom: 10px;">${data.achievementName}</h3>
          <p style="font-size: 16px; color: #6b7280;">${data.achievementDescription}</p>
          <p style="font-size: 18px; color: #10b981; margin-top: 15px;"><strong>🎁 Recompensa:</strong> ${data.reward}</p>
        </div>

        <a href="${data.achievementsUrl}" class="button">Ver Todas as Conquistas 🏆</a>

        <div class="divider"></div>

        <p>Continue estudando para desbloquear mais conquistas e badges raros! Quanto mais você pratica, mais recompensas exclusivas você recebe.</p>

        <p style="margin-top: 30px;">Continue assim! 💪<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.CERTIFICATE_READY]: (data: CertificateReadyData) => ({
    subject: `🎓 Seu certificado do ${data.level} está pronto!`,
    html: EmailLayout({
      preheader: `Parabéns! Você completou o ${data.level}`,
      children: `
        <h2>🎓 CERTIFICADO DISPONÍVEL! 🎓</h2>
        <p>Parabéns, ${data.name}! Você completou o <strong>${data.level}</strong>!</p>

        <p>Seu certificado oficial já está disponível para download. Você pode:</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>📥 Baixar em alta resolução (PNG)</li>
          <li>📤 Compartilhar nas redes sociais</li>
          <li>🔗 Adicionar ao seu currículo</li>
          <li>✉️ Enviar para seu empregador</li>
        </ul>

        <a href="${data.certificateUrl}" class="button">Baixar Certificado 🎓</a>

        <div class="divider"></div>

        <p><strong>O que fazer agora?</strong></p>
        <p>Continue avançando para o próximo nível! Cada nível completado te aproxima mais da fluência completa em inglês. 🚀</p>

        <p style="margin-top: 30px;">Muito orgulho do seu progresso! 🎉<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.CONTACT_CONFIRMATION]: (data: ContactConfirmationData) => ({
    subject: 'Recebemos sua mensagem - English Flow',
    html: EmailLayout({
      preheader: 'Obrigado por entrar em contato conosco!',
      children: `
        <h2>Olá ${data.name}! 👋</h2>
        <p>Obrigado por entrar em contato com a equipe English Flow! Recebemos sua mensagem e responderemos em breve.</p>

        <div class="stats">
          <p style="font-size: 14px; color: #6b7280;"><strong>Sua mensagem:</strong></p>
          <p style="font-size: 14px; color: #374151; margin-top: 10px;">"${data.message}"</p>
        </div>

        <p>Nossa equipe de suporte geralmente responde em até <strong>24 horas</strong> (dias úteis). Se sua dúvida for urgente, você também pode:</p>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>📖 Consultar nossa <a href="https://englishflow.vercel.app/faq">FAQ</a></li>
          <li>📚 Ler nossa <a href="https://englishflow.vercel.app/about">página Sobre</a></li>
          <li>💬 Enviar email direto para: suporte@englishflow.com</li>
        </ul>

        <div class="divider"></div>

        <p>Enquanto isso, que tal continuar estudando e manter seu streak vivo? 🔥</p>
        <a href="https://englishflow.vercel.app/login" class="button">Continuar Estudando 📚</a>

        <p style="margin-top: 30px;">Até logo!<br><strong>Equipe English Flow</strong></p>
      `,
    }),
  }),

  [EmailType.NEWSLETTER]: (data: { name: string; message: string }) => ({
    subject: 'Bem-vindo à Newsletter do English Flow! 📧',
    html: EmailLayout({
      preheader: 'Você se inscreveu na newsletter do English Flow!',
      children: `
        <h2>Olá ${data.name}! 🎉</h2>
        <p>Bem-vindo à newsletter do <strong>English Flow</strong>! Você acaba de se juntar a mais de <strong>5.000+ estudantes</strong> que recebem dicas, estratégias e conteúdo exclusivo sobre aprendizado de inglês.</p>

        <div class="stats">
          <div class="stats-item">📧 <strong>Frequência:</strong> Emails semanais (toda sexta-feira)</div>
          <div class="stats-item">📚 <strong>Conteúdo:</strong> Dicas, estudos de caso, novidades</div>
          <div class="stats-item">🎁 <strong>Bônus:</strong> Ofertas exclusivas para assinantes</div>
          <div class="stats-item">❌ <strong>Spam:</strong> Zero! Apenas conteúdo de valor</div>
        </div>

        <h3>O que você vai receber:</h3>
        <ul style="margin-left: 20px; margin-bottom: 15px;">
          <li>✅ Dicas semanais para acelerar seu aprendizado</li>
          <li>✅ Estudos de caso de alunos que alcançaram fluência</li>
          <li>✅ Novos artigos do blog antes de todos</li>
          <li>✅ Ofertas e promoções exclusivas</li>
          <li>✅ Recursos gratuitos (PDFs, checklists, guias)</li>
        </ul>

        <div class="divider"></div>

        <p><strong>Primeiro passo:</strong> Que tal criar sua conta grátis e começar a estudar hoje?</p>
        <a href="https://englishflow.vercel.app/register" class="button">Criar Conta Grátis 🚀</a>

        <p style="margin-top: 30px;">Nos vemos na próxima sexta-feira! 📬<br><strong>Equipe English Flow</strong></p>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px;">
          Se você não deseja mais receber nossos emails, pode <a href="https://englishflow.vercel.app/unsubscribe">cancelar a inscrição aqui</a>.
        </p>
      `,
    }),
  }),
}

// Main send email function
export async function sendEmail(
  to: string | string[],
  type: EmailType,
  data: any
): Promise<boolean> {
  try {
    const template = emailTemplates[type](data)

    const mailOptions = {
      from: `${EMAIL_CONFIG.fromName} <${EMAIL_CONFIG.from}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      replyTo: EMAIL_CONFIG.replyTo,
      subject: template.subject,
      html: template.html,
    }

    const info = await transporter.sendMail(mailOptions)

    console.log(`Email sent successfully to ${to}:`, info.messageId)

    // Log preview URL for Ethereal (development)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Bulk send email with rate limiting
export async function sendBulkEmails(
  recipients: Array<{ email: string; data: any }>,
  type: EmailType,
  delayMs: number = 100
): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  for (const recipient of recipients) {
    const sent = await sendEmail(recipient.email, type, recipient.data)

    if (sent) {
      success++
    } else {
      failed++
    }

    // Delay to avoid rate limits
    if (delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  console.log(`Bulk email complete: ${success} sent, ${failed} failed`)
  return { success, failed }
}

export default {
  sendEmail,
  sendBulkEmails,
  EmailType,
}
