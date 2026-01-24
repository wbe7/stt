import { render, screen } from '@testing-library/react'
import { AudioVisualizer } from '@/components/AudioVisualizer'

describe('AudioVisualizer', () => {
  it('renders waveform canvas when in listening state', () => {
    render(<AudioVisualizer state="listening" audioLevels={[0.5, 0.8]} />)
    expect(screen.getByTestId('waveform-canvas')).toBeInTheDocument()
  })

  it('applies red/warm pulse animation for listening state', () => {
    render(<AudioVisualizer state="listening" audioLevels={[]} />)
    const container = screen.getByTestId('audio-visualizer')
    expect(container).toHaveClass('animate-pulse')
    expect(container).toHaveClass('bg-red-400') // warm red
  })

  it('applies blue/cool shimmer animation for thinking state', () => {
    render(<AudioVisualizer state="thinking" audioLevels={[0.5]} />)
    const container = screen.getByTestId('audio-visualizer')
    expect(container).toHaveClass('bg-blue-500')
    expect(container).toHaveClass('shimmer')
    expect(screen.getByTestId('waveform-canvas')).toBeInTheDocument()
  })

  it('shows green flash with checkmark for success state and fades out', () => {
    render(<AudioVisualizer state="success" audioLevels={[]} />)
    const container = screen.getByTestId('audio-visualizer')
    expect(container).toHaveClass('bg-green-500')
    expect(container).toHaveClass('animate-pulse')
    expect(screen.getByTestId('success-checkmark')).toBeInTheDocument()
    // Fade out would be checked in integration test
  })

  it('success state fades out within 300ms without delay', () => {
    render(<AudioVisualizer state="success" audioLevels={[]} />)
    const fadeDiv = screen.getByTestId('fade-overlay')
    expect(fadeDiv).toHaveClass('transition-opacity', 'duration-300')
    expect(fadeDiv).not.toHaveClass('delay-500', 'duration-2000')
  })

  it('uses backdrop-blur-xl', () => {
    render(<AudioVisualizer state="listening" audioLevels={[]} />)
    const container = screen.getByTestId('audio-visualizer')
    expect(container).toHaveClass('backdrop-blur-xl')
  })

  it('adapts to system dark/light theme', () => {
    render(<AudioVisualizer state="listening" audioLevels={[]} />)
    const container = screen.getByTestId('audio-visualizer')
    expect(container).toHaveClass('bg-white')
    expect(container).toHaveClass('dark:bg-slate-800')
  })
})