'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { BarChart3 } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import type { MonthlyComparison } from '@/lib/hooks/useDashboard'

interface BarChartProps {
  data: MonthlyComparison[]
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
      <span className="chart-tooltip-date">{label}</span>
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

export function BarChart({ data }: BarChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.outcome > 0)

  return (
    <div className="chart-card bar-chart-card">
      <h3 className="chart-title">
        <BarChart3 size={18} />
        Perbandingan 6 Bulan
      </h3>
      {!hasData ? (
        <div className="empty-state">
          <p>Belum ada data 6 bulan terakhir</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <RechartsBarChart
            data={data}
            margin={{ top: 8, right: 8, left: -8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
            <XAxis
              dataKey="monthLabel"
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-tertiary)' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fontSize: 'var(--font-size-xs)', fill: 'var(--color-text-tertiary)' }}
              tickLine={false}
              axisLine={false}
              width={48}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value: string) =>
                value === 'income' ? 'Pemasukan' : 'Pengeluaran'
              }
              wrapperStyle={{ fontSize: 'var(--font-size-xs)', paddingTop: 'var(--space-sm)' }}
            />
            <Bar
              dataKey="income"
              fill="var(--color-secondary)"
              fillOpacity={0.88}
              radius={[4, 4, 0, 0]}
              name="income"
            />
            <Bar
              dataKey="outcome"
              fill="var(--color-primary)"
              fillOpacity={0.88}
              radius={[4, 4, 0, 0]}
              name="outcome"
            />
          </RechartsBarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
