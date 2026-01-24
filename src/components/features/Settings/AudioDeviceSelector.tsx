import React from 'react'
import { useSettingsStore } from '@/store/settings-store'
import { useAudioDeviceStore } from '@/store/audio-device-store'

export function AudioDeviceSelector(): React.JSX.Element {
  const { settings, updateSettings } = useSettingsStore()
  const { inputDevices, isMonitoring, level, startMonitoring, stopMonitoring } = useAudioDeviceStore()

  const handleToggleMonitoring = async () => {
    if (isMonitoring) {
      stopMonitoring()
    } else {
      await startMonitoring(settings.selectedInputDevice)
    }
  }

  return (
    <div className="settings-section">
      <h3>Входное аудиоустройство</h3>
       <select
         value={settings.selectedInputDevice}
         onChange={(e) => updateSettings({ selectedInputDevice: e.target.value })}
         className="settings-select"
         aria-label="Входное аудиоустройство"
       >
        <option value="default">По умолчанию</option>
        {inputDevices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>

      <div className="mt-4">
        <button
          onClick={handleToggleMonitoring}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isMonitoring ? 'Остановить тест' : 'Тестировать микрофон'}
        </button>
        {isMonitoring && (
          <div className="mt-2">
            <div className="text-sm text-gray-600 mb-1">Уровень звука:</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${level}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{level}%</div>
          </div>
        )}
      </div>
    </div>
  )
}