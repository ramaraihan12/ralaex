'use client'

import { useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { TransactionList } from '@/components/transactions/TransactionList'
import { TransactionForm } from '@/components/transactions/TransactionForm'
import { FilterBar } from '@/components/transactions/FilterBar'
import { useTransactions } from '@/lib/hooks/useTransactions'
import { formatRupiah } from '@/lib/utils/currency'
import type { Transaction } from '@/lib/types'
import { Plus } from 'lucide-react'
import '@/styles/transactions.css'
import '@/styles/master.css'

export default function IncomePage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const {
    transactions,
    categories,
    loading,
    loadingMore,
    hasMore,
    error,
    filters,
    totalAmount,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    loadMore,
    updateFilters,
    refetch,
  } = useTransactions('income')

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingTransaction(null)
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    const result = await deleteTransaction(id)
    setDeleting(null)
    return result
  }

  return (
    <AppShell>
      <div className="transaction-page">
        <div className="transaction-header">
          <h1>Pemasukan</h1>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              setEditingTransaction(null)
              setFormOpen(true)
            }}
          >
            <Plus size={16} />
            Tambah
          </button>
        </div>

        <div className="transaction-total">
          <span className="transaction-total-label">Total Pemasukan</span>
          <span className="transaction-total-amount income">
            {formatRupiah(totalAmount)}
          </span>
        </div>

        <FilterBar
          filters={filters}
          categories={categories}
          onFilterChange={updateFilters}
        />

        {error && (
          <div className="empty-state" style={{ padding: 'var(--space-lg)' }}>
            <h3>Gagal Memuat</h3>
            <p>{error}</p>
            <button className="btn btn-primary btn-sm" onClick={refetch}>
              Coba Lagi
            </button>
          </div>
        )}

        {!error && (
          <TransactionList
            transactions={transactions}
            categories={categories}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onLoadMore={loadMore}
            deleting={deleting}
          />
        )}

        <TransactionForm
          open={formOpen}
          onClose={handleCloseForm}
          onSave={addTransaction}
          onUpdate={updateTransaction}
          type="income"
          categories={categories}
          transaction={editingTransaction}
        />
      </div>
    </AppShell>
  )
}
