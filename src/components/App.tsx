'use client'

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { MenuBar } from '@/components/features/MenuBar'
import { Mic, Settings, History as HistoryIcon } from 'lucide-react'

const SettingsPanel = lazy(() => import('@/components/features/Settings').then(m => ({ default: m.SettingsPanel })))
const TranscriptionHistory = lazy(() => import('@/components/features/History').then(m => ({ default: m.TranscriptionHistory })))

type View = 'home' | 'settings' | 'history'

export default function App() {
  const [view, setView] = useState<View>('home')
  const [isRecording, setIsRecording] = useState(false)

  const checkRecordingState = useCallback(async () => {
    try {
      const state = await invoke<{ is_recording: boolean }>('get_recording_state')
      setIsRecording(state.is_recording)
    } catch (error) {
      console.error('Failed to get recording state:', error)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      checkRecordingState()
    }, 2000)
    return () => clearInterval(interval)
  }, [checkRecordingState])

  return (
    <main className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-800">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <div className="flex items-center gap-3">
              <Mic className="h-6 w-6 text-blue-500" />
              <h1 className="text-xl font-bold">Voice Dictation</h1>
            </div>
          <div className="flex items-center gap-4">
            <nav className="flex gap-2">
              <button
                type="button"
                onClick={() => setView('home')}
                className={`px-4 py-2 rounded-lg transition-colors ${view === 'home' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                Home
              </button>
              <button
                type="button"
                onClick={() => setView('history')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'history' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                <HistoryIcon size={16} />
                History
              </button>
              <button
                type="button"
                onClick={() => setView('settings')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${view === 'settings' ? 'bg-blue-600' : 'hover:bg-slate-700'}`}
              >
                <Settings size={16} />
                Settings
              </button>
            </nav>
            <MenuBar status={isRecording ? 'recording' : 'idle'} />
          </div>
        </div>
      </header>

      <div className="container mx-auto flex-1 px-4 py-8">
        {view === 'home' && (
          <div className="flex flex-col items-center justify-center h-full gap-8">
            <div className="text-center">
              <h2 className="text-5xl font-bold mb-4">Turn Speech Into Text</h2>
              <p className="text-lg text-slate-400 max-w-2xl">
                AI-powered voice dictation with intelligent editing. Remove filler words, fix stuttering,
                and get polished text instantly.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 max-w-2xl w-full">
              <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
                <div className="rounded-full bg-blue-500 p-4">
                  <Mic className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold">Hold to Record</h3>
                <p className="text-center text-sm text-slate-400">
                  Press and hold your hotkey to start recording
                </p>
              </div>

              <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-700 bg-slate-800 p-6">
                <div className="rounded-full bg-green-500 p-4">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold">AI Powered</h3>
                <p className="text-center text-sm text-slate-400">
                  Intelligent editing removes filler words and fixes stuttering
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-sm text-slate-500">
              <p>
                Press <kbd className="rounded bg-slate-700 px-2 py-1">Cmd</kbd> +{' '}
                <kbd className="rounded bg-slate-700 px-2 py-1">Shift</kbd> +{' '}
                <kbd className="rounded bg-slate-700 px-2 py-1">V</kbd> to start recording
              </p>
              <p>Add <kbd className="rounded bg-slate-700 px-2 py-1">Space</kbd> for toggle mode</p>
            </div>

            {isRecording && (
              <div className="rounded-lg bg-red-900/50 border border-red-700 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-100 font-medium">Recording in progress...</span>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'settings' && (
          <div className="max-w-2xl mx-auto">
            <Suspense fallback={<div className="text-slate-400">Loading settings...</div>}>
              <SettingsPanel />
            </Suspense>
          </div>
        )}

        {view === 'history' && (
          <div className="max-w-4xl mx-auto h-[600px]">
            <Suspense fallback={<div className="text-slate-400">Loading history...</div>}>
              <TranscriptionHistory />
            </Suspense>
          </div>
        )}
      </div>
    </main>
  )
}
