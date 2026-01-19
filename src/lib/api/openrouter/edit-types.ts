export interface EditRequest {
  text: string
  language?: string
  mode?: EditMode
  tone?: EditTone
  preserveTechnicalTerms?: boolean
}

export interface EditResponse {
  editedText: string
  originalText: string
  changes?: Array<{
    type: 'filler_removed' | 'stutter_fixed' | 'punctuation_added' | 'capitalization_fixed'
    original: string
    edited: string
  }>
}

export interface EditResult {
  editedText: string
  changes?: EditResponse['changes']
}

export type EditSuccess = {
  success: true
  data: EditResult
}

export type EditError = {
  success: false
  error: string
}

export type EditResponseWrapper = EditSuccess | EditError

export type EditMode = 'minimal' | 'medium' | 'aggressive'

export type EditTone = 'casual' | 'formal' | 'preserve'

export interface EditConfig {
  model: string
  mode: EditMode
  tone: EditTone
  preserveTechnicalTerms: boolean
  maxRetries?: number
  retryDelay?: number
}

export const DEFAULT_EDIT_CONFIG: EditConfig = {
  model: 'openai/gpt-4o-mini',
  mode: 'medium',
  tone: 'preserve',
  preserveTechnicalTerms: true,
  maxRetries: 3,
  retryDelay: 1000,
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  model: string
  messages: Message[]
  temperature?: number
  max_tokens?: number
}

export interface ChatResponse {
  choices: Array<{
    message: {
      role: string
      content: string
    }
  }>
}
