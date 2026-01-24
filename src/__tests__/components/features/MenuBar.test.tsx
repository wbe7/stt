import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { MenuBar } from '@/components/features/MenuBar/MenuBar'
import { useGlobalHotkey } from '@/hooks/useGlobalHotkey'

// Mock the useGlobalHotkey hook
vi.mock('@/hooks/useGlobalHotkey')

describe('MenuBar Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.mocked(useGlobalHotkey).mockReturnValue({
      lastEvent: null,
      recordingState: null,
      error: null,
      registerHotkey: vi.fn(),
      unregisterHotkey: vi.fn(),
      registerToggleHotkey: vi.fn(),
      registerRecordHotkey: vi.fn(),
      registerCommitHotkey: vi.fn(),
      registerCancelHotkey: vi.fn(),
      getRecordingState: vi.fn(),
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should export MenuBar component', () => {
    expect(MenuBar).toBeDefined()
    expect(typeof MenuBar).toBe('function')
  })

  it('should auto-hide after 5 seconds of inactivity', () => {
    render(<MenuBar />)
    const menuBar = screen.getByRole('button', { name: /menu/i })
    expect(menuBar).toBeInTheDocument()

    // Initially visible
    expect(menuBar).toHaveClass('opacity-100')

    // Advance time by 5 seconds
    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(menuBar).toHaveClass('opacity-0')
  })

  it('should fade-in within 200ms on hotkey press', async () => {
    vi.mocked(useGlobalHotkey).mockReturnValue({
      lastEvent: { hotkey: 'space', state: 'pressed', timestamp: Date.now() },
      recordingState: null,
      error: null,
      registerHotkey: vi.fn(),
      unregisterHotkey: vi.fn(),
      registerToggleHotkey: vi.fn(),
      registerRecordHotkey: vi.fn(),
      registerCommitHotkey: vi.fn(),
      registerCancelHotkey: vi.fn(),
      getRecordingState: vi.fn(),
    })

    render(<MenuBar />)
    const menuBar = screen.getByRole('button', { name: /menu/i })

    // Should fade in quickly
    expect(menuBar).toHaveClass('transition-opacity')
    expect(menuBar).toHaveClass('duration-200')
    expect(menuBar).toHaveClass('opacity-100')
  })

  it('should shake animation on error', () => {
    vi.mocked(useGlobalHotkey).mockReturnValue({
      lastEvent: null,
      recordingState: null,
      error: 'Hotkey registration failed',
      registerHotkey: vi.fn(),
      unregisterHotkey: vi.fn(),
      registerToggleHotkey: vi.fn(),
      registerRecordHotkey: vi.fn(),
      registerCommitHotkey: vi.fn(),
      registerCancelHotkey: vi.fn(),
      getRecordingState: vi.fn(),
    })

    render(<MenuBar />)
    const menuBar = screen.getByRole('button', { name: /menu/i })

    expect(menuBar).toHaveClass('animate-shake')
  })
})
