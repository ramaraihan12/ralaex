'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Budget, Category } from '@/lib/types'
import { budgetPercentage, budgetRange } from '@/lib/utils/budget'

export interface BudgetWithCategory extends Budget {
  categories?: { name: string; icon: string; color: string } | null
}

export interface BudgetSpending {
  id: string
  spent: number
  percentage: number
}

export function useBudgets() {
  const [budgets, setBudgets] = useState<BudgetWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [spending, setSpending] = useState<Record<string, BudgetSpending>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('budgets')
      .select('*, categories(id, name, icon, color)')
      .order('created_at', { ascending: true })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    const budgetList = (data || []) as BudgetWithCategory[]
    setBudgets(budgetList)

    const spendingMap: Record<string, BudgetSpending> = {}

    for (const b of budgetList) {
      const { start: budgetStart, end: budgetEnd } = budgetRange(b.period)

      let query = supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'outcome')
        .gte('date', budgetStart)
        .lte('date', budgetEnd)

      if (b.category_id) {
        query = query.eq('category_id', b.category_id)
      }

      const { data: outcomeData } = await query
      const spent = (outcomeData || []).reduce((sum, t) => sum + t.amount, 0)

      spendingMap[b.id] = {
        id: b.id,
        spent,
        percentage: budgetPercentage(spent, b.amount),
      }
    }

    setSpending(spendingMap)
    setLoading(false)
  }, [supabase])

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', 'outcome')
      .eq('is_active', true)
      .order('name')

    if (data) {
      setCategories(data as Category[])
    }
  }, [supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchBudgets()
    fetchCategories()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchBudgets, fetchCategories])

  const addBudget = async (input: {
    category_id: string | null
    amount: number
    period: 'weekly' | 'monthly'
  }): Promise<{ success: boolean; error?: string }> => {
    let dupeQuery = supabase
      .from('budgets')
      .select('id')
      .eq('period', input.period)

    if (input.category_id) {
      dupeQuery = dupeQuery.eq('category_id', input.category_id)
    } else {
      dupeQuery = dupeQuery.is('category_id', null)
    }

    const { data: existing } = await dupeQuery

    if (existing && existing.length > 0) {
      const label = input.category_id
        ? 'Budget untuk kategori dan periode ini sudah ada.'
        : 'Budget keseluruhan untuk periode ini sudah ada.'
      return { success: false, error: label }
    }

    const { error: err } = await supabase.from('budgets').insert([
      { ...input, is_active: true },
    ])

    if (err) return { success: false, error: err.message }
    await fetchBudgets()
    return { success: true }
  }

  const updateBudget = async (
    id: string,
    input: {
      category_id: string | null
      amount: number
      period: 'weekly' | 'monthly'
    }
  ): Promise<{ success: boolean; error?: string }> => {
    let dupeQuery = supabase
      .from('budgets')
      .select('id')
      .neq('id', id)
      .eq('period', input.period)

    if (input.category_id) {
      dupeQuery = dupeQuery.eq('category_id', input.category_id)
    } else {
      dupeQuery = dupeQuery.is('category_id', null)
    }

    const { data: existing } = await dupeQuery

    if (existing && existing.length > 0) {
      const label = input.category_id
        ? 'Budget untuk kategori dan periode ini sudah ada.'
        : 'Budget keseluruhan untuk periode ini sudah ada.'
      return { success: false, error: label }
    }

    const { error: err } = await supabase
      .from('budgets')
      .update(input)
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchBudgets()
    return { success: true }
  }

  const deleteBudget = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase.from('budgets').delete().eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchBudgets()
    return { success: true }
  }

  return {
    budgets,
    categories,
    spending,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    refetch: fetchBudgets,
  }
}
