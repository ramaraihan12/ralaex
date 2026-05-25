'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Transaction, Category } from '@/lib/types'

const PAGE_SIZE = 20

export type SortField = 'date' | 'amount'
export type SortDirection = 'asc' | 'desc'

export interface TransactionFilters {
  search: string
  categoryId: string
  dateFrom: string
  dateTo: string
  sortField: SortField
  sortDirection: SortDirection
}

export function useTransactions(type: 'income' | 'outcome') {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    categoryId: '',
    dateFrom: '',
    dateTo: '',
    sortField: 'date',
    sortDirection: 'desc',
  })
  const pageRef = useRef(0)
  const supabase = createClient()

  const fetchTransactions = useCallback(
    async (reset = true) => {
      if (reset) {
        setLoading(true)
        pageRef.current = 0
      } else {
        setLoadingMore(true)
      }

      setError(null)

      const page = reset ? 0 : pageRef.current
      const from = page * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('type', type)

      if (filters.search) {
        const clauses = [`description.ilike.%${filters.search}%`]
        const searchNum = parseInt(filters.search)
        if (!isNaN(searchNum)) {
          clauses.push(`amount.eq.${searchNum}`)
        }
        query = query.or(clauses.join(','))
      }

      if (filters.categoryId) {
        query = query.eq('category_id', filters.categoryId)
      }

      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom)
      }

      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo)
      }

      query = query
        .order(filters.sortField, { ascending: filters.sortDirection === 'asc' })
        .range(from, to)

      const { data, error: err, count } = await query

      if (err) {
        setError(err.message)
      } else {
        const newData = (data as Transaction[]) || []
        if (reset) {
          setTransactions(newData)
        } else {
          setTransactions((prev) => [...prev, ...newData])
        }
        setHasMore(newData.length === PAGE_SIZE && (count ?? 0) > to + 1)
        pageRef.current = page + 1
      }

      setLoading(false)
      setLoadingMore(false)
    },
    [supabase, type, filters]
  )

  const fetchCategories = useCallback(async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('type', type)
      .eq('is_active', true)
      .order('name')

    if (data) {
      setCategories(data as Category[])
    }
  }, [supabase, type])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchCategories()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchCategories])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchTransactions(true)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchTransactions])

  const addTransaction = async (input: {
    type: 'income' | 'outcome'
    amount: number
    category_id: string
    description?: string
    date: string
    receipt_url?: string
  }): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase.from('transactions').insert([
      {
        type: input.type,
        amount: input.amount,
        category_id: input.category_id,
        description: input.description || null,
        date: input.date,
        receipt_url: input.receipt_url || null,
      },
    ])

    if (err) return { success: false, error: err.message }
    await fetchTransactions(true)
    return { success: true }
  }

  const updateTransaction = async (
    id: string,
    input: {
      amount: number
      category_id: string
      description?: string
      date: string
      receipt_url?: string
    }
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase
      .from('transactions')
      .update({
        amount: input.amount,
        category_id: input.category_id,
        description: input.description || null,
        date: input.date,
        receipt_url: input.receipt_url || null,
      })
      .eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchTransactions(true)
    return { success: true }
  }

  const deleteTransaction = async (
    id: string
  ): Promise<{ success: boolean; error?: string }> => {
    const { error: err } = await supabase.from('transactions').delete().eq('id', id)

    if (err) return { success: false, error: err.message }
    await fetchTransactions(true)
    return { success: true }
  }

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(false)
    }
  }

  const updateFilters = (newFilters: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const totalAmount = transactions.reduce((sum, tx) => sum + tx.amount, 0)

  return {
    transactions,
    categories,
    loading,
    loadingMore,
    error,
    hasMore,
    filters,
    totalAmount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadMore,
    updateFilters,
    refetch: () => fetchTransactions(true),
  }
}
