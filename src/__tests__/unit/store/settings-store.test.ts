import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useSettingsStore } from '@/store/settings-store'
import { DEFAULT_SETTINGS } from '@/types/settings'

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
    expect(settings.hotkey).toBe('CommandOrControl+Shift+V')
    expect(settings.editModel).toBe('openai/gpt-4o-mini')
  })

  it('should update hotkey', () => {
    useSettingsStore.getState().updateSettings({ hotkey: 'CommandOrControl+Shift+A' })
    const settings = useSettingsStore.getState().settings

    expect(settings.hotkey).toBe('CommandOrControl+Shift+A')
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

  it('should reset settings to default', () => {
    useSettingsStore.getState().updateSettings({ hotkey: 'CommandOrControl+A' })
    useSettingsStore.getState().updateSettings({ editingLevel: 'aggressive' })

    useSettingsStore.getState().resetSettings()
    const settings = useSettingsStore.getState().settings

    expect(settings).toEqual(DEFAULT_SETTINGS)
    expect(settings.hotkey).toBe('CommandOrControl+Shift+V')
    expect(settings.editingLevel).toBe('minimal')
  })
})
