import type { SoundCue, SoundPlayerConfig } from '@/types/audio'

export class SoundPlayer {
  private config: SoundPlayerConfig
  private audioElements: Map<SoundCue, HTMLAudioElement> = new Map()

  constructor(config: SoundPlayerConfig) {
    this.config = config
    this.initializeAudioElements()
  }

  private initializeAudioElements(): void {
    const soundFiles: Record<SoundCue, string> = {
      start: '/start.mp3',
      stop: '/stop.mp3',
      success: '/success.mp3',
      error: '/error.mp3',
    }

    for (const [cue, file] of Object.entries(soundFiles)) {
      const audio = new Audio(file)
      audio.preload = 'auto'
      this.audioElements.set(cue as SoundCue, audio)
    }
  }

  play(cue: SoundCue): void {
    if (this.config.muteSounds) {
      return
    }

    const audio = this.audioElements.get(cue)
    if (audio) {
      audio.currentTime = 0
      audio.play().catch((error) => {
        console.warn(`Failed to play sound cue ${cue}:`, error)
      })
    }
  }

  updateConfig(config: Partial<SoundPlayerConfig>): void {
    this.config = { ...this.config, ...config }
  }
}