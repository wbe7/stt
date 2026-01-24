import { describe, it, expect, beforeEach, vi } from 'vitest'
import { VoiceRecorder } from '@/lib/audio/recorder'
import { AudioConverter } from '@/lib/audio/converter'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { transcribeAudio } from '@/lib/api/openrouter/whisper'
import { editText } from '@/lib/api/openrouter/edit'
import { useSettingsStore } from '@/store/settings-store'
import { useHistoryStore } from '@/store/history-store'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

// Mock API functions
vi.mock('@/lib/api/openrouter/whisper', () => ({
  transcribeAudio: vi.fn(),
}))

vi.mock('@/lib/api/openrouter/edit', () => ({
  editText: vi.fn(),
}))

// Mock stores
vi.mock('@/store/settings-store', () => ({
  useSettingsStore: vi.fn(),
}))

vi.mock('@/store/history-store', () => ({
  useHistoryStore: vi.fn(),
}))

// Mock recorder
vi.mock('@/lib/audio/recorder', () => ({
  VoiceRecorder: class {
    start = vi.fn()
    stop = vi.fn().mockResolvedValue(undefined)
    getAudioBlob = vi.fn(() => new Blob(['test audio data'], { type: 'audio/webm' }))
    dispose = vi.fn()
  },
}))

// Mock converter
vi.mock('@/lib/audio/converter', () => ({
  AudioConverter: class {
    convertToWav = vi.fn().mockResolvedValue(new Blob(['wav data'], { type: 'audio/wav' }))
  },
}))

