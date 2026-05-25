'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { TrendingDown } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import type { CategoryBreakdown } from '@/lib/hooks/useDashboard'

interface DonutChartProps {
  data: CategoryBreakdown[]
}

interface TooltipPayload {
  payload: CategoryBreakdown & { fill: string }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0].payload
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-header">
        <span
          className="chart-tooltip-dot"
          style={{ background: item.fill }}
        />
        <span>{item.category_name}</span>
      </div>
      <span className="chart-tooltip-value">{formatRupiah(item.total)}</span>
    </div>
  )
}

function CustomLegend({ payload }: { payload?: TooltipPayload[] }) {
  if (!payload) return null
  const top5 = payload.slice(0, 5)
  return (
    <div className="donut-legend">
      {top5.map((entry) => (
        <div key={entry.payload.category_id} className="donut-legend-item">
          <span
            className="donut-legend-dot"
            style={{ background: entry.payload.fill }}
          />
          <span className="donut-legend-label">{entry.payload.category_name}</span>
        </div>
      ))}
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

  const total = data.reduce((sum, d) => sum + d.total, 0)
  const displayData = data.slice(0, 8)

  return (
    <div className="chart-card">
      <h3 className="chart-title">
        <TrendingDown size={18} />
        Pengeluaran per Kategori
      </h3>
      <div className="donut-chart-wrapper">
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={displayData}
              dataKey="total"
              nameKey="category_name"
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={110}
              paddingAngle={2}
              strokeWidth={0}
            >
              {displayData.map((entry) => (
                <Cell
                  key={entry.category_id}
                  fill={entry.color}
                  fillOpacity={0.88}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend />}
              verticalAlign="bottom"
              height={80}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center-overlay">
          <span className="donut-center-label">Total</span>
          <span className="donut-center-value">{formatRupiah(total)}</span>
        </div>
      </div>
    </div>
  )
}
