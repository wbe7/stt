import type { HistoryEntry, HistoryStats } from '@/types/history'

export function calculateStats(entries: HistoryEntry[]): HistoryStats {
  const totalRecordings = entries.length
  const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0)
  const totalWords = entries.reduce((sum, entry) => {
    const wordCount = entry.editedText.split(/\s+/).filter((word) => word.length > 0).length
    return sum + wordCount
  }, 0)

  const languageBreakdown: Record<string, number> = {}
  entries.forEach((entry) => {
    languageBreakdown[entry.language] = (languageBreakdown[entry.language] || 0) + 1
  })

  const statusBreakdown = {
    pending: 0,
    transcribing: 0,
    editing: 0,
    completed: 0,
    failed: 0,
  }

  entries.forEach((entry) => {
    statusBreakdown[entry.status]++
  })

  return {
    totalRecordings,
    totalDuration,
    totalWords,
    languageBreakdown,
    statusBreakdown,
  }
}
