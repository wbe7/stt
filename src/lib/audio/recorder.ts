import type {
  VoiceRecorderConfig,
  RecordingState,
} from '@/types/audio'

export class VoiceRecorder {
  private audioContext: AudioContext | null = null
  private mediaStream: MediaStream | null = null
  private mediaRecorder: MediaRecorder | null = null
  private audioChunks: Blob[] = []
  private startTime: number = 0
  private config: VoiceRecorderConfig
  private state: RecordingState = {
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
  }
  private eventHandlers: Map<string, Set<(...args: unknown[]) => void>> = new Map()

  constructor(config?: Partial<VoiceRecorderConfig>) {
    this.config = {
      sampleRate: 44100,
      channelCount: 1,
      bitDepth: 16,
      ...config,
    }

    this.initializeAudioContext()
  }

  private initializeAudioContext(): void {
    try {
      if (typeof AudioContext !== 'undefined') {
        this.audioContext = new AudioContext({
          sampleRate: this.config.sampleRate,
        })
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error)
    }
  }

  async start(): Promise<void> {
    try {
      if (!this.audioContext) {
        this.initializeAudioContext()
      }

      if (!this.audioContext) {
        throw new Error('AudioContext not available')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: this.config.channelCount,
          sampleRate: this.config.sampleRate,
        },
      })

      this.mediaStream = stream
      this.mediaRecorder = new MediaRecorder(stream)
      this.audioChunks = []
      this.startTime = Date.now()

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data)
        }
      }

      this.mediaRecorder.onstop = () => {
        const blob = new Blob(this.audioChunks, {
          type: 'audio/webm',
        })
        this.state.audioBlob = blob
        this.state.isRecording = false
        this.emit('stateChange', this.state)
        this.emit('recordingStopped', this.state)
      }

      this.mediaRecorder.start(100)
      this.state.isRecording = true
      this.state.isPaused = false
      this.emit('stateChange', this.state)
      this.emit('recordingStarted', this.state)
    } catch (error) {
      this.emit('error', error)
      throw error
    }
  }

  async stop(): Promise<void> {
    if (this.mediaRecorder && this.state.isRecording) {
      return new Promise<void>((resolve) => {
        if (this.mediaRecorder) {
          const stopListener = () => {
            this.state.duration = Date.now() - this.startTime
            this.stopStream()
            resolve()
          }
          this.mediaRecorder.addEventListener('stop', stopListener, { once: true })
          this.mediaRecorder.stop()
        } else {
          resolve()
        }
      })
    }
  }

  async toggle(): Promise<void> {
    if (this.state.isRecording) {
      await this.stop()
    } else {
      await this.start()
    }
  }

  private stopStream(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop())
      this.mediaStream = null
    }
  }

  getAudioBlob(): Blob | null {
    return this.state.audioBlob
  }

  getState(): RecordingState {
    return { ...this.state }
  }

  on(event: string, handler: (...args: unknown[]) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set())
    }
    this.eventHandlers.get(event)?.add(handler)
  }

  off(event: string, handler: (...args: unknown[]) => void): void {
    this.eventHandlers.get(event)?.delete(handler)
  }

  private emit(event: string, data?: unknown): void {
    this.eventHandlers.get(event)?.forEach((handler) => handler(data))
  }

  reset(): void {
    this.state = {
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
    }
    this.audioChunks = []
  }

  dispose(): void {
    this.stop()
    this.reset()

    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }

    this.eventHandlers.clear()
  }
}
