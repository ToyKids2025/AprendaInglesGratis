/**
 * SOCIAL SHARING UTILITIES
 * Share achievements, streaks, and progress on social media
 */

interface ShareData {
  title: string
  text: string
  url?: string
}

/**
 * Check if Web Share API is supported
 */
export function isShareSupported(): boolean {
  return typeof navigator !== 'undefined' && 'share' in navigator
}

/**
 * Share using Web Share API (mobile)
 */
export async function share(data: ShareData): Promise<boolean> {
  if (!isShareSupported()) {
    return false
  }

  try {
    await navigator.share(data)
    return true
  } catch (error) {
    // User cancelled or error occurred
    console.error('Share failed:', error)
    return false
  }
}

/**
 * Generate share text for streak achievement
 */
export function generateStreakShareText(streak: number): ShareData {
  const emojis = ['🔥', '⚡', '🎯', '🌟', '🏆']
  const emoji = emojis[Math.floor(Math.random() * emojis.length)]

  let message = ''

  if (streak >= 365) {
    message = `Incrível! Completei ${streak} dias de sequência no English Flow! ${emoji} Um ano de dedicação!`
  } else if (streak >= 100) {
    message = `${streak} dias de sequência no English Flow! ${emoji} Persistência é a chave!`
  } else if (streak >= 30) {
    message = `${streak} dias seguidos estudando inglês no English Flow! ${emoji} Rumo à fluência!`
  } else if (streak >= 7) {
    message = `Uma semana completa estudando inglês! ${streak} dias de sequência no English Flow! ${emoji}`
  } else {
    message = `${streak} dias de sequência no English Flow! ${emoji} Vamos que vamos!`
  }

  return {
    title: 'English Flow - Minha Sequência',
    text: message,
    url: 'https://englishflow.com',
  }
}

/**
 * Generate share text for level up
 */
export function generateLevelUpShareText(level: number, xp: number): ShareData {
  return {
    title: 'English Flow - Level Up!',
    text: `Acabei de alcançar o nível ${level} no English Flow! 🎉 ${xp} XP conquistados. Aprenda inglês comigo!`,
    url: 'https://englishflow.com',
  }
}

/**
 * Generate share text for achievement
 */
export function generateAchievementShareText(
  achievementName: string,
  description: string
): ShareData {
  return {
    title: 'English Flow - Nova Conquista!',
    text: `Desbloqueei "${achievementName}" no English Flow! 🏆 ${description}`,
    url: 'https://englishflow.com',
  }
}

/**
 * Generate share text for certificate
 */
export function generateCertificateShareText(level: string): ShareData {
  return {
    title: 'English Flow - Certificado',
    text: `Concluí o curso de ${level} no English Flow! 📜 Certificado conquistado com dedicação e esforço!`,
    url: 'https://englishflow.com',
  }
}

/**
 * Generate share text for phrases learned
 */
export function generatePhrasesLearnedShareText(count: number): ShareData {
  let message = ''

  if (count >= 1000) {
    message = `🎯 ${count.toLocaleString()} frases dominadas no English Flow! Vocabulário expandido!`
  } else if (count >= 500) {
    message = `🌟 ${count} frases aprendidas no English Flow! Meio caminho andado!`
  } else if (count >= 100) {
    message = `🚀 ${count} frases no bolso! Aprendendo inglês com English Flow!`
  } else {
    message = `💪 ${count} frases aprendidas no English Flow! O começo da jornada!`
  }

  return {
    title: 'English Flow - Progresso',
    text: message,
    url: 'https://englishflow.com',
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-9999px'
    document.body.appendChild(textArea)
    textArea.select()

    try {
      document.execCommand('copy')
      document.body.removeChild(textArea)
      return true
    } catch (err) {
      document.body.removeChild(textArea)
      return false
    }
  }
}

/**
 * Share on Twitter/X
 */
export function shareOnTwitter(text: string, url?: string): void {
  const twitterUrl = new URL('https://twitter.com/intent/tweet')
  twitterUrl.searchParams.set('text', text)
  if (url) {
    twitterUrl.searchParams.set('url', url)
  }
  window.open(twitterUrl.toString(), '_blank', 'width=550,height=420')
}

/**
 * Share on Facebook
 */
export function shareOnFacebook(url: string): void {
  const facebookUrl = new URL('https://www.facebook.com/sharer/sharer.php')
  facebookUrl.searchParams.set('u', url)
  window.open(facebookUrl.toString(), '_blank', 'width=550,height=420')
}

/**
 * Share on WhatsApp
 */
export function shareOnWhatsApp(text: string): void {
  const whatsappUrl = new URL('https://wa.me/')
  whatsappUrl.searchParams.set('text', text)
  window.open(whatsappUrl.toString(), '_blank')
}

/**
 * Share on LinkedIn
 */
export function shareOnLinkedIn(url: string): void {
  const linkedinUrl = new URL('https://www.linkedin.com/sharing/share-offsite/')
  linkedinUrl.searchParams.set('url', url)
  window.open(linkedinUrl.toString(), '_blank', 'width=550,height=420')
}

/**
 * Download achievement image (for sharing)
 */
export async function downloadAchievementImage(
  canvasId: string,
  filename: string = 'achievement.png'
): Promise<boolean> {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement
  if (!canvas) {
    return false
  }

  try {
    const dataUrl = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()
    return true
  } catch (error) {
    console.error('Failed to download image:', error)
    return false
  }
}

/**
 * Create shareable image from canvas
 */
export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, 'image/png')
  })
}

/**
 * Share image using Web Share API
 */
export async function shareImage(
  imageBlob: Blob,
  data: ShareData
): Promise<boolean> {
  if (!isShareSupported()) {
    return false
  }

  try {
    const file = new File([imageBlob], 'achievement.png', { type: 'image/png' })

    await navigator.share({
      ...data,
      files: [file],
    })

    return true
  } catch (error) {
    console.error('Share image failed:', error)
    return false
  }
}

export default {
  isShareSupported,
  share,
  generateStreakShareText,
  generateLevelUpShareText,
  generateAchievementShareText,
  generateCertificateShareText,
  generatePhrasesLearnedShareText,
  copyToClipboard,
  shareOnTwitter,
  shareOnFacebook,
  shareOnWhatsApp,
  shareOnLinkedIn,
  downloadAchievementImage,
  canvasToBlob,
  shareImage,
}
