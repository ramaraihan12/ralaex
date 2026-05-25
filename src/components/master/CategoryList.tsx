'use client'

import { useState } from 'react'
import { Pencil, Trash2, Database, Plus } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import type { Category } from '@/lib/types'

interface CategoryListProps {
  categories: Category[]
  loading: boolean
  onToggle: (id: string, isActive: boolean) => Promise<{ success: boolean; error?: string }>
  onEdit: (category: Category) => void
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  onAddClick?: () => void
}

export function CategoryList({ categories, loading, onToggle, onEdit, onDelete, onAddClick }: CategoryListProps) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  if (loading) {
    return <div className="components-loading">Memuat kategori...</div>
  }

  if (categories.length === 0) {
    return (
      <div className="empty-state-card">
        <div className="empty-state-icon">
          <Database size={28} />
        </div>
        <h3>Belum Ada Kategori</h3>
        <p>Tambah kategori untuk mulai mencatat transaksi</p>
        {onAddClick && (
          <button className="btn btn-primary btn-primary-lg" onClick={onAddClick}>
            <Plus size={18} />
            Tambah Kategori
          </button>
        )}
      </div>
    )
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Hapus kategori "${name}"?`)) return

    setDeleting(id)
    setDeleteError(null)
    const result = await onDelete(id)
    if (!result.success) {
      setDeleteError(result.error || 'Gagal menghapus')
    }
    setDeleting(null)
  }

  return (
    <div className="category-list">
      {deleteError && <div className="form-error">{deleteError}</div>}

      {categories.map((cat) => {
        const Icon = getIcon(cat.icon)

        return (
          <div key={cat.id} className={`category-item ${!cat.is_active ? 'inactive' : ''}`}>
            <div
              className="category-icon"
              style={{ backgroundColor: cat.color + '1A', color: cat.color }}
            >
              <Icon size={20} />
            </div>

            <div className="category-info">
              <span className="category-name">{cat.name}</span>
            </div>

            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={cat.is_active}
                onChange={async (e) => {
                  await onToggle(cat.id, e.target.checked)
                }}
              />
              <span className="toggle-slider" />
            </label>

            <div className="category-actions">
              <button
                className="btn-icon action-btn"
                onClick={() => onEdit(cat)}
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                className="btn-icon action-btn danger"
                onClick={() => handleDelete(cat.id, cat.name)}
                disabled={deleting === cat.id}
                title="Hapus"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
