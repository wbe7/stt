import type { ContextMode, FocusedAppInfo, ContextConfig } from '@/types'

// Bundle ID patterns for different contexts
const DEV_BUNDLE_IDS = [
  'com.microsoft.VSCode',
  'com.apple.Xcode',
  'com.jetbrains.', // Covers IntelliJ IDEA, PyCharm, etc.
  'com.sublimetext.', // Sublime Text
  'com.macromates.TextMate',
  'com.github.atom',
  'com.visualstudio.code.oss', // VSCodium
]

const CHAT_BUNDLE_IDS = [
  'com.apple.iChat',
  'com.apple.Messages',
  'com.skype.skype',
  'com.discordapp.Discord',
  'com.slack.Slack',
  'com.whatsapp.WebClient',
  'com.facebook.Messenger',
  'com.tencent.qq',
  'com.telegram.desktop',
  'org.telegram.Telegram',
]

const PRO_BUNDLE_IDS = [
  'com.apple.mail',
  'com.microsoft.Outlook',
  'com.google.Chrome', // When used for professional work
  'com.apple.Notes',
  'com.apple.TextEdit',
  'com.barebones.textwrangler',
  'com.barebones.bbedit',
]

export function detectContextMode(focusedApp: FocusedAppInfo): ContextMode {
  const bundleId = focusedApp.bundle_id.toLowerCase()

  // Check for dev tools
  if (DEV_BUNDLE_IDS.some(id => bundleId.startsWith(id.toLowerCase()))) {
    return 'dev'
  }

  // Check for chat/messaging apps
  if (CHAT_BUNDLE_IDS.some(id => bundleId.startsWith(id.toLowerCase()))) {
    return 'chat'
  }

  // Check for professional apps
  if (PRO_BUNDLE_IDS.some(id => bundleId.startsWith(id.toLowerCase()))) {
    return 'pro'
  }

  // Default to professional mode
  return 'pro'
}

export function getContextConfig(mode: ContextMode): Omit<ContextConfig, 'mode'> {
  switch (mode) {
    case 'dev':
      return {
        tone: 'preserve',
        editingLevel: 'minimal', // Less aggressive editing for code-related text
      }
    case 'chat':
      return {
        tone: 'casual',
        editingLevel: 'medium',
      }
    case 'pro':
    default:
      return {
        tone: 'formal',
        editingLevel: 'aggressive', // More polished for professional communication
      }
  }
}