export type ContextMode = 'dev' | 'chat' | 'pro'

export interface FocusedAppInfo {
  bundle_id: string
  name: string
}

export interface ContextConfig {
  mode: ContextMode
  tone: 'casual' | 'formal' | 'preserve'
  editingLevel: 'minimal' | 'medium' | 'aggressive'
}