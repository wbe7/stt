export function calculateDBLevel(analyser: AnalyserNode): number {
  const dataArray = new Uint8Array(analyser.fftSize)
  analyser.getByteTimeDomainData(dataArray)
  let sum = 0
  for (let i = 0; i < dataArray.length; i++) {
    const sample = (dataArray[i] - 128) / 128
    sum += sample * sample
  }
  const rms = Math.sqrt(sum / dataArray.length)
  return rms === 0 ? -60 : Math.max(-60, Math.round(20 * Math.log10(rms)))
}