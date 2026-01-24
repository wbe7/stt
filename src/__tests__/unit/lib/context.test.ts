import { describe, it, expect } from 'vitest'
import { detectContextMode, getContextConfig } from '@/lib/context'
import type { FocusedAppInfo } from '@/types/context'

describe('Context Detection', () => {
  describe('detectContextMode', () => {
    it('should detect dev mode for VS Code', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.microsoft.VSCode',
        name: 'Visual Studio Code',
      }
      expect(detectContextMode(appInfo)).toBe('dev')
    })

    it('should detect dev mode for IntelliJ IDEA', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.jetbrains.intellij',
        name: 'IntelliJ IDEA',
      }
      expect(detectContextMode(appInfo)).toBe('dev')
    })

    it('should detect chat mode for Slack', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.slack.Slack',
        name: 'Slack',
      }
      expect(detectContextMode(appInfo)).toBe('chat')
    })

    it('should detect chat mode for Discord', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.discordapp.Discord',
        name: 'Discord',
      }
      expect(detectContextMode(appInfo)).toBe('chat')
    })

    it('should detect pro mode for Mail', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.apple.mail',
        name: 'Mail',
      }
      expect(detectContextMode(appInfo)).toBe('pro')
    })

    it('should default to pro mode for unknown apps', () => {
      const appInfo: FocusedAppInfo = {
        bundle_id: 'com.unknown.app',
        name: 'Unknown App',
      }
      expect(detectContextMode(appInfo)).toBe('pro')
    })
  })

  describe('getContextConfig', () => {
    it('should return dev config', () => {
      const config = getContextConfig('dev')
      expect(config).toEqual({
        tone: 'preserve',
        editingLevel: 'minimal',
      })
    })

    it('should return chat config', () => {
      const config = getContextConfig('chat')
      expect(config).toEqual({
        tone: 'casual',
        editingLevel: 'medium',
      })
    })

    it('should return pro config', () => {
      const config = getContextConfig('pro')
      expect(config).toEqual({
        tone: 'formal',
        editingLevel: 'aggressive',
      })
    })
  })
})