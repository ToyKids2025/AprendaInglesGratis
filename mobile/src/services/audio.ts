/**
 * AUDIO SERVICE
 * Text-to-Speech and audio playback for phrases
 */

import Tts from 'react-native-tts'
import Sound from 'react-native-sound'

// Initialize TTS
Tts.setDefaultLanguage('en-US')
Tts.setDefaultRate(0.5) // Slower for learning
Tts.setDefaultPitch(1.0)

/**
 * Play phrase using TTS
 */
export async function playPhrase(text: string, language: 'en' | 'pt' = 'en') {
  try {
    await Tts.setDefaultLanguage(language === 'en' ? 'en-US' : 'pt-BR')
    await Tts.speak(text)
  } catch (error) {
    console.error('TTS Error:', error)
  }
}

/**
 * Stop current TTS
 */
export async function stopAudio() {
  try {
    await Tts.stop()
  } catch (error) {
    console.error('Stop TTS Error:', error)
  }
}

/**
 * Play audio file (if available)
 */
export function playAudioFile(url: string, onComplete?: () => void) {
  Sound.setCategory('Playback')

  const sound = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
    if (error) {
      console.error('Failed to load sound', error)
      return
    }

    sound.play((success) => {
      if (success) {
        console.log('Audio played successfully')
      } else {
        console.error('Playback failed')
      }
      sound.release()
      if (onComplete) onComplete()
    })
  })
}

/**
 * Get available voices
 */
export async function getAvailableVoices() {
  try {
    const voices = await Tts.voices()
    return voices.filter((v: any) =>
      v.language.startsWith('en-') || v.language.startsWith('pt-')
    )
  } catch (error) {
    console.error('Get voices error:', error)
    return []
  }
}

/**
 * Set voice
 */
export async function setVoice(voiceId: string) {
  try {
    await Tts.setDefaultVoice(voiceId)
  } catch (error) {
    console.error('Set voice error:', error)
  }
}

/**
 * Set speech rate (0.5 = slow, 1.0 = normal, 2.0 = fast)
 */
export async function setSpeechRate(rate: number) {
  try {
    await Tts.setDefaultRate(rate)
  } catch (error) {
    console.error('Set rate error:', error)
  }
}

export default {
  playPhrase,
  stopAudio,
  playAudioFile,
  getAvailableVoices,
  setVoice,
  setSpeechRate,
}
