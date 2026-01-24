import { useEffect, useState, useRef } from 'react'
import { VoiceRecorder } from '@/lib/audio/recorder'

export function useAudioLevels(isRecording: boolean): number[] {
  const [levels, setLevels] = useState<number[]>([])
  const recorderRef = useRef<VoiceRecorder | null>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    if (isRecording) {
      recorderRef.current = new VoiceRecorder()
      recorderRef.current.start().catch(console.error)
    } else {
      if (recorderRef.current) {
        recorderRef.current.stop().catch(console.error)
        recorderRef.current.dispose()
        recorderRef.current = null
      }
      setLevels([])
    }
  }, [isRecording])

  useEffect(() => {
    if (!isRecording) return

    const updateLevels = () => {
      if (recorderRef.current) {
        const newLevels = recorderRef.current.getAudioLevels()
        setLevels(newLevels)
      }
      animationRef.current = requestAnimationFrame(updateLevels)
    }

    animationRef.current = requestAnimationFrame(updateLevels)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isRecording])

  return levels
}