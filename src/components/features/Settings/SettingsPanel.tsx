import React, { useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { isTauri } from '@tauri-apps/api/core'
import { useSettingsStore } from '@/store/settings-store'
import { HotkeyEditor } from './HotkeyEditor'
import { ModelSelector } from './ModelSelector'
import { AudioDeviceSelector } from './AudioDeviceSelector'
import { AudioLevelMeter } from './AudioLevelMeter'
import { useAudioDevices } from '@/hooks/useAudioDevices'
import { AVAILABLE_PROVIDERS } from '@/types/settings'

export function SettingsPanel(): React.JSX.Element {
  const { settings, updateSettings } = useSettingsStore()
  useAudioDevices()

  useEffect(() => {
    if (isTauri()) {
      const syncAutostart = async () => {
        try {
          const enabled = await invoke<boolean>('is_autostart_enabled')
          if (enabled !== settings.startAtLogin) {
            if (settings.startAtLogin) {
              await invoke('enable_autostart')
            } else {
              await invoke('disable_autostart')
            }
          }
        } catch (error) {
          console.error('Failed to sync autostart:', error)
        }
      }
      syncAutostart()
    }
  }, [settings.startAtLogin])

  return (
    <div className="settings-panel">
      <h2>Настройки</h2>

      <div className="settings-section">
        <h3>Режим записи</h3>
        <select
          value={settings.recordingMode}
          onChange={(e) => updateSettings({ recordingMode: e.target.value as 'hold' | 'toggle' })}
          className="settings-select"
          aria-label="Режим записи"
        >
          <option value="hold">Удерживать (Hold)</option>
          <option value="toggle">Переключатель (Toggle)</option>
        </select>
      </div>

      <div className="settings-section">
        <h3>Горячие клавиши</h3>
        <HotkeyEditor
          label="Запись"
          value={settings.recordHotkey}
          onChange={(value: string) => updateSettings({ recordHotkey: value })}
        />
        <HotkeyEditor
          label="Подтвердить"
          value={settings.commitHotkey}
          onChange={(value: string) => updateSettings({ commitHotkey: value })}
        />
        <HotkeyEditor
          label="Отмена"
          value={settings.cancelHotkey}
          onChange={(value: string) => updateSettings({ cancelHotkey: value })}
        />
      </div>

       <div className="settings-section">
         <h3>Провайдер AI</h3>
          <select
            value={settings.provider}
            onChange={(e) => updateSettings({ provider: e.target.value as 'openrouter' | 'openai' | 'groq' | 'ollama' })}
            className="settings-select"
            aria-label="Провайдер AI"
          >
           {AVAILABLE_PROVIDERS.map((provider) => (
             <option key={provider.id} value={provider.id}>
               {provider.name}: {provider.description}
             </option>
           ))}
         </select>
       </div>

       <div className="settings-section">
         <h3>Модели</h3>
         <ModelSelector
           label="Модель редактирования"
           value={settings.editModel}
           onChange={(value: string) => updateSettings({ editModel: value })}
         />
       </div>

       {settings.provider !== 'ollama' && (
         <div className="settings-section">
           <h3>API ключ {settings.provider === 'openrouter' ? 'OpenRouter' : settings.provider === 'openai' ? 'OpenAI' : 'Groq'}</h3>
            <input
              type="password"
              value={settings.apiKey}
              onChange={(e) => updateSettings({ apiKey: e.target.value })}
              placeholder={settings.provider === 'openrouter' ? 'sk-or-v1-...' : settings.provider === 'openai' ? 'sk-...' : 'gsk_...'}
              className="settings-select"
              aria-label={settings.provider === 'openrouter' ? 'API ключ OpenRouter' : settings.provider === 'openai' ? 'API ключ OpenAI' : 'API ключ Groq'}
            />
           <p className="text-xs text-slate-400 mt-2">
             {settings.provider === 'openrouter' && (
               <>
                 Получите ключ на{' '}
                 <a
                   href="https://openrouter.ai/keys"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300"
                 >
                   openrouter.ai
                 </a>
               </>
             )}
             {settings.provider === 'openai' && (
               <>
                 Получите ключ на{' '}
                 <a
                   href="https://platform.openai.com/api-keys"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300"
                 >
                   platform.openai.com
                 </a>
               </>
             )}
             {settings.provider === 'groq' && (
               <>
                 Получите ключ на{' '}
                 <a
                   href="https://console.groq.com/keys"
                   target="_blank"
                   rel="noopener noreferrer"
                   className="text-blue-400 hover:text-blue-300"
                 >
                   console.groq.com
                 </a>
               </>
             )}
            </p>
          </div>
        )}

        {settings.provider === 'openai' && (
          <div className="settings-section">
            <h3>Custom API Base URL</h3>
             <input
               type="url"
               value={settings.customBaseUrl}
               onChange={(e) => updateSettings({ customBaseUrl: e.target.value })}
               placeholder="https://api.openai.com/v1"
               className="settings-select"
               aria-label="Custom API Base URL"
             />
            <p className="text-xs text-slate-400 mt-2">
              Leave empty to use default OpenAI API. Supports Azure OpenAI, local servers, and other OpenAI-compatible endpoints.
            </p>
          </div>
        )}

         <div className="settings-section">
          <h3>UI Language</h3>
          <select
            value={settings.uiLanguage}
            onChange={(e) => updateSettings({ uiLanguage: e.target.value as 'en' | 'ru' })}
            className="settings-select"
            aria-label="UI Language"
          >
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>

        <div className="settings-section">
          <h3>Язык</h3>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ language: e.target.value })}
            className="settings-select"
            aria-label="Язык"
          >
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

       <AudioDeviceSelector />
       <AudioLevelMeter />

      <div className="settings-section">
        <h3>Уровень редактирования</h3>
        <select
          value={settings.editingLevel}
          onChange={(e) => updateSettings({ editingLevel: e.target.value as 'minimal' | 'medium' | 'aggressive' })}
          className="settings-select"
          aria-label="Уровень редактирования"
        >
          <option value="minimal">Минимальный</option>
          <option value="medium">Средний</option>
          <option value="aggressive">Агрессивный</option>
        </select>
      </div>

      <div className="settings-section">
        <h3>Другое</h3>
         <label className="settings-label">
           <input
             type="checkbox"
             checked={settings.autoPaste}
             onChange={(e) => updateSettings({ autoPaste: e.target.checked })}
             className="settings-checkbox"
             aria-label="Автоматически вставлять текст"
           />
           Автоматически вставлять текст
         </label>
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.showNotifications}
              onChange={(e) => updateSettings({ showNotifications: e.target.checked })}
              className="settings-checkbox"
              aria-label="Показывать уведомления"
            />
            Показывать уведомления
          </label>
           <label className="settings-label">
             <input
               type="checkbox"
               checked={settings.startAtLogin}
               onChange={(e) => updateSettings({ startAtLogin: e.target.checked })}
               className="settings-checkbox"
               aria-label="Запускать при входе в систему"
             />
             Запускать при входе в систему
           </label>
            <label className="settings-label">
              <input
                type="checkbox"
                checked={settings.muteSounds}
                onChange={(e) => updateSettings({ muteSounds: e.target.checked })}
                className="settings-checkbox"
                aria-label="Отключить звуки"
              />
              Отключить звуки
            </label>
       </div>

       <div className="settings-section">
         <h3>Вставка текста</h3>
         <div className="settings-label">
           <label>Метод вставки</label>
            <select
              value={settings.injectionMethod}
              onChange={(e) => updateSettings({ injectionMethod: e.target.value as 'accessibility' | 'clipboard' })}
              className="settings-select"
              aria-label="Метод вставки"
            >
             <option value="accessibility">Accessibility API</option>
             <option value="clipboard">Clipboard (Cmd+V)</option>
           </select>
         </div>
          <label className="settings-label">
            <input
              type="checkbox"
              checked={settings.smartSpacing}
              onChange={(e) => updateSettings({ smartSpacing: e.target.checked })}
              className="settings-checkbox"
              aria-label="Умные пробелы"
            />
            Умные пробелы
          </label>
       </div>

      <button
        onClick={() => useSettingsStore.getState().resetSettings()}
        className="settings-button settings-button-danger"
      >
        Сбросить настройки
      </button>
    </div>
  )
}
