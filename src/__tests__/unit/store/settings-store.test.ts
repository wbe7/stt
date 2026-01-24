import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from '@/store/settings-store'
import { DEFAULT_SETTINGS, AVAILABLE_PROVIDERS } from '@/types/settings'

describe('settings-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useSettingsStore.setState({
      settings: { ...DEFAULT_SETTINGS },
    })
  })

  it('should initialize with default settings', () => {
    const settings = useSettingsStore.getState().settings

    expect(settings).toEqual(DEFAULT_SETTINGS)
    expect(settings.recordHotkey).toBe('V')
    expect(settings.editModel).toBe('openai/gpt-4o-mini')
  })

  it('should update recordHotkey', () => {
    useSettingsStore.getState().updateSettings({ recordHotkey: 'A' })
    const settings = useSettingsStore.getState().settings

    expect(settings.recordHotkey).toBe('A')
  })

  it('should update recordingMode', () => {
    useSettingsStore.getState().updateSettings({ recordingMode: 'toggle' })
    const settings = useSettingsStore.getState().settings

    expect(settings.recordingMode).toBe('toggle')
  })

  it('should update commitHotkey', () => {
    useSettingsStore.getState().updateSettings({ commitHotkey: 'Return' })
    const settings = useSettingsStore.getState().settings

    expect(settings.commitHotkey).toBe('Return')
  })

  it('should update cancelHotkey', () => {
    useSettingsStore.getState().updateSettings({ cancelHotkey: 'Delete' })
    const settings = useSettingsStore.getState().settings

    expect(settings.cancelHotkey).toBe('Delete')
  })

  it('should update edit model', () => {
    useSettingsStore.getState().updateSettings({ editModel: 'openai/gpt-4o' })
    const settings = useSettingsStore.getState().settings

    expect(settings.editModel).toBe('openai/gpt-4o')
  })

  it('should update editing level', () => {
    useSettingsStore.getState().updateSettings({ editingLevel: 'aggressive' })
    const settings = useSettingsStore.getState().settings

    expect(settings.editingLevel).toBe('aggressive')
  })

  it('should update language', () => {
    useSettingsStore.getState().updateSettings({ language: 'en' })
    const settings = useSettingsStore.getState().settings

    expect(settings.language).toBe('en')
  })

  it('should toggle autoPaste', () => {
    useSettingsStore.getState().updateSettings({ autoPaste: false })
    const settings = useSettingsStore.getState().settings

    expect(settings.autoPaste).toBe(false)
  })

  it('should toggle showNotifications', () => {
    useSettingsStore.getState().updateSettings({ showNotifications: false })
    const settings = useSettingsStore.getState().settings

    expect(settings.showNotifications).toBe(false)
  })

   it('should update selectedInputDevice', () => {
     useSettingsStore.getState().updateSettings({ selectedInputDevice: 'device123' })
     const settings = useSettingsStore.getState().settings

     expect(settings.selectedInputDevice).toBe('device123')
   })

  it('should toggle startAtLogin', () => {
    useSettingsStore.getState().updateSettings({ startAtLogin: true })
    const settings = useSettingsStore.getState().settings

    expect(settings.startAtLogin).toBe(true)
  })

  it('should toggle muteSounds', () => {
    useSettingsStore.getState().updateSettings({ muteSounds: true })
    const settings = useSettingsStore.getState().settings

    expect(settings.muteSounds).toBe(true)
  })

  it('should update injection method', () => {
    useSettingsStore.getState().updateSettings({ injectionMethod: 'clipboard' })
    const settings = useSettingsStore.getState().settings

    expect(settings.injectionMethod).toBe('clipboard')
  })

  it('should toggle smart spacing', () => {
    useSettingsStore.getState().updateSettings({ smartSpacing: false })
    const settings = useSettingsStore.getState().settings

    expect(settings.smartSpacing).toBe(false)
  })

   it('should reset settings to default', () => {
    useSettingsStore.getState().updateSettings({ recordHotkey: 'A' })
    useSettingsStore.getState().updateSettings({ editingLevel: 'aggressive' })

    useSettingsStore.getState().resetSettings()
    const settings = useSettingsStore.getState().settings

    expect(settings).toEqual(DEFAULT_SETTINGS)
    expect(settings.recordHotkey).toBe('V')
    expect(settings.editingLevel).toBe('minimal')
  })

  it('should update provider to openrouter', () => {
    useSettingsStore.getState().updateSettings({ provider: 'openrouter' })
    const settings = useSettingsStore.getState().settings

    expect(settings.provider).toBe('openrouter')
  })

  it('should update provider to openai', () => {
    useSettingsStore.getState().updateSettings({ provider: 'openai' })
    const settings = useSettingsStore.getState().settings

    expect(settings.provider).toBe('openai')
  })

  it('should update provider to groq', () => {
    useSettingsStore.getState().updateSettings({ provider: 'groq' })
    const settings = useSettingsStore.getState().settings

    expect(settings.provider).toBe('groq')
  })

  it('should update provider to ollama', () => {
    useSettingsStore.getState().updateSettings({ provider: 'ollama' })
    const settings = useSettingsStore.getState().settings

    expect(settings.provider).toBe('ollama')
  })

  it('should update customBaseUrl', () => {
    useSettingsStore.getState().updateSettings({ customBaseUrl: 'https://custom.openai.com/v1' })
    const settings = useSettingsStore.getState().settings

    expect(settings.customBaseUrl).toBe('https://custom.openai.com/v1')
  })

  it('should have available providers including all required options', () => {
    expect(AVAILABLE_PROVIDERS).toContainEqual({
      id: 'openrouter',
      name: 'OpenRouter (Default)',
      description: 'Best balance',
    })
    expect(AVAILABLE_PROVIDERS).toContainEqual({
      id: 'openai',
      name: 'Custom OpenAI-Compatible API',
      description: 'Any provider',
    })
    expect(AVAILABLE_PROVIDERS).toContainEqual({
      id: 'groq',
      name: 'Groq Integration',
      description: 'Extreme speed',
    })
    expect(AVAILABLE_PROVIDERS).toContainEqual({
      id: 'ollama',
      name: 'Local LLM (Ollama)',
      description: 'Privacy/Offline',
    })
  })

  it('should have OpenRouter as default provider with best balance of quality and speed', () => {
    const defaultProvider = AVAILABLE_PROVIDERS.find(p => p.id === DEFAULT_SETTINGS.provider)
    expect(defaultProvider).toBeDefined()
    expect(defaultProvider?.description).toBe('Best balance')
  })
})
