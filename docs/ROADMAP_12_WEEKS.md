# 🗓️ Roadmap 12 Semanas - English Flow

**Período:** 31/10/2024 - 31/01/2025
**Objetivo:** MVP completo + 100 beta testers + Launch

---

## 📊 Visão Geral

| Semana | Foco | Status |
|--------|------|--------|
| 1 | Setup + Auth + Level 1 | ✅ 90% |
| 2 | IA + Áudio | ⏳ |
| 3 | Gamificação Avançada | ⏳ |
| 4 | Monetização (Stripe) | ⏳ |
| 5-6 | Levels 2-3 | ⏳ |
| 7-8 | Levels 4-5 | ⏳ |
| 9-10 | Beta Testing | ⏳ |
| 11-12 | Polimento + Launch | ⏳ |

---

## ✅ Semana 1 (31/10 - 07/11) - FUNDAÇÃO

### Objetivos
- [x] Setup do projeto
- [x] Sistema de autenticação
- [x] Database schema
- [x] Frontend MVP
- [x] Backend API
- [x] Level 1 (100 frases)
- [ ] Deploy inicial
- [ ] Testes

### Entregas
✅ 38 arquivos criados
✅ 13 endpoints API
✅ 6 páginas frontend
✅ 100 frases escritas
✅ Sistema de XP
✅ 8 conquistas

### Métricas
- Linhas de código: ~8.000
- Tempo: ~20 horas
- Progresso: **90%**

---

## 🤖 Semana 2 (07-14/11) - INTELIGÊNCIA ARTIFICIAL

### Objetivos
- [ ] Integrar OpenAI GPT-4
- [ ] Sistema de conversação IA
- [ ] Text-to-Speech (pronúncia)
- [ ] Speech-to-Text (reconhecimento)
- [ ] Sistema de exercícios interativos
- [ ] Algoritmo de repetição espaçada

### Funcionalidades

**1. IA Conversacional**
```typescript
// Cenários de conversa
- Restaurant
- Airport
- Hotel
- Shopping
- Emergency
```

**2. Pronúncia**
- Text-to-Speech para cada frase
- Velocidade ajustável (0.5x - 1.5x)
- Sotaque americano/britânico

**3. Reconhecimento de Voz**
- Gravar resposta do usuário
- Avaliar pronúncia (0-100)
- Feedback detalhado

**4. Exercícios**
- Multiple choice
- Fill in the blanks
- Ordenar palavras
- Tradução
- Conversação livre com IA

### Entregáveis
- [ ] 5 cenários de IA implementados
- [ ] Sistema de áudio funcional
- [ ] 4 tipos de exercícios
- [ ] Algoritmo de review (spaced repetition)

### Métricas Alvo
- Tempo de resposta IA: < 2s
- Qualidade áudio: 128 kbps
- Taxa de acerto pronúncia: ±5%

---

## 🎮 Semana 3 (14-21/11) - GAMIFICAÇÃO

### Objetivos
- [ ] Sistema de streaks avançado
- [ ] Ranking de usuários
- [ ] Badges animados
- [ ] Desafios diários
- [ ] Sistema de notificações
- [ ] Social features básicas

### Funcionalidades

**1. Streaks**
- Notificação diária (20h)
- Streak freeze (1x/mês)
- Recuperação de streak (gemas)
- Leaderboard de streaks

**2. Ranking**
- Global
- Por amigos
- Por cidade/país
- Atualização real-time

**3. Badges**
- 30 badges diferentes
- Animações de desbloqueio
- Showcase no perfil
- Compartilhar nas redes

**4. Desafios Diários**
- 3 desafios/dia
- XP bônus
- Variedade (vocabulário, áudio, IA)

**5. Social**
- Adicionar amigos
- Ver progresso de amigos
- Desafios entre amigos

### Entregáveis
- [ ] 30 badges criados
- [ ] Sistema de notificações
- [ ] Ranking funcional
- [ ] 10 tipos de desafios

---

## 💳 Semana 4 (21-28/11) - MONETIZAÇÃO

### Objetivos
- [ ] Integrar Stripe
- [ ] Checkout flow
- [ ] Gestão de assinaturas
- [ ] Sistema de cupons
- [ ] Dashboard de admin

### Planos

**Freemium (R$ 0)**
- 7 dias de trial
- Level 1 completo (100 frases)
- Exercícios básicos
- Sem IA conversacional
- Anúncios leves

