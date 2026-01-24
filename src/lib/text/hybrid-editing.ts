import { editTextLocally } from './editing'
import { editText } from '@/lib/api/openrouter/edit'
import type { EditOptions } from './editing'
import type { EditConfig, EditResponseWrapper } from '@/lib/api/openrouter/edit-types'

interface HybridEditOptions extends EditOptions {
  editingLevel: 'minimal' | 'medium' | 'aggressive' | 'local'
  mode?: EditConfig['mode']
  provider?: EditConfig['provider']
  apiKey?: string
  customBaseUrl?: string
  model?: string
}

export async function editTextHybrid(
  text: string,
  options: HybridEditOptions
): Promise<EditResponseWrapper> {
  // For basic tasks (minimal, medium), use only local processing
  if (options.editingLevel === 'minimal' || options.editingLevel === 'medium') {
    const localEdited = editTextLocally(text, options)
    return {
      success: true,
      data: { editedText: localEdited },
    }
  }

  // For complex operations (aggressive), use cloud processing
  // For chat mode, skip local processing and go directly to cloud
  if (options.editingLevel === 'aggressive') {
    const inputText = options.mode === 'chat' ? text : editTextLocally(text, options)

    const cloudResult = await editText(inputText, {
      mode: options.mode || 'aggressive',
      tone: options.tone,
      provider: options.provider,
      apiKey: options.apiKey,
      customBaseUrl: options.customBaseUrl,
      model: options.model,
    })

    if (cloudResult.success) {
      return cloudResult
    }

    // Fallback to local if cloud fails
    const localEdited = editTextLocally(text, options)
    return {
      success: true,
      data: { editedText: localEdited },
    }
  }

  // For 'local' editing level, use only local
  const localEdited = editTextLocally(text, options)
  return {
    success: true,
    data: { editedText: localEdited },
  }
}