export async function transcribeAudio(audioBlob: Blob): Promise<{
  text: string
  language: string
  duration: number
}> {
  const formData = new FormData()
  formData.append('file', audioBlob)
  formData.append('model', 'whisper-1')

  const response = await fetch(
    'https://openrouter.ai/api/v1/audio/transcriptions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
      },
      body: formData,
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Transcription failed: ${error}`)
  }

  const data = await response.json()
  return {
    text: data.text,
    language: data.language,
    duration: data.duration,
  }
}

export async function editText(text: string, language: string = 'ru'): Promise<string> {
  const response = await fetch(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an intelligent text editor. Your task is to edit spoken text in ${language} language.

Rules:
1. Remove filler words: "ээ", "мээ", "хмм", "ну", "это", "типа", "короче"
2. Remove repeats and stuttering: "я я я" → "я"
3. Fix mispronounced words while preserving meaning
4. Add proper punctuation
5. Preserve original user tone
6. Keep technical terms in English (werf, docker, k8s, npm, etc.)
7. DO NOT rewrite the meaning, only fix the form

Examples:
Input: "нуу ээ это надо сделать деплой хмм через верфь"
Output: "Надо сделать деплой через werf"

Input: "я я я хочу чтобы ты написал код для рест апи"
Output: "Я хочу, чтобы ты написал код для REST API"

Edit the following text:`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
      }),
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Text editing failed: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}
