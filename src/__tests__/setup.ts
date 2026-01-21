import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom'

afterEach(() => {
  vi.restoreAllMocks()
})

class MockBlobEvent extends Event {
  readonly data: Blob
  readonly timecode: number

  constructor(type: string, eventInitDict: BlobEventInit) {
    super(type, eventInitDict)
    this.data = eventInitDict.data as unknown as Blob
    this.timecode = eventInitDict.timecode || 0
  }
}

class MockAudioBuffer {
  numberOfChannels: number
  length: number
  sampleRate: number
  private channelData: Float32Array[]

  constructor(options: { numberOfChannels: number; length: number; sampleRate: number }) {
    this.numberOfChannels = options.numberOfChannels
    this.length = options.length
    this.sampleRate = options.sampleRate
    this.channelData = []
    for (let i = 0; i < options.numberOfChannels; i++) {
      this.channelData.push(new Float32Array(options.length))
    }
  }

  getChannelData(channel: number): Float32Array {
    if (channel < 0 || channel >= this.channelData.length) {
      return new Float32Array(0)
    }
    return this.channelData[channel]
  }

  copyFromChannel(): void {}
  copyToChannel(): void {}
}

class MockAudioContext {
  private _audioWorklet: Record<string, unknown> = {}
  private _currentTime = 0
  private _state: AudioContextState = 'suspended'

  constructor() {
    this._audioWorklet = {}
  }

  get currentTime(): number {
    return this._currentTime
  }

  get state(): AudioContextState {
    return this._state
  }

  get sampleRate(): number {
    return 44100
  }

  get audioWorklet(): Record<string, unknown> {
    return this._audioWorklet
  }

  async decodeAudioData(audioData: ArrayBuffer): Promise<AudioBuffer> {
    if (!audioData || audioData.byteLength === 0) {
      throw new Error('Failed to decode audio data: empty or null')
    }
    return new MockAudioBuffer({
      numberOfChannels: 1,
      length: 44100,
      sampleRate: 44100,
    }) as unknown as AudioBuffer
  }

  async suspend(): Promise<void> {
    this._state = 'suspended'
  }

  async resume(): Promise<void> {
    this._state = 'running'
  }

  async close(): Promise<void> {
    this._state = 'closed'
  }

  createMediaStreamSource(): Record<string, unknown> {
    return {}
  }

  createMediaStreamDestination(): Record<string, unknown> {
    return { stream: {} }
  }

  createAnalyser(): Record<string, unknown> {
    return {}
  }

  createScriptProcessor(): Record<string, unknown> {
    return {}
  }
}

class MockMediaRecorder {
  stream: MediaStream
  mimeType: string
  state: RecordingState = 'inactive'
  ondataavailable: ((event: BlobEvent) => void) | null = null
  onstop: ((event: Event) => void) | null = null
  onstart: ((event: Event) => void) | null = null
  private _chunks: Blob[] = []
  private _listeners: Map<string, Set<(...args: unknown[]) => void>> = new Map()
  get chunks() {
    return this._chunks
  }
  addChunk(chunk: Blob) {
    this._chunks.push(chunk)
  }

  constructor(stream: MediaStream, options: MediaRecorderOptions = {}) {
    this.stream = stream
    this.mimeType = options.mimeType || 'audio/webm'
  }

  start(): void {
    this.state = 'recording'
    if (this.onstart) {
      this.onstart(new Event('start'))
    }
    this._dispatchEvent('start', new Event('start'))
  }

  stop(): void {
    this.state = 'inactive'
    if (this.ondataavailable) {
      const data = new (global.Blob as unknown as typeof Blob)([], {})
      this.ondataavailable(new MockBlobEvent('dataavailable', { data }))
    }
    if (this.onstop) {
      this.onstop(new Event('stop'))
    }
    this._dispatchEvent('stop', new Event('stop'))
  }

  pause(): void {
    this.state = 'paused'
  }

  resume(): void {
    this.state = 'recording'
  }

