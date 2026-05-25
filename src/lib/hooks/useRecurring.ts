'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RecurringTransaction, Category } from '@/lib/types'

export interface RecurringWithCategory extends RecurringTransaction {
  categories?: { name: string; icon: string; color: string } | null
}

export function useRecurring() {
  const [items, setItems] = useState<RecurringWithCategory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchRecurring = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('recurring_transactions')
      .select('*, categories(id, name, icon, color)')
      .order('next_execution', { ascending: true })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setItems((data || []) as RecurringWithCategory[])
    setLoading(false)
  }, [supabase])

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (data) {
      setCategories(data as Category[])
    }
  }, [supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchRecurring()
    fetchCategories()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchRecurring, fetchCategories])

  const addRecurring = async (input: {
    type: 'income' | 'outcome'
    amount: number
    category_id: string
    description?: string
    frequency: 'weekly' | 'monthly'
    day_of_week?: number | null
    day_of_month?: number | null
    next_execution: string
  }): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase.from('recurring_transactions').insert([
      {
        type: input.type,
        amount: input.amount,
        category_id: input.category_id,
        description: input.description || null,
        frequency: input.frequency,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        next_execution: input.next_execution,
        is_active: true,
      },
    ])

    if (err) return { success: false, error: err.message }
    await fetchRecurring()
    return { success: true }
  }

  const updateRecurring = async (
    id: string,
    input: {
      type: 'income' | 'outcome'
      amount: number
      category_id: string
      description?: string
      frequency: 'weekly' | 'monthly'
      day_of_week?: number | null
      day_of_month?: number | null
      next_execution: string
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('recurring_transactions')
      .update({
        type: input.type,
        amount: input.amount,
        category_id: input.category_id,
        description: input.description || null,
        frequency: input.frequency,
        day_of_week: input.day_of_week ?? null,
        day_of_month: input.day_of_month ?? null,
        next_execution: input.next_execution,
      })
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchRecurring()
    return { success: true }
  }

  const toggleRecurring = async (
    id: string,
    currentActive: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('recurring_transactions')
      .update({ is_active: !currentActive })
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchRecurring()
    return { success: true }
  }

  const deleteRecurring = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('recurring_transactions')
      .delete()
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchRecurring()
    return { success: true }
  }

  return {
    items,
    categories,
    loading,
    error,
    addRecurring,
    updateRecurring,
    toggleRecurring,
    deleteRecurring,
    refetch: fetchRecurring,
  }
}
