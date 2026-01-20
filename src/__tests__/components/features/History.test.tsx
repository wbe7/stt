import { describe, it, expect } from 'vitest'
import { TranscriptionHistory } from '@/components/features/History/TranscriptionHistory'

describe('TranscriptionHistory', () => {
  it('should export TranscriptionHistory component', () => {
    expect(TranscriptionHistory).toBeDefined()
    expect(typeof TranscriptionHistory).toBe('function')
  })
})
