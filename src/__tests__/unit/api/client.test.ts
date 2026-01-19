import { describe, it, expect, beforeEach, vi } from 'vitest'
import { OpenRouterClient } from '@/lib/api/openrouter/client'

describe('OpenRouterClient', () => {
  let client: OpenRouterClient

  beforeEach(() => {
    client = new OpenRouterClient('test-api-key')
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  describe('initialization', () => {
    it('should initialize with API key', () => {
      const testClient = new OpenRouterClient('test-key')
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
})
