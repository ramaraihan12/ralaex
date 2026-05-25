'use client'

import { createElement } from 'react'
import { Pencil, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import { formatRupiah } from '@/lib/utils/currency'
import { formatDateID } from '@/lib/utils/date'
import type { RecurringWithCategory } from '@/lib/hooks/useRecurring'

interface RecurringCardProps {
  item: RecurringWithCategory
  onEdit: (item: RecurringWithCategory) => void
  onToggle: (id: string, currentActive: boolean) => void
  onDelete: (id: string) => void
  deleting: string | null
}

function formatFrequency(
  frequency: 'weekly' | 'monthly',
  dayOfWeek: number | null,
  dayOfMonth: number | null
): string {
  if (frequency === 'weekly' && dayOfWeek !== null) {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
    return `Mingguan — ${days[dayOfWeek]}`
  }
  if (frequency === 'monthly' && dayOfMonth !== null) {
    return `Bulanan — Tanggal ${dayOfMonth}`
  }
  return frequency === 'weekly' ? 'Mingguan' : 'Bulanan'
}

export function RecurringCard({
  item,
  onEdit,
  onToggle,
  onDelete,
  deleting,
}: RecurringCardProps) {
  const categoryName = item.categories?.name || 'Tidak Diketahui'
  const iconName = item.categories?.icon || 'Circle'
  const categoryColor = item.categories?.color || '#B8663B'
  const iconElement = createElement(getIcon(iconName), { size: 18 })

  const frequencyText = formatFrequency(
    item.frequency,
    item.day_of_week,
    item.day_of_month
  )

  return (
    <div className={`recurring-card ${!item.is_active ? 'inactive' : ''}`}>
      <div className="recurring-card-body">
        <div className="recurring-card-left">
          <span
            className="recurring-card-icon"
            style={{ background: categoryColor + '1A', color: categoryColor }}
          >
            {iconElement}
          </span>
          <div className="recurring-card-info">
            <span className="recurring-card-category">{categoryName}</span>
            <span className="recurring-card-desc">
              {item.description || '-'}
            </span>
          </div>
        </div>

        <div className="recurring-card-amount">
          <span
            className={`recurring-card-nominal ${item.type === 'income' ? 'income' : 'outcome'}`}
          >
            {item.type === 'income' ? '+' : '-'} {formatRupiah(item.amount)}
          </span>
        </div>
      </div>

      <div className="recurring-card-footer">
        <div className="recurring-card-meta">
          <span className="recurring-card-frequency">{frequencyText}</span>
          <span className="recurring-card-next">
            Berikutnya: {formatDateID(item.next_execution)}
          </span>
        </div>
      </div>

      <div className="recurring-card-actions">
        <div className="recurring-card-type-badge">
          {item.type === 'income' ? (
            <span className="type-badge income-badge">
              <TrendingUp size={12} />
              Pemasukan
            </span>
          ) : (
            <span className="type-badge outcome-badge">
              <TrendingDown size={12} />
              Pengeluaran
            </span>
          )}
        </div>

        <div className="recurring-card-controls">
          <label className="toggle-switch recurring-toggle">
            <input
              type="checkbox"
              checked={item.is_active}
              onChange={() => onToggle(item.id, item.is_active)}
            />
            <span className="toggle-slider" />
          </label>
          <button
            className="action-btn"
            onClick={() => onEdit(item)}
            title="Edit"
          >
            <Pencil size={14} />
          </button>
          <button
            className="action-btn danger"
            onClick={() => onDelete(item.id)}
            disabled={deleting === item.id}
            title="Hapus"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}
