/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import PermissionGuard from '@/components/PermissionGuard'

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
}))

const mockInvoke = vi.mocked(invoke)

describe('PermissionGuard', () => {
  it('shows permission setup screen when permissions are missing', async () => {
    mockInvoke.mockResolvedValue({ accessibility: false, microphone: false })

    render(<PermissionGuard><div>App Content</div></PermissionGuard>)

    expect(await screen.findByText('Setup Required')).toBeInTheDocument()
    expect(screen.getByText('Accessibility Permission')).toBeInTheDocument()
    expect(screen.getByText('Microphone Permission')).toBeInTheDocument()
  })
})