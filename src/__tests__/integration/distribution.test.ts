import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('Distribution and Updates', () => {
  it('should have Tauri updater configured', () => {
    const tauriConfigPath = path.join(__dirname, '../../../src-tauri/tauri.conf.json')
    const config = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf-8'))

    expect(config.updater).toBeDefined()
    expect(config.updater.active).toBe(true)
    expect(config.updater.endpoints).toBeDefined()
    expect(config.updater.endpoints.length).toBeGreaterThan(0)
  })

  it('should have macOS notarization configured', () => {
    const tauriConfigPath = path.join(__dirname, '../../../src-tauri/tauri.conf.json')
    const config = JSON.parse(fs.readFileSync(tauriConfigPath, 'utf-8'))

    expect(config.bundle).toBeDefined()
    expect(config.bundle.macOS).toBeDefined()
    expect(config.bundle.macOS.notarization).toBeDefined()
    expect(config.bundle.macOS.notarization.appleId).toBeDefined()
    expect(config.bundle.macOS.notarization.appleIdPassword).toBeDefined()
    expect(config.bundle.macOS.notarization.teamId).toBeDefined()
  })

  it('should have GitHub Actions workflow for CI/CD', () => {
    const workflowPath = path.join(__dirname, '../../../.github/workflows/build.yml')
    expect(fs.existsSync(workflowPath)).toBe(true)

    const workflow = fs.readFileSync(workflowPath, 'utf-8')
    expect(workflow).toContain('tauri-action')
    expect(workflow).toContain('macos-latest')
    expect(workflow).toContain('GITHUB_TOKEN')
  })
})