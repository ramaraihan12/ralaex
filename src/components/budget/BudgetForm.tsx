'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { formatRupiah, parseRupiah } from '@/lib/utils/currency'
import type { Category } from '@/lib/types'
import type { BudgetWithCategory } from '@/lib/hooks/useBudgets'

interface BudgetFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    category_id: string | null
    amount: number
    period: 'weekly' | 'monthly'
  }) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (
    id: string,
    data: {
      category_id: string | null
      amount: number
      period: 'weekly' | 'monthly'
    }
  ) => Promise<{ success: boolean; error?: string }>
  onDelete?: (id: string) => Promise<{ success: boolean; error?: string }>
  categories: Category[]
  budget?: BudgetWithCategory | null
}

export function BudgetForm({
  open,
  onClose,
  onSave,
  onUpdate,
  onDelete,
  categories,
  budget,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState<string>('')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('monthly')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!budget

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (budget) {
      setCategoryId(budget.category_id || '__overall__')
      setAmountDisplay(formatRupiah(budget.amount))
      setPeriod(budget.period)
    } else {
      setCategoryId('__overall__')
      setAmountDisplay('')
      setPeriod('monthly')
    }
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [budget])

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

    const finalCategoryId = categoryId === '__overall__' ? null : categoryId

    setSaving(true)
    if (isEditing && onUpdate) {
      const result = await onUpdate(budget!.id, {
        category_id: finalCategoryId,
        amount,
        period,
      })
      if (!result.success) setError(result.error || 'Gagal mengupdate anggaran')
      else onClose()
    } else {
      const result = await onSave({
        category_id: finalCategoryId,
        amount,
        period,
      })
      if (!result.success) setError(result.error || 'Gagal menambah anggaran')
      else onClose()
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!budget || !onDelete) return
    setDeleting(true)
    const result = await onDelete(budget.id)
    if (!result.success) setError(result.error || 'Gagal menghapus anggaran')
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
          <h2>{isEditing ? 'Edit Anggaran' : 'Tambah Anggaran'}</h2>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="budget-category">Kategori</label>
            <select
              id="budget-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="__overall__">Keseluruhan</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="budget-amount">Nominal Anggaran</label>
            <input
              id="budget-amount"
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
            <label>Periode</label>
            <div className="period-toggle">
              <button
                type="button"
                className={`period-toggle-btn ${period === 'weekly' ? 'active' : ''}`}
                onClick={() => setPeriod('weekly')}
              >
                Mingguan
              </button>
              <button
                type="button"
                className={`period-toggle-btn ${period === 'monthly' ? 'active' : ''}`}
                onClick={() => setPeriod('monthly')}
              >
                Bulanan
              </button>
            </div>
          </div>

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
