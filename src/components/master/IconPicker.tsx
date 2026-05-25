'use client'

import { iconMap } from '@/lib/utils/icons'

interface IconPickerProps {
  selected: string
  onSelect: (icon: string) => void
}

const ICON_NAMES = Object.keys(iconMap).filter((k) => k !== 'Circle')

export function IconPicker({ selected, onSelect }: IconPickerProps) {
  return (
    <div className="icon-picker">
      {ICON_NAMES.map((name) => {
        const Icon = iconMap[name]
        return (
          <button
            key={name}
            type="button"
            className={`icon-picker-btn ${selected === name ? 'selected' : ''}`}
            onClick={() => onSelect(name)}
            title={name}
          >
            <Icon size={18} />
          </button>
        )
      })}
    </div>
  )
}
