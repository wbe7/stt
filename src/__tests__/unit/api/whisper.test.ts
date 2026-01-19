import { describe, it, expect, beforeEach, vi } from 'vitest'
import { transcribeAudio } from '@/lib/api/openrouter/whisper'

describe('transcribeAudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    process.env.OPENROUTER_API_KEY = 'test-api-key'
  })

  describe('audio format validation', () => {
    it('should accept WAV format', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'test transcription', language: 'en' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.text).toBe('test transcription')
      }
    })

    it('should reject non-WAV formats', async () => {
      const mp3Blob = new Blob(['test'], { type: 'audio/mp3' })
      const result = await transcribeAudio(mp3Blob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid audio format')
      }
    })

    it('should reject audio with no MIME type', async () => {
      const blob = new Blob(['test'])
      const result = await transcribeAudio(blob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Invalid audio format')
      }
    })

    it('should validate file size limit (25MB)', async () => {
      const blob = new Blob(['test'], { type: 'audio/wav' })
      Object.defineProperty(blob, 'size', { value: 26 * 1024 * 1024, writable: false })
      const result = await transcribeAudio(blob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Audio file too large')
      }
    })
  })

  describe('retry logic', () => {
    it('should retry on transient failures', async () => {
      let attempts = 0
      vi.mocked(fetch).mockImplementation(async () => {
        attempts++
        if (attempts < 3) {
          throw new Error('Network error')
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ text: 'retry success', language: 'en' }),
        } as Response)
      })

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(attempts).toBe(3)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.text).toBe('retry success')
      }
    })

    it('should not retry on client errors (4xx)', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad request' } }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })

      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should fail after max retries', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Persistent error'))

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Persistent error')
      }
    })
  })

  describe('language detection', () => {
    it('should use auto-detection when language not specified', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'привет мир', language: 'ru' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.language).toBe('ru')
      }
    })

    it('should pass language parameter when specified', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'hello world', language: 'en' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as never)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob, { language: 'en' })

      expect(result.success).toBe(true)
    })
  })

  describe('response processing', () => {
    it('should return transcribed text', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'The quick brown fox', language: 'en' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.text).toBe('The quick brown fox')
      }
    })

    it('should return detected language', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'bonjour', language: 'fr' }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.language).toBe('fr')
      }
    })

    it('should return duration when available', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({ text: 'test', language: 'en', duration: 5.2 }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.duration).toBe(5.2)
      }
    })
  })

  describe('error responses', () => {
    it('should handle API error responses', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => ({ error: { message: 'Internal server error' } }),
      }
      const mockFetch = vi.fn().mockImplementation(async () => mockResponse as unknown as Response)
      global.fetch = mockFetch

      const wavBlob = new Blob(['test'], { type: 'audio/wav' })
      const result = await transcribeAudio(wavBlob)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Internal server error')
      }
    })
  })
})
