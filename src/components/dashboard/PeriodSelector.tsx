'use client'

import type { DashboardPeriod } from '@/lib/hooks/useDashboard'

interface PeriodSelectorProps {
  period: DashboardPeriod
  onChange: (period: DashboardPeriod, customStart?: string, customEnd?: string) => void
  customStart?: string
  customEnd?: string
}

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: 'week', label: 'Minggu Ini' },
  { value: 'month', label: 'Bulan Ini' },
  { value: 'year', label: 'Tahun Ini' },
]

export function PeriodSelector({
  period,
  onChange,
  customStart,
  customEnd,
}: PeriodSelectorProps) {
  const isCustom = period === 'custom'

  return (
    <div className="period-selector">
      <div className="period-pills">
        {PERIODS.map((p) => (
          <button
            key={p.value}
            className={`period-pill ${period === p.value ? 'active' : ''}`}
            onClick={() => onChange(p.value)}
          >
            {p.label}
          </button>
        ))}
        <button
          className={`period-pill ${isCustom ? 'active' : ''}`}
          onClick={() => {
            if (!isCustom) {
              onChange('custom', customStart, customEnd)
            }
          }}
        >
          {isCustom && customStart && customEnd
            ? `${customStart} - ${customEnd}`
            : 'Custom'}
        </button>
      </div>

      {isCustom && (
        <div className="period-custom-dates">
          <input
            type="date"
            className="period-date-input"
            value={customStart || ''}
            onChange={(e) => onChange('custom', e.target.value, customEnd)}
          />
          <span className="period-date-separator">sampai</span>
          <input
            type="date"
            className="period-date-input"
            value={customEnd || ''}
            onChange={(e) => onChange('custom', customStart, e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
