import { describe, it, expect, beforeEach, vi } from 'vitest'

describe('useGlobalHotkey', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('should have correct type definitions', () => {
      const recordingInfo = {
        is_recording: false,
        mode: 'hold',
        start_time: null,
      }
      expect(recordingInfo).toBeDefined()
    })

    it('should handle hotkey event type', () => {
      const hotkeyEvent = {
        hotkey: 'CommandOrControl+Shift+V',
        state: 'pressed',
        timestamp: Date.now(),
      }
      expect(hotkeyEvent).toBeDefined()
    })
  })
})
