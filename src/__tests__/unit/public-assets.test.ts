import { describe, it, expect } from 'vitest'
import { existsSync } from 'fs'
import { join } from 'path'

describe('Public Assets', () => {
  const publicDir = join(process.cwd(), 'public')

  it('should have sound cue files', () => {
    const soundFiles = ['start.mp3', 'stop.mp3', 'success.mp3', 'error.mp3']

    for (const file of soundFiles) {
      const filePath = join(publicDir, file)
      expect(existsSync(filePath)).toBe(true)
    }
  })
})