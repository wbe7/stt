import { useEffect, useRef, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { VoiceRecorder } from '@/lib/audio/recorder'
import { AudioConverter } from '@/lib/audio/converter'
import { transcribeAudio } from '@/lib/api/openrouter/whisper'
import { editText } from '@/lib/api/openrouter/edit'
import { useSettingsStore } from '@/store/settings-store'
import { useHistoryStore } from '@/store/history-store'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'
import type { HistoryEntry } from '@/types/history'
function mapEditingLevelToMode(level: string): string {
  switch (level) {
    case 'minimal':
    case 'medium':
    case 'aggressive':
      return level
    case 'local':
      return 'medium' // fallback
    default:
      return 'medium'
  }
}

export function useDictationWorkflow() {
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const { recordingState } = useGlobalHotkey()
  const { settings } = useSettingsStore()
  const { addEntry } = useHistoryStore()
  const converterRef = useRef(new AudioConverter())

  // Initialize recorder
  useEffect(() => {
    recorderRef.current = new VoiceRecorder()

    return () => {
      if (recorderRef.current) {
        recorderRef.current.dispose()
      }
    }
  }, [])

  const processAudio = useCallback(async (audioBlob: Blob) => {
    try {
      // Convert to WAV
      const wavBlob = await converterRef.current.convertToWav(audioBlob)
      if (!wavBlob) {
        throw new Error('Failed to convert audio to WAV')
      }

      // Transcribe
      const transcription = await transcribeAudio(wavBlob, {
        language: settings.language,
      })

      if (!transcription.success) {
        throw new Error(transcription.error)
      }

      const originalText = transcription.data.text

      // Edit text
      const mode = mapEditingLevelToMode(settings.editingLevel) as 'minimal' | 'medium' | 'aggressive'
      const edited = await editText(originalText, {
        mode,
        language: settings.language,
      })

      if (!edited.success) {
        throw new Error(edited.error)
      }

      const editedText = edited.data.editedText

      // Inject text if auto-paste enabled
      if (settings.autoPaste) {
        const injectResult = await invoke<{ success: boolean; error?: string }>('inject_text', {
          text: editedText,
        })

        if (!injectResult.success) {
          throw new Error(injectResult.error || 'Failed to inject text')
        }
      }

      // Add to history
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalText,
        editedText,
        language: transcription.data.language || settings.language,
        duration: transcription.data.duration || 0,
        status: 'completed',
        timestamp: Date.now(),
      }

      addEntry(entry)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        originalText: '',
        editedText: '',
        language: settings.language,
        duration: 0,
        status: 'failed',
        error: errorMessage,
        timestamp: Date.now(),
      }

      addEntry(entry)
    }
  }, [settings, addEntry])

  // Handle recording state changes
  useEffect(() => {
    if (!recordingState || !recorderRef.current) return

    const { action } = recordingState

    if (action === 'start') {
      recorderRef.current.start().catch(console.error)
    } else if (action === 'commit') {
      recorderRef.current.stop().then(() => {
        const audioBlob = recorderRef.current?.getAudioBlob()
        if (audioBlob) {
          processAudio(audioBlob)
        }
      }).catch(console.error)
    }
  }, [recordingState, processAudio])

  return {}
}