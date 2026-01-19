export interface TranscriptionResult {
  text: string
  confidence: number
  language: string
  timestamp: number
}

export interface AudioRecording {
  id: string
  blob: Blob
  duration: number
  timestamp: number
}

export interface Settings {
  hotkey: string
  toggleHotkey: string
  whisperModel: string
  editModel: string
  language: string
  editingLevel: 'minimal' | 'medium' | 'aggressive'
}

export const DEFAULT_SETTINGS: Settings = {
  hotkey: 'CommandOrControl+Shift+V',
  toggleHotkey: 'CommandOrControl+Shift+Space',
  whisperModel: 'whisper-1',
  editModel: 'openai/gpt-4o-mini',
  language: 'ru',
  editingLevel: 'minimal',
}
