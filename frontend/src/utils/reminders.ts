/**
 * DAILY REMINDERS SYSTEM
 * Send notifications to remind users to study daily
 */

interface ReminderSettings {
  enabled: boolean
  time: string // Format: "HH:MM"
  days: number[] // 0 = Sunday, 6 = Saturday
  lastNotification?: string
}

const DEFAULT_SETTINGS: ReminderSettings = {
  enabled: true,
  time: '19:00',
  days: [1, 2, 3, 4, 5], // Monday to Friday
}

const STORAGE_KEY = 'englishflow_reminders'

// Get reminder settings from localStorage
export function getReminderSettings(): ReminderSettings {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return DEFAULT_SETTINGS
    }
  }
  return DEFAULT_SETTINGS
}

// Save reminder settings
export function saveReminderSettings(settings: ReminderSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('Notifications not supported')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

// Show notification
export function showNotification(title: string, options?: NotificationOptions): void {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      vibrate: [200, 100, 200],
      ...options,
    })

    // Close after 10 seconds
    setTimeout(() => notification.close(), 10000)

    // Handle click
    notification.onclick = () => {
      window.focus()
      notification.close()
    }
  }
}

// Check if should send reminder now
export function shouldSendReminder(settings: ReminderSettings): boolean {
  if (!settings.enabled) return false

  const now = new Date()
  const currentDay = now.getDay()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`

  // Check if today is a reminder day
  if (!settings.days.includes(currentDay)) return false

  // Check if it's the right time
  if (currentTime !== settings.time) return false

  // Check if we already sent today
  if (settings.lastNotification) {
    const lastDate = new Date(settings.lastNotification)
    if (
      lastDate.getDate() === now.getDate() &&
      lastDate.getMonth() === now.getMonth() &&
      lastDate.getFullYear() === now.getFullYear()
    ) {
      return false // Already sent today
    }
  }

  return true
}

// Send daily reminder
export function sendDailyReminder(): void {
  const settings = getReminderSettings()

  if (shouldSendReminder(settings)) {
    const messages = [
      {
        title: '📚 Hora de estudar inglês!',
        body: 'Mantenha seu streak vivo! Pratique algumas frases agora.',
      },
      {
        title: '🔥 Seu streak está esperando!',
        body: 'Não perca sua sequência! Estude por 10 minutos hoje.',
      },
      {
        title: '⚡ XP esperando por você!',
        body: 'Complete algumas frases e ganhe XP extra hoje!',
      },
      {
        title: '🎯 Meta diária pendente',
        body: 'Você ainda não estudou hoje. Vamos lá!',
      },
      {
        title: '🚀 Continue sua jornada!',
        body: 'Mais perto da fluência a cada dia. Estude agora!',
      },
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    showNotification(randomMessage.title, {
      body: randomMessage.body,
      tag: 'daily-reminder',
      requireInteraction: false,
      actions: [
        {
          action: 'study',
          title: 'Estudar Agora',
        },
        {
          action: 'later',
          title: 'Depois',
        },
      ],
    })

    // Update last notification time
    settings.lastNotification = new Date().toISOString()
    saveReminderSettings(settings)
  }
}

// Setup reminder checker (runs every minute)
export function setupReminderChecker(): void {
  // Check immediately
  sendDailyReminder()

  // Check every minute
  setInterval(() => {
    sendDailyReminder()
  }, 60000) // 1 minute
}

// Get motivational message based on time of day
export function getMotivationalMessage(): string {
  const hour = new Date().getHours()

  if (hour < 6) {
    return '🌙 Estudo noturno? Você é dedicado!'
  } else if (hour < 12) {
    return '☀️ Bom dia! Comece o dia com inglês!'
  } else if (hour < 18) {
    return '🌤️ Boa tarde! Hora de praticar!'
  } else if (hour < 22) {
    return '🌆 Boa noite! Continue seu progresso!'
  } else {
    return '🌙 Estudo noturno é poderoso!'
  }
}

// Get reminder suggestion based on user stats
export function getReminderSuggestion(streak: number, xp: number): string {
  if (streak === 0) {
    return '🎯 Comece seu streak hoje! Apenas 1 frase já conta.'
  } else if (streak < 7) {
    return `🔥 ${streak} dias de streak! Continue até 7 para ganhar badge!`
  } else if (streak < 30) {
    return `💪 ${streak} dias! Você está no caminho certo!`
  } else {
    return `🏆 ${streak} dias! Você é uma lenda!`
  }
}

// Format time for display
export function formatReminderTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours)
  const period = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
  return `${displayHour}:${minutes} ${period}`
}

// Get day names
export const DAY_NAMES = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
]
