import { describe, it, expect, beforeEach, vi } from 'vitest'
import { editText } from '@/lib/api/openrouter/edit'

describe('editText', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
    process.env.OPENROUTER_API_KEY = 'test-api-key'
  })

  describe('input validation', () => {
    it('should reject empty text', async () => {
      const result = await editText('')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })

    it('should reject whitespace-only text', async () => {
      const result = await editText('   ')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })
  })

  describe('API integration', () => {
    it('should call OpenRouter API with correct parameters', async () => {
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

      const result = await editText('test text', { mode: 'minimal', tone: 'casual' })

      expect(result.success).toBe(true)
      expect(vi.mocked(fetch)).toHaveBeenCalledWith(
        expect.stringContaining('/chat/completions'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should return edited text from API', async () => {
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

      const result = await editText('ээ это test text')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Clean text without fillers')
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
          json: async () => ({
            choices: [{ message: { content: 'retry success' } }],
          }),
        } as Response)
      })

      const result = await editText('test text')

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

      const result = await editText('test text')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should fail after max retries', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Persistent error'))

      const result = await editText('test text')

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

      const result = await editText('test text', { mode: 'minimal' })

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

      const result = await editText('test text', { mode: 'aggressive' })

      expect(result.success).toBe(true)
    })
  })
})
