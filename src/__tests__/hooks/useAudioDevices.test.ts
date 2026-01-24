// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAudioDevices } from '@/hooks/useAudioDevices'
import { useAudioDeviceStore } from '@/store/audio-device-store'

describe('useAudioDevices', () => {
  it('should refresh devices on mount', () => {
    const refreshDevices = vi.spyOn(useAudioDeviceStore.getState(), 'refreshDevices')

    renderHook(() => useAudioDevices())

    expect(refreshDevices).toHaveBeenCalled()
  })

  it('should add devicechange listener', () => {
    const addEventListener = vi.spyOn(navigator.mediaDevices, 'addEventListener')

    renderHook(() => useAudioDevices())

    expect(addEventListener).toHaveBeenCalledWith('devicechange', expect.any(Function))
  })

  it('should remove devicechange listener on unmount', () => {
    const removeEventListener = vi.spyOn(navigator.mediaDevices, 'removeEventListener')

    const { unmount } = renderHook(() => useAudioDevices())
    unmount()

    expect(removeEventListener).toHaveBeenCalledWith('devicechange', expect.any(Function))
  })

  it('should refresh devices when devicechange event fires', () => {
    const refreshDevices = vi.spyOn(useAudioDeviceStore.getState(), 'refreshDevices')
    refreshDevices.mockClear() // Clear previous calls

    renderHook(() => useAudioDevices())

    // Should be called once on mount
    expect(refreshDevices).toHaveBeenCalledTimes(1)

    // Simulate devicechange event
    const event = new Event('devicechange')
    navigator.mediaDevices.dispatchEvent(event)

    // Should be called again
    expect(refreshDevices).toHaveBeenCalledTimes(2)
  })
})