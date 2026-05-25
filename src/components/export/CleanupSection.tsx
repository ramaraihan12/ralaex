'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Download, Trash2, AlertTriangle, FileSpreadsheet } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils/currency'

interface YearData {
  year: number
  transactionCount: number
}

const PAGE_SIZE = 1000

export function CleanupSection() {
  const [years, setYears] = useState<YearData[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingYear, setDeletingYear] = useState<number | null>(null)
  const [showConfirm, setShowConfirm] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const fetchYears = useCallback(async () => {
    setLoading(true)
    setError(null)

    const yearCounts = new Map<number, number>()
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data, error: err } = await supabase
        .from('transactions')
        .select('date')
        .range(offset, offset + PAGE_SIZE - 1)

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      if (data && data.length > 0) {
        ;(data as { date: string }[]).forEach((tx) => {
          const y = new Date(tx.date).getFullYear()
          yearCounts.set(y, (yearCounts.get(y) || 0) + 1)
        })
        offset += PAGE_SIZE
        hasMore = data.length === PAGE_SIZE
      } else {
        hasMore = false
      }
    }

    const sorted = Array.from(yearCounts.entries())
      .map(([year, transactionCount]) => ({ year, transactionCount }))
      .sort((a, b) => b.year - a.year)

    setYears(sorted)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    fetchYears()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [fetchYears])

  const handleDownloadYear = async (year: number) => {
    setError(null)
    try {
      const XLSX = await import('xlsx')

      const allTxs: {
        type: 'income' | 'outcome'
        amount: number
        date: string
        description: string | null
        categories: { name: string } | null
      }[] = []

      let offset = 0
      let hasMore = true

      while (hasMore) {
        const { data: transactions } = await supabase
          .from('transactions')
          .select('*, categories(name)')
          .gte('date', `${year}-01-01`)
          .lte('date', `${year}-12-31`)
          .order('date', { ascending: true })
          .range(offset, offset + PAGE_SIZE - 1)

        if (transactions && transactions.length > 0) {
          allTxs.push(...(transactions as unknown as typeof allTxs))
          offset += PAGE_SIZE
          hasMore = transactions.length === PAGE_SIZE
        } else {
          hasMore = false
        }
      }

      if (allTxs.length === 0) return

      const rows = allTxs.map((tx) => ({
        Tanggal: tx.date,
        Tipe: tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
        Kategori: tx.categories?.name || '',
        Deskripsi: tx.description || '',
        Nominal: tx.amount,
      }))

      const summaryIncome = allTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)
      const summaryOutcome = allTxs
        .filter((t) => t.type === 'outcome')
        .reduce((sum, t) => sum + t.amount, 0)
      const summaryNet = summaryIncome - summaryOutcome

      const wsData = [
        ['RaLaEX - Laporan Keuangan', '', '', '', ''],
        [`Periode: Tahun ${year}`, '', '', '', ''],
        ['', '', '', '', ''],
        ['Total Pemasukan', '', formatRupiah(summaryIncome), '', ''],
        ['Total Pengeluaran', '', formatRupiah(summaryOutcome), '', ''],
        ['Saldo Bersih', '', summaryNet >= 0 ? formatRupiah(summaryNet) : `-${formatRupiah(summaryNet)}`, '', ''],
        ['', '', '', '', ''],
        ['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal'],
        ...rows.map((r) => [
          r.Tanggal,
          r.Tipe,
          r.Kategori,
          r.Deskripsi,
          r.Nominal,
        ]),
      ]

      const ws = XLSX.utils.aoa_to_sheet(wsData)
      ws['!cols'] = [
        { wch: 14 },
        { wch: 14 },
        { wch: 20 },
        { wch: 30 },
        { wch: 16 },
      ]

      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan')
      XLSX.writeFile(wb, `RaLaEX_Tahun_${year}.xlsx`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengunduh data'
      setError(message)
    }
  }

  const handleDeleteYear = async (year: number) => {
    setDeletingYear(year)
    setError(null)

    const allReceipts: string[] = []
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data: receiptUrls } = await supabase
        .from('transactions')
        .select('receipt_url')
        .gte('date', `${year}-01-01`)
        .lte('date', `${year}-12-31`)
        .not('receipt_url', 'is', null)
        .range(offset, offset + PAGE_SIZE - 1)

      if (receiptUrls && receiptUrls.length > 0) {
        allReceipts.push(
          ...(receiptUrls as { receipt_url: string }[])
            .map((tx) => tx.receipt_url)
            .filter((url) => url)
        )
        offset += PAGE_SIZE
        hasMore = receiptUrls.length === PAGE_SIZE
      } else {
        hasMore = false
      }
    }

    if (allReceipts.length > 0) {
      const fileNames = allReceipts.map((url) => {
        try {
          const parsed = new URL(url)
          return parsed.pathname.split('/').pop() || ''
        } catch {
          const parts = url.split('/')
          return parts[parts.length - 1]
        }
      })

      const { error: storageErr } = await supabase.storage
        .from('receipts')
        .remove(fileNames)

      if (storageErr) {
        setError(`Gagal menghapus ${fileNames.length} file receipt: ${storageErr.message}`)
      }
    }

    const { error: deleteErr } = await supabase
      .from('transactions')
      .delete()
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`)

    if (deleteErr) {
      setError(deleteErr.message)
      setDeletingYear(null)
      setShowConfirm(null)
      return
    }

    await fetchYears()
    setDeletingYear(null)
    setShowConfirm(null)
  }

  if (loading) {
    return (
      <div className="cleanup-section">
        <p className="cleanup-empty">Memuat data...</p>
      </div>
    )
  }

  return (
    <div className="cleanup-section">
      <h2 className="cleanup-section-title">Pembersihan Data Tahunan</h2>
      <p className="cleanup-section-desc">
        Unduh atau hapus data berdasarkan tahun. Data yang dihapus tidak dapat dikembalikan.
      </p>

      {error && (
        <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-md)' }}>
          {error}
        </p>
      )}

      {years.length === 0 ? (
        <div className="empty-state-card">
          <div className="empty-state-icon">
            <FileSpreadsheet size={28} />
          </div>
          <h3>Belum Ada Data Transaksi</h3>
          <p>
            Data transaksi akan muncul di sini setelah Anda mulai mencatat pemasukan dan pengeluaran.
          </p>
        </div>
      ) : (
        <div className="cleanup-list">
          {years.map(({ year, transactionCount }) => (
            <div key={year} className="cleanup-year-card">
              <div>
                <div className="cleanup-year-label">{year}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)' }}>
                  {transactionCount} transaksi
                </div>
              </div>
              <div className="cleanup-year-actions">
                <button
                  className="cleanup-btn cleanup-btn-download"
                  onClick={() => handleDownloadYear(year)}
                >
                  <Download size={14} />
                  Unduh
                </button>
                <button
                  className="cleanup-btn cleanup-btn-delete"
                  onClick={() => setShowConfirm(year)}
                  disabled={deletingYear === year}
                >
                  <Trash2 size={14} />
                  {deletingYear === year ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showConfirm !== null && (
        <div className="confirm-overlay" onClick={() => setShowConfirm(null)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Hapus Data Tahun {showConfirm}?</h3>
            <p>
              Semua transaksi dan bukti foto untuk tahun {showConfirm} akan dihapus permanen.
            </p>
            <div className="confirm-warning">
              <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
              Pastikan Anda sudah mengunduh data sebelum menghapus. Data yang dihapus tidak dapat dikembalikan.
            </div>
            <div className="confirm-actions">
              <button className="confirm-cancel" onClick={() => setShowConfirm(null)}>
                Batal
              </button>
              <button
                className="confirm-delete"
                onClick={() => handleDeleteYear(showConfirm)}
                disabled={deletingYear !== null}
              >
                {deletingYear === showConfirm ? 'Menghapus...' : 'Hapus Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
