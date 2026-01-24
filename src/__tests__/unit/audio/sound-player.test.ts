import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SoundPlayer } from '@/lib/audio/sound-player'

// Mock Audio constructor and methods
const mockPlay = vi.fn().mockResolvedValue(undefined)
const mockAudioInstances: MockAudio[] = []

class MockAudio {
  play = mockPlay
  preload = ''
  currentTime = 0
  volume = 1.0
  src: string

  constructor(src: string) {
    this.src = src
    mockAudioInstances.push(this)
  }
}

vi.stubGlobal('Audio', MockAudio)

describe('SoundPlayer', () => {
  let soundPlayer: SoundPlayer

  beforeEach(() => {
    vi.clearAllMocks()
    mockAudioInstances.length = 0
    soundPlayer = new SoundPlayer({ muteSounds: false })
  })

  it('should play sound when not muted', () => {
    soundPlayer.play('start')

    expect(mockPlay).toHaveBeenCalled()
  })

  it('should not play sound when muted', () => {
    soundPlayer.updateConfig({ muteSounds: true })
    soundPlayer.play('stop')

    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('should handle play errors gracefully', async () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockPlay.mockRejectedValueOnce(new Error('Play failed'))

    soundPlayer.play('error')

    // Wait for next tick
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to play sound cue error:',
      expect.any(Error)
    )

    consoleWarnSpy.mockRestore()
  })

  it('should play sound at correct volume and timing', () => {
    soundPlayer.play('start')

    const startAudio = mockAudioInstances.find(a => a.src === '/start.mp3')
    expect(startAudio).toBeDefined()
    expect(startAudio!.volume).toBe(1.0)
    expect(startAudio!.currentTime).toBe(0)
    expect(mockPlay).toHaveBeenCalled()
  })
})