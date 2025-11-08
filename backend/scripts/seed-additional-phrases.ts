/**
 * STATIC PHRASE SEEDER
 * Add pre-written phrases without AI (no API key required)
 *
 * Usage: tsx scripts/seed-additional-phrases.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Additional phrases for existing categories (Level 1 expansion)
const level1Expansion = {
  greetings: [
    { en: 'How do you do?', pt: 'Como vai?', tip: 'Formal greeting' },
    { en: "What's up?", pt: 'E aí?', tip: 'Very casual greeting' },
    { en: 'Long time no see!', pt: 'Há quanto tempo!', tip: 'Haven\'t seen someone in a while' },
    { en: 'Welcome!', pt: 'Bem-vindo!', tip: 'Greeting someone arriving' },
    { en: 'Good night!', pt: 'Boa noite!', tip: 'When going to sleep' },
    { en: 'Have a good day!', pt: 'Tenha um bom dia!', tip: 'Farewell wish' },
    { en: 'Take care!', pt: 'Cuide-se!', tip: 'Caring farewell' },
    { en: "It's nice to see you again!", pt: 'É bom ver você novamente!', tip: 'Reunion' },
    { en: 'Pleased to meet you.', pt: 'Prazer em conhecê-lo.', tip: 'Formal introduction' },
    { en: "How's it going?", pt: 'Como vai indo?', tip: 'Casual check-in' },
    { en: "I'm doing great!", pt: 'Estou muito bem!', tip: 'Positive response' },
    { en: 'Not bad, thanks!', pt: 'Nada mal, obrigado!', tip: 'Neutral positive response' },
    { en: 'Same as always.', pt: 'Como sempre.', tip: 'Nothing has changed' },
    { en: 'Could be better.', pt: 'Poderia estar melhor.', tip: 'Politely negative' },
    { en: 'Catch you later!', pt: 'Te vejo depois!', tip: 'Casual goodbye' },
  ],

  restaurant: [
    { en: 'Is there a wait?', pt: 'Há fila de espera?', tip: 'Asking about waiting time' },
    { en: 'We have a reservation for 7pm.', pt: 'Temos reserva para 19h.', tip: 'Confirming reservation' },
    { en: 'Could we sit outside?', pt: 'Podemos sentar lá fora?', tip: 'Requesting outdoor seating' },
    { en: "I'm allergic to peanuts.", pt: 'Sou alérgico a amendoim.', tip: 'Important allergy info' },
    { en: "What's in this dish?", pt: 'O que tem neste prato?', tip: 'Asking about ingredients' },
    { en: 'Is this gluten-free?', pt: 'Isso é sem glúten?', tip: 'Dietary restriction' },
    { en: 'Can I get this to go?', pt: 'Posso levar para viagem?', tip: 'Takeout request' },
    { en: 'The food is cold.', pt: 'A comida está fria.', tip: 'Complaint' },
    { en: 'This is not what I ordered.', pt: 'Isso não foi o que pedi.', tip: 'Wrong order' },
    { en: 'Could we get some water?', pt: 'Podemos pegar água?', tip: 'Requesting water' },
    { en: "I'd like mine well done.", pt: 'Quero o meu bem passado.', tip: 'Meat cooking preference' },
    { en: "We're ready to order.", pt: 'Estamos prontos para pedir.', tip: 'Calling waiter' },
    { en: 'Just the bill, please.', pt: 'Só a conta, por favor.', tip: 'Requesting check' },
    { en: 'Is service included?', pt: 'O serviço está incluído?', tip: 'About tips' },
    { en: 'Keep the change.', pt: 'Pode ficar com o troco.', tip: 'Giving tip' },
    { en: 'Can we split the bill?', pt: 'Podemos dividir a conta?', tip: 'Separate payments' },
    { en: "I'm vegetarian.", pt: 'Sou vegetariano.', tip: 'Dietary preference' },
    { en: 'No MSG, please.', pt: 'Sem glutamato, por favor.', tip: 'Food additive preference' },
    { en: 'Can I see the wine list?', pt: 'Posso ver a carta de vinhos?', tip: 'Requesting wine menu' },
    { en: "We're celebrating a birthday!", pt: 'Estamos comemorando um aniversário!', tip: 'Special occasion' },
  ],

  airport: [
    { en: 'Where do I check in?', pt: 'Onde faço check-in?', tip: 'Finding check-in counter' },
    { en: 'Window or aisle seat?', pt: 'Janela ou corredor?', tip: 'Seat preference question' },
    { en: "I'd like a window seat.", pt: 'Gostaria de assento na janela.', tip: 'Seat preference' },
    { en: 'How many bags can I check?', pt: 'Quantas malas posso despachar?', tip: 'Luggage allowance' },
    { en: 'Is this flight on time?', pt: 'Este voo está no horário?', tip: 'Checking delays' },
    { en: 'My flight is delayed.', pt: 'Meu voo está atrasado.', tip: 'Reporting delay' },
    { en: 'Where is the boarding gate?', pt: 'Onde é o portão de embarque?', tip: 'Finding gate' },
    { en: "What's the boarding time?", pt: 'Qual o horário de embarque?', tip: 'Boarding schedule' },
    { en: 'I have a connecting flight.', pt: 'Tenho um voo de conexão.', tip: 'Transfer information' },
    { en: 'I missed my flight.', pt: 'Perdi meu voo.', tip: 'Missed flight' },
    { en: 'Can I get on the next flight?', pt: 'Posso pegar o próximo voo?', tip: 'Alternative flight' },
    { en: 'My luggage is damaged.', pt: 'Minha bagagem está danificada.', tip: 'Luggage complaint' },
    { en: 'Where can I file a claim?', pt: 'Onde posso fazer uma reclamação?', tip: 'Complaint procedure' },
    { en: 'Is there free WiFi?', pt: 'Tem WiFi grátis?', tip: 'Internet access' },
    { en: 'Where are the restrooms?', pt: 'Onde ficam os banheiros?', tip: 'Finding facilities' },
    { en: 'Is there a lounge?', pt: 'Tem uma sala VIP?', tip: 'VIP lounge' },
    { en: 'I need to change my seat.', pt: 'Preciso trocar meu assento.', tip: 'Seat change request' },
    { en: 'Can I upgrade?', pt: 'Posso fazer upgrade?', tip: 'Class upgrade' },
    { en: 'Boarding is now open.', pt: 'Embarque está aberto agora.', tip: 'Boarding announcement' },
    { en: 'Final call for flight 123.', pt: 'Última chamada para voo 123.', tip: 'Last boarding call' },
  ],

  hotel: [
    { en: "I'd like a non-smoking room.", pt: 'Gostaria de quarto para não fumantes.', tip: 'Room preference' },
    { en: 'Is breakfast included?', pt: 'O café da manhã está incluído?', tip: 'Meal inquiry' },
    { en: 'What time is breakfast?', pt: 'Que horas é o café da manhã?', tip: 'Meal schedule' },
    { en: 'Can I have a late checkout?', pt: 'Posso fazer checkout tarde?', tip: 'Extended stay' },
    { en: 'The AC is not working.', pt: 'O ar condicionado não está funcionando.', tip: 'Room problem' },
    { en: 'I need extra towels.', pt: 'Preciso de toalhas extras.', tip: 'Room request' },
    { en: 'Can you clean my room?', pt: 'Pode limpar meu quarto?', tip: 'Housekeeping request' },
    { en: 'Do not disturb, please.', pt: 'Não perturbe, por favor.', tip: 'Privacy request' },
    { en: "I'd like to extend my stay.", pt: 'Gostaria de estender minha estadia.', tip: 'Extended booking' },
    { en: 'Is there room service?', pt: 'Tem serviço de quarto?', tip: 'Room service inquiry' },
    { en: 'Where is the gym?', pt: 'Onde fica a academia?', tip: 'Hotel facilities' },
    { en: 'Is there a pool?', pt: 'Tem piscina?', tip: 'Amenities' },
    { en: 'I lost my room key.', pt: 'Perdi a chave do quarto.', tip: 'Key problem' },
    { en: "I'm locked out of my room.", pt: 'Estou trancado fora do quarto.', tip: 'Lock problem' },
    { en: 'Can I store my luggage?', pt: 'Posso guardar minha bagagem?', tip: 'Luggage storage' },
  ],

  shopping: [
    { en: 'Where is the fitting room?', pt: 'Onde fica o provador?', tip: 'Finding changing room' },
    { en: 'This is too small.', pt: 'Isso está muito pequeno.', tip: 'Size issue' },
    { en: 'This is too big.', pt: 'Isso está muito grande.', tip: 'Size issue' },
    { en: 'Do you have this in another color?', pt: 'Tem isso em outra cor?', tip: 'Color options' },
    { en: "I'm just looking, thanks.", pt: 'Só estou olhando, obrigado.', tip: 'Browsing' },
    { en: 'Can I return this?', pt: 'Posso devolver isso?', tip: 'Return policy' },
    { en: "What's your return policy?", pt: 'Qual a política de devolução?', tip: 'Return terms' },
    { en: 'I have a receipt.', pt: 'Tenho o recibo.', tip: 'Proof of purchase' },
    { en: "I'd like to exchange this.", pt: 'Gostaria de trocar isso.', tip: 'Exchange request' },
    { en: 'Is there a warranty?', pt: 'Tem garantia?', tip: 'Warranty inquiry' },
    { en: 'When does the sale end?', pt: 'Quando termina a promoção?', tip: 'Sale duration' },
    { en: 'Do you have this on sale?', pt: 'Tem isso em promoção?', tip: 'Discount inquiry' },
    { en: "I'll think about it.", pt: 'Vou pensar sobre isso.', tip: 'Delaying purchase' },
    { en: 'Can I pay in installments?', pt: 'Posso pagar parcelado?', tip: 'Payment options' },
    { en: 'Do you accept gift cards?', pt: 'Aceitam cartões presente?', tip: 'Payment method' },
    { en: 'This is damaged.', pt: 'Isso está danificado.', tip: 'Product issue' },
    { en: 'Do you offer gift wrapping?', pt: 'Oferecem embrulho para presente?', tip: 'Gift service' },
    { en: 'Can you hold this for me?', pt: 'Pode guardar isso para mim?', tip: 'Item reservation' },
    { en: "I'd like a refund.", pt: 'Gostaria de um reembolso.', tip: 'Refund request' },
    { en: 'Do you price match?', pt: 'Vocês igualam preços?', tip: 'Price matching' },
  ],
}

async function seedAdditionalPhrases() {
  console.log('🌱 Seeding additional phrases (static)...\n')

  let totalAdded = 0

  for (const [slug, phrases] of Object.entries(level1Expansion)) {
    const category = await prisma.category.findUnique({
      where: { slug },
    })

    if (!category) {
      console.log(`  ⏭️  Category "${slug}" not found, skipping...`)
      continue
    }

    // Get current max order
    const maxOrder = await prisma.phrase.findFirst({
      where: { categoryId: category.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const startOrder = (maxOrder?.order || 0) + 1

    console.log(`📝 Adding ${phrases.length} phrases to "${category.name}"...`)

    for (let i = 0; i < phrases.length; i++) {
      const phrase = phrases[i]

      await prisma.phrase.create({
        data: {
          categoryId: category.id,
          en: phrase.en,
          pt: phrase.pt,
          tip: phrase.tip,
          difficulty: 1,
          order: startOrder + i,
        },
      })
    }

    totalAdded += phrases.length
    console.log(`  ✅ Added ${phrases.length} phrases`)
  }

  console.log(`\n✨ Seed complete!`)
  console.log(`📊 Total phrases added: ${totalAdded}`)

  return totalAdded
}

async function main() {
  try {
    console.log('🚀 English Flow - Static Phrase Seeder\n')

    await seedAdditionalPhrases()

    console.log('\n🎉 All done!')
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
