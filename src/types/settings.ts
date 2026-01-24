export interface Settings {
  recordingMode: 'hold' | 'toggle'
  recordHotkey: string
  commitHotkey: string
  cancelHotkey: string
  provider: 'openrouter' | 'openai' | 'groq' | 'ollama'
  apiKey: string
  customBaseUrl: string
  whisperModel: string
  editModel: string
  language: string
  uiLanguage: 'en' | 'ru'
  editingLevel: 'minimal' | 'medium' | 'aggressive' | 'local'
  tone: 'casual' | 'formal' | 'preserve'
  autoPaste: boolean
  showNotifications: boolean
  selectedInputDevice: string
  startAtLogin: boolean
  muteSounds: boolean
  injectionMethod: 'accessibility' | 'clipboard'
  smartSpacing: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  recordingMode: 'hold',
  recordHotkey: 'V',
  commitHotkey: 'Enter',
  cancelHotkey: 'Escape',
  provider: 'openrouter',
  apiKey: '',
  customBaseUrl: '',
  whisperModel: 'whisper-1',
  editModel: 'openai/gpt-4o-mini',
  language: 'ru',
  uiLanguage: 'en',
  editingLevel: 'minimal',
  tone: 'preserve',
  autoPaste: true,
  showNotifications: true,
  selectedInputDevice: 'default',
  startAtLogin: false,
  muteSounds: false,
  injectionMethod: 'accessibility',
  smartSpacing: true,
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

export interface ProviderConfig {
  id: 'openrouter' | 'openai' | 'groq' | 'ollama'
  name: string
  description: string
}

export const AVAILABLE_PROVIDERS: ProviderConfig[] = [
  {
    id: 'openrouter',
    name: 'OpenRouter (Default)',
    description: 'Best balance',
  },
  {
    id: 'openai',
    name: 'Custom OpenAI-Compatible API',
    description: 'Any provider',
  },
  {
    id: 'groq',
    name: 'Groq Integration',
    description: 'Extreme speed',
  },
  {
    id: 'ollama',
    name: 'Local LLM (Ollama)',
    description: 'Privacy/Offline',
  },
]
