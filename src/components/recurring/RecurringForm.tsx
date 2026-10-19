'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatRupiah, parseRupiah } from '@/lib/utils/currency'
import { firstExecution } from '@/lib/utils/recurring'
import type { Category } from '@/lib/types'
import type { RecurringWithCategory } from '@/lib/hooks/useRecurring'

interface RecurringFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    type: 'income' | 'outcome'
    amount: number
    category_id: string
    description?: string
    frequency: 'weekly' | 'monthly'
    day_of_week?: number | null
    day_of_month?: number | null
    next_execution: string
  }) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (
    id: string,
    data: {
      type: 'income' | 'outcome'
      amount: number
      category_id: string
      description?: string
      frequency: 'weekly' | 'monthly'
      day_of_week?: number | null
      day_of_month?: number | null
      next_execution: string
    }
  ) => Promise<{ success: boolean; error?: string }>
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>
  categories: Category[]
  item?: RecurringWithCategory | null
}

const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

export function RecurringForm({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  categories,
  item,
}: RecurringFormProps) {
  const [type, setType] = useState<'income' | 'outcome'>('outcome')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('monthly')
  const [dayOfWeek, setDayOfWeek] = useState<number>(0)
  const [dayOfMonth, setDayOfMonth] = useState<number>(1)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!item

  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (item) {
      setType(item.type)
      setAmountDisplay(formatRupiah(item.amount))
      setCategoryId(item.category_id)
      setDescription(item.description || '')
      setFrequency(item.frequency)
      setDayOfWeek(item.day_of_week ?? 0)
      setDayOfMonth(item.day_of_month ?? 1)
    } else {
      setType('outcome')
      setAmountDisplay('')
      setCategoryId('')
      setDescription('')
      setFrequency('monthly')
      setDayOfWeek(0)
      setDayOfMonth(1)
    }
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [item])



  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const amount = parseRupiah(amountDisplay)
    if (!amount || amount <= 0) {
      setError('Nominal tidak boleh kosong')
      return
    }

    if (!categoryId) {
      setError('Pilih kategori')
      return
    }

    const finalDow = frequency === 'weekly' ? dayOfWeek : null
    const finalDom = frequency === 'monthly' ? dayOfMonth : null
    const nextExecution = firstExecution(frequency, finalDow, finalDom)

    setSaving(true)
    if (isEditing && onUpdate) {
      const result = await onUpdate(item!.id, {
        type,
        amount,
        category_id: categoryId,
        description: description || undefined,
        frequency,
        day_of_week: finalDow,
        day_of_month: finalDom,
        next_execution: nextExecution,
      })
      if (!result.success) setError(result.error || 'Gagal mengupdate')
      else onClose()
    } else {
      const result = await onSave({
        type,
        amount,
        category_id: categoryId,
        description: description || undefined,
        frequency,
        day_of_week: finalDow,
        day_of_month: finalDom,
        next_execution: nextExecution,
      })
      if (!result.success) setError(result.error || 'Gagal menambah')
      else onClose()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!item || !onDelete) return
    setDeleting(true)
    const result = await onDelete(item.id)
    if (!result.success) setError(result.error || 'Gagal menghapus')
    else onClose()
    setDeleting(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setAmountDisplay('')
      return
    }
    setAmountDisplay(formatRupiah(parseInt(raw, 10)))
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? 'Edit Transaksi Berulang' : 'Tambah Transaksi Berulang'}</h2>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label>Tipe</label>
            <div className="period-toggle">
              <button
                type="button"
                className={`period-toggle-btn ${type === 'income' ? 'active' : ''}`}
                onClick={() => { setType('income'); setCategoryId('') }}
              >
                Pemasukan
              </button>
              <button
                type="button"
                className={`period-toggle-btn ${type === 'outcome' ? 'active' : ''}`}
                onClick={() => { setType('outcome'); setCategoryId('') }}
              >
                Pengeluaran
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="recurring-amount">Nominal</label>
            <input
              id="recurring-amount"
              type="text"
              inputMode="numeric"
              value={amountDisplay}
              onChange={handleAmountChange}
              placeholder="Rp 0"
              className="amount-input"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="recurring-category">Kategori</label>
            <select
              id="recurring-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">Pilih kategori...</option>
              {filteredCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="recurring-desc">Deskripsi (opsional)</label>
            <input
              id="recurring-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Gaji bulanan"
              className="amount-input"
            />
          </div>

          <div className="form-group">
            <label>Frekuensi</label>
            <div className="period-toggle">
              <button
                type="button"
                className={`period-toggle-btn ${frequency === 'weekly' ? 'active' : ''}`}
                onClick={() => setFrequency('weekly')}
              >
                Mingguan
              </button>
              <button
                type="button"
                className={`period-toggle-btn ${frequency === 'monthly' ? 'active' : ''}`}
                onClick={() => setFrequency('monthly')}
              >
                Bulanan
              </button>
            </div>
          </div>

          {frequency === 'weekly' && (
            <div className="form-group">
              <label>Hari Eksekusi</label>
              <div className="day-picker">
                {DAYS.map((day, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`day-picker-btn ${dayOfWeek === idx ? 'active' : ''}`}
                    onClick={() => setDayOfWeek(idx)}
                  >
                    {day.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {frequency === 'monthly' && (
            <div className="form-group">
              <label htmlFor="recurring-dom">Tanggal Eksekusi</label>
              <select
                id="recurring-dom"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(parseInt(e.target.value, 10))}
                className="form-select"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>
                    Tanggal {d}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="modal-actions">
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={deleting}
                style={{ marginRight: 'auto' }}
              >
                {deleting ? 'Menghapus...' : 'Hapus'}
              </button>
            )}
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
