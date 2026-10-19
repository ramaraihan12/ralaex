'use client'

import { useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { BudgetProgressData } from '@/lib/hooks/useDashboard'
import { budgetAlert } from '@/lib/utils/budget'
import '@/styles/budget.css'

interface BudgetAlertBannerProps {
  budgets: BudgetProgressData[]
}

export function BudgetAlertBanner({ budgets }: BudgetAlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  const nearLimit = budgets.filter((b) => budgetAlert(b.percentage) !== null)

  if (dismissed || nearLimit.length === 0) return null

  const hasExceeded = nearLimit.some((b) => budgetAlert(b.percentage) === 'budget_exceeded')

  return (
    <div className={`budget-alert-banner${hasExceeded ? ' has-exceeded' : ''}`}>
      <div className="budget-alert-content">
        <AlertTriangle size={18} className="budget-alert-icon" />
        <div className="budget-alert-info">
          <span className="budget-alert-title">
            {hasExceeded
              ? 'Anggaran melebihi batas!'
              : 'Anggaran hampir penuh!'}
          </span>
          <span className="budget-alert-list">
            {nearLimit.map((b) => (
              <span key={b.id} className="budget-alert-item">
                {b.category_name}: {b.percentage}%
              </span>
            ))}
          </span>
        </div>
      </div>
      <button
        className="budget-alert-dismiss"
        onClick={() => setDismissed(true)}
      >
        <X size={14} />
      </button>
    </div>
  )
}