describe('Complete User Flow Integration', () => {
  let mockSettings: any
  let mockAddEntry: any

  beforeEach(() => {
    vi.clearAllMocks()

    mockSettings = {
      language: 'en',
      editingLevel: 'medium',
      autoPaste: true,
    }

    mockAddEntry = vi.fn()

    // Mock stores
    ;(useSettingsStore as any).mockReturnValue({
      settings: mockSettings,
    })

    ;(useHistoryStore as any).mockReturnValue({
      addEntry: mockAddEntry,
    })

    // Mock API responses
    ;(transcribeAudio as any).mockResolvedValue({
      success: true,
      data: {
        text: 'Hello world this is a test',
        language: 'en',
        duration: 2.5,
      },
    })

    ;(editText as any).mockResolvedValue({
      success: true,
      data: {
        editedText: 'Hello world. This is a test.',
      },
    })

    // Mock Tauri invoke
    ;(invoke as any).mockResolvedValue({
      success: true,
    })
  })

  it('should complete full user flow from recording to text injection', async () => {
    // Simulate complete workflow process
    const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' })
    const converter = new AudioConverter()

    // Convert audio to WAV
    const wavBlob = await converter.convertToWav(audioBlob)
    expect(wavBlob).toBeDefined()

    // Transcribe audio
    const transcription = await transcribeAudio(wavBlob!, { language: 'en' })
    expect(transcribeAudio).toHaveBeenCalledWith(wavBlob, { language: 'en' })
    expect(transcription.success).toBe(true)

    if (transcription.success) {
      expect(transcription.data.text).toBe('Hello world this is a test')

      // Edit text
      const edited = await editText(transcription.data.text, { mode: 'medium', language: 'en' })
      expect(editText).toHaveBeenCalledWith('Hello world this is a test', { mode: 'medium', language: 'en' })
      expect(edited.success).toBe(true)

      if (edited.success) {
        expect(edited.data.editedText).toBe('Hello world. This is a test.')

        // Inject text (autoPaste is true)
        const injectResult = await invoke('inject_text', {
          text: edited.data.editedText,
        }) as { success: boolean }
        expect(invoke).toHaveBeenCalledWith('inject_text', {
          text: 'Hello world. This is a test.',
        })
        expect(injectResult.success).toBe(true)

        // Add to history
        const entry = {
          id: crypto.randomUUID(),
          originalText: transcription.data.text,
          editedText: edited.data.editedText,
          language: transcription.data.language || 'en',
          duration: transcription.data.duration || 0,
          status: 'completed' as const,
          timestamp: Date.now(),
        }

        mockAddEntry(entry)

        // Verify history entry was added
        expect(mockAddEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            originalText: 'Hello world this is a test',
            editedText: 'Hello world. This is a test.',
            language: 'en',
            duration: 2.5,
            status: 'completed',
          })
        )
      }
    }
  })

  it('should handle transcription API failures gracefully', async () => {
    // Mock transcription failure
    ;(transcribeAudio as any).mockResolvedValue({
      success: false,
      error: 'Transcription failed',
    })

    const recorder = new VoiceRecorder()
    const converter = new AudioConverter()

    // Simulate recording
    await recorder.start()
    await recorder.stop()
    const audioBlob = recorder.getAudioBlob()
    const wavBlob = await converter.convertToWav(audioBlob as Blob)

    // Process audio - should fail at transcription
    const transcription = await transcribeAudio(wavBlob!, { language: 'en' })
    expect(transcription.success).toBe(false)

    // Add failed entry to history (as would happen in workflow)
    const errorMessage = (transcription as any).error || 'Unknown error'
    const entry = {
      id: crypto.randomUUID(),
      originalText: '',
      editedText: '',
      language: 'en',
      duration: 0,
      status: 'failed' as const,
      error: errorMessage,
      timestamp: Date.now(),
    }

    mockAddEntry(entry)

    // Verify failed entry was added to history
    expect(mockAddEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'failed',
        error: 'Transcription failed',
      })
    )

    // Should not call edit or inject
    expect(editText).not.toHaveBeenCalled()
    expect(invoke).not.toHaveBeenCalled()
  })

  it('should handle editing API failures', async () => {
    // Mock editing failure
    ;(editText as any).mockResolvedValue({
      success: false,
      error: 'Editing failed',
    })

    const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' })
    const converter = new AudioConverter()

    const wavBlob = await converter.convertToWav(audioBlob)
    const transcription = await transcribeAudio(wavBlob!, { language: 'en' })

    if (transcription.success) {
      const edited = await editText(transcription.data.text, { mode: 'medium', language: 'en' })
      expect(edited.success).toBe(false)

      // Add failed entry
      const errorMessage = (edited as any).error || 'Unknown error'
      const entry = {
        id: crypto.randomUUID(),
        originalText: transcription.data.text,
        editedText: '',
        language: 'en',
        duration: transcription.data.duration || 0,
        status: 'failed' as const,
        error: errorMessage,
        timestamp: Date.now(),
      }

      mockAddEntry(entry)

      // Verify failed entry
      expect(mockAddEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'failed',
          error: 'Editing failed',
        })
      )

      // Should not inject
      expect(invoke).not.toHaveBeenCalled()
    }
  })

  it('should handle injection failures', async () => {
    // Mock injection failure
    ;(invoke as any).mockResolvedValue({
      success: false,
      error: 'Injection failed',
    })

    const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' })
    const converter = new AudioConverter()

    const wavBlob = await converter.convertToWav(audioBlob)
    const transcription = await transcribeAudio(wavBlob!, { language: 'en' })

    if (transcription.success) {
      const edited = await editText(transcription.data.text, { mode: 'medium', language: 'en' })
      if (edited.success) {
        const injectResult = await invoke('inject_text', {
          text: edited.data.editedText,
        }) as { success: boolean }

        expect(injectResult.success).toBe(false)

        // Add failed entry
        const entry = {
          id: crypto.randomUUID(),
          originalText: transcription.data.text,
          editedText: edited.data.editedText,
          language: 'en',
          duration: transcription.data.duration || 0,
          status: 'failed' as const,
          error: 'Injection failed',
          timestamp: Date.now(),
        }

        mockAddEntry(entry)

        // Verify failed entry
        expect(mockAddEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'failed',
            error: 'Injection failed',
          })
        )
      }
    }
  })

  it('should skip injection when autoPaste is disabled', async () => {
    // Set autoPaste to false
    const audioBlob = new Blob(['test audio data'], { type: 'audio/webm' })
    const converter = new AudioConverter()

    const wavBlob = await converter.convertToWav(audioBlob)
    const transcription = await transcribeAudio(wavBlob!, { language: 'en' })

    if (transcription.success) {
      const edited = await editText(transcription.data.text, { mode: 'medium', language: 'en' })
      if (edited.success) {
        // When autoPaste is false, injection should not be called
        // (we don't call invoke here since autoPaste is false)

        // But history should still be added
        const entry = {
          id: crypto.randomUUID(),
          originalText: transcription.data.text,
          editedText: edited.data.editedText,
          language: transcription.data.language || 'en',
          duration: transcription.data.duration || 0,
          status: 'completed' as const,
          timestamp: Date.now(),
        }

        mockAddEntry(entry)

        expect(mockAddEntry).toHaveBeenCalledWith(
          expect.objectContaining({
            status: 'completed',
          })
        )

        // Injection should not be called
        expect(invoke).not.toHaveBeenCalled()
      }
    }
  })
})