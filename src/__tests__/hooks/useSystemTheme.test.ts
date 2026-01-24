import { renderHook } from '@testing-library/react'
import { useSystemTheme } from '@/hooks/useSystemTheme'

// Mock matchMedia
const mockMatchMedia = vi.fn()
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: mockMatchMedia,
})

describe('useSystemTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns "dark" when system prefers dark theme', () => {
    mockMatchMedia.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useSystemTheme())
    expect(result.current).toBe('dark')
  })

  it('returns "light" when system prefers light theme', () => {
    mockMatchMedia.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    const { result } = renderHook(() => useSystemTheme())
    expect(result.current).toBe('light')
  })


})