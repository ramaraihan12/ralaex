import { formatLocalDate } from './date'

export type Frequency = 'weekly' | 'monthly'

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate()
}

function monthlyDate(year: number, monthIndex: number, dayOfMonth: number): string {
  const day = Math.min(dayOfMonth, daysInMonth(year, monthIndex))
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

/**
 * First run date for an item saved from the form, in local time.
 * dayOfWeek uses the form's order: 0 is Monday, 6 is Sunday.
 */
export function firstExecution(
  frequency: Frequency,
  dayOfWeek: number | null,
  dayOfMonth: number | null,
  now = new Date()
): string {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  if (frequency === 'weekly' && dayOfWeek !== null) {
    const target = (dayOfWeek + 1) % 7
    let daysUntil = target - today.getDay()
    if (daysUntil <= 0) daysUntil += 7
    today.setDate(today.getDate() + daysUntil)
    return formatLocalDate(today)
  }

  if (frequency === 'monthly' && dayOfMonth !== null) {
    if (today.getDate() <= dayOfMonth) {
      return monthlyDate(today.getFullYear(), today.getMonth(), dayOfMonth)
    }
    const next = new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return monthlyDate(next.getFullYear(), next.getMonth(), dayOfMonth)
  }

  return formatLocalDate(today)
}

/**
 * The run after `current` (YYYY-MM-DD). Monthly items aim for their own
 * day_of_month each time, so a bill on the 31st becomes Feb 28 and then
 * Mar 31 again instead of drifting.
 */
export function nextExecution(
  frequency: Frequency,
  current: string,
  dayOfMonth: number | null
): string {
  const [year, month, day] = current.split('-').map(Number)

  if (frequency === 'weekly') {
    return new Date(Date.UTC(year, month - 1, day + 7)).toISOString().slice(0, 10)
  }

  // `month` is 1-based, so it is already next month's 0-based index.
  return month === 12
    ? monthlyDate(year + 1, 0, dayOfMonth ?? day)
    : monthlyDate(year, month, dayOfMonth ?? day)
}
