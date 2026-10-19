import { describe, expect, it } from 'vitest'
import { formatRupiah, parseRupiah } from './currency'

describe('formatRupiah', () => {
  it('uses dots as thousand separators', () => {
    expect(formatRupiah(1500000)).toBe('Rp 1.500.000')
    expect(formatRupiah(0)).toBe('Rp 0')
  })

  it('drops the sign so callers decide how to show negatives', () => {
    expect(formatRupiah(-250000)).toBe('Rp 250.000')
  })

  it('shows zero for NaN', () => {
    expect(formatRupiah(Number.NaN)).toBe('Rp 0')
  })
})

describe('parseRupiah', () => {
  it('reads back what formatRupiah writes', () => {
    expect(parseRupiah(formatRupiah(9700000))).toBe(9700000)
  })

  it('ignores anything that is not a digit', () => {
    expect(parseRupiah('Rp 12.345abc')).toBe(12345)
  })

  it('returns 0 for empty input', () => {
    expect(parseRupiah('')).toBe(0)
    expect(parseRupiah('Rp ')).toBe(0)
  })
})
