export interface EditOptions {
  fillerWords?: string[]
  tone?: 'casual' | 'formal' | 'preserve'
}

const DEFAULT_FILLER_WORDS_RU = [
  'ээ',
  'мээ',
  'хмм',
  'ну',
  'это',
  'типа',
  'короче',
  'вроде бы',
  'как бы',
  'как-то',
]

const DEFAULT_FILLER_WORDS_EN = [
  'um',
  'uh',
  'hmm',
  'like',
  'you know',
  'kind of',
  'sort of',
]

const DEFAULT_FILLER_WORDS = [...DEFAULT_FILLER_WORDS_RU, ...DEFAULT_FILLER_WORDS_EN]

export function removeFillerWords(text: string, options?: EditOptions): string {
  const fillers = options?.fillerWords || DEFAULT_FILLER_WORDS
  let result = text

  fillers.forEach((filler) => {
    const escapedFiller = filler.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(`(?:^|[\\s.,!?])${escapedFiller}(?:[\\s.,!?]|$)`, 'gi')
    result = result.replace(regex, ' ')
  })

  result = result.replace(/\s+/g, ' ').trim()
  return result
}

export function fixStuttering(text: string): string {
  const result = text.replace(/(\S+)(?:\s+\1)+/g, '$1')

  return result
}

export function insertPunctuation(text: string): string {
  let result = text

  result = result.replace(/([а-яёa-z])([А-ЯЁA-Z])/g, '$1. $2')

  result = result.replace(/([a-zA-Z])\s+([а-яё])/g, '$1. $2')

  if (!/[.!?]$/.test(result) && result.length > 0) {
    result += '.'
  }

  return result
}

export function correctCapitalization(text: string): string {
  if (!text) return ''

  let result = text

  result = result.charAt(0).toUpperCase() + result.slice(1)

  result = result.replace(/([.!?])\s*([а-яёa-z])/g, (match, punct, letter) => {
    return punct + ' ' + letter.toUpperCase()
  })

  return result
}

export function adjustTone(text: string, tone: EditOptions['tone'] = 'preserve'): string {
  let result = text

  switch (tone) {
    case 'casual':
      result = result
        .replace(/, пожалуйста,/gi, ', ')
        .replace(/, спасибо,/gi, ', ')
        .replace(/будьте добры,/gi, '')
        .replace(/, если можно,/gi, ', ')
        .replace(/(?:Вам |Тебе )?нужно/gi, 'надо')
        .replace(/(?:Вам |Тебе )?необходимо/gi, 'надо')
        .replace(/(?:Вам |Тебе )?требуется/gi, 'надо')
      break

    case 'formal':
      result = result
        .replace(/(?:^|[\s,.!?])надо(?:[\s,.!?]|$)/gi, 'необходимо')
        .replace(/(?:^|[\s,.!?])хочу(?:[\s,.!?]|$)/gi, 'бы хотел(а) бы')
        .replace(/(?:^|[\s,.!?])(расскажи|скажи)(?:[\s,.!?]|$)/gi, 'пожалуйста, расскажите')
        .replace(/(?:^|[\s,.!?])(сделай|помоги)(?:[\s,.!?]|$)/gi, 'помогите, пожалуйста')
      break

    case 'preserve':
    default:
      break
  }

  return result
}

export function editTextLocally(text: string, options?: EditOptions): string {
  let result = text

  result = removeFillerWords(result, options)
  result = fixStuttering(result)
  result = correctCapitalization(result)
  result = insertPunctuation(result)
  result = adjustTone(result, options?.tone)

  return result
}
