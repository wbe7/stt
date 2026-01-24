import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      appTitle: 'Voice Dictation',
      home: 'Home',
      history: 'History',
      settings: 'Settings',
      mainHeading: 'Turn Speech Into Text',
      mainDescription: 'AI-powered voice dictation with intelligent editing. Remove filler words, fix stuttering, and get polished text instantly.',
      holdToRecord: 'Hold to Record',
      holdToRecordDesc: 'Press and hold your hotkey to start recording',
      aiPowered: 'AI Powered',
      aiPoweredDesc: 'Intelligent editing removes filler words and fixes stuttering',
      hotkeyInstruction: 'Press <cmd>Cmd</cmd> + <shift>Shift</shift> + <v>V</v> to start recording',
      toggleModeInstruction: 'Add <space>Space</space> for toggle mode',
      hotkeyConflict: 'Hotkey conflict: {{error}}',
      recordingInProgress: 'Recording in progress...',
      loadingSettings: 'Loading settings...',
      loadingHistory: 'Loading history...',
    },
  },
  ru: {
    translation: {
      appTitle: 'Голосовое Диктование',
      home: 'Главная',
      history: 'История',
      settings: 'Настройки',
      mainHeading: 'Преобразование Речи в Текст',
      mainDescription: 'ИИ-диктовка с интеллектуальным редактированием. Удаляет слова-паразиты, исправляет заикание и мгновенно получает отполированный текст.',
      holdToRecord: 'Удерживайте для Записи',
      holdToRecordDesc: 'Нажмите и удерживайте горячую клавишу для начала записи',
      aiPowered: 'На Основе ИИ',
      aiPoweredDesc: 'Интеллектуальное редактирование удаляет слова-паразиты и исправляет заикание',
      hotkeyInstruction: 'Нажмите <cmd>Cmd</cmd> + <shift>Shift</shift> + <v>V</v> для начала записи',
      toggleModeInstruction: 'Добавьте <space>Space</space> для режима переключения',
      hotkeyConflict: 'Конфликт горячих клавиш: {{error}}',
      recordingInProgress: 'Идет запись...',
      loadingSettings: 'Загрузка настроек...',
      loadingHistory: 'Загрузка истории...',
    },
  },
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n