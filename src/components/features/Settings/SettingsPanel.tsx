import React from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { HotkeyEditor } from './HotkeyEditor'
import { ModelSelector } from './ModelSelector'

export function SettingsPanel(): React.JSX.Element {
  const { settings, updateSettings } = useSettingsStore()

  return (
    <div className="settings-panel">
      <h2>Настройки</h2>

      <div className="settings-section">
        <h3>Горячие клавиши</h3>
        <HotkeyEditor
          label="Запись"
          value={settings.hotkey}
          onChange={(value: string) => updateSettings({ hotkey: value })}
        />
        <HotkeyEditor
          label="Переключение"
          value={settings.toggleHotkey}
          onChange={(value: string) => updateSettings({ toggleHotkey: value })}
        />
      </div>

      <div className="settings-section">
        <h3>Модели</h3>
        <ModelSelector
          label="Модель редактирования"
          value={settings.editModel}
          onChange={(value: string) => updateSettings({ editModel: value })}
        />
      </div>

      <div className="settings-section">
        <h3>Язык</h3>
        <select
          value={settings.language}
          onChange={(e) => updateSettings({ language: e.target.value })}
          className="settings-select"
        >
          <option value="ru">Русский</option>
          <option value="en">English</option>
        </select>
      </div>

      <div className="settings-section">
        <h3>Уровень редактирования</h3>
        <select
          value={settings.editingLevel}
          onChange={(e) => updateSettings({ editingLevel: e.target.value as 'minimal' | 'medium' | 'aggressive' })}
          className="settings-select"
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
          />
          Автоматически вставлять текст
        </label>
        <label className="settings-label">
          <input
            type="checkbox"
            checked={settings.showNotifications}
            onChange={(e) => updateSettings({ showNotifications: e.target.checked })}
            className="settings-checkbox"
          />
          Показывать уведомления
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
