import { CheckCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface AudioVisualizerProps {
  state: 'listening' | 'thinking' | 'success'
  audioLevels: number[]
}

export function AudioVisualizer({ state, audioLevels }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw waveform bars
    const barWidth = 4
    const gap = 1
    const totalWidth = audioLevels.length * (barWidth + gap) - gap
    const startX = (canvas.width - totalWidth) / 2

    audioLevels.forEach((level, index) => {
      const x = startX + index * (barWidth + gap)
      const barHeight = level * canvas.height
      const y = canvas.height - barHeight

      // Set color based on state
      if (state === 'listening') {
        ctx.fillStyle = '#ef4444' // red-500
      } else if (state === 'thinking') {
        ctx.fillStyle = '#3b82f6' // blue-500
      } else {
        ctx.fillStyle = '#6b7280' // gray-500
      }

      ctx.fillRect(x, y, barWidth, barHeight)
    })
  }, [audioLevels, state])

  const getContainerClasses = () => {
    let base = 'fixed inset-0 backdrop-blur-xl flex items-center justify-center transition-all duration-500 bg-white dark:bg-slate-800'
    if (state === 'listening') {
      base += ' bg-red-400 animate-pulse'
    } else if (state === 'thinking') {
      base += ' bg-blue-500 shimmer'
    } else if (state === 'success') {
      base += ' bg-green-500 animate-pulse opacity-0'
    }
    return base
  }

  if (state === 'success') {
    return (
      <div data-testid="audio-visualizer" className={getContainerClasses()}>
        <CheckCircle data-testid="success-checkmark" className="w-16 h-16 text-green-500 animate-bounce" />
        <div data-testid="fade-overlay" className="absolute inset-0 bg-green-500 animate-pulse opacity-50 transition-opacity duration-300 opacity-0" />
      </div>
    )
  }

  return (
    <div data-testid="audio-visualizer" className={getContainerClasses()}>
      <canvas
        ref={canvasRef}
        data-testid="waveform-canvas"
        width={400}
        height={128}
        className="w-full max-w-md h-32"
      />
    </div>
  )
}