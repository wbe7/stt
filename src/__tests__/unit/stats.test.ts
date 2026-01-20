import { describe, it, expect } from 'vitest'
import { calculateStats } from '@/lib/stats'
import type { HistoryEntry } from '@/types/history'

describe('stats', () => {
  it('should calculate stats for empty history', () => {
    const entries: HistoryEntry[] = []

    const stats = calculateStats(entries)

    expect(stats.totalRecordings).toBe(0)
    expect(stats.totalDuration).toBe(0)
    expect(stats.totalWords).toBe(0)
    expect(stats.languageBreakdown).toEqual({})
    expect(stats.statusBreakdown).toEqual({
      pending: 0,
      transcribing: 0,
      editing: 0,
      completed: 0,
      failed: 0,
    })
  })

  it('should calculate stats for single entry', () => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 10,
        originalText: 'hello world',
        editedText: 'Hello World.',
        language: 'en',
        status: 'completed',
      },
    ]

    const stats = calculateStats(entries)

    expect(stats.totalRecordings).toBe(1)
    expect(stats.totalDuration).toBe(10)
    expect(stats.totalWords).toBe(2)
    expect(stats.languageBreakdown).toEqual({ en: 1 })
    expect(stats.statusBreakdown.completed).toBe(1)
  })

  it('should calculate total words correctly', () => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 10,
        originalText: 'hello world',
        editedText: 'Hello World.',
        language: 'en',
        status: 'completed',
      },
      {
        id: '2',
        timestamp: Date.now(),
        duration: 15,
        originalText: 'привет мир это тест',
        editedText: 'Привет мир это тест.',
        language: 'ru',
        status: 'completed',
      },
    ]

    const stats = calculateStats(entries)

    expect(stats.totalWords).toBe(6)
  })

  it('should aggregate duration correctly', () => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 10,
        originalText: 'hello',
        editedText: 'Hello.',
        language: 'en',
        status: 'completed',
      },
      {
        id: '2',
        timestamp: Date.now(),
        duration: 15,
        originalText: 'world',
        editedText: 'World.',
        language: 'en',
        status: 'completed',
      },
    ]

    const stats = calculateStats(entries)

    expect(stats.totalDuration).toBe(25)
  })

  it('should count recordings by language', () => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 10,
        originalText: 'hello',
        editedText: 'Hello.',
        language: 'en',
        status: 'completed',
      },
      {
        id: '2',
        timestamp: Date.now(),
        duration: 15,
        originalText: 'привет',
        editedText: 'Привет.',
        language: 'ru',
        status: 'completed',
      },
      {
        id: '3',
        timestamp: Date.now(),
        duration: 20,
        originalText: 'bonjour',
        editedText: 'Bonjour.',
        language: 'fr',
        status: 'completed',
      },
      {
        id: '4',
        timestamp: Date.now(),
        duration: 25,
        originalText: 'world',
        editedText: 'World.',
        language: 'en',
        status: 'completed',
      },
    ]

    const stats = calculateStats(entries)

    expect(stats.languageBreakdown).toEqual({
      en: 2,
      ru: 1,
      fr: 1,
    })
  })

  it('should count recordings by status', () => {
    const entries: HistoryEntry[] = [
      {
        id: '1',
        timestamp: Date.now(),
        duration: 10,
        originalText: 'hello',
        editedText: 'Hello.',
        language: 'en',
        status: 'pending',
      },
      {
        id: '2',
        timestamp: Date.now(),
        duration: 15,
        originalText: 'world',
        editedText: 'World.',
        language: 'en',
        status: 'transcribing',
      },
      {
        id: '3',
        timestamp: Date.now(),
        duration: 20,
        originalText: 'test',
        editedText: 'Test.',
        language: 'en',
        status: 'editing',
      },
      {
        id: '4',
        timestamp: Date.now(),
        duration: 25,
        originalText: 'done',
        editedText: 'Done.',
        language: 'en',
        status: 'completed',
      },
      {
        id: '5',
        timestamp: Date.now(),
        duration: 30,
        originalText: 'error',
        editedText: '',
        language: 'en',
        status: 'failed',
        error: 'API error',
      },
    ]

    const stats = calculateStats(entries)

    expect(stats.statusBreakdown).toEqual({
      pending: 1,
      transcribing: 1,
      editing: 1,
      completed: 1,
      failed: 1,
    })
  })
})
