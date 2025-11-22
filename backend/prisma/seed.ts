/**
 * SEED DATABASE - AprendaInglesGratis
 *
 * Initial data for all tables
 * Run: npx prisma db seed
 *
 * @module Seed
 * @version 1.0.0
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ==================== LEVELS DATA ====================

const levels = [
  {
    name: 'A1',
    description: 'Iniciante - Compreende e usa expressoes familiares do cotidiano e frases basicas.',
    order: 1,
  },
  {
    name: 'A2',
    description: 'Basico - Comunica-se em tarefas simples e rotineiras do dia a dia.',
    order: 2,
  },
  {
    name: 'B1',
    description: 'Intermediario - Lida com situacoes de viagem e descreve experiencias.',
    order: 3,
  },
  {
    name: 'B2',
    description: 'Intermediario Superior - Interage com fluencia com falantes nativos.',
    order: 4,
  },
  {
    name: 'C1',
    description: 'Avancado - Expressa-se de forma fluente e espontanea.',
    order: 5,
  },
  {
    name: 'C2',
    description: 'Proficiente - Compreende praticamente tudo e se expressa com precisao.',
    order: 6,
  },
];

// ==================== CATEGORIES DATA ====================

const categories = [
  { name: 'Saudacoes', slug: 'greetings', description: 'Cumprimentos e apresentacoes', icon: 'wave', order: 1 },
  { name: 'Familia', slug: 'family', description: 'Membros da familia e relacionamentos', icon: 'users', order: 2 },
  { name: 'Comida e Bebida', slug: 'food-drink', description: 'Alimentos, restaurantes e culinaria', icon: 'utensils', order: 3 },
  { name: 'Viagem', slug: 'travel', description: 'Aeroportos, hoteis e turismo', icon: 'plane', order: 4 },
  { name: 'Trabalho', slug: 'work', description: 'Escritorio, reunioes e carreira', icon: 'briefcase', order: 5 },
  { name: 'Compras', slug: 'shopping', description: 'Lojas, precos e produtos', icon: 'shopping-cart', order: 6 },
  { name: 'Saude', slug: 'health', description: 'Medicos, hospital e bem-estar', icon: 'heart', order: 7 },
  { name: 'Casa', slug: 'home', description: 'Moradia, moveis e tarefas domesticas', icon: 'home', order: 8 },
  { name: 'Tempo e Clima', slug: 'weather', description: 'Condicoes climaticas e estacoes', icon: 'cloud', order: 9 },
  { name: 'Hobbies', slug: 'hobbies', description: 'Esportes, musica e passatempos', icon: 'gamepad', order: 10 },
  { name: 'Tecnologia', slug: 'technology', description: 'Computadores, internet e dispositivos', icon: 'laptop', order: 11 },
  { name: 'Negocios', slug: 'business', description: 'Reunioes formais e negociacoes', icon: 'chart', order: 12 },
];

// ==================== PHRASES DATA ====================

const phrasesData = [
  // A1 - Greetings
  { text: 'Hello!', translation: 'Ola!', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/heˈloʊ/' },
  { text: 'Good morning!', translation: 'Bom dia!', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/ɡʊd ˈmɔːrnɪŋ/' },
  { text: 'Good afternoon!', translation: 'Boa tarde!', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/ɡʊd ˌæftərˈnuːn/' },
  { text: 'Good evening!', translation: 'Boa noite!', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/ɡʊd ˈiːvnɪŋ/' },
  { text: 'Goodbye!', translation: 'Adeus!', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/ɡʊdˈbaɪ/' },
  { text: 'How are you?', translation: 'Como voce esta?', level: 'A1', category: 'greetings', difficulty: 2, ipa: '/haʊ ɑːr juː/' },
  { text: 'I am fine, thank you.', translation: 'Eu estou bem, obrigado.', level: 'A1', category: 'greetings', difficulty: 2, ipa: '/aɪ æm faɪn θæŋk juː/' },
  { text: 'Nice to meet you!', translation: 'Prazer em conhece-lo!', level: 'A1', category: 'greetings', difficulty: 2, ipa: '/naɪs tuː miːt juː/' },
  { text: 'My name is...', translation: 'Meu nome e...', level: 'A1', category: 'greetings', difficulty: 1, ipa: '/maɪ neɪm ɪz/' },
  { text: 'See you later!', translation: 'Ate mais tarde!', level: 'A1', category: 'greetings', difficulty: 2, ipa: '/siː juː ˈleɪtər/' },

  // A1 - Family
  { text: 'This is my mother.', translation: 'Esta e minha mae.', level: 'A1', category: 'family', difficulty: 2, ipa: '/ðɪs ɪz maɪ ˈmʌðər/' },
  { text: 'This is my father.', translation: 'Este e meu pai.', level: 'A1', category: 'family', difficulty: 2, ipa: '/ðɪs ɪz maɪ ˈfɑːðər/' },
  { text: 'I have two brothers.', translation: 'Eu tenho dois irmaos.', level: 'A1', category: 'family', difficulty: 3, ipa: '/aɪ hæv tuː ˈbrʌðərz/' },
  { text: 'She is my sister.', translation: 'Ela e minha irma.', level: 'A1', category: 'family', difficulty: 2, ipa: '/ʃiː ɪz maɪ ˈsɪstər/' },
  { text: 'My family is big.', translation: 'Minha familia e grande.', level: 'A1', category: 'family', difficulty: 2, ipa: '/maɪ ˈfæmɪli ɪz bɪɡ/' },

  // A1 - Food
  { text: 'I am hungry.', translation: 'Eu estou com fome.', level: 'A1', category: 'food-drink', difficulty: 2, ipa: '/aɪ æm ˈhʌŋɡri/' },
  { text: 'I want water, please.', translation: 'Eu quero agua, por favor.', level: 'A1', category: 'food-drink', difficulty: 2, ipa: '/aɪ wɑːnt ˈwɔːtər pliːz/' },
  { text: 'This food is delicious!', translation: 'Esta comida e deliciosa!', level: 'A1', category: 'food-drink', difficulty: 3, ipa: '/ðɪs fuːd ɪz dɪˈlɪʃəs/' },
  { text: 'The bill, please.', translation: 'A conta, por favor.', level: 'A1', category: 'food-drink', difficulty: 2, ipa: '/ðə bɪl pliːz/' },
  { text: 'I like coffee.', translation: 'Eu gosto de cafe.', level: 'A1', category: 'food-drink', difficulty: 2, ipa: '/aɪ laɪk ˈkɔːfi/' },

  // A2 - Travel
  { text: 'Where is the train station?', translation: 'Onde fica a estacao de trem?', level: 'A2', category: 'travel', difficulty: 4, ipa: '/wer ɪz ðə treɪn ˈsteɪʃən/' },
  { text: 'I need a taxi.', translation: 'Eu preciso de um taxi.', level: 'A2', category: 'travel', difficulty: 3, ipa: '/aɪ niːd ə ˈtæksi/' },
  { text: 'How much is the ticket?', translation: 'Quanto custa a passagem?', level: 'A2', category: 'travel', difficulty: 4, ipa: '/haʊ mʌtʃ ɪz ðə ˈtɪkɪt/' },
  { text: 'I have a reservation.', translation: 'Eu tenho uma reserva.', level: 'A2', category: 'travel', difficulty: 4, ipa: '/aɪ hæv ə ˌrezərˈveɪʃən/' },
  { text: 'What time does the bus leave?', translation: 'Que horas o onibus sai?', level: 'A2', category: 'travel', difficulty: 4, ipa: '/wɑːt taɪm dʌz ðə bʌs liːv/' },

  // A2 - Work
  { text: 'I work in an office.', translation: 'Eu trabalho em um escritorio.', level: 'A2', category: 'work', difficulty: 3, ipa: '/aɪ wɜːrk ɪn ən ˈɔːfɪs/' },
  { text: 'What is your job?', translation: 'Qual e seu trabalho?', level: 'A2', category: 'work', difficulty: 3, ipa: '/wɑːt ɪz jʊr dʒɑːb/' },
  { text: 'I have a meeting at 10.', translation: 'Eu tenho uma reuniao as 10.', level: 'A2', category: 'work', difficulty: 4, ipa: '/aɪ hæv ə ˈmiːtɪŋ æt ten/' },
  { text: 'Can you send me the email?', translation: 'Voce pode me enviar o email?', level: 'A2', category: 'work', difficulty: 4, ipa: '/kæn juː send miː ðə ˈiːmeɪl/' },
  { text: 'The deadline is tomorrow.', translation: 'O prazo e amanha.', level: 'A2', category: 'work', difficulty: 4, ipa: '/ðə ˈdedlaɪn ɪz təˈmɔːroʊ/' },

  // B1 - Business
  { text: 'Let me introduce myself.', translation: 'Deixe-me apresentar-me.', level: 'B1', category: 'business', difficulty: 5, ipa: '/let miː ˌɪntrəˈduːs maɪˈself/' },
  { text: 'I would like to schedule a meeting.', translation: 'Gostaria de agendar uma reuniao.', level: 'B1', category: 'business', difficulty: 6, ipa: '/aɪ wʊd laɪk tuː ˈskedʒuːl ə ˈmiːtɪŋ/' },
  { text: 'Could you clarify that point?', translation: 'Voce poderia esclarecer esse ponto?', level: 'B1', category: 'business', difficulty: 6, ipa: '/kʊd juː ˈklærɪfaɪ ðæt pɔɪnt/' },
  { text: 'We need to discuss the budget.', translation: 'Precisamos discutir o orcamento.', level: 'B1', category: 'business', difficulty: 6, ipa: '/wiː niːd tuː dɪˈskʌs ðə ˈbʌdʒɪt/' },
  { text: 'The report is due next week.', translation: 'O relatorio e para a proxima semana.', level: 'B1', category: 'business', difficulty: 6, ipa: '/ðə rɪˈpɔːrt ɪz duː nekst wiːk/' },

  // B1 - Technology
  { text: 'My computer is not working.', translation: 'Meu computador nao esta funcionando.', level: 'B1', category: 'technology', difficulty: 5, ipa: '/maɪ kəmˈpjuːtər ɪz nɑːt ˈwɜːrkɪŋ/' },
  { text: 'Can you help me with this software?', translation: 'Voce pode me ajudar com este software?', level: 'B1', category: 'technology', difficulty: 6, ipa: '/kæn juː help miː wɪð ðɪs ˈsɔːftwer/' },
  { text: 'I need to update my password.', translation: 'Preciso atualizar minha senha.', level: 'B1', category: 'technology', difficulty: 5, ipa: '/aɪ niːd tuː ʌpˈdeɪt maɪ ˈpæswɜːrd/' },
  { text: 'The internet connection is slow.', translation: 'A conexao de internet esta lenta.', level: 'B1', category: 'technology', difficulty: 6, ipa: '/ðə ˈɪntərnet kəˈnekʃən ɪz sloʊ/' },

  // B2 - Advanced Business
  { text: 'I strongly believe we should reconsider our approach.', translation: 'Acredito fortemente que devemos reconsiderar nossa abordagem.', level: 'B2', category: 'business', difficulty: 7, ipa: '/aɪ ˈstrɔːŋli bɪˈliːv wiː ʃʊd ˌriːkənˈsɪdər ˈaʊər əˈproʊtʃ/' },
  { text: 'The quarterly results exceeded our expectations.', translation: 'Os resultados trimestrais superaram nossas expectativas.', level: 'B2', category: 'business', difficulty: 8, ipa: '/ðə ˈkwɔːrtərli rɪˈzʌlts ɪkˈsiːdɪd ˈaʊər ˌekspekˈteɪʃənz/' },
  { text: 'We are looking to expand into new markets.', translation: 'Estamos buscando expandir para novos mercados.', level: 'B2', category: 'business', difficulty: 7, ipa: '/wiː ɑːr ˈlʊkɪŋ tuː ɪkˈspænd ˈɪntuː nuː ˈmɑːrkɪts/' },

  // C1 - Advanced
  { text: 'The implications of this decision are far-reaching.', translation: 'As implicacoes desta decisao sao de longo alcance.', level: 'C1', category: 'business', difficulty: 9, ipa: '/ðə ˌɪmplɪˈkeɪʃənz əv ðɪs dɪˈsɪʒən ɑːr fɑːr ˈriːtʃɪŋ/' },
  { text: 'I would argue that the data suggests otherwise.', translation: 'Eu argumentaria que os dados sugerem o contrario.', level: 'C1', category: 'business', difficulty: 9, ipa: '/aɪ wʊd ˈɑːrɡjuː ðæt ðə ˈdeɪtə səˈdʒests ˈʌðərwaɪz/' },
  { text: 'This raises some interesting philosophical questions.', translation: 'Isso levanta algumas questoes filosoficas interessantes.', level: 'C1', category: 'technology', difficulty: 9, ipa: '/ðɪs ˈreɪzɪz sʌm ˈɪntrəstɪŋ ˌfɪləˈsɑːfɪkəl ˈkwestʃənz/' },

  // C2 - Proficient
  { text: 'The nuances of this argument are often overlooked in mainstream discourse.', translation: 'As nuances deste argumento sao frequentemente ignoradas no discurso comum.', level: 'C2', category: 'business', difficulty: 10, ipa: '/ðə ˈnuːɑːnsɪz əv ðɪs ˈɑːrɡjumənt ɑːr ˈɔːfən ˌoʊvərˈlʊkt ɪn ˈmeɪnstriːm ˈdɪskɔːrs/' },
  { text: 'One could posit that the underlying assumptions are fundamentally flawed.', translation: 'Pode-se supor que as suposicoes subjacentes sao fundamentalmente falhas.', level: 'C2', category: 'business', difficulty: 10, ipa: '/wʌn kʊd ˈpɑːzɪt ðæt ðə ˌʌndərˈlaɪɪŋ əˈsʌmpʃənz ɑːr ˌfʌndəˈmentəli flɔːd/' },
];

// ==================== ACHIEVEMENTS DATA ====================

const achievements = [
  // Streak achievements
  { title: 'Primeiro Passo', description: 'Complete sua primeira licao', icon: 'footprints', category: 'completion', xpReward: 50, coinsReward: 10, gemsReward: 0, requirement: 1, isSecret: false },
  { title: 'Sequencia de 3 dias', description: 'Mantenha uma sequencia de 3 dias', icon: 'fire', category: 'streak', xpReward: 100, coinsReward: 25, gemsReward: 1, requirement: 3, isSecret: false },
  { title: 'Sequencia de 7 dias', description: 'Mantenha uma sequencia de 7 dias', icon: 'fire-alt', category: 'streak', xpReward: 300, coinsReward: 75, gemsReward: 3, requirement: 7, isSecret: false },
  { title: 'Sequencia de 30 dias', description: 'Mantenha uma sequencia de 30 dias', icon: 'flame', category: 'streak', xpReward: 1000, coinsReward: 250, gemsReward: 10, requirement: 30, isSecret: false },
  { title: 'Sequencia de 100 dias', description: 'Mantenha uma sequencia de 100 dias', icon: 'volcano', category: 'streak', xpReward: 5000, coinsReward: 1000, gemsReward: 50, requirement: 100, isSecret: false },
  { title: 'Sequencia de 365 dias', description: 'Um ano inteiro de aprendizado!', icon: 'trophy', category: 'streak', xpReward: 20000, coinsReward: 5000, gemsReward: 200, requirement: 365, isSecret: false },

  // Pronunciation achievements
  { title: 'Primeira Palavra', description: 'Pronuncie sua primeira palavra corretamente', icon: 'microphone', category: 'pronunciation', xpReward: 50, coinsReward: 10, gemsReward: 0, requirement: 1, isSecret: false },
  { title: 'Fluente Iniciante', description: 'Acerte 10 pronuncias', icon: 'microphone-alt', category: 'pronunciation', xpReward: 200, coinsReward: 50, gemsReward: 2, requirement: 10, isSecret: false },
  { title: 'Mestre da Pronuncia', description: 'Acerte 100 pronuncias', icon: 'star', category: 'pronunciation', xpReward: 1000, coinsReward: 250, gemsReward: 10, requirement: 100, isSecret: false },
  { title: 'Nativo Virtual', description: 'Acerte 1000 pronuncias', icon: 'crown', category: 'pronunciation', xpReward: 5000, coinsReward: 1000, gemsReward: 50, requirement: 1000, isSecret: false },

  // Listening achievements
  { title: 'Ouvinte Atento', description: 'Complete sua primeira sessao de listening', icon: 'headphones', category: 'listening', xpReward: 50, coinsReward: 10, gemsReward: 0, requirement: 1, isSecret: false },
  { title: 'Audio Expert', description: 'Complete 50 sessoes de listening', icon: 'headphones-alt', category: 'listening', xpReward: 500, coinsReward: 125, gemsReward: 5, requirement: 50, isSecret: false },

  // Level achievements
  { title: 'A1 Completo', description: 'Domine o nivel A1', icon: 'medal', category: 'completion', xpReward: 500, coinsReward: 100, gemsReward: 5, requirement: 1, isSecret: false },
  { title: 'A2 Completo', description: 'Domine o nivel A2', icon: 'medal', category: 'completion', xpReward: 1000, coinsReward: 200, gemsReward: 10, requirement: 1, isSecret: false },
  { title: 'B1 Completo', description: 'Domine o nivel B1', icon: 'medal', category: 'completion', xpReward: 2000, coinsReward: 400, gemsReward: 20, requirement: 1, isSecret: false },
  { title: 'B2 Completo', description: 'Domine o nivel B2', icon: 'medal', category: 'completion', xpReward: 3000, coinsReward: 600, gemsReward: 30, requirement: 1, isSecret: false },
  { title: 'C1 Completo', description: 'Domine o nivel C1', icon: 'medal', category: 'completion', xpReward: 5000, coinsReward: 1000, gemsReward: 50, requirement: 1, isSecret: false },
  { title: 'C2 Completo', description: 'Domine o nivel C2 - Fluente!', icon: 'gem', category: 'completion', xpReward: 10000, coinsReward: 2000, gemsReward: 100, requirement: 1, isSecret: false },

  // Secret achievements
  { title: 'Coruja Noturna', description: 'Estude apos meia-noite', icon: 'moon', category: 'streak', xpReward: 100, coinsReward: 50, gemsReward: 2, requirement: 1, isSecret: true },
  { title: 'Madrugador', description: 'Estude antes das 6 da manha', icon: 'sun', category: 'streak', xpReward: 100, coinsReward: 50, gemsReward: 2, requirement: 1, isSecret: true },
  { title: 'Perfeccionista', description: 'Obtenha 100% em 10 exercicios seguidos', icon: 'check-double', category: 'completion', xpReward: 500, coinsReward: 200, gemsReward: 10, requirement: 10, isSecret: true },
];

// ==================== TEACHERS DATA ====================

const teachers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@aprendaingles.com',
    avatar: 'https://randomuser.me/api/portraits/women/1.jpg',
    bio: 'Professora nativa americana com 10 anos de experiencia ensinando ingles como segunda lingua. Especialista em conversacao e preparacao para TOEFL.',
    certifications: ['TEFL', 'CELTA'],
    specializations: ['Conversation', 'TOEFL Prep', 'Business English'],
    languages: ['English', 'Spanish'],
    rating: 4.9,
    totalLessons: 2500,
    experience: 10,
    hourlyRate: 8000, // R$ 80.00
    timezone: 'America/New_York',
    availability: {
      monday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      tuesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      wednesday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      thursday: ['09:00', '10:00', '11:00', '14:00', '15:00'],
      friday: ['09:00', '10:00', '11:00'],
    },
    isActive: true,
  },
  {
    name: 'Michael Brown',
    email: 'michael.brown@aprendaingles.com',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg',
    bio: 'Professor britanico com certificacao Cambridge. Experiencia com todos os niveis, do iniciante ao avancado.',
    certifications: ['CELTA', 'DELTA'],
    specializations: ['Grammar', 'Writing', 'IELTS Prep'],
    languages: ['English', 'Portuguese'],
    rating: 4.8,
    totalLessons: 1800,
    experience: 8,
    hourlyRate: 9000, // R$ 90.00
    timezone: 'Europe/London',
    availability: {
      monday: ['13:00', '14:00', '15:00', '16:00'],
      tuesday: ['13:00', '14:00', '15:00', '16:00'],
      wednesday: ['13:00', '14:00', '15:00', '16:00'],
      thursday: ['13:00', '14:00', '15:00', '16:00'],
      friday: ['13:00', '14:00'],
    },
    isActive: true,
  },
  {
    name: 'Emily Wilson',
    email: 'emily.wilson@aprendaingles.com',
    avatar: 'https://randomuser.me/api/portraits/women/3.jpg',
    bio: 'Professora canadense especializada em Business English e preparacao para entrevistas de emprego.',
    certifications: ['TEFL', 'TESOL'],
    specializations: ['Business English', 'Job Interviews', 'Presentations'],
    languages: ['English', 'French', 'Portuguese'],
    rating: 4.95,
    totalLessons: 3200,
    experience: 12,
    hourlyRate: 10000, // R$ 100.00
    timezone: 'America/Toronto',
    availability: {
      monday: ['08:00', '09:00', '10:00', '18:00', '19:00'],
      tuesday: ['08:00', '09:00', '10:00', '18:00', '19:00'],
      wednesday: ['08:00', '09:00', '10:00', '18:00', '19:00'],
      thursday: ['08:00', '09:00', '10:00', '18:00', '19:00'],
      friday: ['08:00', '09:00', '10:00'],
    },
    isActive: true,
  },
  {
    name: 'David Martinez',
    email: 'david.martinez@aprendaingles.com',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
    bio: 'Professor bilingue com foco em alunos brasileiros. Entende as dificuldades especificas de falantes de portugues.',
    certifications: ['TEFL'],
    specializations: ['Pronunciation', 'Conversation', 'Beginner Friendly'],
    languages: ['English', 'Portuguese', 'Spanish'],
    rating: 4.7,
    totalLessons: 950,
    experience: 5,
    hourlyRate: 6000, // R$ 60.00
    timezone: 'America/Sao_Paulo',
    availability: {
      monday: ['07:00', '08:00', '09:00', '19:00', '20:00', '21:00'],
      tuesday: ['07:00', '08:00', '09:00', '19:00', '20:00', '21:00'],
      wednesday: ['07:00', '08:00', '09:00', '19:00', '20:00', '21:00'],
      thursday: ['07:00', '08:00', '09:00', '19:00', '20:00', '21:00'],
      friday: ['07:00', '08:00', '09:00'],
      saturday: ['09:00', '10:00', '11:00'],
    },
    isActive: true,
  },
];

// ==================== DEMO USER DATA ====================

async function createDemoUser() {
  const hashedPassword = await bcrypt.hash('demo123456', 12);

  return {
    email: 'demo@aprendaingles.com',
    password: hashedPassword,
    name: 'Usuario Demo',
    avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
    level: 'A1',
    emailVerified: true,
    subscriptionStatus: 'premium',
  };
}

// ==================== MAIN SEED FUNCTION ====================

async function main() {
  console.log('Seeding database...\n');

  // Clear existing data (in reverse dependency order)
  console.log('Clearing existing data...');
  await prisma.speakingAttempt.deleteMany();
  await prisma.speakingSession.deleteMany();
  await prisma.listeningSession.deleteMany();
  await prisma.placementTest.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.gamification.deleteMany();
  await prisma.phrase.deleteMany();
  await prisma.category.deleteMany();
  await prisma.level.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.user.deleteMany();
  console.log('Data cleared.\n');

  // Seed levels
  console.log('Seeding levels...');
  const createdLevels: Record<string, string> = {};
  for (const level of levels) {
    const created = await prisma.level.create({ data: level });
    createdLevels[level.name] = created.id;
  }
  console.log(`Created ${levels.length} levels.\n`);

  // Seed categories
  console.log('Seeding categories...');
  const createdCategories: Record<string, string> = {};
  for (const category of categories) {
    const created = await prisma.category.create({ data: category });
    createdCategories[category.slug] = created.id;
  }
  console.log(`Created ${categories.length} categories.\n`);

  // Seed phrases
  console.log('Seeding phrases...');
  for (const phrase of phrasesData) {
    await prisma.phrase.create({
      data: {
        text: phrase.text,
        translation: phrase.translation,
        levelId: createdLevels[phrase.level],
        categoryId: createdCategories[phrase.category],
        difficulty: phrase.difficulty,
        ipaTranscription: phrase.ipa,
        tags: [phrase.category, phrase.level.toLowerCase()],
      },
    });
  }
  console.log(`Created ${phrasesData.length} phrases.\n`);

  // Seed achievements
  console.log('Seeding achievements...');
  for (const achievement of achievements) {
    await prisma.achievement.create({ data: achievement });
  }
  console.log(`Created ${achievements.length} achievements.\n`);

  // Seed teachers
  console.log('Seeding teachers...');
  for (const teacher of teachers) {
    await prisma.teacher.create({ data: teacher });
  }
  console.log(`Created ${teachers.length} teachers.\n`);

  // Seed demo user
  console.log('Seeding demo user...');
  const demoUserData = await createDemoUser();
  const demoUser = await prisma.user.create({ data: demoUserData });

  // Create gamification profile for demo user
  await prisma.gamification.create({
    data: {
      userId: demoUser.id,
      xp: 1500,
      level: 5,
      xpToNextLevel: 2000,
      coins: 500,
      gems: 25,
      streak: 7,
      maxStreak: 15,
      rank: 'Silver',
    },
  });
  console.log(`Created demo user: ${demoUserData.email}\n`);

  console.log('============================================');
  console.log('Database seeded successfully!');
  console.log('============================================');
  console.log('\nDemo credentials:');
  console.log('  Email: demo@aprendaingles.com');
  console.log('  Password: demo123456');
  console.log('\nTotal records:');
  console.log(`  - ${levels.length} CEFR levels`);
  console.log(`  - ${categories.length} categories`);
  console.log(`  - ${phrasesData.length} phrases`);
  console.log(`  - ${achievements.length} achievements`);
  console.log(`  - ${teachers.length} teachers`);
  console.log(`  - 1 demo user`);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
