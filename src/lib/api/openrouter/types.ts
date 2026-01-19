export interface WhisperRequest {
  file: Blob
  model: string
  language?: string
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt'
}

export interface WhisperResponse {
  text: string
  language?: string
  duration?: number
  words?: Array<{
    word: string
    start: number
    end: number
  }>
}

export interface TranscriptionResult {
  text: string
  language?: string
  duration?: number
}

export type TranscriptionSuccess = {
  success: true
  data: TranscriptionResult
}

export type TranscriptionError = {
  success: false
  error: string
}

export type TranscriptionResponse = TranscriptionSuccess | TranscriptionError

export interface WhisperConfig {
  model: string
  language?: string
  maxRetries?: number
  retryDelay?: number
  maxFileSize?: number
}

export const DEFAULT_WHISPER_CONFIG: WhisperConfig = {
  model: 'whisper-1',
  maxRetries: 3,
  retryDelay: 1000,
  maxFileSize: 25 * 1024 * 1024,
}
