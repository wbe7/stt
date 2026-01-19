export interface Transcription {
  id: string
  rawText: string
  editedText: string
  timestamp: number
  duration: number
  language: string
  confidence: number
}

export interface TranscriptionHistory {
  items: Transcription[]
  maxItems: number
}

export const DEFAULT_HISTORY: TranscriptionHistory = {
  items: [],
  maxItems: 100,
}

export interface EditRequest {
  text: string
  language: string
  level: 'minimal' | 'medium' | 'aggressive'
}

export interface EditResponse {
  editedText: string
  changes: number
}
