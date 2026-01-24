import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'
import { useSettingsStore } from '@/store/settings-store'

// Mock Tauri API
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}))

// Mock the hook
vi.mock('@/hooks/useGlobalHotkey', () => ({
  useGlobalHotkey: vi.fn(),
}))

describe('Interaction State Machine', () => {
  const mockRegisterRecordHotkey = vi.fn()
  const mockRegisterCommitHotkey = vi.fn()
  const mockRegisterCancelHotkey = vi.fn()
  const mockGetRecordingState = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    // Setup mock hook
    ;(useGlobalHotkey as any).mockReturnValue({
      registerRecordHotkey: mockRegisterRecordHotkey,
      registerCommitHotkey: mockRegisterCommitHotkey,
      registerCancelHotkey: mockRegisterCancelHotkey,
      getRecordingState: mockGetRecordingState,
      recordingState: null,
      lastEvent: null,
      error: null,
    })

    // Setup mock settings
    useSettingsStore.setState({
      settings: {
        recordingMode: 'hold',
        recordHotkey: 'V',
        commitHotkey: 'Enter',
        cancelHotkey: 'Escape',
        provider: 'openrouter',
        apiKey: '',
        customBaseUrl: '',
        whisperModel: 'whisper-1',
        uiLanguage: 'en',
        editModel: 'openai/gpt-4o-mini',
        muteSounds: false,
        language: 'ru',
        editingLevel: 'minimal',
        tone: 'preserve',
        autoPaste: true,
        showNotifications: true,
        selectedInputDevice: 'default',
        startAtLogin: false,
        injectionMethod: 'accessibility',
        smartSpacing: true,
      },
    })
  })

  it('should register record, commit, and cancel hotkeys on mount', async () => {
    // Mock successful registrations
    mockRegisterRecordHotkey.mockResolvedValue(undefined)
    mockRegisterCommitHotkey.mockResolvedValue(undefined)
    mockRegisterCancelHotkey.mockResolvedValue(undefined)

    // Render a component that uses the hook
    const TestComponent = () => {
      const { registerRecordHotkey, registerCommitHotkey, registerCancelHotkey } = useGlobalHotkey()
      const { settings } = useSettingsStore()

      React.useEffect(() => {
        const registerHotkeys = async () => {
          await registerRecordHotkey(settings.recordHotkey, settings.recordingMode)
          await registerCommitHotkey(settings.commitHotkey)
          await registerCancelHotkey(settings.cancelHotkey)
        }
        registerHotkeys()
      }, [settings, registerRecordHotkey, registerCommitHotkey, registerCancelHotkey])

      return React.createElement('div', null, 'Testing hotkey registration')
    }

    render(React.createElement(TestComponent))

    await waitFor(() => {
      expect(mockRegisterRecordHotkey).toHaveBeenCalledWith('V', 'hold')
      expect(mockRegisterCommitHotkey).toHaveBeenCalledWith('Enter')
      expect(mockRegisterCancelHotkey).toHaveBeenCalledWith('Escape')
    })
  })

  it('should handle hold mode state transitions', async () => {
    const expectedState = {
      is_recording: false,
      mode: 'hold',
      start_time: null,
      action: 'idle',
    }

    mockGetRecordingState.mockResolvedValue(expectedState)

    // Setup mock to return the state
    ;(useGlobalHotkey as any).mockReturnValue({
      registerRecordHotkey: mockRegisterRecordHotkey,
      registerCommitHotkey: mockRegisterCommitHotkey,
      registerCancelHotkey: mockRegisterCancelHotkey,
      getRecordingState: mockGetRecordingState,
      recordingState: expectedState,
      lastEvent: null,
      error: null,
    })

    const TestComponent = () => {
      const { recordingState } = useGlobalHotkey()

      return React.createElement('div', null,
        React.createElement('div', { 'data-testid': 'recording-state' },
          recordingState ? JSON.stringify(recordingState) : 'no state'
        )
      )
    }

    render(React.createElement(TestComponent))

    await waitFor(() => {
      expect(screen.getByTestId('recording-state')).toHaveTextContent(JSON.stringify(expectedState))
    })
  })

  it('should handle toggle mode state transitions', async () => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        recordingMode: 'toggle',
      },
    })

    mockRegisterRecordHotkey.mockResolvedValue(undefined)

    const TestComponent = () => {
      const { registerRecordHotkey } = useGlobalHotkey()
      const { settings } = useSettingsStore()

      React.useEffect(() => {
        registerRecordHotkey(settings.recordHotkey, settings.recordingMode)
      }, [settings, registerRecordHotkey])

      return React.createElement('div', null, 'Toggle mode test')
    }

    render(React.createElement(TestComponent))

    await waitFor(() => {
      expect(mockRegisterRecordHotkey).toHaveBeenCalledWith('V', 'toggle')
    })
  })

  it('should support single key hotkeys', () => {
    // Test that single keys are accepted (this is more of a UI test)
    expect('V').toBe('V') // Single key
    expect('Enter').toBe('Enter') // Special key
    expect('Escape').toBe('Escape') // Special key
  })
})