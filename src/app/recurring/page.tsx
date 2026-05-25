'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { RecurringCard } from '@/components/recurring/RecurringCard'
import { RecurringForm } from '@/components/recurring/RecurringForm'
import { useRecurring } from '@/lib/hooks/useRecurring'
import type { RecurringWithCategory } from '@/lib/hooks/useRecurring'
import { Plus, Repeat } from 'lucide-react'
import '@/styles/recurring.css'

export default function RecurringPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<RecurringWithCategory | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    items,
    categories,
    loading,
    error,
    addRecurring,
    updateRecurring,
    toggleRecurring,
    deleteRecurring,
  } = useRecurring()

  const handleEdit = (item: RecurringWithCategory) => {
    setEditingItem(item)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingItem(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    await deleteRecurring(id)
    setDeleting(null)
  }

  const handleToggle = async (id: string, currentActive: boolean) => {
    await toggleRecurring(id, currentActive)
  }

  return (
    <AppShell>
      <div className="page-container recurring-page">
        <div className="recurring-header">
          <h1>Transaksi Berulang</h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingItem(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>

        {loading ? (
          <div className="components-loading">
            <span>Memuat data...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Gagal Memuat</h3>
            <p>{error}</p>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <Repeat size={28} />
            </div>
            <h3>Belum Ada Transaksi Berulang</h3>
            <p>
              Tambahkan transaksi yang terjadi secara rutin seperti gaji bulanan,
              tagihan, atau cicilan. Transaksi akan dicatat otomatis sesuai jadwal.
            </p>
            <button
              className="btn btn-primary btn-primary-lg"
              onClick={() => {
                setEditingItem(null)
                setFormOpen(true)
              }}
            >
              <Plus size={18} />
              Tambah Transaksi Berulang
            </button>
          </div>
        ) : (
          <div className="recurring-list">
            {items.map((item) => (
              <RecurringCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
          </div>
        )}

        <RecurringForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={addRecurring}
          onUpdate={updateRecurring}
          onDelete={deleteRecurring}
          categories={categories}
          item={editingItem}
        />
      </div>
    </AppShell>
  )
}
