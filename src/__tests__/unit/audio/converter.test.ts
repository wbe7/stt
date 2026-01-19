import { describe, it, expect, beforeEach } from 'vitest'
import { AudioConverter } from '@/lib/audio/converter'

describe('AudioConverter', () => {
  let converter: AudioConverter

  beforeEach(() => {
    converter = new AudioConverter()
  })

  describe('WebM to WAV conversion', () => {
    it('should convert WebM blob to WAV', async () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(webmBlob)

      expect(wavBlob).toBeInstanceOf(Blob)
      expect(wavBlob!.type).toBe('audio/wav')
    })

    it('should preserve audio quality', async () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(webmBlob)

      expect(wavBlob).not.toBeNull()
      expect(wavBlob!.size).toBeGreaterThan(0)
    })

    it('should handle different sample rates', async () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(webmBlob, 48000)

      expect(wavBlob).not.toBeNull()
      expect(wavBlob!).toBeInstanceOf(Blob)
    })

    it('should handle mono and stereo audio', async () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const monoWav = await converter.convertToWav(webmBlob, 44100, 1)
      const stereoWav = await converter.convertToWav(webmBlob, 44100, 2)

      expect(monoWav).not.toBeNull()
      expect(stereoWav).not.toBeNull()
      expect(monoWav!).toBeInstanceOf(Blob)
      expect(stereoWav!).toBeInstanceOf(Blob)
    })
  })

  describe('format validation', () => {
    it('should detect WebM format', () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const format = converter.detectFormat(webmBlob)
      expect(format).toBe('webm')
    })

    it('should detect WAV format', () => {
      const wavBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/wav',
      })

      const format = converter.detectFormat(wavBlob)
      expect(format).toBe('wav')
    })

    it('should reject unsupported formats', () => {
      const mp3Blob = new Blob([new Uint8Array(100)], {
        type: 'audio/mp3',
      })

      const format = converter.detectFormat(mp3Blob)
      expect(format).toBe('unknown')
    })
  })

  describe('file size', () => {
    it('should optimize file size for API', async () => {
      const largeBlob = new Blob([new Uint8Array(30000000)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(largeBlob)

      expect(wavBlob).not.toBeNull()
      expect(wavBlob!.size).toBeLessThanOrEqual(26214400)
    })

    it('should not exceed 25MB limit (Whisper limit)', async () => {
      const webmBlob = new Blob([new Uint8Array(100)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(webmBlob)

      expect(wavBlob).not.toBeNull()
      expect(wavBlob!.size).toBeLessThanOrEqual(26214400)
    })

    it('should compress audio if needed', async () => {
      const webmBlob = new Blob([new Uint8Array(20000000)], {
        type: 'audio/webm',
      })

      const wavBlob = await converter.convertToWav(webmBlob)

      expect(wavBlob).not.toBeNull()
      expect(wavBlob!.size).toBeLessThanOrEqual(26214400)
    })
  })

  describe('error handling', () => {
    it('should handle corrupt audio data', async () => {
      const corruptBlob = new Blob([new Uint8Array(0)], {
        type: 'audio/webm',
      })

      await expect(converter.convertToWav(corruptBlob)).rejects.toThrow()
    })

    it('should handle conversion errors', async () => {
      const invalidBlob = new Blob([new Uint8Array(10)], {
        type: 'audio/invalid',
      })

      await expect(converter.convertToWav(invalidBlob)).rejects.toThrow()
    })

    it('should throw for empty blob', async () => {
      const invalidBlob = new Blob([new Uint8Array(0)])

      await expect(converter.convertToWav(invalidBlob)).rejects.toThrow()
    })
  })
})
