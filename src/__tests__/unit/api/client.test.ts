import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenRouterClient } from '@/lib/api/openrouter/client'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

describe('OpenRouterClient', () => {
  let client: OpenRouterClient

  beforeEach(() => {
    client = new OpenRouterClient('openrouter', 'test-api-key')
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('initialization', () => {
    it('should initialize with API key', () => {
      const testClient = new OpenRouterClient('openrouter', 'test-key')
      expect(testClient).toBeDefined()
    })

    it('should get API key from environment if not provided', () => {
      const originalKey = process.env.OPENROUTER_API_KEY
      process.env.OPENROUTER_API_KEY = 'env-key'
      
      const testClient = new OpenRouterClient()
      expect(testClient).toBeDefined()
      
      process.env.OPENROUTER_API_KEY = originalKey
    })
  })

  describe('HTTP requests', () => {
    it('should make POST request with correct headers', async () => {
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await client.transcribe(new Blob(), 'whisper-1')

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/audio/transcriptions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
          }),
        })
      )
    })

    it('should send FormData with file and model', async () => {
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const audioBlob = new Blob(['test'], { type: 'audio/wav' })
      await client.transcribe(audioBlob, 'whisper-1')

      const call = vi.mocked(fetch).mock.calls[0]
      const body = call[1]?.body as FormData
      
      expect(body).toBeInstanceOf(FormData)
      expect(body.get('model')).toBe('whisper-1')
      expect(body.get('file')).toBeInstanceOf(Blob)
    })

    it('should include language parameter when provided', async () => {
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await client.transcribe(new Blob(), 'whisper-1', 'en')

      const call = vi.mocked(fetch).mock.calls[0]
      const body = call[1]?.body as FormData
      
      expect(body.get('language')).toBe('en')
    })
  })

  describe('error handling', () => {
    it('should throw on network error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        client.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('Network error')
    })

    it('should throw on HTTP error status', async () => {
      const mockResponse = { 
        ok: false, 
        status: 401,
        json: async () => ({ error: { message: 'Unauthorized' } })
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await expect(
        client.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('Unauthorized')
    })

    it('should throw on rate limit (429)', async () => {
      const mockResponse = {
        ok: false,
        status: 429,
        json: async () => ({ error: { message: 'Rate limit exceeded' } })
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await expect(
        client.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('Rate limit exceeded')
    })

    it('should handle timeout gracefully', async () => {
      // Mock fetch to reject with AbortError (simulating timeout)
      const abortError = new Error('The operation was aborted')
      ;(abortError as any).name = 'AbortError'
      vi.mocked(fetch).mockRejectedValueOnce(abortError)

      await expect(
        client.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('The operation was aborted')
    })

    it('should log errors on transcription failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        client.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('Network error')

      expect(invoke).toHaveBeenCalledWith('log_error', {
        message: 'Transcription failed',
        details: 'Provider: openrouter, Model: whisper-1, Error: Network error'
      })
    })
  })

  describe('response handling', () => {
    it('should parse transcription response', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          text: 'Hello world',
          language: 'en',
          duration: 1.5,
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const result = await client.transcribe(new Blob(), 'whisper-1')

      expect(result.text).toBe('Hello world')
      expect(result.language).toBe('en')
    })

    it('should handle empty transcription', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: '' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const result = await client.transcribe(new Blob(), 'whisper-1')

      expect(result.text).toBe('')
    })
  })

  describe('provider-specific API calls', () => {
    it('should use OpenRouter API base for openrouter provider', async () => {
      const openRouterClient = new OpenRouterClient('openrouter', 'test-key')
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await openRouterClient.transcribe(new Blob(), 'whisper-1')

      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/audio/transcriptions',
        expect.any(Object)
      )
    })

    it('should use OpenAI API base for openai provider', async () => {
      const openAiClient = new OpenRouterClient('openai', 'test-key')
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await openAiClient.transcribe(new Blob(), 'whisper-1')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/audio/transcriptions',
        expect.any(Object)
      )
    })

    it('should use Groq API base for groq provider', async () => {
      const groqClient = new OpenRouterClient('groq', 'test-key')
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await groqClient.transcribe(new Blob(), 'whisper-1')

      expect(fetch).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/audio/transcriptions',
        expect.any(Object)
      )
    })

    it('should throw error for Ollama transcription', async () => {
      const ollamaClient = new OpenRouterClient('ollama')

      await expect(
        ollamaClient.transcribe(new Blob(), 'whisper-1')
      ).rejects.toThrow('Ollama does not support transcription')
    })

    it('should use Ollama API for chat', async () => {
      const ollamaClient = new OpenRouterClient('ollama')
      const mockResponse = { ok: true, json: async () => ({ message: { content: 'response' } }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const result = await ollamaClient.chat('llama2', [{ role: 'user', content: 'test' }])

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.any(Object)
      )
      expect(result).toBe('response')
    })

    it('should use OpenAI-compatible chat for non-Ollama providers', async () => {
      const openAiClient = new OpenRouterClient('openai', 'test-key')
      const mockResponse = { ok: true, json: async () => ({ choices: [{ message: { content: 'response' } }] }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const result = await openAiClient.chat('gpt-3.5-turbo', [{ role: 'user', content: 'test' }])

      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.any(Object)
      )
      expect(result).toBe('response')
    })

    it('should use custom base URL when provided', async () => {
      const customClient = new OpenRouterClient('openrouter', 'test-key', 'https://custom.api/v1')
      const mockResponse = { ok: true, json: async () => ({ text: 'test' }) }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      await customClient.transcribe(new Blob(), 'whisper-1')

      expect(fetch).toHaveBeenCalledWith(
        'https://custom.api/v1/audio/transcriptions',
        expect.any(Object)
      )
    })

    it('should handle timeout gracefully in chat', async () => {
      // Mock fetch to reject with AbortError (simulating timeout)
      const abortError = new Error('The operation was aborted')
      ;(abortError as any).name = 'AbortError'
      vi.mocked(fetch).mockRejectedValueOnce(abortError)

      await expect(
        client.chat('gpt-4o-mini', [{ role: 'user', content: 'test' }])
      ).rejects.toThrow('The operation was aborted')
    })

    it('should log errors on chat failure', async () => {
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'))

      await expect(
        client.chat('gpt-4o-mini', [{ role: 'user', content: 'test' }])
      ).rejects.toThrow('Network error')

      expect(invoke).toHaveBeenCalledWith('log_error', {
        message: 'Chat failed',
        details: 'Provider: openrouter, Model: gpt-4o-mini, Error: Network error'
      })
    })
  })
})
