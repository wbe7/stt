import type {
  SilenceDetectionConfig,
} from '@/types/audio'

export interface SilenceDetectionResult {
  isSilent: boolean
  duration: number
  silenceStart: number | null
}

export class SilenceDetector {
  private config: SilenceDetectionConfig
  private silenceStart: number | null = null
  private totalSilenceDuration: number = 0
  private lastSampleTime: number = 0

  constructor(config?: Partial<SilenceDetectionConfig>) {
    this.config = {
      threshold: 0.01,
      minSilenceDuration: 500,
      maxSilenceDuration: 2000,
      ...config,
    }
  }

  detect(buffer: Float32Array, sampleRate: number): SilenceDetectionResult {
    let isSilent = true
    let silenceStart: number | null = null
    let currentSilenceDuration = 0

    for (let i = 0; i < buffer.length; i++) {
      const sample = Math.abs(buffer[i])

      if (sample > this.config.threshold) {
        isSilent = false

        if (this.silenceStart !== null) {
          const silenceDuration = (this.lastSampleTime - this.silenceStart) * 1000

          if (silenceDuration >= this.config.minSilenceDuration) {
            this.totalSilenceDuration += silenceDuration / 1000
          }

          this.silenceStart = null
        }
      } else if (this.silenceStart === null) {
        this.silenceStart = this.lastSampleTime
      }

      this.lastSampleTime += 1 / sampleRate
    }

    if (isSilent && this.silenceStart !== null) {
      silenceStart = this.silenceStart
      currentSilenceDuration = this.lastSampleTime - this.silenceStart

      const currentMs = currentSilenceDuration * 1000
      if (currentMs >= this.config.minSilenceDuration) {
        if (currentMs >= this.config.maxSilenceDuration) {
          this.config.onSilenceDetected?.()
        }
      }
    }

    return {
      isSilent,
      duration: Math.round((this.totalSilenceDuration + currentSilenceDuration) * 1000),
      silenceStart,
    }
  }

  reset(): void {
    this.silenceStart = null
    this.totalSilenceDuration = 0
    this.lastSampleTime = 0
  }

  getConfig(): SilenceDetectionConfig {
    return { ...this.config }
  }
}
