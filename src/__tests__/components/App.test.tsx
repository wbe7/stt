import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from '@/components/App'

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

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  isTauri: vi.fn(() => true),
}))

// Mock Tauri event
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(vi.fn())),
}))

// Mock react-i18next
let currentLanguage = 'en'
vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({
    t: vi.fn((key: string) => {
      const englishTranslations: Record<string, string> = {
        appTitle: 'Voice Dictation',
        home: 'Home',
        history: 'History',
        settings: 'Settings',
        mainHeading: 'Turn Speech Into Text',
        mainDescription: 'AI-powered voice dictation with intelligent editing. Remove filler words, fix stuttering, and get polished text instantly.',
        holdToRecord: 'Hold to Record',
        holdToRecordDesc: 'Press and hold your hotkey to start recording',
        aiPowered: 'AI Powered',
        aiPoweredDesc: 'Intelligent editing removes filler words and fixes stuttering',
        hotkeyInstruction: 'Press Cmd + Shift + V to start recording',
        toggleModeInstruction: 'Add Space for toggle mode',
        hotkeyConflict: 'Hotkey conflict: {{error}}',
        recordingInProgress: 'Recording in progress...',
        loadingSettings: 'Loading settings...',
        loadingHistory: 'Loading history...',
      }
      const russianTranslations: Record<string, string> = {
        appTitle: 'Голосовое Диктование',
        home: 'Главная',
        history: 'История',
        settings: 'Настройки',
        mainHeading: 'Преобразование Речи в Текст',
        mainDescription: 'ИИ-диктовка с интеллектуальным редактированием. Удаляет слова-паразиты, исправляет заикание и мгновенно получает отполированный текст.',
        holdToRecord: 'Удерживайте для Записи',
        holdToRecordDesc: 'Нажмите и удерживайте горячую клавишу для начала записи',
        aiPowered: 'На Основе ИИ',
        aiPoweredDesc: 'Интеллектуальное редактирование удаляет слова-паразиты и исправляет заикание',
        hotkeyInstruction: 'Нажмите Cmd + Shift + V для начала записи',
        toggleModeInstruction: 'Добавьте Space для режима переключения',
        hotkeyConflict: 'Конфликт горячих клавиш: {{error}}',
        recordingInProgress: 'Идет запись...',
        loadingSettings: 'Загрузка настроек...',
        loadingHistory: 'Загрузка истории...',
      }
      const translations = currentLanguage === 'ru' ? russianTranslations : englishTranslations
      return translations[key] || key
    }),
    i18n: {
      changeLanguage: vi.fn((lang: string) => { currentLanguage = lang }),
    },
  })),
  Trans: vi.fn(({ children }) => children),
  I18nextProvider: vi.fn(({ children }) => children),
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

describe('App Component - UI Translation', () => {
  it('should display English text by default', () => {
    render(<App />)

    expect(screen.getByText('Voice Dictation')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('should display Russian text when uiLanguage is ru', () => {
    // Set language to Russian
    currentLanguage = 'ru'

    render(<App />)

    expect(screen.getByText('Голосовое Диктование')).toBeInTheDocument()
    expect(screen.getByText('Главная')).toBeInTheDocument()
    expect(screen.getByText('Настройки')).toBeInTheDocument()
  })
})

describe('App Component - Hotkey Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock successful registration by default
    mockInvoke.mockResolvedValue(undefined)
  })

  it('should call register hotkeys on mount with default settings', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('register_record_hotkey', {
        hotkey: 'V',
        mode: 'hold'
      })
      expect(mockInvoke).toHaveBeenCalledWith('register_commit_hotkey', {
        hotkey: 'Enter'
      })
      expect(mockInvoke).toHaveBeenCalledWith('register_cancel_hotkey', {
        hotkey: 'Escape'
      })
    })
  })

  it('should show warning when hotkey registration fails due to conflict', async () => {
    // Mock registration failure
    mockInvoke.mockRejectedValueOnce(new Error('Hotkey already in use'))

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/hotkey.*conflict|hotkey.*taken|hotkey.*already.*use/i)).toBeInTheDocument()
    })
  })

  it('should not show warning when hotkey registration succeeds', async () => {
    render(<App />)

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('register_record_hotkey', {
        hotkey: 'V',
        mode: 'hold'
      })
      expect(mockInvoke).toHaveBeenCalledWith('register_commit_hotkey', {
        hotkey: 'Enter'
      })
      expect(mockInvoke).toHaveBeenCalledWith('register_cancel_hotkey', {
        hotkey: 'Escape'
      })
    })

    // Should not show any warning
    expect(screen.queryByText(/hotkey.*conflict|hotkey.*taken|hotkey.*already.*use/i)).not.toBeInTheDocument()
  })
})