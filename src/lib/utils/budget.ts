import { getMonthRange, getWeekRange } from './date'

export type BudgetPeriod = 'weekly' | 'monthly'
export type BudgetAlert = 'budget_warning' | 'budget_exceeded'

export function budgetRange(period: BudgetPeriod, now = new Date()): { start: string; end: string } {
  return period === 'weekly' ? getWeekRange(now) : getMonthRange(now)
}

export function budgetPercentage(spent: number, amount: number): number {
  return amount > 0 ? Math.round((spent / amount) * 100) : 0
}

// Warn from 80% so there's still room to slow down before the limit.
export function budgetAlert(percentage: number): BudgetAlert | null {
  if (percentage >= 100) return 'budget_exceeded'
  if (percentage >= 80) return 'budget_warning'
  return null
}
