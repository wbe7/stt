import { detectMagicEditCommand } from '@/lib/text/magic-edit'

describe('detectMagicEditCommand', () => {
  it('should detect "make it shorter" command', () => {
    const text = 'This is a long sentence that needs to be shortened make it shorter'
    const result = detectMagicEditCommand(text)
    expect(result).not.toBeNull()
    expect(result!.command).toBe('make it shorter')
    expect(result!.cleanedText).toBe('This is a long sentence that needs to be shortened')
  })

  it('should return null if no command detected', () => {
    const text = 'This is a normal sentence without any commands'
    const result = detectMagicEditCommand(text)
    expect(result).toBeNull()
  })

  it('should handle case insensitive commands', () => {
    const text = 'Make it shorter please MAKE IT SHORTER'
    const result = detectMagicEditCommand(text)
    expect(result).not.toBeNull()
    expect(result!.command).toBe('make it shorter')
    expect(result!.cleanedText).toBe('Make it shorter please')
  })

  describe('detection accuracy', () => {
    const testCases = [
      { text: 'Please make it shorter', expected: 'make it shorter' },
      { text: 'Shorten this', expected: 'make it shorter' },
      { text: 'Summarize', expected: 'make it shorter' },
      { text: 'Capitalize', expected: 'capitalize' },
      { text: 'Make it capital', expected: 'capitalize' },
      { text: 'Lowercase', expected: 'lowercase' },
      { text: 'Make it lowercase', expected: 'lowercase' },
      { text: 'Remove filler words', expected: 'remove filler words' },
      { text: 'Clean it up', expected: 'remove filler words' },
      { text: 'Fix grammar', expected: 'fix grammar' },
      { text: 'Correct grammar', expected: 'fix grammar' },
      { text: 'Make it formal', expected: 'make it formal' },
      { text: 'Formalize', expected: 'make it formal' },
      { text: 'Make it casual', expected: 'make it casual' },
      { text: 'Casualize', expected: 'make it casual' },
      { text: 'Fix punctuation', expected: 'fix punctuation' },
      { text: 'Add punctuation', expected: 'fix punctuation' },
      { text: 'Correct capitalization', expected: 'correct capitalization' },
      { text: 'Fix capitalization', expected: 'correct capitalization' },
      { text: 'Remove repetitions', expected: 'remove repetitions' },
      { text: 'Fix stuttering', expected: 'remove repetitions' },
      { text: 'This is normal text', expected: null },
      { text: 'Another sentence', expected: null },
    ]

    it('should detect at least 80% of common commands', () => {
      let correct = 0
      const total = testCases.length

      for (const { text, expected } of testCases) {
        const result = detectMagicEditCommand(text)
        const detected = result?.command || null
        if (detected === expected) {
          correct++
        }
      }

      const accuracy = correct / total
      expect(accuracy).toBeGreaterThanOrEqual(0.8)
    })
  })
})