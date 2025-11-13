/**
 * INTERNATIONALIZATION (i18n)
 */

export const languages = ['pt-BR', 'en-US', 'es-ES', 'fr-FR', 'de-DE', 'it-IT', 'ja-JP', 'zh-CN', 'ko-KR', 'ru-RU']

export const translations = {
  'pt-BR': {
    'app.welcome': 'Bem-vindo ao English Flow',
    'app.start': 'Começar',
    'lesson.complete': 'Lição completa!',
    'achievement.unlocked': 'Conquista desbloqueada!'
  },
  'en-US': {
    'app.welcome': 'Welcome to English Flow',
    'app.start': 'Start',
    'lesson.complete': 'Lesson complete!',
    'achievement.unlocked': 'Achievement unlocked!'
  },
  'es-ES': {
    'app.welcome': 'Bienvenido a English Flow',
    'app.start': 'Empezar',
    'lesson.complete': '¡Lección completa!',
    'achievement.unlocked': '¡Logro desbloqueado!'
  }
}

export function t(key: string, locale: string = 'pt-BR'): string {
  return translations[locale]?.[key] || key
}
