import { OpenRouterClient } from './client'
import { DEFAULT_WHISPER_CONFIG } from './types'
import type {
  TranscriptionResponse,
  WhisperConfig,
} from './types'

const WAV_MIME_TYPE = 'audio/wav'
const MAX_FILE_SIZE = 25 * 1024 * 1024

export async function transcribeAudio(
  audioBlob: Blob,
  options?: Partial<WhisperConfig>
): Promise<TranscriptionResponse> {
  const config = { ...DEFAULT_WHISPER_CONFIG, ...options }

  try {
    validateAudioFormat(audioBlob)
    validateFileSize(audioBlob, config.maxFileSize || MAX_FILE_SIZE)

    const client = new OpenRouterClient()
    const result = await retryWithBackoff(
      () => client.transcribe(audioBlob, config.model, options?.language),
      config.maxRetries || 3,
      config.retryDelay || 1000
    )

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

function validateAudioFormat(blob: Blob): void {
  if (blob.type !== WAV_MIME_TYPE) {
    throw new Error(`Invalid audio format: ${blob.type || 'unknown'}. Expected ${WAV_MIME_TYPE}`)
  }
}

function validateFileSize(blob: Blob, maxSize: number): void {
  if (blob.size > maxSize) {
    const sizeMB = (blob.size / (1024 * 1024)).toFixed(2)
    const maxMB = (maxSize / (1024 * 1024)).toFixed(2)
    throw new Error(`Audio file too large: ${sizeMB}MB. Maximum allowed: ${maxMB}MB`)
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      const isClientError = lastError.message.includes('400') ||
        lastError.message.includes('401') ||
        lastError.message.includes('403') ||
        lastError.message.includes('422')

      if (isClientError || attempt === maxRetries) {
        throw lastError
      }

      await sleep(delay * attempt)
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
