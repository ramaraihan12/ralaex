'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { BudgetCard } from '@/components/budget/BudgetCard'
import { BudgetForm } from '@/components/budget/BudgetForm'
import { useBudgets } from '@/lib/hooks/useBudgets'
import type { BudgetWithCategory } from '@/lib/hooks/useBudgets'
import { Plus, Wallet } from 'lucide-react'
import '@/styles/budget.css'

export default function BudgetPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<BudgetWithCategory | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    budgets,
    categories,
    spending,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets()

  const handleEdit = (budget: BudgetWithCategory) => {
    setEditingBudget(budget)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingBudget(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const result = await deleteBudget(id)
    setDeleting(null)
    return result
  }

  return (
    <AppShell>
      <div className="page-container budget-page">
        <div className="budget-header">
          <h1>Anggaran</h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingBudget(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>

        {loading ? (
          <div className="components-loading">
            <span>Memuat data...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Gagal Memuat</h3>
            <p>{error}</p>
          </div>
        ) : budgets.length === 0 ? (
          <div className="empty-state-card">
            <div className="empty-state-icon">
              <Wallet size={28} />
            </div>
            <h3>Belum Ada Anggaran</h3>
            <p>
              Buat anggaran untuk mengontrol pengeluaran Anda. Tetapkan batas
              pengeluaran per kategori atau keseluruhan.
            </p>
            <button
              className="btn btn-primary btn-primary-lg"
              onClick={() => {
                setEditingBudget(null)
                setFormOpen(true)
              }}
            >
              <Plus size={18} />
              Tambah Anggaran
            </button>
          </div>
        ) : (
          <div className="budget-list">
            {budgets.map((budget) => (
              <BudgetCard
                key={budget.id}
                budget={budget}
                spending={spending[budget.id] || { spent: 0, percentage: 0 }}
                onEdit={handleEdit}
                onDelete={handleDelete}
                deleting={deleting}
              />
            ))}
          </div>
        )}

        <BudgetForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={addBudget}
          onUpdate={updateBudget}
          onDelete={deleteBudget}
          categories={categories}
          budget={editingBudget}
        />
      </div>
    </AppShell>
  )
}
