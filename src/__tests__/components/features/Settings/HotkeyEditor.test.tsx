import { render, screen, fireEvent } from '@testing-library/react'
import { HotkeyEditor } from '@/components/features/Settings/HotkeyEditor'

describe('HotkeyEditor', () => {
  const mockOnChange = vi.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders with initial value', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    expect(screen.getByText('Test')).toBeInTheDocument()
    expect(screen.getByText('V')).toBeInTheDocument()
  })

  it('enters recording mode when clicked', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    expect(screen.getByText('Нажмите сочетание...')).toBeInTheDocument()
  })

  it('captures single key', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    // Simulate pressing 'R' key
    fireEvent.keyDown(input, { key: 'R', code: 'KeyR' })

    expect(mockOnChange).toHaveBeenCalledWith('R')
  })

  it('captures key combination with modifiers', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    // Simulate pressing Ctrl+R
    fireEvent.keyDown(input, { key: 'R', code: 'KeyR', ctrlKey: true })

    expect(mockOnChange).toHaveBeenCalledWith('CommandOrControl+R')
  })

  it('ignores modifier keys alone', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    // Simulate pressing Shift alone
    fireEvent.keyDown(input, { key: 'Shift', code: 'ShiftLeft', shiftKey: true })

    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('exits recording mode after capturing hotkey', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    expect(screen.getByText('Нажмите сочетание...')).toBeInTheDocument()

    fireEvent.keyDown(input, { key: 'R', code: 'KeyR' })

    expect(mockOnChange).toHaveBeenCalledWith('R')
    expect(screen.getByText('V')).toBeInTheDocument() // value hasn't changed yet (controlled component)
  })

  it('exits recording mode on blur', () => {
    render(<HotkeyEditor label="Test" value="V" onChange={mockOnChange} />)

    const input = screen.getByRole('button')
    fireEvent.click(input)

    expect(screen.getByText('Нажмите сочетание...')).toBeInTheDocument()

    fireEvent.blur(input)

    expect(screen.getByText('V')).toBeInTheDocument()
  })
})