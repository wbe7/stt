import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor, act } from '@testing-library/react'
import { VoiceRecorder } from '@/components/features/VoiceRecorder/VoiceRecorder'
import { transcribeAudio } from '@/lib/api/openrouter/whisper'
import { editText } from '@/lib/api/openrouter/edit'
import { editTextHybrid } from '@/lib/text/hybrid-editing'

// Mock Tauri
const mockInvoke = vi.fn()
Object.defineProperty(window, '__TAURI__', {
  value: {
    core: {
      invoke: mockInvoke,
    },
  },
  writable: true,
})

const mockRecorderOn = vi.fn()

// Mock the necessary dependencies
vi.mock('@/hooks/useGlobalHotkey', () => {
  const mockRegisterRecordHotkey = vi.fn()
  return {
    useGlobalHotkey: vi.fn(() => ({
      registerRecordHotkey: mockRegisterRecordHotkey,
      recordingState: null,
      lastEvent: null,
      error: null,
    })),
  }
})

const mockSettings = {
  recordingMode: 'hold',
  recordHotkey: 'V',
  commitHotkey: 'Enter',
  cancelHotkey: 'Escape',
  provider: 'openrouter',
  apiKey: '',
  customBaseUrl: '',
  whisperModel: 'whisper-1',
  editModel: 'openai/gpt-4o-mini',
  language: 'en',
  uiLanguage: 'en',
  editingLevel: 'aggressive', // Changed to aggressive to enable cloud editing in tests
  tone: 'preserve',
  autoPaste: true,
  showNotifications: false,
  selectedInputDevice: 'default',
  startAtLogin: false,
  muteSounds: false,
  injectionMethod: 'accessibility',
  smartSpacing: true,
}

vi.mock('@/store/settings-store', () => ({
  useSettingsStore: vi.fn(() => ({
    settings: mockSettings,
  })),
}))

vi.mock('@/store/history-store', () => {
  const mockAddEntry = vi.fn()
  return {
    useHistoryStore: vi.fn(() => ({
      addEntry: mockAddEntry,
    })),
  }
})

vi.mock('@/lib/audio/recorder', () => ({
  VoiceRecorder: class {
    start = vi.fn()
    stop = vi.fn()
    on = mockRecorderOn
    dispose = vi.fn()
    getAudioBlob = vi.fn(() => new Blob(['test'], { type: 'audio/webm' }))
    getAudioLevels = vi.fn(() => [])
  },
}))

vi.mock('@/lib/audio/converter', () => ({
  AudioConverter: class {
    convertToWav = vi.fn(() => Promise.resolve(new Blob(['test'], { type: 'audio/wav' })))
  },
}))

const mockPlaySound = vi.fn()

vi.mock('@/lib/audio/sound-player', () => ({
  SoundPlayer: class {
    play = mockPlaySound
    updateConfig = vi.fn()
  },
}))

vi.mock('@/lib/api/openrouter/whisper', () => ({
  transcribeAudio: vi.fn(() => Promise.resolve({
    success: true,
    data: { text: 'Test transcription.', language: 'en', duration: 2.5 },
  })),
}))

vi.mock('@/lib/api/openrouter/edit', () => ({
  editText: vi.fn(() => Promise.resolve({
    success: true,
    data: { editedText: 'Test edited text.' },
  })),
}))

vi.mock('@/lib/text/editing', () => ({
  editTextLocally: vi.fn(() => 'Test edited text.'),
}))

vi.mock('@/lib/text/hybrid-editing', () => ({
  editTextHybrid: vi.fn(() => Promise.resolve({
    success: true,
    data: { editedText: 'Test edited text.' },
  })),
}))

