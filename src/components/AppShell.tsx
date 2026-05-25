'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/Header'
import { BottomNav } from '@/components/BottomNav'
import { Sidebar } from '@/components/Sidebar'
import { QuickAddModal } from '@/components/transactions/QuickAddModal'
import { createClient } from '@/lib/supabase/client'
import { checkBudgetNotifications } from '@/lib/utils/notifications'
import type { Category } from '@/lib/types'
import '@/styles/layout.css'
import '@/styles/transactions.css'
import '@/styles/components.css'

export function AppShell({ children }: { children: React.ReactNode }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [incomeCategories, setIncomeCategories] = useState<Category[]>([])
  const [outcomeCategories, setOutcomeCategories] = useState<Category[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (data) {
        const cats = data as Category[]
        setIncomeCategories(cats.filter((c) => c.type === 'income'))
        setOutcomeCategories(cats.filter((c) => c.type === 'outcome'))
      }
    }
    fetchCategories()
  }, [supabase])

  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSidebarOpen])

  const handleQuickSave = async (input: {
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
    if (input.type === 'outcome') {
      checkBudgetNotifications(input.category_id)
    }
    return { success: true }
  }

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      <div className="main-content">
        <Header onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="page-container">
          {children}
        </main>
        <BottomNav
          onQuickAdd={() => setQuickAddOpen(true)}
          onMenuClick={() => setMobileSidebarOpen(true)}
        />
      </div>
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}
      <QuickAddModal
        open={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSave={handleQuickSave}
        incomeCategories={incomeCategories}
        outcomeCategories={outcomeCategories}
      />
    </div>
  )
}
