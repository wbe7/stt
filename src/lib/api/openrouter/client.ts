import type {
  TranscriptionResult,
  WhisperConfig,
} from './types'
import { DEFAULT_WHISPER_CONFIG } from './types'

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1'

export class OpenRouterClient {
  private apiKey: string
  private config: WhisperConfig

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
    this.config = { ...DEFAULT_WHISPER_CONFIG }

    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required')
    }
  }

  async transcribe(
    audioBlob: Blob,
    model: string,
    language?: string
  ): Promise<TranscriptionResult> {
    const formData = new FormData()
    formData.append('file', audioBlob)
    formData.append('model', model)

    if (language) {
      formData.append('language', language)
    }

    const response = await fetch(`${OPENROUTER_API_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const errorMessage = errorData.error?.message || `HTTP ${response.status}`
      throw new Error(errorMessage)
    }

    const data = (await response.json()) as { text?: string; language?: string; duration?: number }

    return {
      text: data.text || '',
      language: data.language,
      duration: data.duration,
    }
  }
}
