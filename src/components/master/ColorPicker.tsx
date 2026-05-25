'use client'

interface ColorPickerProps {
  selected: string
  onSelect: (color: string) => void
}

const COLORS = [
  '#B8663B',
  '#6B8E3D',
  '#C9982E',
  '#C0392B',
  '#D4860A',
  '#E07A5F',
  '#3D405B',
  '#81B29A',
  '#F2CC8F',
  '#F4A261',
  '#45B7D1',
  '#96CEB4',
]

export function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div className="color-picker">
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={`color-picker-btn ${selected === color ? 'selected' : ''}`}
          style={{ backgroundColor: color }}
          onClick={() => onSelect(color)}
          title={color}
        />
      ))}
    </div>
  )
}
