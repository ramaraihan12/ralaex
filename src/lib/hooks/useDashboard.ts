'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, Category, Budget } from '@/lib/types'
import { formatLocalDate, getWeekRange, getMonthRange } from '@/lib/utils/date'

export type DashboardPeriod = 'week' | 'month' | 'year' | 'custom'

export interface CategoryBreakdown {
  category_id: string
  category_name: string
  icon: string
  color: string
  total: number
}

export interface TrendPoint {
  date: string
  income: number
  outcome: number
}

export interface MonthlyComparison {
  month: string
  monthLabel: string
  income: number
  outcome: number
}

export interface BudgetProgressData {
  id: string
  category_id: string | null
  category_name: string
  category_icon: string
  category_color: string
  period: 'weekly' | 'monthly'
  budget_amount: number
  spent: number
  percentage: number
  is_overall: boolean
}

export interface DashboardData {
  summary: {
    totalIncome: number
    totalOutcome: number
    balance: number
    remainingBudget: number
  }
  categoryBreakdown: CategoryBreakdown[]
  trend: TrendPoint[]
  monthlyComparison: MonthlyComparison[]
  budgets: BudgetProgressData[]
  recentTransactions: Transaction[]
  categories: Category[]
}

const PAGE_SIZE = 1000

const MONTHS_ID = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]

function getYearRange(now: Date): { start: string; end: string } {
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear(), 11, 31)
  return {
    start: formatLocalDate(start),
    end: formatLocalDate(end),
  }
}

export function getPeriodRange(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string
): { start: string; end: string } {
  if (period === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd }
  }
  const now = new Date()
  switch (period) {
    case 'week':
      return getWeekRange()
    case 'month':
      return getMonthRange()
    case 'year':
      return getYearRange(now)
    default:
      return getMonthRange()
  }
}

