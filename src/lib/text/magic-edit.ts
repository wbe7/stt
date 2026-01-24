export interface MagicEditResult {
  command: string
  cleanedText: string
}

const COMMAND_VARIATIONS: Record<string, string[]> = {
  'make it shorter': ['make it shorter', 'make it short', 'shorten it', 'shorten this', 'summarize'],
  'capitalize': ['capitalize', 'capitalise', 'make it capital'],
  'lowercase': ['lowercase', 'lower case', 'make it lowercase'],
  'remove filler words': ['remove filler words', 'remove fillers', 'clean it up'],
  'fix grammar': ['fix grammar', 'correct grammar', 'grammar check'],
  'make it formal': ['make it formal', 'formalize'],
  'make it casual': ['make it casual', 'casualize'],
  'fix punctuation': ['fix punctuation', 'add punctuation'],
  'correct capitalization': ['correct capitalization', 'fix capitalization'],
  'remove repetitions': ['remove repetitions', 'fix stuttering'],
}

export function detectMagicEditCommand(text: string): MagicEditResult | null {
  const lowerText = text.toLowerCase()

  for (const [canonical, variations] of Object.entries(COMMAND_VARIATIONS)) {
    for (const variation of variations) {
      if (lowerText.endsWith(variation.toLowerCase())) {
        const cleanedText = text.slice(0, -variation.length).trim()
        return {
          command: canonical,
          cleanedText,
        }
      }
    }
  }

  return null
}