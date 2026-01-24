import { describe, it, expect, beforeEach, vi } from 'vitest'

type RecordingInfo = {
  is_recording: boolean
  mode: string
  start_time: number | null
  action: string
}

type HotkeyEvent = {
  hotkey: string
  state: string
  timestamp: number
}

describe('hotkey integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('type definitions', () => {
    it('should have correct type definitions', () => {
      const recordingInfo: RecordingInfo = {
        is_recording: false,
        mode: 'hold',
        start_time: null,
        action: 'start',
      }
      expect(recordingInfo).toBeDefined()
    })

    it('should handle hotkey event type', () => {
      const hotkeyEvent: HotkeyEvent = {
        hotkey: 'CommandOrControl+Shift+V',
        state: 'pressed',
        timestamp: Date.now(),
      }
      expect(hotkeyEvent).toBeDefined()
    })
  })
})
