 import type {
    TranscriptionResult,
    WhisperConfig,
   } from './types'
 import type { Message as EditMessage } from './edit-types'
 import { DEFAULT_WHISPER_CONFIG } from './types'
 import { logError } from '@/lib/logger'

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1'
const OPENAI_API_BASE = 'https://api.openai.com/v1'
const GROQ_API_BASE = 'https://api.groq.com/openai/v1'
const OLLAMA_API_BASE = 'http://localhost:11434/api'

type Provider = 'openrouter' | 'openai' | 'groq' | 'ollama'

export class OpenRouterClient {
  private provider: Provider
  private apiKey: string
  private config: WhisperConfig
  private baseUrl?: string

  constructor(provider: Provider = 'openrouter', apiKey?: string, baseUrl?: string) {
    this.provider = provider
    this.apiKey = apiKey || this.getDefaultApiKey()
    this.baseUrl = baseUrl
    this.config = { ...DEFAULT_WHISPER_CONFIG }

    if (!this.apiKey && provider !== 'ollama' && !baseUrl) {
      throw new Error(`${provider} API key is required`)
    }
  }

  private getDefaultApiKey(): string {
    switch (this.provider) {
      case 'openrouter':
        return process.env.OPENROUTER_API_KEY || ''
      case 'openai':
        return process.env.OPENAI_API_KEY || ''
      case 'groq':
        return process.env.GROQ_API_KEY || ''
      case 'ollama':
        return '' // No key needed for local
      default:
        return ''
    }
  }

  private getApiBase(): string {
    if (this.baseUrl) {
      return this.baseUrl
    }
    switch (this.provider) {
      case 'openrouter':
        return OPENROUTER_API_BASE
      case 'openai':
        return OPENAI_API_BASE
      case 'groq':
        return GROQ_API_BASE
      case 'ollama':
        return OLLAMA_API_BASE
      default:
        return OPENROUTER_API_BASE
    }
  }

  async transcribe(
    audioBlob: Blob,
    model: string,
    language?: string
  ): Promise<TranscriptionResult> {
    if (this.provider === 'ollama') {
      throw new Error('Ollama does not support transcription. Use OpenRouter, OpenAI, or Groq.')
    }

    const formData = new FormData()
    formData.append('file', audioBlob)
    formData.append('model', model)

    if (language) {
      formData.append('language', language)
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(`${this.getApiBase()}/audio/transcriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: formData,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
    } catch (error) {
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await logError('Transcription failed', `Provider: ${this.provider}, Model: ${model}, Error: ${errorMessage}`)
      throw error
    }
  }

  async chat(
    model: string,
    messages: EditMessage[]
  ): Promise<string> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      if (this.provider === 'ollama') {
        // Ollama uses different API format
        const response = await fetch(`${this.getApiBase()}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages,
            stream: false,
          }),
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error?.message || `HTTP ${response.status}`
          throw new Error(errorMessage)
        }

        const data = (await response.json()) as { message?: { content?: string } }

        return data.message?.content || ''
      }

      // OpenAI-compatible for others
      const response = await fetch(`${this.getApiBase()}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: this.config.temperature || 0.7,
          max_tokens: this.config.maxTokens || 1000,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`
        throw new Error(errorMessage)
      }

      const data = (await response.json()) as { choices?: Array<{ message: { content?: string } }> }

      return data.choices?.[0]?.message?.content || ''
    } catch (error) {
      clearTimeout(timeoutId)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      await logError('Chat failed', `Provider: ${this.provider}, Model: ${model}, Error: ${errorMessage}`)
      throw error
    }
  }
}
