import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Settings, DEFAULT_SETTINGS } from '@/types/settings'

interface SettingsState {
  settings: Settings
  updateSettings: (updates: Partial<Settings>) => void
  resetSettings: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetSettings: () =>
        set({
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: 'stt-settings',
    }
  )
)
