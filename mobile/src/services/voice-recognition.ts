/**
 * MOBILE VOICE RECOGNITION SERVICE
 * React Native voice recording and pronunciation practice
 */

import { Audio } from 'expo-av'
import * as FileSystem from 'expo-file-system'
import { Platform } from 'react-native'

interface RecordingOptions {
  maxDuration?: number // milliseconds
  sampleRate?: number
  bitRate?: number
}

interface RecordingResult {
  uri: string
  duration: number
  size: number
}

interface PronunciationResult {
  score: number
  level: string
  feedback: string
  analysis: any
}

/**
 * Request microphone permissions
 */
export async function requestMicrophonePermission(): Promise<boolean> {
  try {
    const { status } = await Audio.requestPermissionsAsync()
    return status === 'granted'
  } catch (error) {
    console.error('Failed to request microphone permission:', error)
    return false
  }
}

/**
 * Configure audio mode for recording
 */
async function configureAudioMode() {
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: true,
    playsInSilentModeIOS: true,
    staysActiveInBackground: false,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  })
}

/**
 * Start recording audio
 */
export async function startRecording(
  options: RecordingOptions = {}
): Promise<Audio.Recording | null> {
  try {
    // Request permission
    const hasPermission = await requestMicrophonePermission()
    if (!hasPermission) {
      throw new Error('Microphone permission denied')
    }

    // Configure audio mode
    await configureAudioMode()

    // Configure recording options
    const recordingOptions = {
      android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: options.sampleRate || 44100,
        numberOfChannels: 1,
        bitRate: options.bitRate || 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: options.sampleRate || 44100,
        numberOfChannels: 1,
        bitRate: options.bitRate || 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {
        mimeType: 'audio/webm',
        bitsPerSecond: options.bitRate || 128000,
      },
    }

    // Create recording
    const recording = new Audio.Recording()
    await recording.prepareToRecordAsync(recordingOptions)

    // Start recording
    await recording.startAsync()

    console.log('🎤 Recording started')

    // Stop recording after max duration
    if (options.maxDuration) {
      setTimeout(async () => {
        try {
          await recording.stopAndUnloadAsync()
          console.log('⏱️ Recording stopped (max duration reached)')
        } catch (error) {
          console.error('Failed to stop recording:', error)
        }
      }, options.maxDuration)
    }

    return recording
  } catch (error) {
    console.error('Failed to start recording:', error)
    return null
  }
}

/**
 * Stop recording and get result
 */
export async function stopRecording(
  recording: Audio.Recording
): Promise<RecordingResult | null> {
  try {
    const status = await recording.getStatusAsync()

    if (!status.isRecording) {
      console.warn('Recording is not active')
      return null
    }

    // Stop recording
    await recording.stopAndUnloadAsync()

    // Get recording URI and details
    const uri = recording.getURI()
    if (!uri) {
      throw new Error('Failed to get recording URI')
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri)
    if (!fileInfo.exists) {
      throw new Error('Recording file not found')
    }

    console.log('✅ Recording stopped:', uri)

    return {
      uri,
      duration: status.durationMillis,
      size: fileInfo.size || 0,
    }
  } catch (error) {
    console.error('Failed to stop recording:', error)
    return null
  }
}

/**
 * Play audio file
 */
export async function playAudio(uri: string): Promise<Audio.Sound | null> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    )

    console.log('▶️ Playing audio:', uri)

    return sound
  } catch (error) {
    console.error('Failed to play audio:', error)
    return null
  }
}

/**
 * Convert audio to base64 for upload
 */
export async function audioToBase64(uri: string): Promise<string | null> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    return base64
  } catch (error) {
    console.error('Failed to convert audio to base64:', error)
    return null
  }
}

/**
 * Upload audio and analyze pronunciation
 */
export async function analyzePronunciation(
  audioUri: string,
  phraseId: string,
  transcribedText: string,
  expectedText: string,
  audioDuration: number,
  authToken: string,
  apiUrl: string = 'http://localhost:3000/api'
): Promise<PronunciationResult | null> {
  try {
    // Create form data
    const formData = new FormData()

    // Add audio file
    const filename = audioUri.split('/').pop() || 'recording.m4a'
    const match = /\.(\w+)$/.exec(filename)
    const type = match ? `audio/${match[1]}` : 'audio/m4a'

    formData.append('audio', {
      uri: Platform.OS === 'ios' ? audioUri.replace('file://', '') : audioUri,
      name: filename,
      type,
    } as any)

    // Add metadata
    formData.append('phraseId', phraseId)
    formData.append('transcribedText', transcribedText)
    formData.append('expectedText', expectedText)
    formData.append('audioDuration', audioDuration.toString())

    // Upload to server
    const response = await fetch(`${apiUrl}/voice/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Analysis failed')
    }

    console.log('✅ Pronunciation analyzed:', data.result.analysis.pronunciationScore)

    return {
      score: data.result.analysis.pronunciationScore,
      level: data.result.analysis.level,
      feedback: data.result.analysis.feedback,
      analysis: data.result.analysis,
    }
  } catch (error) {
    console.error('Failed to analyze pronunciation:', error)
    return null
  }
}

/**
 * Get pronunciation history
 */
export async function getPronunciationHistory(
  authToken: string,
  phraseId?: string,
  limit: number = 20,
  apiUrl: string = 'http://localhost:3000/api'
) {
  try {
    const params = new URLSearchParams()
    if (phraseId) params.append('phraseId', phraseId)
    params.append('limit', limit.toString())

    const response = await fetch(`${apiUrl}/voice/history?${params}`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to get history')
    }

    return data.history
  } catch (error) {
    console.error('Failed to get pronunciation history:', error)
    return []
  }
}

/**
 * Get voice statistics
 */
export async function getVoiceStatistics(
  authToken: string,
  apiUrl: string = 'http://localhost:3000/api'
) {
  try {
    const response = await fetch(`${apiUrl}/voice/statistics`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to get statistics')
    }

    return data.statistics
  } catch (error) {
    console.error('Failed to get voice statistics:', error)
    return null
  }
}

/**
 * Update voice settings
 */
export async function updateVoiceSettings(
  settings: any,
  authToken: string,
  apiUrl: string = 'http://localhost:3000/api'
) {
  try {
    const response = await fetch(`${apiUrl}/voice/settings`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings),
    })

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to update settings')
    }

    return data.settings
  } catch (error) {
    console.error('Failed to update voice settings:', error)
    return null
  }
}

/**
 * Clean up audio resources
 */
export async function cleanup(recording?: Audio.Recording, sound?: Audio.Sound) {
  try {
    if (recording) {
      await recording.stopAndUnloadAsync()
    }
    if (sound) {
      await sound.unloadAsync()
    }
  } catch (error) {
    console.error('Failed to cleanup audio resources:', error)
  }
}

export default {
  requestMicrophonePermission,
  startRecording,
  stopRecording,
  playAudio,
  audioToBase64,
  analyzePronunciation,
  getPronunciationHistory,
  getVoiceStatistics,
  updateVoiceSettings,
  cleanup,
}
