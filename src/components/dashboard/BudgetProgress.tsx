'use client'

import { createElement } from 'react'
import { Wallet } from 'lucide-react'
import { getIcon } from '@/lib/utils/icons'
import { formatRupiah } from '@/lib/utils/currency'
import type { BudgetProgressData } from '@/lib/hooks/useDashboard'

interface BudgetProgressProps {
  budgets: BudgetProgressData[]
}

function getProgressColor(percentage: number): string {
  if (percentage < 60) return 'var(--color-secondary)'
  if (percentage < 80) return 'var(--color-accent)'
  return 'var(--color-danger)'
}

function formatPeriod(period: 'weekly' | 'monthly'): string {
  return period === 'weekly' ? 'Mingguan' : 'Bulanan'
}

function BudgetBar({ budget }: { budget: BudgetProgressData }) {
  const progressColor = getProgressColor(budget.percentage)
  const iconElement = createElement(getIcon(budget.category_icon), { size: 16 })

  return (
    <div className="budget-progress-item">
      <div className="budget-progress-header">
        <div className="budget-progress-category">
          <span
            className="budget-progress-icon"
            style={{ background: budget.category_color + '1A', color: budget.category_color }}
          >
            {iconElement}
          </span>
          <div className="budget-progress-info">
            <span className="budget-progress-name">{budget.category_name}</span>
            <span className="budget-progress-period">{formatPeriod(budget.period)}</span>
          </div>
        </div>
        <span className="budget-progress-percentage" style={{ color: progressColor }}>
          {budget.percentage}%
        </span>
      </div>
      <div className="budget-progress-track">
        <div
          className="budget-progress-fill"
          style={{
            width: `${Math.min(budget.percentage, 100)}%`,
            background: progressColor,
          }}
        />
      </div>
      <div className="budget-progress-values">
        <span className="budget-progress-spent">
          {formatRupiah(budget.spent)} terpakai
        </span>
        <span className="budget-progress-total">
          dari {formatRupiah(budget.budget_amount)}
        </span>
      </div>
    </div>
  )
}

export function BudgetProgress({ budgets }: BudgetProgressProps) {
  if (!budgets.length) {
    return null
  }

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        <Wallet size={18} />
        Progress Anggaran
      </h3>
      <div className="budget-progress-list">
        {budgets.map((b) => (
          <BudgetBar key={b.id} budget={b} />
        ))}
      </div>
    </div>
  )
}
