import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import Widget from '@/components/Widget'
import { useSystemTheme } from '@/hooks/useSystemTheme'

// Mock Tauri APIs
vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(() => Promise.resolve({ is_recording: false })),
}))

vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn(() => Promise.resolve(() => {})),
}))

vi.mock('@/hooks/useGlobalHotkey', () => ({
  useGlobalHotkey: vi.fn(() => ({
    registerHotkey: vi.fn(() => Promise.resolve()),
    error: null,
  })),
}))

vi.mock('@/hooks/useAudioLevels', () => ({
  useAudioLevels: vi.fn(() => []),
}))

vi.mock('@/hooks/useSystemTheme', () => ({
  useSystemTheme: vi.fn(() => 'light'),
}))

vi.mock('@/components/AudioVisualizer', () => ({
  AudioVisualizer: ({ state }: any) => <div data-testid={`audio-visualizer-${state}`} />,
}))



vi.mock('@/components/AudioVisualizer', () => ({
  AudioVisualizer: ({ state }: any) => <div data-testid={`audio-visualizer-${state}`} />,
}))

describe('Widget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with correct dimensions and transparency config', () => {
    render(<Widget />)
    const widget = screen.getByRole('main')
    expect(widget).toBeInTheDocument()
    expect(widget).toHaveClass('w-[400px]', 'h-[60px]', 'bg-transparent')
  })

  it('should show idle state initially', () => {
    render(<Widget />)
    expect(screen.getByText('Ready')).toBeInTheDocument()
  })

  it('should show audio visualizer when recording', () => {
    // Mock invoke to return is_recording: true
    const invokeMock = vi.fn(() => Promise.resolve({ is_recording: true }))
    vi.mocked(invoke).mockImplementation(invokeMock)

    render(<Widget />)
    // Since it's async, use waitFor
    waitFor(() => {
      expect(screen.getByTestId('audio-visualizer-listening')).toBeInTheDocument()
    })
  })

  it('should have fade-in transition within 200ms', () => {
    render(<Widget />)
    const widget = screen.getByRole('main')
    expect(widget).toHaveClass('transition-opacity', 'duration-200')
  })

  it('should apply light theme classes when system theme is light', () => {
    vi.mocked(useSystemTheme).mockReturnValue('light')

    render(<Widget />)
    const widget = screen.getByRole('main')
    expect(widget).toHaveClass('border-gray-300', 'text-gray-700', 'backdrop-blur-xl')
  })

  it('should apply dark theme classes when system theme is dark', () => {
    vi.mocked(useSystemTheme).mockReturnValue('dark')

    render(<Widget />)
    const widget = screen.getByRole('main')
    expect(widget).toHaveClass('border-slate-600', 'text-slate-300', 'backdrop-blur-xl')
  })

})