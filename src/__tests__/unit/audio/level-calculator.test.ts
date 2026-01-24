import { describe, it, expect, vi } from 'vitest'
import { calculateDBLevel } from '@/lib/audio/level-calculator'

describe('calculateDBLevel', () => {
  it('returns -60 dB for silence', () => {
    const mockAnalyser = {
      fftSize: 256,
      getByteTimeDomainData: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < 256; i++) {
          array[i] = 128 // Mid point, silence
        }
      }),
    }

    const result = calculateDBLevel(mockAnalyser as any)
    expect(result).toBe(-60)
  })

  it('returns -20 dB for RMS 0.1', () => {
    const amplitude = 0.1 * Math.sqrt(2) // For sine wave, RMS = amplitude / sqrt(2), so amplitude = RMS * sqrt(2)
    const mockAnalyser = {
      fftSize: 256,
      getByteTimeDomainData: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < 256; i++) {
          array[i] = 128 + Math.round(amplitude * 128 * Math.sin((2 * Math.PI * i) / 256))
        }
      }),
    }

    const result = calculateDBLevel(mockAnalyser as any)
    expect(result).toBeGreaterThan(-21)
    expect(result).toBeLessThan(-19)
  })

  it('returns approximately -3 dB for full scale sine wave', () => {
    const mockAnalyser = {
      fftSize: 256,
      getByteTimeDomainData: vi.fn((array: Uint8Array) => {
        for (let i = 0; i < 256; i++) {
          array[i] = 128 + 127 * Math.sin((2 * Math.PI * i) / 256)
        }
      }),
    }

    const result = calculateDBLevel(mockAnalyser as any)
    expect(result).toBeGreaterThan(-4)
    expect(result).toBeLessThan(-2)
  })
})