'use client'

import { useState, useEffect, createElement } from 'react'
import { X } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import { IconPicker } from './IconPicker'
import { ColorPicker } from './ColorPicker'
import type { Category } from '@/lib/types'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSave: (
    data: { name: string; type: 'income' | 'outcome'; icon: string; color: string }
  ) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (
    id: string,
    data: { name: string; icon: string; color: string }
  ) => Promise<{ success: boolean; error?: string }>
  type: 'income' | 'outcome'
  category?: Category | null
}

export function CategoryForm({ open, onClose, onSave, onUpdate, type, category }: CategoryFormProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('ShoppingCart')
  const [color, setColor] = useState('#B8663B')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!category

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (category) {
      setName(category.name)
      setIcon(category.icon)
      setColor(category.color)
    } else {
      setName('')
      setIcon('ShoppingCart')
      setColor('#B8663B')
    }
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [category])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Nama kategori tidak boleh kosong')
      return
    }

    setSaving(true)
    if (isEditing && onUpdate) {
      const result = await onUpdate(category!.id, { name: name.trim(), icon, color })
      if (!result.success) setError(result.error || 'Gagal mengupdate kategori')
      else onClose()
    } else {
      const result = await onSave({ name: name.trim(), type, icon, color })
      if (!result.success) setError(result.error || 'Gagal menambah kategori')
      else onClose()
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Kategori' : 'Tambah Kategori'}</h2>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="cat-name">Nama Kategori</label>
            <input
              id="cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Gaji, Makan, Listrik"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Icon</label>
            <div className="selected-icon-preview">
              {createElement(getIcon(icon), { size: 24, style: { color } })}
              <span>{icon}</span>
            </div>
            <IconPicker selected={icon} onSelect={setIcon} />
          </div>

          <div className="form-group">
            <label>Warna</label>
            <ColorPicker selected={color} onSelect={setColor} />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
