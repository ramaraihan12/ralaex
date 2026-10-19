'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { TrendingDown } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import type { CategoryBreakdown } from '@/lib/hooks/useDashboard'

interface DonutChartProps {
  data: CategoryBreakdown[]
}

interface Slice {
  id: string
  name: string
  color: string
  total: number
}

interface TooltipPayload {
  payload: Slice
}

// More slices than this get too thin to read, so the tail becomes "Lainnya".
const MAX_SLICES = 6
const OTHER_COLOR = '#B5AA9E'

function toSlices(data: CategoryBreakdown[]): Slice[] {
  const sorted = [...data].sort((a, b) => b.total - a.total)
  const slices: Slice[] = sorted.slice(0, MAX_SLICES).map((d) => ({
    id: d.category_id,
    name: d.category_name,
    color: d.color,
    total: d.total,
  }))

  const rest = sorted.slice(MAX_SLICES)
  if (rest.length > 0) {
    slices.push({
      id: 'other',
      name: 'Lainnya',
      color: OTHER_COLOR,
      total: rest.reduce((sum, d) => sum + d.total, 0),
    })
  }
  return slices
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-header">
        <span className="chart-tooltip-dot" style={{ background: item.color }} />
        <span>{item.name}</span>
      </div>
      <span className="chart-tooltip-value">{formatRupiah(item.total)}</span>
    </div>
  )
}

export function DonutChart({ data }: DonutChartProps) {
  if (!data.length) {
    return (
      <div className="chart-card">
        <h3 className="chart-title">
          <TrendingDown size={18} />
          Pengeluaran per Kategori
        </h3>
        <div className="empty-state">
          <p>Belum ada data pengeluaran</p>
        </div>
      </div>
    )
  }

  const slices = toSlices(data)
  const total = slices.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        <TrendingDown size={18} />
        Pengeluaran per Kategori
      </h3>
      <div className="donut-layout">
        <div className="donut-chart-wrapper">
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={slices}
                dataKey="total"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={112}
                paddingAngle={2}
                strokeWidth={0}
              >
                {slices.map((s) => (
                  <Cell key={s.id} fill={s.color} fillOpacity={0.88} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div className="donut-center-overlay">
            <span className="donut-center-label">Total</span>
            <span className="donut-center-value">{formatRupiah(total)}</span>
          </div>
        </div>

        <ul className="donut-legend">
          {slices.map((s) => (
            <li key={s.id} className="donut-legend-item">
              <span className="donut-legend-dot" style={{ background: s.color }} />
              <span className="donut-legend-label">{s.name}</span>
              <span className="donut-legend-amount">{formatRupiah(s.total)}</span>
              <span className="donut-legend-share">
                {total > 0 ? Math.round((s.total / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
