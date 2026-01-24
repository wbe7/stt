import { OpenRouterClient } from './client'
import { DEFAULT_EDIT_CONFIG } from './edit-types'
import type {
  EditResponseWrapper,
  EditConfig,
  EditRequest,
  Message,
} from './edit-types'

export async function editText(
  text: string,
  options?: Partial<EditConfig & EditRequest>
): Promise<EditResponseWrapper> {
  const config = { ...DEFAULT_EDIT_CONFIG, ...options }

  if (!text || text.trim().length === 0) {
    return {
      success: false,
      error: 'Text is required for editing',
    }
  }

  try {
    const prompt = buildEditPrompt({
      text,
      language: options?.language,
      mode: config.mode,
      tone: config.tone,
      preserveTechnicalTerms: config.preserveTechnicalTerms,
    })

    const client = new OpenRouterClient(config.provider, config.apiKey, config.customBaseUrl)
    const editedText = await retryWithBackoff(
      () => client.chat(config.model, prompt),
      config.maxRetries || 3,
      config.retryDelay || 1000
    )

    return {
      success: true,
      data: {
        editedText: editedText.trim(),
      },
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: errorMessage,
    }
  }
}

function buildEditPrompt(params: {
  text: string
  language?: string
  mode: EditConfig['mode']
  tone: EditConfig['tone']
  preserveTechnicalTerms: boolean
}): Message[] {
  const { text, language, mode, tone, preserveTechnicalTerms } = params

  const systemPrompt = buildSystemPrompt(mode, tone, language, preserveTechnicalTerms)

  return [
    {
      role: 'system',
      content: systemPrompt,
    },
    {
      role: 'user',
      content: text,
    },
  ]
}

function buildSystemPrompt(
  mode: EditConfig['mode'],
  tone: EditConfig['tone'],
  language?: string,
  preserveTechnicalTerms: boolean = true
): string {
  const modeInstructions = getModeInstructions(mode)
  const toneInstructions = getToneInstructions(tone)
  const languageNote = language ? ` The text is in ${language === 'ru' ? 'Russian' : 'English'}.` : ''
  const technicalTermsNote = preserveTechnicalTerms
    ? ' PRESERVE all technical terms in English: werf, docker, k8s, npm, REST API, React, TypeScript, etc.'
    : ''

  return `You are a professional text editor. Your task is to edit the given text to make it cleaner and more readable.

${modeInstructions}

${toneInstructions}

${languageNote}${technicalTermsNote}

Rules:
1. Remove filler words: "ээ", "мээ", "хмм", "ну", "это", "типа", "короче", "like", "um", "uh", "hmm"
2. Remove repeats and stuttering: "я я я" → "я"
3. Add proper punctuation
4. Fix capitalization
5. DO NOT rewrite the meaning, only fix the form
6. Respond ONLY with the edited text, no explanations

Return ONLY the edited text, nothing else.`
}

function getModeInstructions(mode: EditConfig['mode']): string {
  switch (mode) {
    case 'dev':
      return 'Dev Mode: Optimized for code editors. Preserve technical terms, maintain concise communication style, minimal punctuation changes, focus on clarity for technical documentation and code comments.'
    case 'chat':
      return 'Chat Mode: Optimized for messaging apps. Keep casual tone, preserve emojis and informal language, add minimal punctuation for readability in conversations.'
    case 'pro':
      return 'Pro Mode: Optimized for professional writing. Use formal tone, ensure proper grammar and punctuation, polish language for business communication, emails, and documentation.'
    case 'minimal':
      return 'Make minimal changes. Only remove obvious filler words and add basic punctuation.'
    case 'aggressive':
      return 'Make aggressive changes. Remove all filler words, fix all stuttering, add full punctuation, and rephrase for clarity while preserving meaning.'
    case 'shorten':
      return 'Make the text significantly shorter while preserving the core meaning. Remove redundant information and condense sentences.'
    case 'medium':
    default:
      return 'Make moderate changes. Remove filler words, fix stuttering, add appropriate punctuation, and improve readability.'
  }
}

function getToneInstructions(tone: EditConfig['tone']): string {
  switch (tone) {
    case 'casual':
      return 'Keep the tone casual and conversational.'
    case 'formal':
      return 'Make the tone more formal and professional.'
    case 'preserve':
    default:
      return 'Preserve the original tone of the text.'
  }
}

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number,
  delay: number
): Promise<T> {
  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error')

      const isClientError = lastError.message.includes('400') ||
        lastError.message.includes('401') ||
        lastError.message.includes('403') ||
        lastError.message.includes('422')

      if (isClientError || attempt === maxRetries) {
        throw lastError
      }

      await sleep(delay * attempt)
    }
  }

  throw lastError
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
