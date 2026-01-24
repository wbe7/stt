// @vitest-environment jsdom

  import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AudioDeviceSelector } from '@/components/features/Settings/AudioDeviceSelector'
import { useSettingsStore } from '@/store/settings-store'
import { useAudioDeviceStore } from '@/store/audio-device-store'

// Mock the stores
vi.mock('@/store/settings-store')
vi.mock('@/store/audio-device-store')

const mockUseSettingsStore = vi.mocked(useSettingsStore)
const mockUseAudioDeviceStore = vi.mocked(useAudioDeviceStore)

const mockStartMonitoring = vi.fn().mockResolvedValue(undefined)
const mockStopMonitoring = vi.fn()

describe('AudioDeviceSelector', () => {
  it('should render microphone selector dropdown', () => {
    mockUseSettingsStore.mockReturnValue({
      settings: { selectedInputDevice: 'default' },
      updateSettings: vi.fn(),
    } as any)

    mockUseAudioDeviceStore.mockReturnValue({
      inputDevices: [
        { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
        { deviceId: 'mic1', label: 'Microphone 1', kind: 'audioinput' },
      ],
      isMonitoring: false,
      level: 0,
      startMonitoring: vi.fn(),
      stopMonitoring: vi.fn(),
    } as any)

    render(<AudioDeviceSelector />)

    expect(screen.getByText('Входное аудиоустройство')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
    expect(screen.getByText('По умолчанию')).toBeInTheDocument()
    expect(screen.getByText('Default Microphone')).toBeInTheDocument()
    expect(screen.getByText('Microphone 1')).toBeInTheDocument()
  })

  it('should start monitoring when test button is clicked', async () => {
    const user = userEvent.setup()
    mockUseSettingsStore.mockReturnValue({
      settings: { selectedInputDevice: 'mic1' },
      updateSettings: vi.fn(),
    } as any)

    mockUseAudioDeviceStore.mockReturnValue({
      inputDevices: [
        { deviceId: 'mic1', label: 'Microphone 1', kind: 'audioinput' },
      ],
      isMonitoring: false,
      level: 0,
      startMonitoring: mockStartMonitoring,
      stopMonitoring: mockStopMonitoring,
    } as any)

    render(<AudioDeviceSelector />)

    const button = screen.getByRole('button', { name: 'Тестировать микрофон' })
    await user.click(button)

    expect(mockStartMonitoring).toHaveBeenCalledWith('mic1')
  })

  it('should stop monitoring when test button is clicked while monitoring', async () => {
    const user = userEvent.setup()
    mockUseSettingsStore.mockReturnValue({
      settings: { selectedInputDevice: 'default' },
      updateSettings: vi.fn(),
    } as any)

    mockUseAudioDeviceStore.mockReturnValue({
      inputDevices: [],
      isMonitoring: true,
      level: 50,
      startMonitoring: mockStartMonitoring,
      stopMonitoring: mockStopMonitoring,
    } as any)

    render(<AudioDeviceSelector />)

    const button = screen.getByRole('button', { name: 'Остановить тест' })
    await user.click(button)

    expect(mockStopMonitoring).toHaveBeenCalled()
  })

  it('should show level meter when monitoring', () => {
    mockUseSettingsStore.mockReturnValue({
      settings: { selectedInputDevice: 'default' },
      updateSettings: vi.fn(),
    } as any)

    mockUseAudioDeviceStore.mockReturnValue({
      inputDevices: [],
      isMonitoring: true,
      level: 75,
      startMonitoring: vi.fn(),
      stopMonitoring: vi.fn(),
    } as any)

    render(<AudioDeviceSelector />)

    expect(screen.getByText('Уровень звука:')).toBeInTheDocument()
    expect(screen.getByText('75%')).toBeInTheDocument()
  })
})