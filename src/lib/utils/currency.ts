export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp 0'
  return 'Rp ' + Math.abs(amount).toLocaleString('id-ID')
}

export function parseRupiah(formatted: string): number {
  const cleaned = formatted.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}
