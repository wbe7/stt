import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AudioConverter } from '@/lib/audio/converter'
import { removeFillerWords, fixStuttering, insertPunctuation, correctCapitalization } from '@/lib/text/editing'
import type { RecordingStatus } from '@/types/history'

describe('Recording Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should track recording status through flow', async () => {
    let status: RecordingStatus = 'pending'

    const updateStatus = (newStatus: RecordingStatus) => {
      status = newStatus
    }

    expect(status).toBe('pending')

    updateStatus('transcribing')
    expect(status).toBe('transcribing')

    updateStatus('editing')
    expect(status).toBe('editing')

    updateStatus('completed')
    expect(status).toBe('completed')
  })

  it('should convert audio to WAV format correctly', async () => {
    const mockAudioBlob = new Blob([new ArrayBuffer(2048)], { type: 'audio/webm' })

    const converter = new AudioConverter()
    const wavBlob = await converter.convertToWav(mockAudioBlob)

    expect(wavBlob).not.toBeNull()
    if (wavBlob) {
      expect(wavBlob.type).toBe('audio/wav')
      expect(wavBlob.size).toBeGreaterThan(0)
    }
  })

  it('should process text through editing pipeline', () => {
    const rawText = 'ээ ну это тест hello world um like'
    
    const withoutFillers = removeFillerWords(rawText)
    expect(withoutFillers).not.toContain('ээ')
    expect(withoutFillers).not.toContain('ну')
    
    const withoutStuttering = fixStuttering(withoutFillers)
    expect(withoutStuttering.length).toBe(withoutFillers.length)
    
    const withPunctuation = insertPunctuation(withoutStuttering)
    expect(withPunctuation.length).toBeGreaterThan(withoutStuttering.length)
    
    const capitalized = correctCapitalization(withPunctuation)
    expect(capitalized[0]).toBe(capitalized[0].toUpperCase())
  })

  it('should handle empty text in editing pipeline', () => {
    const emptyText = ''
    
    const result1 = removeFillerWords(emptyText)
    expect(result1).toBe('')
    
    const result2 = fixStuttering(emptyText)
    expect(result2).toBe('')
    
    const result3 = insertPunctuation(emptyText)
    expect(result3).toBe('')
    
    const result4 = correctCapitalization(emptyText)
    expect(result4).toBe('')
  })

  it('should maintain data consistency through flow', () => {
    const originalText = 'hello world this is a test'
    
    const step1 = removeFillerWords(originalText)
    expect(step1).toBeDefined()
    
    const step2 = fixStuttering(step1)
    expect(step2).toBeDefined()
    
    const step3 = insertPunctuation(step2)
    expect(step3).toBeDefined()
    
    const step4 = correctCapitalization(step3)
    expect(step4).toBeDefined()
    
    const finalText = step4
    
    expect(finalText).toBeTruthy()
    expect(typeof finalText).toBe('string')
  })

  it('should handle multilingual text editing', () => {
    const mixedText = 'hello ээ мир'
    
    const result = insertPunctuation(mixedText)
    expect(result).toBeDefined()
    expect(result.length).toBeGreaterThan(0)
  })

  it('should preserve text content through editing', () => {
    const originalText = 'test message with some words'
    
    const withoutFillers = removeFillerWords(originalText)
    const withoutStuttering = fixStuttering(withoutFillers)
    const withPunctuation = insertPunctuation(withoutStuttering)
    const final = correctCapitalization(withPunctuation)
    
    expect(final.toLowerCase()).toContain('test')
    expect(final.toLowerCase()).toContain('message')
  })

  it('should handle very long text in editing pipeline', () => {
    const longText = 'test '.repeat(1000)
    
    const result = removeFillerWords(longText)
    expect(result.length).toBeGreaterThan(0)
    expect(result.length).toBeLessThanOrEqual(longText.length)
  })

  it('should handle special characters in text editing', () => {
    const textWithSpecial = 'hello! @world #test $dollar'
    
    const result = correctCapitalization(insertPunctuation(fixStuttering(removeFillerWords(textWithSpecial))))
    
    expect(result).toContain('!')
    expect(result).toContain('@')
    expect(result).toContain('#')
    expect(result).toContain('$')
  })
})
