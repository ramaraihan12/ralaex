'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown } from 'lucide-react'
import { FileUpload } from './FileUpload'
import { formatRupiah, parseRupiah } from '@/lib/utils/currency'
import type { Category } from '@/lib/types'

interface QuickAddModalProps {
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
  incomeCategories: Category[]
  outcomeCategories: Category[]
}

export function QuickAddModal({
  open,
  onClose,
  onSave,
  incomeCategories,
  outcomeCategories,
}: QuickAddModalProps) {
  const [mode, setMode] = useState<'income' | 'outcome'>('outcome')
  const [amountDisplay, setAmountDisplay] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  const categories = mode === 'income' ? incomeCategories : outcomeCategories

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (open) {
      setAmountDisplay('')
      setCategoryId('')
      setDescription('')
      setDate(new Date().toISOString().slice(0, 10))
      setReceiptUrl(undefined)
      setError(null)
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [open])

  if (!open && !showSuccess) return null

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
    const result = await onSave({
      type: mode,
      amount,
      category_id: categoryId,
      description: description.trim() || undefined,
      date,
      receipt_url: receiptUrl,
    })

    if (!result.success) {
      setError(result.error || 'Gagal menyimpan transaksi')
    } else {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 1200)
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

  return (
    <>
      {open && (
        <div className="modal-overlay" onClick={onClose}>
          <div className="quick-add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quick-add-handle" />

            <div className="modal-header">
              <h2>Catat Transaksi</h2>
              <button className="btn-icon modal-close" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="quick-add-toggle">
              <button
                className={`quick-add-toggle-btn ${mode === 'outcome' ? 'active outcome' : ''}`}
                onClick={() => setMode('outcome')}
              >
                <TrendingDown size={16} />
                Pengeluaran
              </button>
              <button
                className={`quick-add-toggle-btn ${mode === 'income' ? 'active income' : ''}`}
                onClick={() => setMode('income')}
              >
                <TrendingUp size={16} />
                Pemasukan
              </button>
            </div>

            <form onSubmit={handleSubmit} className="quick-add-form">
              {error && <div className="form-error">{error}</div>}

              <div className="form-group">
                <label htmlFor="qa-amount">Nominal</label>
                <input
                  id="qa-amount"
                  type="text"
                  inputMode="numeric"
                  value={amountDisplay}
                  onChange={handleAmountChange}
                  placeholder="Rp 0"
                  className="amount-input quick-amount-input"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label htmlFor="qa-category">Kategori</label>
                <select
                  id="qa-category"
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

              <div className="quick-add-row">
                <div className="form-group">
                  <label htmlFor="qa-date">Tanggal</label>
                  <input
                    id="qa-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="qa-desc">Deskripsi</label>
                  <input
                    id="qa-desc"
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Opsional"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Bukti (opsional)</label>
                <FileUpload value={receiptUrl} onChange={setReceiptUrl} />
              </div>

              <button type="submit" className="btn btn-primary quick-add-save" disabled={saving}>
                {saving ? 'Menyimpan...' : 'Simpan Transaksi'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="quick-add-toast">Transaksi berhasil disimpan!</div>
      )}
    </>
  )
}
