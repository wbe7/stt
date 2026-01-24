import { describe, it, expect } from 'vitest'
import { detectContextMode, getContextConfig } from '@/lib/context'
import type { FocusedAppInfo } from '@/types/context'

describe('Context Adaptation Integration', () => {
  it('should detect focused app and adapt editing settings', () => {
    // Test VS Code detection
    const vscodeApp: FocusedAppInfo = {
      bundle_id: 'com.microsoft.VSCode',
      name: 'Visual Studio Code',
    }

    const mode = detectContextMode(vscodeApp)
    expect(mode).toBe('dev')

    const config = getContextConfig(mode)
    expect(config.tone).toBe('preserve')
    expect(config.editingLevel).toBe('minimal')
  })

  it('should adapt to different app contexts', () => {
    const apps: Array<{ app: FocusedAppInfo; expectedMode: string; expectedTone: string; expectedLevel: string }> = [
      {
        app: { bundle_id: 'com.microsoft.VSCode', name: 'VS Code' },
        expectedMode: 'dev',
        expectedTone: 'preserve',
        expectedLevel: 'minimal',
      },
      {
        app: { bundle_id: 'com.slack.Slack', name: 'Slack' },
        expectedMode: 'chat',
        expectedTone: 'casual',
        expectedLevel: 'medium',
      },
      {
        app: { bundle_id: 'com.apple.mail', name: 'Mail' },
        expectedMode: 'pro',
        expectedTone: 'formal',
        expectedLevel: 'aggressive',
      },
      {
        app: { bundle_id: 'com.unknown.app', name: 'Unknown' },
        expectedMode: 'pro',
        expectedTone: 'formal',
        expectedLevel: 'aggressive',
      },
    ]

    apps.forEach(({ app, expectedMode, expectedTone, expectedLevel }) => {
      const mode = detectContextMode(app)
      expect(mode).toBe(expectedMode)

      const config = getContextConfig(mode)
      expect(config.tone).toBe(expectedTone)
      expect(config.editingLevel).toBe(expectedLevel)
    })
  })

  it('should handle case-insensitive bundle ID matching', () => {
    const app: FocusedAppInfo = {
      bundle_id: 'COM.MICROSOFT.VSCODE', // uppercase
      name: 'VS Code',
    }

    const mode = detectContextMode(app)
    expect(mode).toBe('dev')
  })
})