**Premium Mensal (R$ 39,90)**
- Acesso total (5.000 frases)
- IA conversacional ilimitada
- Sem anúncios
- Download de áudio
- Suporte prioritário

**Premium Anual (R$ 397)**
- Tudo do mensal
- 17% desconto
- 1 mês grátis
- Badge especial

**Vitalício (R$ 1.997)**
- Acesso perpétuo
- Tudo incluído
- Beta de features novas
- Comunidade VIP

### Funcionalidades

1. **Checkout**
   - PIX (instantâneo)
   - Cartão de crédito
   - Boleto (3 dias úteis)

2. **Gestão**
   - Upgrade/Downgrade
   - Cancelamento
   - Reembolso (7 dias)
   - Histórico de pagamentos

3. **Cupons**
   - LAUNCH50 (50% off)
   - BETA100 (100 usuários grátis)
   - Referral (R$ 20 desconto)

### Entregáveis
- [ ] Stripe integrado
- [ ] 3 métodos de pagamento
- [ ] Sistema de cupons
- [ ] Admin dashboard

### Meta Financeira
- 50 pagantes (R$ 2.000 MRR)

---

## 📚 Semanas 5-6 (Dez) - CONTEÚDO MASSIVO

### Objetivos
- [ ] Level 2 completo (500 frases)
- [ ] Level 3 completo (1.000 frases)
- [ ] 30 novas categorias
- [ ] 20 cenários de IA
- [ ] Sistema de revisão otimizado

### Level 2: Tourist (500 frases)
**Categorias (15):**
- Transporte público
- Fazer reservas
- Pedir informações
- Clima e tempo
- Entretenimento
- Fazer amizades
- Números e medidas
- Datas e horários
- Cores e descrições
- Família e relacionamentos
- (+ 5 categorias)

### Level 3: Conversational (1.000 frases)
**Categorias (20):**
- Small talk
- Opiniões e preferências
- Planos e intenções
- Experiências passadas
- Descrições detalhadas
- Sentimentos e emoções
- Concordar/Discordar
- Fazer sugestões
- Contar histórias
- Expressões idiomáticas
- (+ 10 categorias)

### Entregáveis
- [ ] 1.500 frases escritas
- [ ] 35 categorias novas
- [ ] 20 cenários IA
- [ ] Todos com áudio

### Métricas
- 125 frases/dia
- Qualidade: 95%+ aprovação

---

## 🚀 Semanas 7-8 (Dez) - PROFISSIONALIZAÇÃO

### Objetivos
- [ ] Level 4 (1.500 frases)
- [ ] Level 5 (1.000 frases)
- [ ] Features premium avançadas
- [ ] Otimizações de performance
- [ ] Testes automatizados

### Level 4: Professional (1.500 frases)
**Foco:** Negócios e trabalho
- Reuniões e apresentações
- Emails profissionais
- Networking
- Negociações
- Entrevistas de emprego
- Vocabulário técnico

### Level 5: Fluent (1.000 frases)
**Foco:** Fluência avançada
- Debates e argumentação
- Expressões complexas
- Nuances culturais
- Gírias e coloquialismo
- Literatura e mídia
- Fluência natural

### Features Premium
- [ ] Modo offline
- [ ] Download de lições
- [ ] Certificados
- [ ] Aulas ao vivo (1x/semana)
- [ ] Comunidade exclusiva

### Entregáveis
- [ ] 5.000 frases completas
- [ ] 100 categorias
- [ ] 50 cenários IA
- [ ] Features premium

---

## 🧪 Semanas 9-10 (Jan) - BETA TESTING

### Objetivos
- [ ] Recrutar 100 beta testers
- [ ] Coletar feedback
- [ ] Corrigir bugs críticos
- [ ] Otimizar UX
- [ ] Preparar lançamento

### Recrutamento
- [ ] Landing page beta
- [ ] Formulário de inscrição
- [ ] Email de boas-vindas
- [ ] Onboarding tutorial
- [ ] Grupo privado Discord

### Testes
**Focos:**
1. Usabilidade
2. Performance
3. Bugs
4. Conversão (free → premium)
5. Retenção (D1, D7, D30)

### Feedback
- [ ] Questionários semanais
- [ ] Entrevistas (20 usuários)
- [ ] Analytics completo
- [ ] Heatmaps
- [ ] Session recordings

