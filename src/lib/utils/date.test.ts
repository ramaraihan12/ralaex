import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  formatDateID,
  formatDateShort,
  formatLocalDate,
  getDayName,
  getMonthRange,
  getWeekRange,
  getYearRange,
  timeAgo,
} from './date'

describe('formatLocalDate', () => {
  it('uses the local day, not the UTC one', () => {
    // 06:30 in Jakarta is still the previous day in UTC.
    const earlyMorning = new Date(2026, 9, 19, 6, 30)
    expect(earlyMorning.toISOString().slice(0, 10)).toBe('2026-10-18')
    expect(formatLocalDate(earlyMorning)).toBe('2026-10-19')
  })
})

describe('getWeekRange', () => {
  it('starts on Monday', () => {
    // 2026-10-21 is a Wednesday
    expect(getWeekRange(new Date(2026, 9, 21))).toEqual({
      start: '2026-10-19',
      end: '2026-10-25',
    })
  })

  it('treats Sunday as the last day of the week', () => {
    expect(getWeekRange(new Date(2026, 9, 25))).toEqual({
      start: '2026-10-19',
      end: '2026-10-25',
    })
  })

  it('crosses month and year boundaries', () => {
    // Friday 2027-01-01
    expect(getWeekRange(new Date(2027, 0, 1))).toEqual({
      start: '2026-12-28',
      end: '2027-01-03',
    })
  })
})

describe('getMonthRange', () => {
  it('ends on the last day of the month', () => {
    expect(getMonthRange(new Date(2026, 9, 19))).toEqual({
      start: '2026-10-01',
      end: '2026-10-31',
    })
  })

  it('handles February in a leap year', () => {
    expect(getMonthRange(new Date(2028, 1, 10)).end).toBe('2028-02-29')
    expect(getMonthRange(new Date(2026, 1, 10)).end).toBe('2026-02-28')
  })
})

describe('getYearRange', () => {
  it('covers the whole calendar year', () => {
    expect(getYearRange(new Date(2026, 9, 19))).toEqual({
      start: '2026-01-01',
      end: '2026-12-31',
    })
  })
})

describe('Indonesian formatting', () => {
  const date = new Date(2026, 9, 19)

  it('formats long and short dates', () => {
    expect(formatDateID(date)).toBe('19 Oktober 2026')
    expect(formatDateShort(date)).toBe('19/10/2026')
  })

  it('names the weekday', () => {
    expect(getDayName(date)).toBe('Senin')
  })
})

describe('timeAgo', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('goes from minutes to hours to yesterday to a plain date', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 19, 12, 0))

    expect(timeAgo(new Date(2026, 9, 19, 11, 59, 30))).toBe('Baru saja')
    expect(timeAgo(new Date(2026, 9, 19, 11, 15))).toBe('45 menit lalu')
    expect(timeAgo(new Date(2026, 9, 19, 9, 0))).toBe('3 jam lalu')
    expect(timeAgo(new Date(2026, 9, 18, 8, 0))).toBe('Kemarin')
    expect(timeAgo(new Date(2026, 9, 15, 12, 0))).toBe('4 hari lalu')
    expect(timeAgo(new Date(2026, 8, 1, 12, 0))).toBe('1 September 2026')
  })
})
