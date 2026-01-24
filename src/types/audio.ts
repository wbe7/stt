export type AudioRecordingState = 'idle' | 'recording' | 'processing' | 'error'

export interface AudioConfig {
  sampleRate: number
  channelCount: number
  bitDepth: number
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 44100,
  channelCount: 1,
  bitDepth: 16,
}

export interface AudioBuffer {
  data: Float32Array
  sampleRate: number
  channels: number
}

export interface SilenceDetectionConfig {
  threshold: number
  minSilenceDuration: number
  maxSilenceDuration: number
  onSilenceDetected?: () => void
}

export const DEFAULT_SILENCE_CONFIG: SilenceDetectionConfig = {
  threshold: 0.01,
  minSilenceDuration: 500,
  maxSilenceDuration: 2000,
}

export interface VoiceRecorderConfig {
  sampleRate: number
  channelCount: number
  bitDepth: number
}

export interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  audioBlob: Blob | null
}

export const DEFAULT_RECORDER_CONFIG: VoiceRecorderConfig = {
  sampleRate: 44100,
  channelCount: 1,
  bitDepth: 16,
}

export type SoundCue = 'start' | 'stop' | 'success' | 'error'

export interface SoundPlayerConfig {
  muteSounds: boolean
}
