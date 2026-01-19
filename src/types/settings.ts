export interface Settings {
  hotkey: string
  toggleHotkey: string
  whisperModel: string
  editModel: string
  language: string
  editingLevel: 'minimal' | 'medium' | 'aggressive'
  autoPaste: boolean
  showNotifications: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  hotkey: 'CommandOrControl+Shift+V',
  toggleHotkey: 'CommandOrControl+Shift+Space',
  whisperModel: 'whisper-1',
  editModel: 'openai/gpt-4o-mini',
  language: 'ru',
  editingLevel: 'minimal',
  autoPaste: true,
  showNotifications: true,
}

export interface HotkeyConfig {
  key: string
  modifiers: string[]
  action: 'record' | 'toggle'
}

export interface ModelConfig {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'google'
  description: string
}

export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    description: 'Fast and efficient model for editing',
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Most capable model for complex editing',
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    description: 'Balanced model for editing',
  },
]
