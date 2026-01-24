import { useEffect } from 'react'
import { useAudioDeviceStore } from '@/store/audio-device-store'

export function useAudioDevices() {
  const refreshDevices = useAudioDeviceStore(state => state.refreshDevices)

  useEffect(() => {
    // Initial load
    refreshDevices()

    // Listen for device changes
    const handleDeviceChange = () => {
      refreshDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)

    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [refreshDevices])
}