import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Onboarding from '@/components/features/Onboarding/Onboarding'

describe('Onboarding', () => {
  it('guides users through permission setup and key features tutorial', () => {
    render(<Onboarding />)

    // Check for permission setup guidance
    expect(screen.getByText('Permission Setup')).toBeInTheDocument()
    expect(screen.getByText('Grant necessary permissions')).toBeInTheDocument()

    // Check for key features tutorial
    expect(screen.getByText('Global Hotkeys')).toBeInTheDocument()
    expect(screen.getByText('Use hotkeys to record')).toBeInTheDocument()
    expect(screen.getByText('Voice Recording')).toBeInTheDocument()
    expect(screen.getByText('Record your voice')).toBeInTheDocument()
    expect(screen.getByText('Text Editing')).toBeInTheDocument()
    expect(screen.getByText('AI-powered text editing')).toBeInTheDocument()
    expect(screen.getByText('Settings')).toBeInTheDocument()
    expect(screen.getByText('Customize your experience')).toBeInTheDocument()
  })
})