export class AudioConverter {
  private readonly WAV_HEADER_SIZE = 44
  private readonly MAX_FILE_SIZE = 26214400 // 25MB

  async convertToWav(
    blob: Blob,
    sampleRate: number = 44100,
    channels: number = 1
  ): Promise<Blob | null> {
    if (blob.size === 0) {
      throw new Error('Blob size is zero')
    }

    const format = this.detectFormat(blob)
    if (format === 'unknown') {
      throw new Error('Unsupported audio format')
    }

    const arrayBuffer = await blob.arrayBuffer()
    const audioData = await this.decodeAudioData(arrayBuffer)

    if (!audioData) {
      throw new Error('Failed to decode audio data')
    }

    const wavData = this.encodeWav(audioData, sampleRate, channels)

    return new Blob([wavData], { type: 'audio/wav' })
  }

  private async decodeAudioData(arrayBuffer: ArrayBuffer): Promise<AudioBuffer | null> {
    try {
      const audioContext = new AudioContext()
      return await audioContext.decodeAudioData(arrayBuffer)
    } catch {
      throw new Error('Failed to decode audio data')
    }
  }

  private encodeWav(
    audioBuffer: AudioBuffer,
    sampleRate: number,
    channels: number
  ): ArrayBuffer {
    const numChannels = Math.min(channels, audioBuffer.numberOfChannels)
    const samples = audioBuffer.length
    const sampleSize = 2 // 16-bit
    const byteRate = sampleRate * numChannels * sampleSize
    const dataSize = samples * numChannels * sampleSize
    const totalSize = this.WAV_HEADER_SIZE + dataSize

    const buffer = new ArrayBuffer(totalSize)
    const view = new DataView(buffer)

    // RIFF header
    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, totalSize - 8, true)
    this.writeString(view, 8, 'WAVE')

    // fmt chunk
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, 1, true) // PCM format
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, byteRate, true)
    view.setUint16(32, numChannels * sampleSize, true) // block align
    view.setUint16(34, sampleSize * 8, true) // bits per sample

    // data chunk
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    // Write audio data
    const channelData: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channelData.push(audioBuffer.getChannelData(i))
    }

    let offset = this.WAV_HEADER_SIZE
    for (let i = 0; i < samples; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = channelData[ch][i]
        const clamped = Math.max(-1, Math.min(1, sample))
        const intSample = Math.floor(clamped * 0x7fff)
        view.setInt16(offset, intSample, true)
        offset += 2
      }
    }

    return buffer
  }

  private writeString(view: DataView, offset: number, string: string): void {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i))
    }
  }

  detectFormat(blob: Blob): string {
    const type = blob.type.toLowerCase()
    
    if (type.includes('webm')) {
      return 'webm'
    }
    if (type.includes('wav')) {
      return 'wav'
    }
    if (type.includes('ogg')) {
      return 'ogg'
    }
    if (type.includes('mp4')) {
      return 'mp4'
    }
    
    return 'unknown'
  }

  async compress(blob: Blob, maxFileSize: number = this.MAX_FILE_SIZE): Promise<Blob> {
    if (blob.size <= maxFileSize) {
      return blob
    }

    const compressionRatio = maxFileSize / blob.size
    const compressedData = await this.compressAudio(blob, compressionRatio)

    return new Blob([compressedData], { type: blob.type })
  }

  private async compressAudio(blob: Blob, ratio: number): Promise<ArrayBuffer> {
    const arrayBuffer = await blob.arrayBuffer()
    const newSize = Math.floor(arrayBuffer.byteLength * ratio)
    
    return arrayBuffer.slice(0, newSize)
  }
}
