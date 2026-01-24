import React from 'react'
import { AVAILABLE_MODELS } from '@/types/settings'

interface ModelSelectorProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ModelSelector({ label, value, onChange }: ModelSelectorProps): React.JSX.Element {
  return (
    <div className="model-selector">
      <label className="model-label">{label}</label>
       <select
         value={value}
         onChange={(e) => onChange(e.target.value)}
         className="model-select"
         aria-label={label}
       >
        {AVAILABLE_MODELS.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name} - {model.description}
          </option>
        ))}
      </select>
    </div>
  )
}
