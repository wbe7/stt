import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import App from '@/components/App'
import { invoke } from '@tauri-apps/api/core'

vi.mock('@tauri-apps/api/core')
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(vi.fn())),
}))

// Mock settings store
vi.mock('@/store/settings-store', () => ({
  useSettingsStore: vi.fn(() => ({
    settings: {
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
    },
  })),
}))

// Mock window.__TAURI__ for useGlobalHotkey
const mockInvoke = vi.fn()
Object.defineProperty(window, '__TAURI__', {
  value: {
    core: {
      invoke: mockInvoke,
    },
    event: {
      listen: vi.fn(() => Promise.resolve(vi.fn())),
    },
  },
  writable: true,
})

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => key),
    i18n: {
      changeLanguage: vi.fn(),
    },
  })),
  Trans: vi.fn(({ children }) => children),
  I18nextProvider: vi.fn(({ children }) => children),
}))

describe('menubar integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should create tray on app mount', () => {
    render(<App />)
    expect(invoke).toHaveBeenCalledWith('create_tray')
  })
})