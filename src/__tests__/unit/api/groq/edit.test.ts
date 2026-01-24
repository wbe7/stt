import { describe, it, expect, beforeEach, vi } from 'vitest'
import { editTextGroq } from '@/lib/api/groq/edit'

describe('editTextGroq', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    process.env.GROQ_API_KEY = 'test-groq-api-key'
  })

  describe('input validation', () => {
    it('should reject empty text', async () => {
      const result = await editTextGroq('')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })

    it('should reject whitespace-only text', async () => {
      const result = await editTextGroq('   ')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })
  })

  describe('API integration', () => {
    it('should call Groq API with correct parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Edited text',
              },
            },
          ],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'minimal', tone: 'casual' })

      expect(result.success).toBe(true)
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        'https://api.groq.com/openai/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-groq-api-key',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should return edited text from Groq API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'Clean text without fillers',
              },
            },
          ],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('ээ это test text')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Clean text without fillers')
      }
    })

    it('should use default llama3-8b-8192 model for speed', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Fast edited text' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      await editTextGroq('test text')

      const callArgs = vi.mocked(fetch).mock.calls[0][1] as any
      const body = JSON.parse(callArgs.body)
      expect(body.model).toBe('llama3-8b-8192')
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
          json: async () => ({
            choices: [{ message: { content: 'retry success' } }],
          }),
        } as Response)
      })

      const result = await editTextGroq('test text')

      expect(attempts).toBe(3)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('retry success')
      }
    })

    it('should not retry on client errors (4xx)', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({ error: { message: 'Bad request' } }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should fail after max retries', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Persistent error'))

      const result = await editTextGroq('test text')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Persistent error')
      }
    })
  })

  describe('different edit modes', () => {
    it('should use minimal mode', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Minimal edit' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'minimal' })

      expect(result.success).toBe(true)
    })

    it('should use aggressive mode', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Aggressive edit' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'aggressive' })

      expect(result.success).toBe(true)
    })

    it('should use dev mode for code editors', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Dev mode edit' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'dev' })

      expect(result.success).toBe(true)
    })

    it('should use chat mode for messaging apps', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Chat mode edit' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'chat' })

      expect(result.success).toBe(true)
    })

    it('should use pro mode for professional writing', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Pro mode edit' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('test text', { mode: 'pro' })

      expect(result.success).toBe(true)
    })

    it('should pass customBaseUrl to client when provided', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'edited text' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const customUrl = 'https://custom.groq.com/v1'

      await editTextGroq('test text', {
        apiKey: 'test-key',
        customBaseUrl: customUrl,
      })

      // Check that fetch was called with the custom URL
      expect(fetch).toHaveBeenCalledWith(
        `${customUrl}/chat/completions`,
        expect.any(Object)
      )
    })
  })

  describe('low-latency processing', () => {
    it('should process text quickly using Groq Llama model', async () => {
      const startTime = Date.now()

      const mockResponse = {
        ok: true,
        json: async () => ({
          choices: [{ message: { content: 'Fast edit result' } }],
        }),
      }
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextGroq('Quick test text for speed')

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(result.success).toBe(true)
      // Since it's mocked, duration should be very low (< 10ms typically)
      expect(duration).toBeLessThan(100)
    })
  })
})