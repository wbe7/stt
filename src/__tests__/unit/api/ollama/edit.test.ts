import { describe, it, expect, beforeEach, vi } from 'vitest'
import { editTextOllama } from '@/lib/api/ollama/edit'

vi.mock('@/lib/logger', () => ({
  logError: vi.fn(),
}))

describe('editTextOllama', () => {
  let mockFetch: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch = vi.fn()
    vi.stubGlobal('fetch', mockFetch)
  })

  describe('privacy-focused offline processing', () => {
    it('should use local Ollama API for offline processing', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: {
            content: 'Edited text from Ollama',
          },
        }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextOllama('test text with fillers ээ ну')

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Edited text from Ollama')
      }

      // Verify it uses local Ollama API, not external
      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:11434/api/chat',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
    })

    it('should not require API key for local processing', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: {
            content: 'Local edit result',
          },
        }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextOllama('test text')

      expect(result.success).toBe(true)
      // Ensure no Authorization header is set
      const fetchCall = mockFetch.mock.calls[0]
      const headers = fetchCall[1]?.headers as Record<string, string>
      expect(headers).not.toHaveProperty('Authorization')
    })

    it('should handle Ollama API errors gracefully', async () => {
      const mockResponse = new Response(JSON.stringify({ error: { message: 'Ollama server error' } }), { status: 500 })
      mockFetch.mockResolvedValueOnce(mockResponse)

      const result = await editTextOllama('test text')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('should retry on transient failures for local API', async () => {
      let attempts = 0
      mockFetch.mockImplementation(async () => {
        attempts++
        if (attempts < 2) {
          throw new Error('Connection refused')
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({
            message: { content: 'Retry success' },
          }),
        } as Response)
      })

      const result = await editTextOllama('test text')

      expect(attempts).toBe(2) // First fails, second succeeds
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Retry success')
      }
    })
  })

  describe('input validation', () => {
    it('should reject empty text', async () => {
      const result = await editTextOllama('')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })

    it('should reject whitespace-only text', async () => {
      const result = await editTextOllama('   ')

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error).toContain('Text is required')
      }
    })
  })

  describe('edit modes with Ollama', () => {
    it('should support dev mode for code editing', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: { content: 'Dev mode edit' },
        }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextOllama('test code um like', { mode: 'dev' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Dev mode edit')
      }
    })

    it('should support chat mode for messaging', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          message: { content: 'Chat mode edit' },
        }),
      }
      mockFetch.mockResolvedValueOnce(mockResponse as unknown as Response)

      const result = await editTextOllama('hey um whats up', { mode: 'chat' })

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.editedText).toBe('Chat mode edit')
      }
    })
  })
})