  addEventListener(event: string, handler: (...args: unknown[]) => void): void {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set())
    }
    this._listeners.get(event)?.add(handler)
  }

  removeEventListener(event: string, handler: (...args: unknown[]) => void): void {
    this._listeners.get(event)?.delete(handler)
  }

  private _dispatchEvent(event: string, eventObject: Event): void {
    this._listeners.get(event)?.forEach(handler => handler(eventObject))
  }

  static isTypeSupported(): boolean {
    return true
  }
}

const global = globalThis as typeof globalThis & {
  AudioContext: typeof AudioContext
  webkitAudioContext: typeof AudioContext
  MediaRecorder: typeof MediaRecorder
  navigator: Navigator & { mediaDevices: { getUserMedia: () => Promise<MediaStream> } }
  Blob: typeof Blob
  BlobEvent: typeof BlobEvent
  FormData: typeof FormData
}

global.AudioContext = MockAudioContext as unknown as typeof AudioContext
global.webkitAudioContext = MockAudioContext as unknown as typeof AudioContext
global.MediaRecorder = MockMediaRecorder as unknown as typeof MediaRecorder

global.FormData = class MockFormData {
  private _data: Map<string, string | Blob> = new Map()

  append(name: string, value: string | Blob): void {
    if (typeof value === 'string') {
      this._data.set(name, value)
    } else if (value instanceof Blob) {
      this._data.set(name, value)
    }
  }

  delete(name: string): void {
    this._data.delete(name)
  }

  get(name: string): FormDataEntryValue | null {
    const value = this._data.get(name)
    if (value === undefined || value === null) {
      return null
    }
    return value as FormDataEntryValue
  }

  getAll(name: string): FormDataEntryValue[] {
    const value = this._data.get(name)
    if (value === undefined || value === null) {
      return []
    }
    return [value as FormDataEntryValue]
  }

  has(name: string): boolean {
    return this._data.has(name)
  }

  set(name: string, value: string | Blob): void {
    this._data.set(name, value)
  }

  [Symbol.for('nodejs.util.inspect.custom')](): unknown {
    return `MockFormData {${Array.from(this._data.entries()).map(([k, v]) => `${k}: ${typeof v}`).join(', ')}}`
  }
} as unknown as typeof FormData

global.navigator = {
  mediaDevices: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: vi.fn(() => []),
      getAudioTracks: vi.fn(() => []),
      getVideoTracks: vi.fn(() => []),
    }),
  },
} as unknown as typeof global.navigator

global.Blob = class MockBlob {
  parts: unknown[]
  options: BlobPropertyBag
  size: number
  bytes: () => Promise<Uint8Array<ArrayBuffer>>

  constructor(parts: unknown[], options: BlobPropertyBag = {}) {
    this.parts = Array.isArray(parts) ? parts : []
    this.options = options
    this.size = this.parts.reduce((acc: number, part) => {
      if (part instanceof ArrayBuffer) {
        return acc + part.byteLength
      }
      if (part instanceof Uint8Array) {
        return acc + part.length
      }
      return acc + (part && typeof part === 'object' && 'length' in part ? (part as { length: number }).length || 0 : 0)
    }, 0)
    const buffer = new ArrayBuffer(this.size)
    this.bytes = async () => new Uint8Array(buffer)
  }

  get type(): string {
    return this.options.type || 'application/octet-stream'
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return new ArrayBuffer(this.size)
  }

  slice(): Blob {
    return new MockBlob([], {}) as unknown as Blob
  }

  text(): Promise<string> {
    return Promise.resolve('')
  }

  stream(): ReadableStream {
    return new ReadableStream()
  }
} as unknown as typeof Blob

global.BlobEvent = MockBlobEvent as unknown as typeof BlobEvent

type RecordingInfo = {
  is_recording: boolean
  mode: string
  start_time: number | null
}

type HotkeyEvent = {
  hotkey: string
  state: string
  timestamp: number
}

declare global {
  var RecordingInfo: RecordingInfo
  var HotkeyEvent: HotkeyEvent
}
