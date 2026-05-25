'use client'

import { useState, useCallback } from 'react'
import { AppShell } from '@/components/AppShell'
import { PeriodSelector } from '@/components/dashboard/PeriodSelector'
import { SummaryCards } from '@/components/dashboard/SummaryCards'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { AreaChart } from '@/components/dashboard/AreaChart'
import { BarChart } from '@/components/dashboard/BarChart'
import { BudgetProgress } from '@/components/dashboard/BudgetProgress'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { useDashboard } from '@/lib/hooks/useDashboard'
import type { DashboardPeriod } from '@/lib/hooks/useDashboard'
import { BudgetAlertBanner } from '@/components/budget/BudgetAlertBanner'
import '@/styles/dashboard.css'

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>('month')
  const [customStart, setCustomStart] = useState<string | undefined>()
  const [customEnd, setCustomEnd] = useState<string | undefined>()

  const handlePeriodChange = useCallback(
    (newPeriod: DashboardPeriod, start?: string, end?: string) => {
      setPeriod(newPeriod)
      if (newPeriod === 'custom') {
        setCustomStart(start)
        setCustomEnd(end)
      }
    },
    []
  )

  const { data, loading, error } = useDashboard(period, customStart, customEnd)

  return (
    <AppShell>
      <div className="page-container dashboard-page">
        <h1>Beranda</h1>

        <PeriodSelector
          period={period}
          onChange={handlePeriodChange}
          customStart={customStart}
          customEnd={customEnd}
        />

        {loading ? (
          <div className="components-loading">
            <span>Memuat data...</span>
          </div>
        ) : error ? (
          <div className="empty-state">
            <h3>Gagal Memuat</h3>
            <p>{error}</p>
          </div>
        ) : data ? (
          <>
            <BudgetAlertBanner budgets={data.budgets} />

            <SummaryCards
              totalIncome={data.summary.totalIncome}
              totalOutcome={data.summary.totalOutcome}
              balance={data.summary.balance}
              remainingBudget={data.summary.remainingBudget}
            />

            <div className="charts-grid">
              <DonutChart data={data.categoryBreakdown} />
              <AreaChart data={data.trend} />
              <BarChart data={data.monthlyComparison} />
            </div>

            <BudgetProgress budgets={data.budgets} />

            <div style={{ marginTop: 'var(--space-lg)' }}>
              <RecentTransactions
                transactions={data.recentTransactions}
                categories={data.categories}
              />
            </div>
          </>
        ) : null}
      </div>
    </AppShell>
  )
}