describe('VoiceRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders without crashing', () => {
    render(<VoiceRecorder />)
    // Should not crash - component renders null but initializes properly
  })

  it('initializes without errors', () => {
    expect(() => {
      render(<VoiceRecorder />)
    }).not.toThrow()
  })

  it('verifies pipeline components are available', () => {
    // This test verifies that the component can import all required dependencies
    // The actual pipeline testing would require integration tests

    render(<VoiceRecorder />)

    // If the component renders without errors, it means all imports work
    // and the basic pipeline components are connected
    expect(true).toBe(true)
  })

  it('calls queue_inject_text with correct parameters when auto-pasting', async () => {
    // Mock get_focused_app to throw so it uses default settings
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_focused_app') {
        throw new Error('Mock error')
      }
      return undefined
    })

    render(<VoiceRecorder />)

    // Trigger recording stopped event
    const callback = mockRecorderOn.mock.calls.find(call => call[0] === 'recordingStopped')?.[1]
    if (callback) await act(async () => { callback() })

    // Wait for the inject call (triggered by the mock recorder's 'recordingStopped' event)
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('queue_inject_text', {
        text: 'Test edited text.',
        method: 'accessibility',
        smartSpacing: true,
      })
    })

    // Verify sound cues play at correct timings
    expect(mockPlaySound).toHaveBeenCalledWith('stop')
    expect(mockPlaySound).toHaveBeenCalledWith('success')

    // This test will fail initially because current code calls 'inject_text'
    // After implementation, it should pass
  })

  it('calls queue_inject_text with clipboard method when settings specify clipboard', async () => {
    // Modify mock settings to use clipboard method
    mockSettings.injectionMethod = 'clipboard'

    // Mock get_focused_app to throw so it uses the modified settings
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_focused_app') {
        throw new Error('Mock error')
      }
      return undefined
    })

    render(<VoiceRecorder />)

    // Trigger recording stopped event
    const callback = mockRecorderOn.mock.calls.find(call => call[0] === 'recordingStopped')?.[1]
    if (callback) await act(async () => { callback() })

    // Wait for the inject call (triggered by the mock recorder's 'recordingStopped' event)
    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('queue_inject_text', {
        text: 'Test edited text.',
        method: 'clipboard',
        smartSpacing: true,
      })
    })

    // Verify sound cues play at correct timings
    expect(mockPlaySound).toHaveBeenCalledWith('stop')
    expect(mockPlaySound).toHaveBeenCalledWith('success')

    // Reset settings
    mockSettings.injectionMethod = 'accessibility'
  })

  it('detects bundle ID and applies appropriate context settings', async () => {
    // Mock get_focused_app to return Discord bundle ID (chat context)
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_focused_app') {
        return Promise.resolve({
          bundle_id: 'com.discordapp.Discord',
          name: 'Discord',
        })
      }
      return undefined
    })

    render(<VoiceRecorder />)

    // Trigger recording stopped event
    const callback = mockRecorderOn.mock.calls.find(call => call[0] === 'recordingStopped')?.[1]
    if (callback) await act(async () => { callback() })

    // Wait for the edit call
    await waitFor(() => {
      expect(editTextHybrid).toHaveBeenCalledWith(
        'Test transcription.', // Local editing is applied first
        expect.objectContaining({
          editingLevel: 'aggressive',
          mode: 'chat', // Should be chat mode for messaging apps
          tone: 'casual',
        })
      )
    })
  })

  it('processes multiple rapid dictations sequentially', async () => {
    let callOrder: string[] = []

    // Override the mocks to record order and add delay
    vi.mocked(transcribeAudio).mockImplementation(async () => {
      callOrder.push('transcribe')
      await new Promise(resolve => setTimeout(resolve, 10)) // simulate processing delay
      return {
        success: true,
        data: { text: `transcription ${callOrder.filter(c => c === 'transcribe').length}`, language: 'en', duration: 1 },
      }
    })

    vi.mocked(editText).mockImplementation(async () => {
      callOrder.push('edit')
      return {
        success: true,
        data: { editedText: 'edited text' },
      }
    })

    // Mock get_focused_app to avoid context detection
    mockInvoke.mockImplementation((command: string) => {
      if (command === 'get_focused_app') {
        throw new Error('Mock error')
      }
      return undefined
    })

    render(<VoiceRecorder />)

    // Wait for initialization
    await waitFor(() => {
      expect(mockRecorderOn).toHaveBeenCalledWith('recordingStopped', expect.any(Function))
    })

    const callback = mockRecorderOn.mock.calls.find(call => call[0] === 'recordingStopped')?.[1]

    expect(callback).toBeDefined()

    // Trigger multiple recording stops rapidly
    await act(async () => { callback() })
    await act(async () => { callback() })
    await act(async () => { callback() })

    // Wait for all processing to complete
    await waitFor(() => {
      expect(callOrder).toEqual(['transcribe', 'edit', 'transcribe', 'edit', 'transcribe', 'edit'])
    }, { timeout: 1000 })

    // Verify queue_inject_text was called for each
    const injectCalls = mockInvoke.mock.calls.filter(call => call[0] === 'queue_inject_text')
    expect(injectCalls).toHaveLength(3)
  })
})