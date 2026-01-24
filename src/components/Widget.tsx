import { useState, useEffect, useCallback } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { Mic, AlertTriangle } from 'lucide-react'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'
import { useAudioLevels } from '@/hooks/useAudioLevels'
import { useSystemTheme } from '@/hooks/useSystemTheme'
import { useDictationWorkflow } from '@/hooks/useDictationWorkflow'
import { AudioVisualizer } from '@/components/AudioVisualizer'

export default function Widget() {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const { registerHotkey } = useGlobalHotkey()
  const audioLevels = useAudioLevels(isRecording)
  const theme = useSystemTheme()
  useDictationWorkflow() // Connect the dictation workflow

  const checkRecordingState = useCallback(async () => {
    try {
      const state = await invoke<{ is_recording: boolean }>('get_recording_state')
      setIsRecording(state.is_recording)
      if (state.is_recording) {
        setIsVisible(true) // Show on recording
        setError(null)
      }
    } catch (err) {
      console.error('Failed to get recording state:', err)
      setError('Failed to check recording state')
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      checkRecordingState()
    }, 1000) // Check more frequently for widget
    return () => clearInterval(interval)
  }, [checkRecordingState])

  useEffect(() => {
    invoke('create_tray')
  }, [])

  useEffect(() => {
    const unlistenRecord = listen('trigger-record', () => {
      setIsVisible(true) // Show on hotkey press
    })
    return () => {
      unlistenRecord.then(f => f())
    }
  }, [])

  useEffect(() => {
    invoke('update_tray_status', { status: isRecording ? 'recording' : 'idle' })
  }, [isRecording])

  useEffect(() => {
    const registerDefaultHotkey = async () => {
      try {
        await registerHotkey('CommandOrControl+Shift+V')
      } catch (err) {
        console.error('Failed to register default hotkey:', err)
        setError('Failed to register hotkey')
      }
    }

    registerDefaultHotkey()
  }, [registerHotkey])

  // Auto-hide timer
  useEffect(() => {
    if (isRecording) return // Don't hide while recording

    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 5000) // Hide after 5 seconds of inactivity

    return () => clearTimeout(timer)
  }, [isRecording, isVisible])

  // Shake on error
  const shakeClass = error ? 'animate-shake' : ''

  if (isRecording) {
    return <AudioVisualizer state="listening" audioLevels={audioLevels} />
  }

  const themeClasses = theme === 'dark'
    ? 'border-slate-600 text-slate-300'
    : 'border-gray-300 text-gray-700'

  return (
    <main
      role="main"
      className={`w-[400px] h-[60px] bg-transparent border rounded-lg shadow-lg backdrop-blur-xl ${themeClasses} ${isVisible ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200 ${shakeClass}`}
    >
      <div className="flex items-center justify-center h-full px-4">
         {error ? (
            <div className="flex items-center gap-2 text-red-400">
              <span aria-label="Error icon"><AlertTriangle size={20} role="img" /></span>
              <span className="text-sm font-medium">{error}</span>
            </div>
         ) : (
            <div className="flex items-center gap-2">
              <span aria-label="Microphone icon"><Mic size={20} role="img" /></span>
              <span className="text-sm font-medium">Ready</span>
            </div>
         )}
      </div>
    </main>
  )
}