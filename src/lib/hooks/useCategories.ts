'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/lib/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const fetchCategories = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: true })

    if (err) {
      setError(err.message)
    } else {
      setCategories(data as Category[])
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchCategories()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchCategories])

  const addCategory = async (input: {
    name: string
    type: 'income' | 'outcome'
    icon: string
    color: string
  }): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('categories')
      .insert([{ ...input, is_active: true }])

    if (err) return { success: false, error: err.message }
    await fetchCategories()
    return { success: true }
  }

  const updateCategory = async (
    id: string,
    input: {
      name: string
      icon: string
      color: string
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('categories')
      .update(input)
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchCategories()
    return { success: true }
  }

  const toggleCategory = async (
    id: string,
    isActive: boolean
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('categories')
      .update({ is_active: isActive })
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchCategories()
    return { success: true }
  }

  const deleteCategory = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { count: txCount, error: checkErr } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (checkErr) return { success: false, error: checkErr.message }

    if (txCount && txCount > 0) {
      return {
        success: false,
        error: 'Kategori ini sudah digunakan di transaksi. Tidak bisa dihapus.',
      }
    }

    const { count: budgetCount, error: budgetErr } = await supabase
      .from('budgets')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', id)

    if (budgetErr) return { success: false, error: budgetErr.message }

    if (budgetCount && budgetCount > 0) {
      return {
        success: false,
        error: 'Kategori ini sudah digunakan di anggaran. Tidak bisa dihapus.',
      }
    }

    const { error: delErr } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (delErr) return { success: false, error: delErr.message }
    await fetchCategories()
    return { success: true }
  }

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    toggleCategory,
    deleteCategory,
    refetch: fetchCategories,
  }
}
