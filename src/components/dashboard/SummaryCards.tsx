'use client'

import { useEffect, useState, useRef } from 'react'
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'

interface SummaryCardsProps {
  totalIncome: number
  totalOutcome: number
  balance: number
  remainingBudget: number
}

function useCounter(target: number, duration = 600) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number>(0)
  const startTimeRef = useRef<number>(0)
  const startValueRef = useRef(0)

  useEffect(() => {
    startValueRef.current = value
    startTimeRef.current = performance.now()

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(
        startValueRef.current + (target - startValueRef.current) * eased
      )
      setValue(current)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration])

  return value
}

function SummaryCard({
  label,
  value,
  icon,
  colorClass,
  isNegative = false,
}: {
  label: string
  value: number
  icon: React.ReactNode
  colorClass: string
  isNegative?: boolean
}) {
  const counterValue = useCounter(value)

  return (
    <div className="summary-card">
      <div className={`summary-card-icon ${colorClass}`}>{icon}</div>
      <div className="summary-card-info">
        <span className="summary-card-label">{label}</span>
        <span className={`summary-card-value ${isNegative && value < 0 ? 'negative' : ''}`}>
          {value < 0 && isNegative ? '-' : ''}
          {formatRupiah(counterValue)}
        </span>
      </div>
    </div>
  )
}

export function SummaryCards({
  totalIncome,
  totalOutcome,
  balance,
  remainingBudget,
}: SummaryCardsProps) {
  return (
    <div className="summary-cards">
      <SummaryCard
        label="Total Pemasukan"
        value={totalIncome}
        icon={<TrendingUp size={20} />}
        colorClass="income"
      />
      <SummaryCard
        label="Total Pengeluaran"
        value={totalOutcome}
        icon={<TrendingDown size={20} />}
        colorClass="outcome"
      />
      <SummaryCard
        label="Saldo Bersih"
        value={balance}
        icon={<Wallet size={20} />}
        colorClass="balance"
        isNegative
      />
      <SummaryCard
        label="Sisa Anggaran"
        value={remainingBudget}
        icon={<PiggyBank size={20} />}
        colorClass="budget"
        isNegative
      />
    </div>
  )
}
