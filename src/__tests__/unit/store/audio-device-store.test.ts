import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAudioDeviceStore } from '@/store/audio-device-store'

describe('audio-device-store', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAudioDeviceStore.setState({
      inputDevices: [],
      isMonitoring: false,
      level: 0,
    })
  })

  it('should initialize with default state', () => {
    const state = useAudioDeviceStore.getState()

    expect(state.inputDevices).toEqual([])
    expect(state.isMonitoring).toBe(false)
    expect(state.level).toBe(0)
  })

  it('should set input devices', () => {
    const devices = [
      { deviceId: 'mic1', label: 'Mic 1', kind: 'audioinput' as const },
      { deviceId: 'mic2', label: 'Mic 2', kind: 'audioinput' as const },
    ]

    useAudioDeviceStore.getState().setInputDevices(devices)
    const state = useAudioDeviceStore.getState()

    expect(state.inputDevices).toEqual(devices)
  })



  it('should set monitoring state', () => {
    useAudioDeviceStore.getState().setMonitoring(true)
    const state = useAudioDeviceStore.getState()

    expect(state.isMonitoring).toBe(true)
  })

  it('should set level', () => {
    useAudioDeviceStore.getState().setLevel(50)
    const state = useAudioDeviceStore.getState()

    expect(state.level).toBe(50)
  })

  it('should refresh devices', async () => {
    await useAudioDeviceStore.getState().refreshDevices()
    const state = useAudioDeviceStore.getState()

    expect(navigator.mediaDevices.enumerateDevices).toHaveBeenCalled()
    expect(state.inputDevices).toEqual([
      { deviceId: 'default', label: 'Default Microphone', kind: 'audioinput' },
      { deviceId: 'mic1', label: 'Microphone 1', kind: 'audioinput' },
    ])
  })
})