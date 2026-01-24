import { renderHook, act } from '@testing-library/react'
import { useAudioLevels } from '@/hooks/useAudioLevels'
import { VoiceRecorder } from '@/lib/audio/recorder'

// Mock the VoiceRecorder
vi.mock('@/lib/audio/recorder')

describe('useAudioLevels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns empty array when not recording', () => {
    const mockRecorder = {
      start: vi.fn(),
      stop: vi.fn(),
      getAudioLevels: vi.fn().mockReturnValue([]),
      dispose: vi.fn(),
      getState: vi.fn().mockReturnValue({ isRecording: false }),
    }
    ;(VoiceRecorder as any).mockImplementation(function() { return mockRecorder })

    const { result } = renderHook(() => useAudioLevels(false))
    expect(result.current).toEqual([])
  })

  it('starts recording and returns audio levels when recording is true', async () => {
    const mockRecorder = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn(),
      getAudioLevels: vi.fn().mockReturnValue([0.1, 0.2, 0.3]),
      dispose: vi.fn(),
      getState: vi.fn().mockReturnValue({ isRecording: true }),
    }
    ;(VoiceRecorder as any).mockImplementation(function() { return mockRecorder })

    const { result } = renderHook(() => useAudioLevels(true))

    // Wait for start to be called
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(mockRecorder.start).toHaveBeenCalled()
    expect(result.current).toEqual([0.1, 0.2, 0.3])
  })

  it('stops recording when recording becomes false', async () => {
    const mockRecorder = {
      start: vi.fn().mockResolvedValue(undefined),
      stop: vi.fn().mockResolvedValue(undefined),
      getAudioLevels: vi.fn().mockReturnValue([]),
      dispose: vi.fn(),
      getState: vi.fn().mockReturnValue({ isRecording: false }),
    }
    ;(VoiceRecorder as any).mockImplementation(function() { return mockRecorder })

    const { rerender } = renderHook((recording) => useAudioLevels(recording), {
      initialProps: true,
    })

    // Start
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(mockRecorder.start).toHaveBeenCalled()

    // Stop
    rerender(false)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })
    expect(mockRecorder.stop).toHaveBeenCalled()
  })
})