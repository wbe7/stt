import { describe, it, expect } from 'vitest'
import { MenuBar } from '@/components/features/MenuBar/MenuBar'

describe('MenuBar Component', () => {
  it('should export MenuBar component', () => {
    expect(MenuBar).toBeDefined()
    expect(typeof MenuBar).toBe('function')
  })
})
