import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsPanel } from '@/components/features/Settings/SettingsPanel'
import { useSettingsStore } from '@/store/settings-store'

// Mock the store
vi.mock('@/store/settings-store')
vi.mock('@/hooks/useAudioDevices')
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  isTauri: vi.fn().mockReturnValue(false),
}))

describe('SettingsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render provider selector with all four options', () => {
    // Mock the store to return default settings
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: {
        provider: 'openrouter',
        apiKey: '',
        customBaseUrl: '',
        recordingMode: 'hold',
        recordHotkey: 'V',
        commitHotkey: 'Enter',
        cancelHotkey: 'Escape',
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
      updateSettings: vi.fn(),
    })

    render(<SettingsPanel />)

    const providerSelects = screen.getAllByRole('combobox')
    const providerSelect = providerSelects.find(select => 
      Array.from((select as HTMLSelectElement).options).some(option => option.value === 'openrouter')
    )
    expect(providerSelect).toBeInTheDocument()
    expect(providerSelect).toHaveValue('openrouter')

    expect(screen.getByText('OpenRouter (Default): Best balance')).toBeInTheDocument()
    expect(screen.getByText('Custom OpenAI-Compatible API: Any provider')).toBeInTheDocument()
    expect(screen.getByText('Groq Integration: Extreme speed')).toBeInTheDocument()
    expect(screen.getByText('Local LLM (Ollama): Privacy/Offline')).toBeInTheDocument()
  })

  it('should show API key input for providers except ollama', () => {
    // Mock for openrouter
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: {
        provider: 'openrouter',
        apiKey: 'test-key',
        customBaseUrl: '',
        recordingMode: 'hold',
        recordHotkey: 'V',
        commitHotkey: 'Enter',
        cancelHotkey: 'Escape',
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
      updateSettings: vi.fn(),
    })

    render(<SettingsPanel />)

    expect(screen.getByPlaceholderText('sk-or-v1-...')).toBeInTheDocument()
  })

  it('should hide API key input for ollama provider', () => {
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: {
        provider: 'ollama',
        apiKey: '',
        customBaseUrl: '',
        recordingMode: 'hold',
        recordHotkey: 'V',
        commitHotkey: 'Enter',
        cancelHotkey: 'Escape',
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
      updateSettings: vi.fn(),
    })

    render(<SettingsPanel />)

    expect(screen.queryByPlaceholderText('sk-or-v1-...')).not.toBeInTheDocument()
  })
})