import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SilenceDetector } from '@/lib/audio/silence-detector'

describe('SilenceDetector', () => {
  let detector: SilenceDetector

  beforeEach(() => {
    detector = new SilenceDetector({
      threshold: 0.01,
      minSilenceDuration: 500,
      maxSilenceDuration: 2000,
    })
  })

  describe('silence detection', () => {
    it('should detect silence in audio buffer', () => {
      const silenceBuffer = new Float32Array(100).fill(0)
      const result = detector.detect(silenceBuffer, 44100)

      expect(result.isSilent).toBe(true)
    })

    it('should detect speech in audio buffer', () => {
      const speechBuffer = new Float32Array(100).fill(1)
      const result = detector.detect(speechBuffer, 44100)

      expect(result.isSilent).toBe(false)
    })

    it('should handle mixed speech and silence', () => {
      const mixedBuffer = new Float32Array(300)
      mixedBuffer.fill(0, 0, 100)
      mixedBuffer.fill(1, 100, 200)
      mixedBuffer.fill(0, 200, 300)

      const result = detector.detect(mixedBuffer, 44100)
      expect(result.isSilent).toBe(false)
    })

    it('should detect prolonged silence (>2s)', () => {
      const longSilence = new Float32Array(88201).fill(0)
      const result = detector.detect(longSilence, 44100)

      expect(result.duration).toBeGreaterThanOrEqual(2000)
    })
  })

  describe('threshold configuration', () => {
    it('should use configurable silence threshold', () => {
      const customDetector = new SilenceDetector({
        threshold: 0.05,
        minSilenceDuration: 500,
        maxSilenceDuration: 2000,
      })

      const lowVolume = new Float32Array(100).fill(0.02)
      const result = customDetector.detect(lowVolume, 44100)

      expect(result.isSilent).toBe(true)
    })

    it('should adjust for different environments', () => {
      const quietDetector = new SilenceDetector({
        threshold: 0.005,
        minSilenceDuration: 500,
        maxSilenceDuration: 2000,
      })

      const quietBuffer = new Float32Array(100).fill(0.008)
      const result = quietDetector.detect(quietBuffer, 44100)

      expect(result.isSilent).toBe(false)
    })

    it('should handle different volume levels', () => {
      const loudBuffer = new Float32Array(100).fill(0.5)
      const result = detector.detect(loudBuffer, 44100)

      expect(result.isSilent).toBe(false)
    })
  })

  describe('timing', () => {
    it('should measure duration of silence', () => {
      const silenceBuffer = new Float32Array(22050).fill(0)
      const result = detector.detect(silenceBuffer, 44100)

      expect(result.duration).toBe(500)
    })

    it('should trigger callback on prolonged silence', () => {
      const silenceCallback = vi.fn()
      const callbackDetector = new SilenceDetector({
        threshold: 0.01,
        minSilenceDuration: 500,
        maxSilenceDuration: 1000,
        onSilenceDetected: silenceCallback,
      })

      const longSilence = new Float32Array(44100).fill(0)
      callbackDetector.detect(longSilence, 44100)

      expect(silenceCallback).toHaveBeenCalled()
    })

    it('should debounce rapid silence/speech switches', () => {
      const callback = vi.fn()
      const debounceDetector = new SilenceDetector({
        threshold: 0.01,
        minSilenceDuration: 500,
        maxSilenceDuration: 2000,
        onSilenceDetected: callback,
      })

      const rapidBuffer = new Float32Array(6000)
      for (let i = 0; i < 6000; i++) {
        rapidBuffer[i] = i % 2 === 0 ? 0 : 1
      }

      debounceDetector.detect(rapidBuffer, 44100)

      expect(callback).not.toHaveBeenCalledTimes(3000)
    })
  })
})
