import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AudioLevelMeter } from '@/components/features/Settings/AudioLevelMeter'
import { useSettingsStore } from '@/store/settings-store'
import { useAudioDeviceStore } from '@/store/audio-device-store'

// Mock the stores
vi.mock('@/store/settings-store')
vi.mock('@/store/audio-device-store')

// Mock navigator.mediaDevices.getUserMedia
const mockGetUserMedia = vi.fn()
Object.defineProperty(navigator, 'mediaDevices', {
  value: { getUserMedia: mockGetUserMedia },
  writable: true,
})

// Mock AudioContext and AnalyserNode
const mockAnalyser = {
  fftSize: 256,
  getByteTimeDomainData: vi.fn(),
  connect: vi.fn(),
}

global.AudioContext = class MockAudioContext {
  createAnalyser = vi.fn(() => mockAnalyser)
  createMediaStreamSource = vi.fn(() => ({ connect: vi.fn() }))
} as any

describe('AudioLevelMeter', () => {
  const mockSetLevel = vi.fn()
  const mockSetMonitoring = vi.fn()
  let mockLevel = 0

  beforeEach(() => {
    vi.clearAllMocks()
    mockLevel = 0
    vi.mocked(useSettingsStore).mockReturnValue({
      settings: { selectedInputDevice: 'default' },
    })
    vi.mocked(useAudioDeviceStore).mockImplementation((selector) => {
      const mockState = {
        inputDevices: [],
        analyser: null,
        stream: null,
        setLevel: (level: number) => {
          mockLevel = level
          mockSetLevel(level)
        },
        isMonitoring: false,
        setMonitoring: mockSetMonitoring,
        level: mockLevel,
        setInputDevices: vi.fn(),
        refreshDevices: vi.fn(),
        startMonitoring: vi.fn(),
        stopMonitoring: vi.fn(),
      }
      if (selector) {
        return selector(mockState)
      } else {
        return mockState
      }
    })
  })

  it('displays dB level within 1dB accuracy', async () => {
    // Mock audio stream
    const mockStream = {
      getTracks: vi.fn(() => [{ stop: vi.fn() }]),
    }
    mockGetUserMedia.mockResolvedValue(mockStream)

    // Set up analyser to return data that should result in approximately -23 dB
    // Sine wave with amplitude 0.1 in normalized range, RMS = 0.1 / sqrt(2) ≈ 0.0707
    // dB = 20 * log10(0.0707) ≈ -23
    const dataArray = new Uint8Array(256)
    for (let i = 0; i < 256; i++) {
      dataArray[i] = 128 + Math.round(0.1 * 128 * Math.sin((2 * Math.PI * i) / 256)) // Sine wave with amplitude 0.1
    }
    mockAnalyser.getByteTimeDomainData.mockImplementation((array: Uint8Array) => {
      array.set(dataArray)
    })

    render(<AudioLevelMeter />)

    // Click start test button
    const button = screen.getByRole('button', { name: /начать тест/i })
    fireEvent.click(button)

    // Wait for monitoring to start
    await waitFor(() => {
      expect(mockSetLevel).toHaveBeenCalled()
    })

    // Check that setLevel was called with a value close to -23 dB (within 1dB accuracy)
    const calledValue = mockSetLevel.mock.calls[0][0]
    expect(calledValue).toBeGreaterThan(-24) // within 1dB accuracy
    expect(calledValue).toBeLessThan(-22)
  })
})