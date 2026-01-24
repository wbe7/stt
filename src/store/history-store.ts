import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HistoryEntry, RecordingStatus } from '@/types/history'
import { secureStorage } from '@/lib/storage/secure-storage'

interface HistoryState {
  entries: HistoryEntry[]
  addEntry: (entry: HistoryEntry) => void
  removeEntry: (id: string) => void
  clear: () => void
  getEntry: (id: string) => HistoryEntry | undefined
  updateEntryStatus: (id: string, status: RecordingStatus) => void
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ entries: [entry, ...state.entries] })),
      removeEntry: (id) =>
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        })),
      clear: () => set({ entries: [] }),
      getEntry: (id) => get().entries.find((entry) => entry.id === id),
      updateEntryStatus: (id, status) =>
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id ? { ...entry, status } : entry,
          ),
        })),
    }),
    {
      name: 'stt-history',
      storage: secureStorage,
    },
  ),
)
