'use client'

import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Transaction, Category } from '@/lib/types'

interface RecentTransactionsProps {
  transactions: Transaction[]
  categories: Category[]
}

export function RecentTransactions({ transactions, categories }: RecentTransactionsProps) {
  const categoryMap = new Map(categories.map((c) => [c.id, c]))

  return (
    <div className="chart-card">
      <div className="chart-title-row">
        <h3 className="chart-title">
          <Clock size={18} />
          Transaksi Terbaru
        </h3>
        <Link href="/income" className="recent-link">
          Lihat Semua
          <ArrowRight size={14} />
        </Link>
      </div>
      {!transactions.length ? (
        <div className="empty-state">
          <p>Belum ada transaksi</p>
        </div>
      ) : (
        <div className="recent-transactions-list">
          {transactions.map((tx) => {
            const cat = categoryMap.get(tx.category_id)
            const isIncome = tx.type === 'income'
            return (
              <div key={tx.id} className="recent-transaction-item">
                <div className="recent-transaction-left">
                  <div
                    className={`recent-transaction-icon ${isIncome ? 'income' : 'outcome'}`}
                  >
                    <span className="recent-transaction-direction">
                      {isIncome ? '+' : '-'}
                    </span>
                  </div>
                  <div className="recent-transaction-info">
                    <span className="recent-transaction-category">
                      {cat?.name || 'Tanpa Kategori'}
                    </span>
                    {tx.description && (
                      <span className="recent-transaction-desc">
                        {tx.description}
                      </span>
                    )}
                  </div>
                </div>
                <span
                  className={`recent-transaction-amount ${isIncome ? 'positive' : 'negative'}`}
                >
                  {isIncome ? '+' : '-'} Rp{' '}
                  {Math.abs(tx.amount).toLocaleString('id-ID')}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
