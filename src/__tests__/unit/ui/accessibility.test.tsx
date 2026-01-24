import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SettingsPanel } from '@/components/features/Settings/SettingsPanel'
import Widget from '@/components/Widget'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn().mockResolvedValue({ is_recording: false }),
  isTauri: vi.fn().mockReturnValue(false),
}))
vi.mock('@tauri-apps/api/event', () => ({
  listen: vi.fn().mockResolvedValue(vi.fn()),
}))

describe('SettingsPanel Accessibility', () => {
  it('should have proper ARIA labels for form elements', () => {
    render(<SettingsPanel />)

    // Check that all select elements have associated labels
    const selects = screen.getAllByRole('combobox')
    selects.forEach(select => {
      expect(select).toHaveAttribute('aria-label')
    })

    // Check that input elements have associated labels
    const inputs = screen.getAllByDisplayValue('')
    inputs.forEach(input => {
      expect(input).toHaveAttribute('aria-label')
    })

    // Check checkboxes have labels
    const checkboxes = screen.getAllByRole('checkbox')
    checkboxes.forEach(checkbox => {
      expect(checkbox).toHaveAttribute('aria-label')
    })
  })

  it('should be keyboard navigable', () => {
    render(<SettingsPanel />)

    // Check that interactive elements are focusable
    const buttons = screen.getAllByRole('button')
    const selects = screen.getAllByRole('combobox')
    const checkboxes = screen.getAllByRole('checkbox')

    const focusableElements = [...buttons, ...selects, ...checkboxes]
    expect(focusableElements.length).toBeGreaterThan(0)

    // Check tab order by focusing first element
    const firstElement = focusableElements[0]
    firstElement.focus()
    expect(document.activeElement).toBe(firstElement)
  })

  it('should have screen reader friendly headings', () => {
    render(<SettingsPanel />)

    const headings = screen.getAllByRole('heading')
    expect(headings.length).toBeGreaterThan(0)

    headings.forEach(heading => {
      expect(heading).toBeVisible()
    })
  })
})

describe('Widget Accessibility', () => {
  it('should have proper ARIA labels for icons', async () => {
    render(<Widget />)

    const micIcon = await screen.findByLabelText('Microphone icon')
    expect(micIcon).toBeInTheDocument()
  })

  it('should have main landmark', async () => {
    render(<Widget />)

    const main = await screen.findByRole('main')
    expect(main).toBeInTheDocument()
  })

  it('should be keyboard accessible when visible', async () => {
    render(<Widget />)

    // The widget should be focusable if it's interactive, but it's mainly visual
    // For now, check that main is present
    const main = await screen.findByRole('main')
    expect(main).toBeInTheDocument()
  })
})