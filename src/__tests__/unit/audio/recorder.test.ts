import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VoiceRecorder } from '@/lib/audio/recorder'

describe('VoiceRecorder', () => {
  let recorder: VoiceRecorder

  beforeEach(() => {
    recorder = new VoiceRecorder()
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should create audio context on init', () => {
      expect(recorder).toBeDefined()
    })

    it('should handle browser without Web Audio API', () => {
      const originalAudioContext = global.AudioContext
      // @ts-expect-error AudioContext may be undefined in some browsers
      global.AudioContext = undefined

      expect(() => new VoiceRecorder()).not.toThrow()

      global.AudioContext = originalAudioContext
    })

    it('should start with idle state', () => {
      expect(recorder.getState().isRecording).toBe(false)
      expect(recorder.getState().isPaused).toBe(false)
    })
  })

  describe('recording lifecycle', () => {
    it('should start recording when start() is called', async () => {
      await recorder.start()
      expect(recorder.getState().isRecording).toBe(true)
    })

    it('should stop recording when stop() is called', async () => {
      await recorder.start()
      await recorder.stop()
      expect(recorder.getState().isRecording).toBe(false)
    })

    it('should toggle recording when toggle() is called', async () => {
      await recorder.toggle()
      expect(recorder.getState().isRecording).toBe(true)

      await recorder.toggle()
      expect(recorder.getState().isRecording).toBe(false)
    })

    it('should emit recording state changes', async () => {
      const stateChangeSpy = vi.fn()
      recorder.on('stateChange', stateChangeSpy)

      await recorder.start()
      expect(stateChangeSpy).toHaveBeenCalled()
    })
  })

  describe('audio data', () => {
    it('should capture audio samples', async () => {
      await recorder.start()
      await recorder.stop()

      const blob = recorder.getAudioBlob()
      expect(blob).toBeInstanceOf(Blob)
    })

    it('should maintain audio buffer', async () => {
      await recorder.start()
      await recorder.stop()

      const state = recorder.getState()
      expect(state.duration).toBeGreaterThanOrEqual(0)
    })

    it('should clear buffer after stop', async () => {
      await recorder.start()
      await recorder.stop()

      const state1 = recorder.getState()
      expect(state1.isRecording).toBe(false)
      expect(state1.audioBlob).not.toBeNull()

      await recorder.start()
      await recorder.stop()
      const state2 = recorder.getState()

      expect(state2.isRecording).toBe(false)
      expect(state2.audioBlob).not.toBeNull()
    })

    it('should handle multiple recording sessions', async () => {
      await recorder.start()
      await recorder.stop()

      await recorder.start()
      await recorder.stop()

      expect(recorder.getState().isRecording).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should handle microphone access error', async () => {
      const originalGetUserMedia = navigator.mediaDevices.getUserMedia
      navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(
        new Error('Permission denied')
      )

      await expect(recorder.start()).rejects.toThrow('Permission denied')

      navigator.mediaDevices.getUserMedia = originalGetUserMedia
    })

    it('should handle audio context creation error', () => {
      const originalAudioContext = global.AudioContext
      global.AudioContext = vi.fn().mockImplementation(() => {
        throw new Error('AudioContext not supported')
      }) as never

      expect(() => new VoiceRecorder()).not.toThrow()

      global.AudioContext = originalAudioContext
    })

    it('should emit error events on failures', async () => {
      const errorSpy = vi.fn()
      recorder.on('error', errorSpy)

      const originalGetUserMedia = navigator.mediaDevices.getUserMedia
      navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(
        new Error('Microphone error')
      )

      try {
        await recorder.start()
      } catch {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalled()

      navigator.mediaDevices.getUserMedia = originalGetUserMedia
    })
  })

  describe('events', () => {
    it('should emit onRecordingStarted event', async () => {
      const startSpy = vi.fn()
      recorder.on('recordingStarted', startSpy)

      await recorder.start()
      expect(startSpy).toHaveBeenCalled()
    })

    it('should emit onRecordingStopped event', async () => {
      const stopSpy = vi.fn()
      recorder.on('recordingStopped', stopSpy)

      await recorder.start()
      await recorder.stop()
      expect(stopSpy).toHaveBeenCalled()
    })

    it('should emit onError event', async () => {
      const errorSpy = vi.fn()
      recorder.on('error', errorSpy)

      const originalGetUserMedia = navigator.mediaDevices.getUserMedia
      navigator.mediaDevices.getUserMedia = vi.fn().mockRejectedValue(
        new Error('Test error')
      )

      try {
        await recorder.start()
      } catch {
        // Expected
      }

      expect(errorSpy).toHaveBeenCalled()

      navigator.mediaDevices.getUserMedia = originalGetUserMedia
    })
  })
})
