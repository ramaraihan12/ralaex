import { describe, expect, it } from 'vitest'
import { budgetAlert, budgetPercentage, budgetRange } from './budget'

describe('budgetPercentage', () => {
  it('rounds to a whole percent', () => {
    expect(budgetPercentage(500000, 700000)).toBe(71)
    expect(budgetPercentage(1555000, 1800000)).toBe(86)
  })

  it('goes past 100 when overspent', () => {
    expect(budgetPercentage(325000, 250000)).toBe(130)
  })

  it('returns 0 for an empty budget instead of Infinity', () => {
    expect(budgetPercentage(100000, 0)).toBe(0)
  })
})

describe('budgetAlert', () => {
  it('stays quiet under 80%', () => {
    expect(budgetAlert(0)).toBeNull()
    expect(budgetAlert(79)).toBeNull()
  })

  it('warns from 80% up to 99%', () => {
    expect(budgetAlert(80)).toBe('budget_warning')
    expect(budgetAlert(99)).toBe('budget_warning')
  })

  it('flags 100% and above as exceeded', () => {
    expect(budgetAlert(100)).toBe('budget_exceeded')
    expect(budgetAlert(240)).toBe('budget_exceeded')
  })

  it('uses the rounded percentage, so 79.5% already warns', () => {
    expect(budgetAlert(budgetPercentage(795, 1000))).toBe('budget_warning')
  })
})

describe('budgetRange', () => {
  const wednesday = new Date(2026, 9, 21)

  it('uses Monday to Sunday for weekly budgets', () => {
    expect(budgetRange('weekly', wednesday)).toEqual({ start: '2026-10-19', end: '2026-10-25' })
  })

  it('uses the calendar month for monthly budgets', () => {
    expect(budgetRange('monthly', wednesday)).toEqual({ start: '2026-10-01', end: '2026-10-31' })
  })
})
