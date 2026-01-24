import React, { useState } from 'react'

interface HotkeyEditorProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function HotkeyEditor({ label, value, onChange }: HotkeyEditorProps): React.JSX.Element {
  const [isRecording, setIsRecording] = useState(false)

  const handleRecordClick = () => {
    setIsRecording(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isRecording) return

    const modifiers: string[] = []
    if (e.metaKey) modifiers.push('CommandOrControl')
    if (e.ctrlKey) modifiers.push('CommandOrControl')
    if (e.shiftKey) modifiers.push('Shift')
    if (e.altKey) modifiers.push('Alt')

    const key = e.key
    if (key === 'Shift' || key === 'Control' || key === 'Alt' || key === 'Meta') return

    // Allow single keys or combinations with modifiers
    const hotkey = modifiers.length > 0 ? [...modifiers, key].join('+') : key
    onChange(hotkey)
    setIsRecording(false)
  }

  const handleBlur = () => {
    setIsRecording(false)
  }

  return (
    <div className="hotkey-editor">
      <label className="hotkey-label">{label}</label>
      <div
        className={`hotkey-input ${isRecording ? 'hotkey-input-recording' : ''}`}
        tabIndex={0}
        onClick={handleRecordClick}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        role="button"
        aria-label={`${label} горячая клавиша`}
      >
        {isRecording ? 'Нажмите сочетание...' : value}
      </div>
    </div>
  )
}
