'use client'

import { useEffect, useRef } from 'react'
import { Receipt } from 'lucide-react'
import { TransactionItem } from './TransactionItem'
import type { Transaction, Category } from '@/lib/types'

interface TransactionListProps {
  transactions: Transaction[]
  categories: Category[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>
  onLoadMore: () => void
  deleting: string | null
}

export function TransactionList({
  transactions,
  categories,
  loading,
  loadingMore,
  hasMore,
  onEdit,
  onDelete,
  onLoadMore,
  deleting,
}: TransactionListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, loadingMore, onLoadMore])

  const getCategory = (categoryId: string) => {
    return categories.find((cat) => cat.id === categoryId)
  }

  if (loading) {
    return <div className="components-loading">Memuat transaksi...</div>
  }

  if (transactions.length === 0) {
    return (
      <div className="empty-state">
        <Receipt size={48} />
        <h3>Belum ada transaksi</h3>
        <p>Tambahkan transaksi pertama Anda</p>
      </div>
    )
  }

  return (
    <div className="transaction-list">
      {transactions.map((tx) => (
        <TransactionItem
          key={tx.id}
          transaction={tx}
          category={getCategory(tx.category_id)}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deleting}
        />
      ))}

      {loadingMore && (
        <div className="components-loading" style={{ padding: 'var(--space-md)' }}>
          Memuat lagi...
        </div>
      )}

      <div ref={sentinelRef} className="load-more-sentinel" />
    </div>
  )
}