### Métricas Alvo
- **Onboarding:** 80% conclusão
- **D1 retention:** 60%
- **D7 retention:** 40%
- **Conversão premium:** 5%
- **NPS:** 50+

### Entregáveis
- [ ] 100 beta testers ativos
- [ ] 50 páginas de feedback
- [ ] 100 bugs corrigidos
- [ ] Roadmap de melhorias

---

## 🎉 Semanas 11-12 (Jan) - LAUNCH!

### Objetivos
- [ ] Marketing pre-launch
- [ ] Landing page final
- [ ] Email campaigns
- [ ] Lançamento público
- [ ] Suporte 24/7

### Marketing

**Semana 11: Pre-Launch**
- [ ] Criar lista de espera (waitlist)
- [ ] Teaser nas redes sociais
- [ ] Parcerias com influencers
- [ ] Press release
- [ ] Video demo profissional

**Semana 12: Launch**
- [ ] Launch no Product Hunt
- [ ] Posts nas redes sociais
- [ ] Email para waitlist
- [ ] Anúncios pagos (R$ 5.000)
- [ ] Live demo/webinar

### Canais
1. **Product Hunt** (lançamento dia 1)
2. **Redes Sociais** (Instagram, TikTok, Twitter)
3. **Google Ads** (R$ 2.000)
4. **Facebook Ads** (R$ 2.000)
5. **Influencers** (3-5 parcerias)
6. **SEO** (blog posts)
7. **Email Marketing** (waitlist)

### Metas Launch
- **Dia 1:** 500 cadastros
- **Semana 1:** 1.000 usuários
- **Mês 1:** 100 pagantes
- **MRR:** R$ 4.000

### Entregáveis
- [ ] Landing page final
- [ ] 10 posts redes sociais
- [ ] 5 campanhas de anúncios
- [ ] 3 parcerias fechadas
- [ ] Blog com 10 artigos

---

## 📊 KPIs Gerais (12 Semanas)

### Desenvolvimento
- [x] 38 arquivos (Semana 1)
- [ ] 100+ arquivos (Semana 12)
- [ ] 50.000+ linhas de código
- [ ] 300+ commits
- [ ] 95%+ test coverage

### Conteúdo
- [x] 100 frases (Semana 1)
- [ ] 5.000 frases (Semana 8)
- [ ] 100 categorias
- [ ] 50 cenários IA
- [ ] 5.000 áudios

### Usuários
- [ ] 100 beta testers (Semana 10)
- [ ] 1.000 cadastros (Semana 12)
- [ ] 100 pagantes (Mês 1 pós-launch)
- [ ] 500 pagantes (Mês 6)
- [ ] 1.000 pagantes (Mês 12)

### Financeiro
- **Investimento:** R$ 15.000 (Mês 4)
- **MRR Mês 1:** R$ 4.000
- **MRR Mês 6:** R$ 20.000
- **ARR Ano 1:** R$ 480.000

---

## 🎯 Milestones Críticos

| Data | Milestone | Impacto |
|------|-----------|---------|
| 07/11 | Deploy MVP | Demo funcional |
| 14/11 | IA funcional | Diferencial competitivo |
| 28/11 | Stripe integrado | Monetização ativa |
| 31/12 | 5.000 frases | Produto completo |
| 15/01 | 100 beta testers | Validação mercado |
| 31/01 | **LAUNCH** | 🚀 |

---

## ⚠️ Riscos e Mitigações

### Riscos Técnicos
1. **API OpenAI cara** → Cachear respostas
2. **Performance ruim** → Otimizar queries
3. **Bugs críticos** → Testing robusto

### Riscos de Produto
1. **Usuários não pagam** → Melhorar value prop
2. **Baixa retenção** → Gamificação forte
3. **Competição** → Foco em diferencial (preço+IA)

### Riscos de Negócio
1. **Falta de capital** → Bootstrap até ter tração
2. **Não escala** → Arquitetura escalável desde dia 1
3. **Time pequeno** → Priorização brutal

---

## 📞 Checkpoints Semanais

**Toda quinta-feira, 19h:**
1. Review progresso da semana
2. Demo de funcionalidades
3. Planejar próxima semana
4. Atualizar documentação

---

## 🎓 Lições Aprendidas

(Será preenchido ao longo do projeto)

---

**Última atualização:** 07/11/2024
**Próxima revisão:** 14/11/2024

**Vamos fazer acontecer! 🚀**
