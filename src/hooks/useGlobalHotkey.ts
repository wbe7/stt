import { useCallback, useEffect, useState } from 'react'

declare global {
  interface Window {
    __TAURI__?: {
      core: {
        invoke: (command: string, args?: Record<string, unknown>) => Promise<unknown>
      }
      event: {
        listen: (event: string, handler: (event: { payload: unknown }) => void) => Promise<() => void>
      }
    }
  }
}

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

export interface UseGlobalHotkeyReturn {
  registerHotkey: (hotkey: string) => Promise<void>
  unregisterHotkey: (hotkey: string) => Promise<void>
  registerToggleHotkey: (hotkey: string) => Promise<void>
  registerRecordHotkey: (hotkey: string, mode: string) => Promise<void>
  registerCommitHotkey: (hotkey: string) => Promise<void>
  registerCancelHotkey: (hotkey: string) => Promise<void>
  getRecordingState: () => Promise<RecordingInfo>
  lastEvent: HotkeyEvent | null
  recordingState: RecordingInfo | null
  error: string | null
}

export function useGlobalHotkey(): UseGlobalHotkeyReturn {
  const [lastEvent, setLastEvent] = useState<HotkeyEvent | null>(null)
  const [recordingState, setRecordingState] = useState<RecordingInfo | null>(null)
  const [error, setError] = useState<string | null>(null)

  const invoke = (command: string, args?: Record<string, unknown>) => {
    if (typeof window !== 'undefined' && window.__TAURI__) {
      return window.__TAURI__.core.invoke(command, args)
    }
    return Promise.reject(new Error('Tauri API not available'))
  }

  const listen = (event: string, handler: (event: { payload: unknown }) => void) => {
    if (typeof window !== 'undefined' && window.__TAURI__) {
      return window.__TAURI__.event.listen(event, handler)
    }
    return Promise.resolve(() => {})
  }

  useEffect(() => {
    let unlistenHotkey: (() => void) | undefined
    let unlistenRecording: (() => void) | undefined

    const setupEventListeners = async () => {
      try {
        unlistenHotkey = await listen('hotkey-event', (event: { payload: unknown }) => {
          setLastEvent(event.payload as HotkeyEvent)
        })

        unlistenRecording = await listen(
          'recording-state-changed',
          (event: { payload: unknown }) => {
            setRecordingState(event.payload as RecordingInfo)
          }
        )
      } catch (err) {
        setError(`Failed to setup event listeners: ${String(err)}`)
      }
    }

    setupEventListeners()

    return () => {
      if (unlistenHotkey) unlistenHotkey()
      if (unlistenRecording) unlistenRecording()
    }
  }, [])

  const registerHotkey = useCallback(async (hotkey: string) => {
    try {
      setError(null)
      await invoke('register_hotkey', { hotkey })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to register hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const unregisterHotkey = useCallback(async (hotkey: string) => {
    try {
      setError(null)
      await invoke('unregister_hotkey', { hotkey })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to unregister hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const registerToggleHotkey = useCallback(async (hotkey: string) => {
    try {
      setError(null)
      await invoke('register_toggle_hotkey', { hotkey })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to register toggle hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const registerRecordHotkey = useCallback(async (hotkey: string, mode: string) => {
    try {
      setError(null)
      await invoke('register_record_hotkey', { hotkey, mode })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to register record hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const registerCommitHotkey = useCallback(async (hotkey: string) => {
    try {
      setError(null)
      await invoke('register_commit_hotkey', { hotkey })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to register commit hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const registerCancelHotkey = useCallback(async (hotkey: string) => {
    try {
      setError(null)
      await invoke('register_cancel_hotkey', { hotkey })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to register cancel hotkey: ${errorMessage}`)
      throw err
    }
  }, [])

  const getRecordingState = useCallback(async (): Promise<RecordingInfo> => {
    try {
      setError(null)
      const state = await invoke('get_recording_state')
      setRecordingState(state as RecordingInfo)
      return state as RecordingInfo
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Failed to get recording state: ${errorMessage}`)
      throw err
    }
  }, [])

  return {
    registerHotkey,
    unregisterHotkey,
    registerToggleHotkey,
    registerRecordHotkey,
    registerCommitHotkey,
    registerCancelHotkey,
    getRecordingState,
    lastEvent,
    recordingState,
    error,
  }
}
