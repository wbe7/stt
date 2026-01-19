import { create } from 'zustand'

interface AppState {
  isRecording: boolean
  isProcessing: boolean
  currentTranscription: string
  error: string | null
  
  startRecording: () => void
  stopRecording: () => void
  setProcessing: (processing: boolean) => void
  setTranscription: (text: string) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  isRecording: false,
  isProcessing: false,
  currentTranscription: '',
  error: null,

  startRecording: () => set({ isRecording: true }),
  stopRecording: () => set({ isRecording: false }),
  setProcessing: (processing) => set({ isProcessing: processing }),
  setTranscription: (text) => set({ currentTranscription: text }),
  setError: (error) => set({ error }),
}))
