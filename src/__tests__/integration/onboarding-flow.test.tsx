import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/lib/i18n'
import PermissionGuard from '@/components/PermissionGuard'

// Mock Tauri invoke
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn()
}))

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('Onboarding Flow Integration', () => {
  const renderWithProviders = (component: React.ReactElement) => {
    return render(
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    )
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('First Launch Onboarding', () => {
    it('should show onboarding on first launch when permissions are granted', async () => {
      // Mock permissions granted
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(invoke).mockResolvedValue({ accessibility: true, microphone: true })

      // Mock first launch (no onboardingComplete in localStorage)
      localStorageMock.getItem.mockReturnValue(null)

      renderWithProviders(
        <PermissionGuard>
          <div>App Content</div>
        </PermissionGuard>
      )

      // Should show onboarding instead of app content
      await waitFor(() => {
        expect(screen.getByText('Welcome to Voice Dictation')).toBeInTheDocument()
      })

      // Should show permission setup step
      expect(screen.getByText('Permission Setup')).toBeInTheDocument()
      expect(screen.getByText('Grant necessary permissions')).toBeInTheDocument()

      // Should show global hotkeys step
      expect(screen.getByText('Global Hotkeys')).toBeInTheDocument()
      expect(screen.getByText('Use hotkeys to record')).toBeInTheDocument()
    })

    it('should not show onboarding on subsequent launches', async () => {
      // Mock permissions granted
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(invoke).mockResolvedValue({ accessibility: true, microphone: true })

      // Mock onboarding already completed
      localStorageMock.getItem.mockReturnValue('true')

      renderWithProviders(
        <PermissionGuard>
          <div>App Content</div>
        </PermissionGuard>
      )

      // Should show app content instead of onboarding
      await waitFor(() => {
        expect(screen.getByText('App Content')).toBeInTheDocument()
      })

      expect(screen.queryByText('Welcome to Voice Dictation')).not.toBeInTheDocument()
    })
  })

  describe('Interactive Permission Guidance', () => {
    it('should provide interactive guidance for permission setup', async () => {
      // Mock permissions not granted initially
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(invoke).mockResolvedValueOnce({ accessibility: false, microphone: false })

      renderWithProviders(
        <PermissionGuard>
          <div>App Content</div>
        </PermissionGuard>
      )

      // Should show permission setup screen
      await waitFor(() => {
        expect(screen.getByText('Setup Required')).toBeInTheDocument()
      })

      // Should have buttons to open settings
      const buttons = screen.getAllByRole('button', { name: /open settings/i })
      expect(buttons).toHaveLength(2)

      const accessibilityButton = buttons[0]
      const microphoneButton = buttons[1]

      expect(accessibilityButton).toBeInTheDocument()
      expect(microphoneButton).toBeInTheDocument()

      expect(accessibilityButton).toBeInTheDocument()
      expect(microphoneButton).toBeInTheDocument()

      // Clicking should trigger the appropriate invoke calls
      fireEvent.click(accessibilityButton)
      expect(vi.mocked(invoke)).toHaveBeenCalledWith('open_privacy_settings', { settingType: 'accessibility' })

      fireEvent.click(microphoneButton)
      expect(vi.mocked(invoke)).toHaveBeenCalledWith('open_privacy_settings', { settingType: 'microphone' })
    })
  })

  describe('Interactive Feature Tutorials', () => {
    it('should provide interactive tutorials for key features', async () => {
      // Mock permissions granted
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(invoke).mockResolvedValue({ accessibility: true, microphone: true })

      // Mock first launch
      localStorageMock.getItem.mockReturnValue(null)

      renderWithProviders(
        <PermissionGuard>
          <div>App Content</div>
        </PermissionGuard>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome to Voice Dictation')).toBeInTheDocument()
      })

      // Should show tutorial steps for key features
      expect(screen.getByText('Voice Recording')).toBeInTheDocument()
      expect(screen.getByText('Record your voice')).toBeInTheDocument()

      expect(screen.getByText('Text Editing')).toBeInTheDocument()
      expect(screen.getByText('AI-powered text editing')).toBeInTheDocument()

      expect(screen.getByText('Settings')).toBeInTheDocument()
      expect(screen.getByText('Customize your experience')).toBeInTheDocument()
    })

    it('should complete onboarding and show app content', async () => {
      // Mock permissions granted
      const { invoke } = await import('@tauri-apps/api/core')
      vi.mocked(invoke).mockResolvedValue({ accessibility: true, microphone: true })

      // Mock first launch
      localStorageMock.getItem.mockReturnValue(null)

      renderWithProviders(
        <PermissionGuard>
          <div>App Content</div>
        </PermissionGuard>
      )

      await waitFor(() => {
        expect(screen.getByText('Welcome to Voice Dictation')).toBeInTheDocument()
      })

      // Click complete button
      const completeButton = screen.getByText("I've completed the setup")
      fireEvent.click(completeButton)

      // Should set localStorage
      expect(localStorageMock.setItem).toHaveBeenCalledWith('onboardingComplete', 'true')

      // Should show app content
      await waitFor(() => {
        expect(screen.getByText('App Content')).toBeInTheDocument()
      })
    })
  })
})