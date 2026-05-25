'use client'

import { createElement } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import { formatRupiah } from '@/lib/utils/currency'
import type { BudgetWithCategory } from '@/lib/hooks/useBudgets'

interface BudgetCardProps {
  budget: BudgetWithCategory
  spending: {
    spent: number
    percentage: number
  }
  onEdit: (budget: BudgetWithCategory) => void
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  deleting: string | null
}

function getProgressColor(percentage: number): string {
  if (percentage < 60) return 'var(--color-secondary)'
  if (percentage < 80) return 'var(--color-accent)'
  return 'var(--color-danger)'
}

function getStatusBadge(percentage: number): {
  label: string
  className: string
} {
  if (percentage >= 100) return { label: 'Melebihi', className: 'badge-danger' }
  if (percentage >= 80) return { label: 'Hampir Penuh', className: 'badge-warning' }
  return { label: 'Aman', className: 'badge-safe' }
}

function formatPeriod(period: 'weekly' | 'monthly'): string {
  return period === 'weekly' ? 'Mingguan' : 'Bulanan'
}

export function BudgetCard({
  budget,
  spending,
  onEdit,
  onDelete,
  deleting,
}: BudgetCardProps) {
  const isOverall = !budget.category_id
  const categoryName = isOverall
    ? 'Keseluruhan'
    : (budget.categories?.name || 'Tidak Diketahui')
  const iconName = isOverall
    ? 'CircleDollarSign'
    : (budget.categories?.icon || 'Circle')
  const categoryColor = isOverall
    ? '#B8663B'
    : (budget.categories?.color || '#B8663B')

  const progressColor = getProgressColor(spending.percentage)
  const badge = getStatusBadge(spending.percentage)
  const iconElement = createElement(getIcon(iconName), { size: 18 })

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <div className="budget-card-category">
          <span
            className="budget-card-icon"
            style={{ background: categoryColor + '1A', color: categoryColor }}
          >
            {iconElement}
          </span>
          <div className="budget-card-info">
            <span className="budget-card-name">{categoryName}</span>
            <span className="budget-card-period">
              {formatPeriod(budget.period)}
            </span>
          </div>
        </div>
        <div className="budget-card-right">
          <span className={`budget-card-badge ${badge.className}`}>
            {badge.label}
          </span>
          <div className="budget-card-actions">
            <button
              className="action-btn"
              onClick={() => onEdit(budget)}
              title="Edit"
            >
              <Pencil size={14} />
            </button>
            <button
              className="action-btn danger"
              onClick={() => {
                if (!window.confirm('Hapus budget ini?')) return
                onDelete(budget.id)
              }}
              disabled={deleting === budget.id}
              title="Hapus"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="budget-card-progress">
        <div className="budget-card-progress-header">
          <span className="budget-card-progress-text">
            {formatRupiah(spending.spent)} dari {formatRupiah(budget.amount)}
          </span>
          <span
            className="budget-card-percentage"
            style={{ color: progressColor }}
          >
            {spending.percentage}%
          </span>
        </div>
        <div className="budget-card-track">
          <div
            className="budget-card-fill"
            style={{
              width: `${Math.min(spending.percentage, 100)}%`,
              background: progressColor,
            }}
          />
        </div>
      </div>
    </div>
  )
}
