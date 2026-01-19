import { describe, it, expect } from 'vitest'
import {
  removeFillerWords,
  fixStuttering,
  insertPunctuation,
  correctCapitalization,
  adjustTone,
  editTextLocally,
} from '@/lib/text/editing'

describe('removeFillerWords', () => {
  it('should remove Russian filler words', () => {
    const result = removeFillerWords('ээ это надо сделать')
    expect(result).toBe('надо сделать')
  })

  it('should remove English filler words', () => {
    const result = removeFillerWords('um like hello world')
    expect(result).toBe('hello world')
  })

  it('should remove multiple filler words', () => {
    const result = removeFillerWords('ээ ну хмм вроде бы test')
    expect(result).toBe('test')
  })

  it('should preserve text without filler words', () => {
    const result = removeFillerWords('чистый текст без мусора')
    expect(result).toBe('чистый текст без мусора')
  })
})

describe('fixStuttering', () => {
  it('should remove word repetition', () => {
    const result = fixStuttering('я я я хочу')
    expect(result).toBe('я хочу')
  })

  it('should remove multiple repetitions', () => {
    const result = fixStuttering('test test test text')
    expect(result).toBe('test text')
  })

  it('should preserve normal text', () => {
    const result = fixStuttering('я хочу тест')
    expect(result).toBe('я хочу тест')
  })
})

describe('insertPunctuation', () => {
  it('should add period at end if missing', () => {
    const result = insertPunctuation('hello world')
    expect(result).toBe('hello world.')
  })

  it('should add punctuation between sentences', () => {
    const result = insertPunctuation('hello world это test')
    expect(result).toBe('hello world. это test.')
  })

  it('should preserve existing punctuation', () => {
    const result = insertPunctuation('hello world.')
    expect(result).toBe('hello world.')
  })
})

describe('correctCapitalization', () => {
  it('should capitalize first letter', () => {
    const result = correctCapitalization('hello world')
    expect(result).toBe('Hello world')
  })

  it('should capitalize after period', () => {
    const result = correctCapitalization('hello. world')
    expect(result).toBe('Hello. World')
  })

  it('should handle already capitalized text', () => {
    const result = correctCapitalization('Hello World')
    expect(result).toBe('Hello World')
  })
})

describe('adjustTone', () => {
  it('should preserve original tone by default', () => {
    const result = adjustTone('надо сделать тест', 'preserve')
    expect(result).toBe('надо сделать тест')
  })

  it('should make text casual', () => {
    const result = adjustTone('необходимо сделать тест', 'casual')
    expect(result).toContain('надо')
  })

  it('should make text formal', () => {
    const result = adjustTone('надо сделать тест', 'formal')
    expect(result).toContain('необходимо')
  })
})

describe('editTextLocally', () => {
  it('should apply all edits', () => {
    const result = editTextLocally('ээ я я я надо сделать test')
    expect(result).not.toContain('ээ')
    expect(result).not.toMatch(/я\s+я/)
    expect(result).toMatch(/[!.?]$/)
  })

  it('should handle empty string', () => {
    const result = editTextLocally('')
    expect(result).toBe('')
  })

  it('should handle whitespace only', () => {
    const result = editTextLocally('   ')
    expect(result).toBe('')
  })
})
