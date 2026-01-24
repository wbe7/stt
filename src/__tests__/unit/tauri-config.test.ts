import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Tauri Configuration', () => {
  describe('Window Properties', () => {
    it('should have correct floating capsule window dimensions', () => {
      const configPath = join(__dirname, '../../../src-tauri/tauri.conf.json')
      const configContent = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configContent)

      const window = config.app.windows[0]

      expect(window.width).toBe(400)
      expect(window.height).toBe(60)
    })

    it('should be configured as transparent, always on top, with no decorations', () => {
      const configPath = join(__dirname, '../../../src-tauri/tauri.conf.json')
      const configContent = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configContent)

      const window = config.app.windows[0]

      expect(window.transparent).toBe(true)
      expect(window.alwaysOnTop).toBe(true)
      expect(window.decorations).toBe(false)
    })

    it('should be positioned at bottom-center, not centered', () => {
      const configPath = join(__dirname, '../../../src-tauri/tauri.conf.json')
      const configContent = readFileSync(configPath, 'utf-8')
      const config = JSON.parse(configContent)

      const window = config.app.windows[0]

      expect(window.center).toBe(false)
    })
  })
})