async function fetchAll(
  query: Record<string, unknown>
): Promise<Record<string, unknown>[]> {
  const allData: Record<string, unknown>[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const q = query as { range: (a: number, b: number) => Promise<{ data: Record<string, unknown>[] | null; error: { message: string } | null }> }
    const { data, error } = await q.range(offset, offset + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)

    if (data && data.length > 0) {
      allData.push(...data)
      offset += PAGE_SIZE
      hasMore = data.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  return allData
}

export function useDashboard(
  period: DashboardPeriod,
  customStart?: string,
  customEnd?: string
) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { start, end } = getPeriodRange(period, customStart, customEnd)

    try {
      const [
        incomeData,
        outcomeData,
        outcomeByCategoryData,
        trendData,
        budgetsResult,
        recentResult,
        categoriesResult,
      ] = await Promise.all([
        fetchAll(
          supabase
            .from('transactions')
            .select('amount')
            .eq('type', 'income')
            .gte('date', start)
            .lte('date', end) as unknown as Record<string, unknown>
        ),
        fetchAll(
          supabase
            .from('transactions')
            .select('amount')
            .eq('type', 'outcome')
            .gte('date', start)
            .lte('date', end) as unknown as Record<string, unknown>
        ),
        fetchAll(
          supabase
            .from('transactions')
            .select('amount, category_id')
            .eq('type', 'outcome')
            .gte('date', start)
            .lte('date', end) as unknown as Record<string, unknown>
        ),
        fetchAll(
          supabase
            .from('transactions')
            .select('date, type, amount')
            .gte('date', start)
            .lte('date', end)
            .order('date', { ascending: true }) as unknown as Record<string, unknown>
        ),
        supabase
          .from('budgets')
          .select('*, categories(id, name, icon, color)')
          .eq('is_active', true),
        supabase
          .from('transactions')
          .select('*')
          .gte('date', start)
          .lte('date', end)
          .order('date', { ascending: false })
          .limit(5),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('name'),
      ])

      if (budgetsResult.error) throw new Error(budgetsResult.error.message)
      if (recentResult.error) throw new Error(recentResult.error.message)
      if (categoriesResult.error) throw new Error(categoriesResult.error.message)

      const totalIncome = incomeData.reduce((sum, t) => sum + (t.amount as number), 0)
      const totalOutcome = outcomeData.reduce((sum, t) => sum + (t.amount as number), 0)
      const balance = totalIncome - totalOutcome

      const categoryTotals: Record<string, { amount: number }> = {}
      for (const row of outcomeByCategoryData) {
        if (!categoryTotals[row.category_id as string]) {
          categoryTotals[row.category_id as string] = { amount: 0 }
        }
        categoryTotals[row.category_id as string].amount += row.amount as number
      }

      const categoryIds = Object.keys(categoryTotals)
      let categoryBreakdown: CategoryBreakdown[] = []

      if (categoryIds.length > 0) {
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('id, name, icon, color')
          .in('id', categoryIds)

        const categoriesMap: Record<string, Category> = {}
        for (const cat of categoriesData || []) {
          categoriesMap[cat.id] = cat as Category
        }

        categoryBreakdown = categoryIds.map((id) => ({
          category_id: id,
          category_name: categoriesMap[id]?.name || 'Tidak Diketahui',
          icon: categoriesMap[id]?.icon || 'Circle',
          color: categoriesMap[id]?.color || '#B8663B',
          total: categoryTotals[id].amount,
        }))

        categoryBreakdown.sort((a, b) => b.total - a.total)
      }

      const trendMap: Record<string, { income: number; outcome: number }> = {}
      for (const row of trendData) {
        const dateStr = row.date as string
        if (!trendMap[dateStr]) {
          trendMap[dateStr] = { income: 0, outcome: 0 }
        }
        if ((row.type as string) === 'income') {
          trendMap[dateStr].income += row.amount as number
        } else {
          trendMap[dateStr].outcome += row.amount as number
        }
      }
      const trend: TrendPoint[] = Object.entries(trendMap)
        .map(([date, values]) => ({
          date,
          income: values.income,
          outcome: values.outcome,
        }))
        .sort((a, b) => a.date.localeCompare(b.date))

      const now = new Date()
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      const sixMonthsAgoStr = sixMonthsAgo.toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      const endOfMonthStr = endOfMonth.toISOString().split('T')[0]

      const monthlyData = await fetchAll(
        supabase
          .from('transactions')
          .select('date, type, amount')
          .gte('date', sixMonthsAgoStr)
          .lte('date', endOfMonthStr) as unknown as Record<string, unknown>
      )

      const monthlyMap: Record<string, { income: number; outcome: number }> = {}
      const months: { key: string; label: string }[] = []
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        const label = `${MONTHS_ID[d.getMonth()]} ${d.getFullYear()}`
        months.push({ key, label })
        monthlyMap[key] = { income: 0, outcome: 0 }
      }

      for (const row of monthlyData) {
        const d = new Date(row.date as string)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (monthlyMap[key]) {
          if ((row.type as string) === 'income') {
            monthlyMap[key].income += row.amount as number
          } else {
            monthlyMap[key].outcome += row.amount as number
          }
        }
      }

      const monthlyComparison: MonthlyComparison[] = months.map((m) => ({
        month: m.key,
        monthLabel: m.label,
        income: monthlyMap[m.key].income,
        outcome: monthlyMap[m.key].outcome,
      }))

      const budgets: BudgetProgressData[] = []
      let totalBudgetAmount = 0
      let totalBudgetSpent = 0

      for (const budget of budgetsResult.data || []) {
        const b = budget as Budget & {
          categories?: { name: string; icon: string; color: string } | null
        }

        let spent = 0
        let budgetStart: string
        let budgetEnd: string

        if (b.period === 'weekly') {
          const weekRange = getWeekRange()
          budgetStart = weekRange.start
          budgetEnd = weekRange.end
        } else {
          const monthRange = getMonthRange()
          budgetStart = monthRange.start
          budgetEnd = monthRange.end
        }

        let outcomeQuery = supabase
          .from('transactions')
          .select('amount')
          .eq('type', 'outcome')
          .gte('date', budgetStart)
          .lte('date', budgetEnd)

        if (b.category_id) {
          outcomeQuery = outcomeQuery.eq('category_id', b.category_id)
        }

        const outcomeData = await fetchAll(outcomeQuery as unknown as Record<string, unknown>)
        spent = outcomeData.reduce((sum, t) => sum + (t.amount as number), 0)

        const isOverall = !b.category_id
        const categoryInfo = b.categories as
          | { name: string; icon: string; color: string }
          | undefined

        budgets.push({
          id: b.id,
          category_id: b.category_id,
          category_name: isOverall ? 'Keseluruhan' : (categoryInfo?.name || 'Tidak Diketahui'),
          category_icon: isOverall ? 'CircleDollarSign' : (categoryInfo?.icon || 'Circle'),
          category_color: isOverall ? '#B8663B' : (categoryInfo?.color || '#B8663B'),
          period: b.period,
          budget_amount: b.amount,
          spent,
          percentage: b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0,
          is_overall: isOverall,
        })

        totalBudgetAmount += b.amount
        totalBudgetSpent += spent
      }

      const remainingBudget = totalBudgetAmount - totalBudgetSpent

      setData({
        summary: { totalIncome, totalOutcome, balance, remainingBudget },
        categoryBreakdown,
        trend,
        monthlyComparison,
        budgets,
        recentTransactions: (recentResult.data || []) as Transaction[],
        categories: (categoriesResult.data || []) as Category[],
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memuat data dashboard'
      setError(message)
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [period, customStart, customEnd, supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchData()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}
