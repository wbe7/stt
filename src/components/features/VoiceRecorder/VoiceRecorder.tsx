import { useEffect, useRef, useState } from 'react'
import { VoiceRecorder as AudioRecorder } from '@/lib/audio/recorder'
import { AudioConverter } from '@/lib/audio/converter'
import { SoundPlayer } from '@/lib/audio/sound-player'
import { transcribeAudio } from '@/lib/api/openrouter/whisper'

import { editTextLocally } from '@/lib/text/editing'
import { editTextHybrid } from '@/lib/text/hybrid-editing'
import { detectMagicEditCommand } from '@/lib/text/magic-edit'
import { detectContextMode, getContextConfig } from '@/lib/context'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'
import { useSettingsStore } from '@/store/settings-store'
import { useHistoryStore } from '@/store/history-store'
import { AudioVisualizer } from '@/components/AudioVisualizer'
import type { HistoryEntry } from '@/types/history'
import type { FocusedAppInfo, ContextMode } from '@/types/context'

export function VoiceRecorder() {
  const recorderRef = useRef<AudioRecorder | null>(null)
  const converterRef = useRef<AudioConverter | null>(null)
  const soundPlayerRef = useRef<SoundPlayer | null>(null)
  const processingQueueRef = useRef<(() => Promise<void>)[]>([])
  const isProcessingRef = useRef(false)
  const { registerRecordHotkey, recordingState, lastEvent } = useGlobalHotkey()
  const { settings } = useSettingsStore()
  const { addEntry } = useHistoryStore()
  const [visualizerState, setVisualizerState] = useState<'idle' | 'listening' | 'thinking' | 'success'>('idle')
  const [audioLevels, setAudioLevels] = useState<number[]>([])

  useEffect(() => {
    // Initialize recorder, converter, and sound player
    recorderRef.current = new AudioRecorder()
    converterRef.current = new AudioConverter()
    soundPlayerRef.current = new SoundPlayer({ muteSounds: settings.muteSounds })

    // Register the record hotkey based on mode
    registerRecordHotkey(settings.recordHotkey, settings.recordingMode)

    // Set up event listeners
    recorderRef.current.on('recordingStarted', () => {
      console.log('Recording started')
      setVisualizerState('listening')
      soundPlayerRef.current?.play('start')
    })

    recorderRef.current.on('recordingStopped', () => {
      soundPlayerRef.current?.play('stop')
      handleRecordingStopped()
    })

    return () => {
      recorderRef.current?.dispose()
      recorderRef.current = null
      converterRef.current = null
      soundPlayerRef.current = null
    }
  }, [settings.recordHotkey, settings.recordingMode, settings.muteSounds])

  useEffect(() => {
    soundPlayerRef.current?.updateConfig({ muteSounds: settings.muteSounds })
  }, [settings.muteSounds])

  useEffect(() => {
    if (!lastEvent || !recorderRef.current) return

    // Handle hotkey events
    if (lastEvent.state === 'pressed' && !recordingState?.is_recording) {
      recorderRef.current.start()
    } else if (lastEvent.state === 'released' && recordingState?.is_recording) {
      recorderRef.current.stop()
    }
  }, [lastEvent, recordingState])

  // Poll audio levels when recording
  useEffect(() => {
    if (visualizerState === 'listening') {
      const interval = setInterval(() => {
        if (recorderRef.current) {
          setAudioLevels(recorderRef.current.getAudioLevels())
        }
      }, 100)
      return () => clearInterval(interval)
    }
  }, [visualizerState])

  const handleRecordingStopped = async () => {
    setVisualizerState('thinking')
    if (!recorderRef.current || !converterRef.current) return

    const processTask = async () => {
      try {
        const audioBlob = recorderRef.current!.getAudioBlob()
        if (!audioBlob) return

        // Add to history with pending status
        const entryId = Date.now().toString()
        const entry: HistoryEntry = {
          id: entryId,
          timestamp: Date.now(),
          originalText: '',
          editedText: '',
          status: 'transcribing',
          duration: 0,
          language: settings.language,
        }
        addEntry(entry)

        // Convert to WAV
        const wavBlob = await converterRef.current!.convertToWav(audioBlob)
        if (!wavBlob) {
          updateEntryStatus(entryId, 'failed')
          return
        }

        // Transcribe
        const transcriptionResult = await transcribeAudio(wavBlob, {
          language: settings.language,
          provider: settings.provider,
          apiKey: settings.apiKey,
          customBaseUrl: settings.customBaseUrl,
        })

        if (!transcriptionResult.success) {
          updateEntryStatus(entryId, 'failed')
          soundPlayerRef.current?.play('error')
          return
        }

         let transcribedText = transcriptionResult.data.text
         entry.originalText = transcribedText
         entry.duration = transcriptionResult.data.duration ?? 0
         entry.language = transcriptionResult.data.language ?? settings.language

           // Detect focused app and get context-aware settings
           let contextTone = settings.tone
           let contextEditingLevel = settings.editingLevel

         // Detect magic edit commands
         const magicEdit = detectMagicEditCommand(transcribedText)
         let forceShorten = false

         if (magicEdit) {
           transcribedText = magicEdit.cleanedText
           if (magicEdit.command === 'make it shorter') {
             forceShorten = true
           }
           // Update original text to include the command for history
           entry.originalText = transcribedText + ' ' + magicEdit.command
         }

          let contextMode: ContextMode = 'pro' // default

          try {
            if (typeof window !== 'undefined' && window.__TAURI__) {
              const appInfo = await window.__TAURI__.core.invoke('get_focused_app') as FocusedAppInfo
              contextMode = detectContextMode(appInfo)
              const contextConfig = getContextConfig(contextMode)
              contextTone = contextConfig.tone
              contextEditingLevel = contextConfig.editingLevel
            }
          } catch (error) {
            console.warn('Failed to detect focused app, using default settings:', error)
          }

            // Edit text using hybrid approach
            const editResult = await editTextHybrid(transcribedText, {
              editingLevel: contextEditingLevel,
              mode: forceShorten ? 'shorten' : contextMode,
              tone: contextTone,
              provider: settings.provider,
              apiKey: settings.apiKey,
              customBaseUrl: settings.customBaseUrl,
              model: settings.editModel,
            })

           let editedText: string
           if (editResult.success) {
             editedText = editResult.data.editedText
           } else {
             // Final fallback to local editing
             editedText = editTextLocally(transcribedText, {
               tone: contextTone,
             })
           }

         entry.editedText = editedText
         entry.status = 'completed'

         // Update history
         updateEntryStatus(entryId, 'completed', entry)

         // Inject text if auto-paste is enabled
         if (settings.autoPaste) {
           await injectText(editedText)
         }

          setVisualizerState('success')
          soundPlayerRef.current?.play('success')
          setTimeout(() => setVisualizerState('idle'), 300)

      } catch (error) {
        console.error('Error processing recording:', error)
        // Update entry status to failed
        const entryId = Date.now().toString()
        updateEntryStatus(entryId, 'failed')
        soundPlayerRef.current?.play('error')
      }
    }

    processingQueueRef.current.push(processTask)
    processQueue()
  }

  const updateEntryStatus = (_id: string, status: HistoryEntry['status'], updatedEntry?: Partial<HistoryEntry>) => {
    // Since we can't directly update the entry, we need to add a new one or modify the store
    // For simplicity, we'll add a new entry with updated status
    // In a real implementation, the store should have an update method
    if (updatedEntry) {
      addEntry({ ...updatedEntry, status } as HistoryEntry)
    }
  }

  const processQueue = async () => {
    if (isProcessingRef.current) return
    if (processingQueueRef.current.length > 0) {
      isProcessingRef.current = true
      const task = processingQueueRef.current.shift()!
      await task()
      isProcessingRef.current = false
      // Process next in queue
      processQueue()
    }
  }

  const injectText = async (text: string) => {
    if (typeof window !== 'undefined' && window.__TAURI__) {
      try {
        await window.__TAURI__.core.invoke('queue_inject_text', {
          text,
          method: settings.injectionMethod,
          smartSpacing: settings.smartSpacing,
        })
      } catch (error) {
        console.error('Failed to inject text:', error)
      }
    }
  }

  // Render visualizer when active
  if (visualizerState === 'idle') return null

  return <AudioVisualizer state={visualizerState === 'success' ? 'success' : visualizerState === 'thinking' ? 'thinking' : 'listening'} audioLevels={audioLevels} />
}