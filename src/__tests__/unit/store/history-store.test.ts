import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useHistoryStore } from '@/store/history-store'
import type { HistoryEntry } from '@/types/history'

describe('history-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useHistoryStore.setState({ entries: [] })
  })

  it('should initialize with empty history', () => {
    const entries = useHistoryStore.getState().entries

    expect(entries).toEqual([])
  })

  it('should add a history entry', () => {
    const entry: HistoryEntry = {
      id: '1',
      timestamp: Date.now(),
      duration: 10,
      originalText: 'hello world',
      editedText: 'Hello World.',
      language: 'en',
      status: 'completed',
    }

    useHistoryStore.getState().addEntry(entry)

    const entries = useHistoryStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual(entry)
  })

  it('should remove a history entry by id', () => {
    const entry1: HistoryEntry = {
      id: '1',
      timestamp: Date.now(),
      duration: 10,
      originalText: 'hello',
      editedText: 'Hello.',
      language: 'en',
      status: 'completed',
    }

    const entry2: HistoryEntry = {
      id: '2',
      timestamp: Date.now(),
      duration: 15,
      originalText: 'world',
      editedText: 'World.',
      language: 'en',
      status: 'completed',
    }

    useHistoryStore.getState().addEntry(entry1)
    useHistoryStore.getState().addEntry(entry2)

    useHistoryStore.getState().removeEntry('1')

    const entries = useHistoryStore.getState().entries
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe('2')
  })

  it('should clear all history entries', () => {
    const entry: HistoryEntry = {
      id: '1',
      timestamp: Date.now(),
      duration: 10,
      originalText: 'hello',
      editedText: 'Hello.',
      language: 'en',
      status: 'completed',
    }

    useHistoryStore.getState().addEntry(entry)

    expect(useHistoryStore.getState().entries).toHaveLength(1)

    useHistoryStore.getState().clear()

    expect(useHistoryStore.getState().entries).toEqual([])
  })

  it('should get entry by id', () => {
    const entry: HistoryEntry = {
      id: '1',
      timestamp: Date.now(),
      duration: 10,
      originalText: 'hello',
      editedText: 'Hello.',
      language: 'en',
      status: 'completed',
    }

    useHistoryStore.getState().addEntry(entry)

    const found = useHistoryStore.getState().getEntry('1')
    expect(found).toEqual(entry)

    const notFound = useHistoryStore.getState().getEntry('999')
    expect(notFound).toBeUndefined()
  })

  it('should update entry status', () => {
    const entry: HistoryEntry = {
      id: '1',
      timestamp: Date.now(),
      duration: 10,
      originalText: 'hello',
      editedText: 'Hello.',
      language: 'en',
      status: 'pending',
    }

    useHistoryStore.getState().addEntry(entry)

    useHistoryStore.getState().updateEntryStatus('1', 'completed')

    expect(useHistoryStore.getState().entries[0].status).toBe('completed')
  })
})
