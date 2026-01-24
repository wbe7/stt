import React, { useEffect, useRef } from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { useAudioDeviceStore } from '@/store/audio-device-store'
import { calculateDBLevel } from '@/lib/audio/level-calculator'

export function AudioLevelMeter(): React.JSX.Element {
  const { settings } = useSettingsStore()
  const { setLevel, isMonitoring, setMonitoring } = useAudioDeviceStore()
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationRef = useRef<number | null>(null)

  const startMonitoring = async () => {
    try {
      const constraints: MediaStreamConstraints = {
        audio: settings.selectedInputDevice === 'default' ? true : { deviceId: settings.selectedInputDevice }
      }
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      const audioContext = new AudioContext()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      analyserRef.current = analyser

      const updateLevel = () => {
        const db = calculateDBLevel(analyser)
        setLevel(db)
        animationRef.current = requestAnimationFrame(updateLevel)
      }

      updateLevel()
      setMonitoring(true)
    } catch (error) {
      console.error('Failed to start monitoring:', error)
    }
  }

  const stopMonitoring = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
      animationRef.current = null
    }
    analyserRef.current = null
    setLevel(0)
    setMonitoring(false)
  }

  useEffect(() => {
    return () => {
      stopMonitoring()
    }
  }, [])

  const level = useAudioDeviceStore(state => state.level)

  return (
    <div className="settings-section">
      <h3>Тест микрофона</h3>
      <button
        onClick={isMonitoring ? stopMonitoring : startMonitoring}
        className="settings-button"
      >
        {isMonitoring ? 'Остановить' : 'Начать тест'}
      </button>
       <div className="level-meter">
         <div className="level-bar" style={{ width: `${Math.max(0, level + 60)}%` }} />
         <span>{level}dB</span>
       </div>
    </div>
  )
}