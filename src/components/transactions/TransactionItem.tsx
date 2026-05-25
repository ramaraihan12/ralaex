'use client'

import { createElement } from 'react'
import { Pencil, Trash2, Camera } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateShort } from '@/lib/utils/date'
import type { Transaction, Category } from '@/lib/types'

interface TransactionItemProps {
  transaction: Transaction
  category?: Category
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  deleting: string | null
}

export function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
  deleting,
}: TransactionItemProps) {
  const categoryColor = category?.color || '#B8663B'
  const isIncome = transaction.type === 'income'

  const handleDelete = async () => {
    if (!confirm('Hapus transaksi ini?')) return
    await onDelete(transaction.id)
  }

  const iconElement = createElement(getIcon(category?.icon || 'Circle'), { size: 20 })

  return (
    <div className={`transaction-item ${isIncome ? 'income' : 'outcome'}`}>
      <div
        className="transaction-icon"
        style={{ backgroundColor: categoryColor + '1A', color: categoryColor }}
      >
        {iconElement}
      </div>

      <div className="transaction-info">
        <div className="transaction-title">
          <span className="transaction-category">{category?.name || 'Tanpa Kategori'}</span>
          {transaction.receipt_url && (
            <span className="transaction-receipt-badge" title="Ada bukti foto">
              <Camera size={12} />
            </span>
          )}
        </div>
        {transaction.description && (
          <span className="transaction-desc">{transaction.description}</span>
        )}
        <span className="transaction-date">{formatDateShort(transaction.date)}</span>
      </div>

      <div className={`transaction-amount ${isIncome ? 'positive' : 'negative'}`}>
        {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
      </div>

      <div className="transaction-actions">
        <button
          className="btn-icon action-btn"
          onClick={() => onEdit(transaction)}
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          className="btn-icon action-btn danger"
          onClick={handleDelete}
          disabled={deleting === transaction.id}
          title="Hapus"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
