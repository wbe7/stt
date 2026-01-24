import { vi } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock all dependencies
vi.mock('@/lib/audio/recorder')
vi.mock('@/lib/audio/converter')
vi.mock('@/lib/api/openrouter/whisper')
vi.mock('@/lib/api/openrouter/edit')
vi.mock('@/store/settings-store', () => ({
  useSettingsStore: vi.fn(() => ({
    settings: {
      language: 'en',
      editingLevel: 'medium',
      autoPaste: true,
    },
  })),
}))

vi.mock('@/store/history-store', () => ({
  useHistoryStore: vi.fn(() => ({
    addEntry: vi.fn(),
  })),
}))
vi.mock('@tauri-apps/api/core')
vi.mock('@/hooks/useGlobalHotkey', () => ({
  useGlobalHotkey: vi.fn(() => ({
    recordingState: null,
    registerHotkey: vi.fn(),
    unregisterHotkey: vi.fn(),
    registerToggleHotkey: vi.fn(),
    registerRecordHotkey: vi.fn(),
    registerCommitHotkey: vi.fn(),
    registerCancelHotkey: vi.fn(),
    getRecordingState: vi.fn(),
    lastEvent: null,
    error: null,
  })),
}))

import { useDictationWorkflow } from '@/hooks/useDictationWorkflow'

describe('useDictationWorkflow', () => {
  it('should render without error', () => {
    expect(() => {
      renderHook(() => useDictationWorkflow())
    }).not.toThrow()
  })
})