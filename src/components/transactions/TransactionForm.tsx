'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { formatRupiah, parseRupiah } from '@/lib/utils/currency'
import type { Transaction, Category } from '@/lib/types'

interface TransactionFormProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    type: 'income' | 'outcome'
    amount: number
    category_id: string
    description?: string
    date: string
    receipt_url?: string
  }) => Promise<{ success: boolean; error?: string }>
  onUpdate?: (
    id: string,
    data: {
      amount: number
      category_id: string
      description?: string
      date: string
      receipt_url?: string
    }
  ) => Promise<{ success: boolean; error?: string }>
  type: 'income' | 'outcome'
  categories: Category[]
  transaction?: Transaction | null
}

export function TransactionForm({
  open,
  onClose,
  onSave,
  onUpdate,
  type,
  categories,
  transaction,
}: TransactionFormProps) {
  const [amountDisplay, setAmountDisplay] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEditing = !!transaction

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (transaction) {
      setAmountDisplay(formatRupiah(transaction.amount))
      setCategoryId(transaction.category_id)
      setDescription(transaction.description || '')
      setDate(transaction.date)
      setReceiptUrl(transaction.receipt_url || undefined)
    } else {
      setAmountDisplay('')
      setCategoryId('')
      setDescription('')
      setDate(new Date().toISOString().slice(0, 10))
      setReceiptUrl(undefined)
    }
    setError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [transaction])

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

    if (!date) {
      setError('Pilih tanggal')
      return
    }

    setSaving(true)

    if (isEditing && onUpdate) {
      const result = await onUpdate(transaction!.id, {
        amount,
        category_id: categoryId,
        description: description.trim() || undefined,
        date,
        receipt_url: receiptUrl,
      })
      if (!result.success) setError(result.error || 'Gagal mengupdate transaksi')
      else onClose()
    } else {
      const result = await onSave({
        type,
        amount,
        category_id: categoryId,
        description: description.trim() || undefined,
        date,
        receipt_url: receiptUrl,
      })
      if (!result.success) setError(result.error || 'Gagal menambah transaksi')
      else {
        onClose()
      }
    }

    setSaving(false)
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '')
    if (!raw) {
      setAmountDisplay('')
      return
    }
    const num = parseInt(raw, 10)
    setAmountDisplay(formatRupiah(num))
  }

  const typeLabel = type === 'income' ? 'Pemasukan' : 'Pengeluaran'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? `Edit ${typeLabel}` : `Tambah ${typeLabel}`}</h2>
          <button className="btn-icon modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="transaction-form">
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="tx-amount">Nominal</label>
            <input
              id="tx-amount"
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
            <label htmlFor="tx-category">Kategori</label>
            <select
              id="tx-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="form-select"
            >
              <option value="">Pilih Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tx-date">Tanggal</label>
            <input
              id="tx-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="tx-desc">Deskripsi (opsional)</label>
            <input
              id="tx-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Catatan transaksi"
            />
          </div>

          <div className="form-group">
            <label>Foto Bukti (opsional)</label>
            <FileUpload value={receiptUrl} onChange={setReceiptUrl} />
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
