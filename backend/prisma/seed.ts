import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Levels
  console.log('Creating levels...')
  const levels = await Promise.all([
    prisma.level.create({
      data: {
        number: 1,
        name: 'Survival English',
        description: 'Sobrevivência básica - Frases essenciais',
        minXP: 0,
        color: '#10b981',
        icon: '🆘',
      },
    }),
    prisma.level.create({
      data: {
        number: 2,
        name: 'Tourist',
        description: 'Viagens e turismo',
        minXP: 1000,
        color: '#3b82f6',
        icon: '✈️',
      },
    }),
    prisma.level.create({
      data: {
        number: 3,
        name: 'Conversational',
        description: 'Conversação casual',
        minXP: 5000,
        color: '#8b5cf6',
        icon: '💬',
      },
    }),
    prisma.level.create({
      data: {
        number: 4,
        name: 'Professional',
        description: 'Inglês profissional e de negócios',
        minXP: 15000,
        color: '#f59e0b',
        icon: '💼',
      },
    }),
    prisma.level.create({
      data: {
        number: 5,
        name: 'Fluent',
        description: 'Fluência avançada',
        minXP: 30000,
        color: '#ef4444',
        icon: '🏆',
      },
    }),
  ])

  console.log(`✅ Created ${levels.length} levels`)

  // Create Categories for Level 1
  console.log('Creating categories...')
  const categoriesData = [
    { name: 'Greetings & Introductions', slug: 'greetings', icon: '👋', description: 'Saudações e apresentações', order: 1 },
    { name: 'Restaurant & Food', slug: 'restaurant', icon: '🍽️', description: 'Restaurante e comida', order: 2 },
    { name: 'Airport & Travel', slug: 'airport', icon: '✈️', description: 'Aeroporto e viagens', order: 3 },
    { name: 'Hotel Check-in/out', slug: 'hotel', icon: '🏨', description: 'Hotel entrada/saída', order: 4 },
    { name: 'Shopping & Prices', slug: 'shopping', icon: '🛍️', description: 'Compras e preços', order: 5 },
    { name: 'Directions & Location', slug: 'directions', icon: '🗺️', description: 'Direções e localização', order: 6 },
    { name: 'Emergency & Help', slug: 'emergency', icon: '🚨', description: 'Emergência e ajuda', order: 7 },
    { name: 'Asking for Help', slug: 'help', icon: '🙋', description: 'Pedindo ajuda', order: 8 },
    { name: 'Numbers & Time', slug: 'numbers', icon: '🕐', description: 'Números e horários', order: 9 },
    { name: 'Survival Phrases', slug: 'survival', icon: '🆘', description: 'Frases essenciais', order: 10 },
  ]

  const categories = await Promise.all(
    categoriesData.map((cat) =>
      prisma.category.create({
        data: {
          ...cat,
          levelId: levels[0].id,
        },
      })
    )
  )

  console.log(`✅ Created ${categories.length} categories`)

  // Create Phrases
  console.log('Creating 100 phrases...')

  const phrasesData = [
    // Greetings & Introductions (10)
    { en: 'Hello!', pt: 'Olá!', tip: 'Universal e sempre funciona' },
    { en: 'Good morning!', pt: 'Bom dia!', tip: 'Até meio-dia' },
    { en: 'Good afternoon!', pt: 'Boa tarde!', tip: 'Meio-dia até 18h' },
    { en: 'Good evening!', pt: 'Boa noite!', tip: 'Após 18h para cumprimentar' },
    { en: 'My name is...', pt: 'Meu nome é...', tip: 'Formal e respeitoso' },
    { en: 'Nice to meet you!', pt: 'Prazer em conhecê-lo!', tip: 'Primeiro encontro' },
    { en: 'How are you?', pt: 'Como você está?', tip: 'Pergunta comum e educada' },
    { en: "I'm fine, thanks!", pt: 'Estou bem, obrigado!', tip: 'Resposta padrão positiva' },
    { en: 'See you later!', pt: 'Até logo!', tip: 'Despedida casual' },
    { en: 'Goodbye!', pt: 'Adeus!', tip: 'Despedida mais definitiva' },

    // Restaurant & Food (10)
    { en: 'A table for two, please.', pt: 'Uma mesa para dois, por favor.', tip: 'Ao entrar no restaurante' },
    { en: 'Can I see the menu?', pt: 'Posso ver o cardápio?', tip: 'Pedir o menu' },
    { en: "I'd like to order.", pt: 'Gostaria de fazer o pedido.', tip: 'Chamar garçom' },
    { en: 'What do you recommend?', pt: 'O que você recomenda?', tip: 'Pedir sugestão' },
    { en: "I'll have the chicken.", pt: 'Vou querer o frango.', tip: 'Fazer pedido' },
    { en: 'Is this spicy?', pt: 'Isso é picante?', tip: 'Perguntar sobre comida' },
    { en: 'No onions, please.', pt: 'Sem cebola, por favor.', tip: 'Pedir modificação' },
    { en: 'The check, please.', pt: 'A conta, por favor.', tip: 'Pedir conta' },
    { en: 'Do you accept credit cards?', pt: 'Vocês aceitam cartão de crédito?', tip: 'Forma de pagamento' },
    { en: 'This is delicious!', pt: 'Isso está delicioso!', tip: 'Elogiar comida' },

    // Airport & Travel (10)
    { en: 'Where is check-in?', pt: 'Onde é o check-in?', tip: 'Ao chegar no aeroporto' },
    { en: 'Here is my passport.', pt: 'Aqui está meu passaporte.', tip: 'No check-in' },
    { en: 'Where is gate 5?', pt: 'Onde é o portão 5?', tip: 'Procurar portão de embarque' },
    { en: 'Is this seat taken?', pt: 'Este assento está ocupado?', tip: 'No avião' },
    { en: 'Where is the baggage claim?', pt: 'Onde é a área de bagagem?', tip: 'Ao desembarcar' },
    { en: 'I lost my luggage.', pt: 'Perdi minha bagagem.', tip: 'Reportar problema' },
    { en: 'Where is customs?', pt: 'Onde é a alfândega?', tip: 'Chegada internacional' },
    { en: 'How do I get to the city?', pt: 'Como chego ao centro da cidade?', tip: 'Transporte' },
    { en: 'Is there a bus to downtown?', pt: 'Tem ônibus para o centro?', tip: 'Transporte público' },
    { en: 'How much is a taxi?', pt: 'Quanto custa um táxi?', tip: 'Preço táxi' },

    // Hotel (10)
    { en: 'I have a reservation.', pt: 'Tenho uma reserva.', tip: 'Ao fazer check-in' },
    { en: 'Under what name?', pt: 'Em que nome?', tip: 'Pergunta comum no hotel' },
    { en: 'For how many nights?', pt: 'Por quantas noites?', tip: 'Duração estadia' },
    { en: 'Can I see the room first?', pt: 'Posso ver o quarto primeiro?', tip: 'Antes de aceitar' },
    { en: 'What time is checkout?', pt: 'Que horas é o checkout?', tip: 'Horário saída' },
    { en: 'Do you have wifi?', pt: 'Vocês têm wifi?', tip: 'Internet' },
    { en: "What's the wifi password?", pt: 'Qual a senha do wifi?', tip: 'Conectar internet' },
    { en: 'Can you call me a taxi?', pt: 'Pode chamar um táxi para mim?', tip: 'Serviço hotel' },
    { en: "I'd like a wake-up call at 7am.", pt: 'Gostaria de um despertador às 7h.', tip: 'Serviço despertador' },
    { en: "I'm checking out.", pt: 'Estou fazendo checkout.', tip: 'Ao sair' },

    // Shopping (10)
    { en: 'How much does this cost?', pt: 'Quanto custa isso?', tip: 'Perguntar preço' },
    { en: "That's too expensive.", pt: 'Isso é muito caro.', tip: 'Reclamar de preço' },
    { en: 'Do you have a discount?', pt: 'Você tem desconto?', tip: 'Pedir desconto' },
    { en: 'Can I try this on?', pt: 'Posso experimentar isso?', tip: 'Provar roupa' },
    { en: 'Where is the fitting room?', pt: 'Onde é o provador?', tip: 'Procurar provador' },
    { en: 'Do you have this in small?', pt: 'Você tem isso no pequeno?', tip: 'Tamanho roupa' },
    { en: "I'll take it.", pt: 'Vou levar.', tip: 'Decidir comprar' },
    { en: 'Can I pay by card?', pt: 'Posso pagar com cartão?', tip: 'Forma pagamento' },
    { en: 'Do you have a bag?', pt: 'Você tem uma sacola?', tip: 'Embalagem' },
    { en: 'Can I get a receipt?', pt: 'Posso pegar um recibo?', tip: 'Nota fiscal' },

    // Directions (10)
    { en: 'Where is the bathroom?', pt: 'Onde fica o banheiro?', tip: 'Pergunta muito comum' },
    { en: 'How do I get there?', pt: 'Como chego lá?', tip: 'Pedir direções' },
    { en: 'Is it far from here?', pt: 'É longe daqui?', tip: 'Distância' },
    { en: 'Turn right.', pt: 'Vire à direita.', tip: 'Direção' },
    { en: 'Turn left.', pt: 'Vire à esquerda.', tip: 'Direção' },
    { en: 'Go straight ahead.', pt: 'Siga em frente.', tip: 'Direção reta' },
    { en: "It's on the corner.", pt: 'Fica na esquina.', tip: 'Localização' },
    { en: "It's next to the bank.", pt: 'Fica ao lado do banco.', tip: 'Ponto de referência' },
    { en: 'Can you show me on the map?', pt: 'Pode me mostrar no mapa?', tip: 'Visual' },
    { en: "I'm lost.", pt: 'Estou perdido.', tip: 'Pedir ajuda' },

    // Emergency (10)
    { en: 'Help!', pt: 'Socorro!', tip: 'Emergência' },
    { en: 'Call the police!', pt: 'Chame a polícia!', tip: 'Urgência' },
    { en: 'I need a doctor.', pt: 'Preciso de um médico.', tip: 'Saúde' },
    { en: 'Where is the hospital?', pt: 'Onde fica o hospital?', tip: 'Emergência médica' },
    { en: "I don't feel well.", pt: 'Não me sinto bem.', tip: 'Mal estar' },
    { en: "I'm allergic to...", pt: 'Sou alérgico a...', tip: 'Alergias' },
    { en: 'Call an ambulance!', pt: 'Chame uma ambulância!', tip: 'Emergência grave' },
    { en: 'Where is the pharmacy?', pt: 'Onde fica a farmácia?', tip: 'Medicamentos' },
    { en: 'I lost my wallet.', pt: 'Perdi minha carteira.', tip: 'Roubo/perda' },
    { en: 'Where is the embassy?', pt: 'Onde fica a embaixada?', tip: 'Ajuda consular' },

    // Asking for Help (10)
    { en: 'Excuse me.', pt: 'Com licença.', tip: 'Chamar atenção educadamente' },
    { en: 'Can you help me?', pt: 'Você pode me ajudar?', tip: 'Pedir ajuda' },
    { en: "I don't understand.", pt: 'Não entendo.', tip: 'Dificuldade de compreensão' },
    { en: 'Can you repeat that?', pt: 'Pode repetir?', tip: 'Não ouviu bem' },
    { en: 'Please speak slowly.', pt: 'Por favor, fale devagar.', tip: 'Dificuldade com velocidade' },
    { en: 'Do you speak English?', pt: 'Você fala inglês?', tip: 'Verificar idioma' },
    { en: "I don't speak English well.", pt: 'Não falo inglês bem.', tip: 'Desculpar-se' },
    { en: 'Can you write it down?', pt: 'Pode escrever?', tip: 'Visual ajuda' },
    { en: 'What does this mean?', pt: 'O que isso significa?', tip: 'Tradução' },
    { en: 'Thank you very much!', pt: 'Muito obrigado!', tip: 'Gratidão' },

    // Numbers & Time (10)
    { en: 'What time is it?', pt: 'Que horas são?', tip: 'Perguntar hora' },
    { en: "It's 3 o'clock.", pt: 'São 3 horas.', tip: 'Responder hora exata' },
    { en: 'Half past two.', pt: 'Duas e meia.', tip: '30 minutos' },
    { en: 'How much is this?', pt: 'Quanto é isso?', tip: 'Preço' },
    { en: 'One, two, three...', pt: 'Um, dois, três...', tip: 'Números básicos' },
    { en: 'Can I have the number?', pt: 'Pode me dar o número?', tip: 'Telefone/endereço' },
    { en: "What's your phone number?", pt: 'Qual seu número de telefone?', tip: 'Contato' },
    { en: 'What day is today?', pt: 'Que dia é hoje?', tip: 'Data' },
    { en: 'What time does it open?', pt: 'A que horas abre?', tip: 'Horário funcionamento' },
    { en: 'What time does it close?', pt: 'A que horas fecha?', tip: 'Horário fechamento' },

    // Survival Phrases (10)
    { en: 'Yes.', pt: 'Sim.', tip: 'Afirmação' },
    { en: 'No.', pt: 'Não.', tip: 'Negação' },
    { en: 'Please.', pt: 'Por favor.', tip: 'Educação' },
    { en: 'Thank you.', pt: 'Obrigado.', tip: 'Gratidão' },
    { en: 'Sorry.', pt: 'Desculpe.', tip: 'Pedir desculpas' },
    { en: "I'm sorry.", pt: 'Me desculpe.', tip: 'Desculpas mais formal' },
    { en: 'Excuse me.', pt: 'Com licença.', tip: 'Chamar atenção' },
    { en: "You're welcome.", pt: 'De nada.', tip: 'Resposta a obrigado' },
    { en: 'I understand.', pt: 'Eu entendo.', tip: 'Compreensão' },
    { en: "I don't know.", pt: 'Não sei.', tip: 'Desconhecimento' },
  ]

  let phraseCounter = 0
  for (let i = 0; i < categories.length; i++) {
    const categoryPhrases = phrasesData.slice(i * 10, (i + 1) * 10)

    await Promise.all(
      categoryPhrases.map((phrase, index) =>
        prisma.phrase.create({
          data: {
            ...phrase,
            categoryId: categories[i].id,
            difficulty: 1,
            order: index + 1,
          },
        })
      )
    )
    phraseCounter += categoryPhrases.length
  }

  console.log(`✅ Created ${phraseCounter} phrases`)

  // Create Achievements
  console.log('Creating achievements...')
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        slug: 'first-lesson',
        name: 'Primeira Lição',
        description: 'Complete sua primeira lição',
        icon: '🎯',
        xpReward: 10,
        type: 'phrases',
        target: 1,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'ten-phrases',
        name: '10 Frases',
        description: 'Aprenda 10 frases',
        icon: '📚',
        xpReward: 50,
        type: 'phrases',
        target: 10,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-3',
        name: 'Dedicação',
        description: 'Estude 3 dias seguidos',
        icon: '🔥',
        xpReward: 50,
        type: 'streak',
        target: 3,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-7',
        name: 'Semana Perfeita',
        description: 'Estude 7 dias seguidos',
        icon: '⭐',
        xpReward: 100,
        type: 'streak',
        target: 7,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'level-2',
        name: 'Subindo de Nível',
        description: 'Alcance o nível 2',
        icon: '🚀',
        xpReward: 100,
        type: 'level',
        target: 2,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'xp-1000',
        name: 'Milhar',
        description: 'Ganhe 1.000 XP',
        icon: '💎',
        xpReward: 150,
        type: 'xp',
        target: 1000,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'complete-level-1',
        name: 'Survival Master',
        description: 'Complete todas as 100 frases do Level 1',
        icon: '🏆',
        xpReward: 500,
        type: 'phrases',
        target: 100,
      },
    }),
    prisma.achievement.create({
      data: {
        slug: 'streak-30',
        name: 'Mês Perfeito',
        description: 'Estude 30 dias seguidos',
        icon: '👑',
        xpReward: 1000,
        type: 'streak',
        target: 30,
      },
    }),
  ])

  console.log(`✅ Created ${achievements.length} achievements`)

  console.log('🎉 Seed completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
