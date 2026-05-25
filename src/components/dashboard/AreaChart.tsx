'use client'

import {
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import type { TrendPoint } from '@/lib/hooks/useDashboard'

interface AreaChartProps {
  data: TrendPoint[]
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr)
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
  ]
  return `${d.getDate()} ${months[d.getMonth()]}`
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length || !label) return null
  return (
    <div className="chart-tooltip">
      <span className="chart-tooltip-date">{formatDateLabel(label)}</span>
      {payload.map((entry) => (
        <div key={entry.name} className="chart-tooltip-row">
          <span
            className="chart-tooltip-dot"
            style={{ background: entry.color }}
          />
          <span className="chart-tooltip-label">
            {entry.name === 'income' ? 'Pemasukan' : 'Pengeluaran'}
          </span>
          <span className="chart-tooltip-value">{formatRupiah(entry.value)}</span>
        </div>
      ))}
    </div>
  )
}

function formatYAxis(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
  return String(value)
}

export function AreaChart({ data }: AreaChartProps) {
  if (!data.length) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">
          <TrendingUp size={18} />
          Tren Pemasukan vs Pengeluaran
        </h3>
        <div className="empty-state">
          <p>Belum ada data transaksi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chart-card area-chart-card">
      <h3 className="chart-title">
        <TrendingUp size={18} />
        Tren Pemasukan vs Pengeluaran
      </h3>
      <ResponsiveContainer width="100%" height={280}>
        <RechartsAreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.24} />
              <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="colorOutcome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.24} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-tertiary)' }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={formatYAxis}
            tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-tertiary)' }}
            tickLine={false}
            axisLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="var(--color-secondary)"
            strokeWidth={2}
            fill="url(#colorIncome)"
            name="income"
          />
          <Area
            type="monotone"
            dataKey="outcome"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#colorOutcome)"
            name="outcome"
          />
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  )
}
