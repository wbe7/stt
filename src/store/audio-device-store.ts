import { create } from 'zustand'

export interface AudioDevice {
  deviceId: string
  label: string
  kind: 'audioinput' | 'audiooutput'
}

interface AudioDeviceState {
  inputDevices: AudioDevice[]
  isMonitoring: boolean
  level: number // 0-100
  analyser: AnalyserNode | null
  stream: MediaStream | null
  setInputDevices: (devices: AudioDevice[]) => void
  setMonitoring: (monitoring: boolean) => void
  setLevel: (level: number) => void
  refreshDevices: () => Promise<void>
  startMonitoring: (deviceId?: string) => Promise<void>
  stopMonitoring: () => void
}

export const useAudioDeviceStore = create<AudioDeviceState>((set, get) => ({
  inputDevices: [],
  isMonitoring: false,
  level: 0,
  analyser: null,
  stream: null,

  setInputDevices: (devices) => set({ inputDevices: devices }),

  setMonitoring: (monitoring) => set({ isMonitoring: monitoring }),

  setLevel: (level) => set({ level }),

  refreshDevices: async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const inputDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: device.kind as 'audioinput'
        }))
      set({ inputDevices })
    } catch (error) {
      console.error('Failed to enumerate devices:', error)
    }
  },

  startMonitoring: async (deviceId = 'default') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId === 'default' ? undefined : deviceId }
      })
      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyser.fftSize = 256
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      const updateLevel = () => {
        if (!get().isMonitoring) return
        analyser.getByteFrequencyData(dataArray)
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length
        const level = Math.round((average / 255) * 100)
        set({ level })
        requestAnimationFrame(updateLevel)
      }

      set({ isMonitoring: true, analyser, stream })
      updateLevel()
    } catch (error) {
      console.error('Failed to start monitoring:', error)
    }
  },

  stopMonitoring: () => {
    const { stream, analyser } = get()
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    if (analyser) {
      analyser.disconnect()
    }
    set({ isMonitoring: false, level: 0, analyser: null, stream: null })
  }
}))