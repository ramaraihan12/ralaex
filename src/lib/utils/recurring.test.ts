import { describe, expect, it } from 'vitest'
import { firstExecution, nextExecution } from './recurring'

// Day indexes follow the form: 0 = Senin (Monday) ... 6 = Minggu (Sunday).
const SENIN = 0
const JUMAT = 4
const MINGGU = 6

describe('firstExecution', () => {
  // Monday 2026-10-19, early enough that UTC is still on Sunday.
  const mondayMorning = new Date(2026, 9, 19, 6, 30)

  it('picks the coming weekday in local time', () => {
    expect(firstExecution('weekly', JUMAT, null, mondayMorning)).toBe('2026-10-23')
    expect(firstExecution('weekly', MINGGU, null, mondayMorning)).toBe('2026-10-25')
  })

  it('pushes a weekly item set to today to next week', () => {
    expect(firstExecution('weekly', SENIN, null, mondayMorning)).toBe('2026-10-26')
  })

  it('keeps a monthly item in this month when the day has not passed', () => {
    expect(firstExecution('monthly', null, 25, mondayMorning)).toBe('2026-10-25')
    expect(firstExecution('monthly', null, 19, mondayMorning)).toBe('2026-10-19')
  })

  it('moves a monthly item to next month once the day has passed', () => {
    expect(firstExecution('monthly', null, 5, mondayMorning)).toBe('2026-11-05')
    expect(firstExecution('monthly', null, 5, new Date(2026, 11, 20))).toBe('2027-01-05')
  })

  it('clamps the 31st to the end of a short month', () => {
    expect(firstExecution('monthly', null, 31, new Date(2026, 10, 15))).toBe('2026-11-30')
    expect(firstExecution('monthly', null, 31, new Date(2026, 1, 3))).toBe('2026-02-28')
  })
})

describe('nextExecution', () => {
  it('adds a week, across month and year ends', () => {
    expect(nextExecution('weekly', '2026-10-19', null)).toBe('2026-10-26')
    expect(nextExecution('weekly', '2026-12-28', null)).toBe('2027-01-04')
  })

  it('moves to the same day next month', () => {
    expect(nextExecution('monthly', '2026-10-06', 6)).toBe('2026-11-06')
    expect(nextExecution('monthly', '2026-12-01', 1)).toBe('2027-01-01')
  })

  it('does not overflow from the 31st into the month after', () => {
    // A plain setMonth(+1) on Jan 31 lands on Mar 3.
    expect(nextExecution('monthly', '2026-01-31', 31)).toBe('2026-02-28')
    expect(nextExecution('monthly', '2028-01-31', 31)).toBe('2028-02-29')
  })

  it('goes back to the chosen day after a short month', () => {
    expect(nextExecution('monthly', '2026-02-28', 31)).toBe('2026-03-31')
    expect(nextExecution('monthly', '2026-04-30', 31)).toBe('2026-05-31')
  })

  it('falls back to the current day when day_of_month is missing', () => {
    expect(nextExecution('monthly', '2026-10-15', null)).toBe('2026-11-15')
  })
})
