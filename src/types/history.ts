export type RecordingStatus = 'pending' | 'transcribing' | 'editing' | 'completed' | 'failed'

export interface HistoryEntry {
  id: string
  timestamp: number
  duration: number
  originalText: string
  editedText: string
  language: string
  status: RecordingStatus
  error?: string
}

export interface HistoryStats {
  totalRecordings: number
  totalDuration: number
  totalWords: number
  languageBreakdown: Record<string, number>
  statusBreakdown: Record<RecordingStatus, number>
}
