'use client'

import { useState, useRef, useCallback } from 'react'
import { Download, FileSpreadsheet, FileText, File } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatRupiah } from '@/lib/utils/currency'
import type { Category } from '@/lib/types'

type ExportFormat = 'xlsx' | 'csv' | 'pdf'
type PeriodType = 'monthly' | 'yearly' | 'custom'
type TransactionType = 'all' | 'income' | 'outcome'

const PAGE_SIZE = 1000

export function ExportForm() {
  const [format, setFormat] = useState<ExportFormat>('xlsx')
  const [periodType, setPeriodType] = useState<PeriodType>('monthly')
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  })
  const [year, setYear] = useState(() => String(new Date().getFullYear()))
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [txType, setTxType] = useState<TransactionType>('all')
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const isMountedRef = useRef(true)

  const getPeriodLabel = (): string => {
    if (periodType === 'monthly') {
      const [y, m] = month.split('-')
      return `${getMonthName(parseInt(m))} ${y}`
    }
    if (periodType === 'yearly') {
      return `Tahun ${year}`
    }
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`
    }
    return 'Semua'
  }

  const getFileName = (): string => {
    const period = getPeriodLabel()
    const typeLabel = txType === 'all' ? '' : txType === 'income' ? '_Income' : '_Outcome'
    const ext = format === 'xlsx' ? '.xlsx' : format === 'csv' ? '.csv' : '.pdf'
    return `RaLaEX_${period.replace(/\s+/g, '_')}${typeLabel}${ext}`
  }

  const getDateRange = (): { start: string; end: string } => {
    if (periodType === 'monthly') {
      const [y, m] = month.split('-').map(Number)
      const lastDay = new Date(y, m, 0).getDate()
      return {
        start: `${month}-01`,
        end: `${month}-${String(lastDay).padStart(2, '0')}`,
      }
    }
    if (periodType === 'yearly') {
      return {
        start: `${year}-01-01`,
        end: `${year}-12-31`,
      }
    }
    return { start: startDate, end: endDate }
  }

  const fetchData = async () => {
    const { start, end } = getDateRange()

    const allData: {
      type: 'income' | 'outcome'
      amount: number
      date: string
      description: string | null
      categories: { name: string } | null
    }[] = []

    let offset = 0
    let hasMore = true

    while (hasMore) {
      let query = supabase
        .from('transactions')
        .select('*, categories(name)')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: true })
        .range(offset, offset + PAGE_SIZE - 1)

      if (txType !== 'all') {
        query = query.eq('type', txType)
      }

      const { data, error } = await query
      if (error) throw new Error(error.message)

      if (data && data.length > 0) {
        allData.push(...(data as unknown as typeof allData))
        offset += PAGE_SIZE
        hasMore = data.length === PAGE_SIZE
      } else {
        hasMore = false
      }
    }

    return allData
  }

  const getCategories = useCallback(async () => {
    const allData: Category[] = []
    let offset = 0
    let hasMore = true

    while (hasMore) {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name')
        .range(offset, offset + PAGE_SIZE - 1)

      if (error) throw new Error(error.message)

      if (data && data.length > 0) {
        allData.push(...(data as Category[]))
        offset += PAGE_SIZE
        hasMore = data.length === PAGE_SIZE
      } else {
        hasMore = false
      }
    }

    return allData
  }, [supabase])

  const exportXLSX = async (transactions: Awaited<ReturnType<typeof fetchData>>, categories: Category[]) => {
    const XLSX = await import('xlsx')
    const catMap = new Map(categories.map((c) => [c.id, c.name]))

    const rows = transactions.map((tx) => ({
      Tanggal: tx.date,
      Tipe: tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori: tx.categories?.name || catMap.get((tx as unknown as { category_id: string }).category_id) || '',
      Deskripsi: tx.description || '',
      Nominal: tx.amount,
    }))

    const summaryIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const summaryOutcome = transactions
      .filter((t) => t.type === 'outcome')
      .reduce((sum, t) => sum + t.amount, 0)
    const summaryNet = summaryIncome - summaryOutcome

    const wsData = [
      ['RaLaEX - Laporan Keuangan', '', '', '', ''],
      [`Periode: ${getPeriodLabel()}`, '', '', '', ''],
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
    XLSX.writeFile(wb, getFileName())
  }

  const exportCSV = (transactions: Awaited<ReturnType<typeof fetchData>>) => {
    const header = 'Tanggal,Tipe,Kategori,Deskripsi,Nominal'
    const rows = transactions.map((tx) => {
      const categoryName = (tx.categories?.name || '').replace(/"/g, '""')
      const desc = (tx.description || '').replace(/"/g, '""')
      return `${tx.date},${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'},"${categoryName}","${desc}",${tx.amount}`
    })

    const BOM = '\uFEFF'
    const csv = BOM + [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = getFileName()
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPDF = async (transactions: Awaited<ReturnType<typeof fetchData>>) => {
    const { jsPDF } = await import('jspdf')
    const autoTable = (await import('jspdf-autotable')).default

    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm' })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('RaLaEX - Laporan Keuangan', 14, 20)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Periode: ${getPeriodLabel()}`, 14, 28)
    doc.text(`Dibuat: ${new Date().toLocaleDateString('id-ID')}`, 14, 34)

    const summaryIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    const summaryOutcome = transactions
      .filter((t) => t.type === 'outcome')
      .reduce((sum, t) => sum + t.amount, 0)
    const summaryNet = summaryIncome - summaryOutcome

    autoTable(doc, {
      startY: 40,
      head: [['', 'Jumlah']],
      body: [
        ['Total Pemasukan', formatRupiah(summaryIncome)],
        ['Total Pengeluaran', formatRupiah(summaryOutcome)],
        ['Saldo Bersih', summaryNet >= 0 ? formatRupiah(summaryNet) : `-${formatRupiah(summaryNet)}`],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [184, 102, 59] },
      margin: { left: 14 },
      tableWidth: 80,
    })

    const tableBody = transactions.map((tx) => [
      tx.date,
      tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      tx.categories?.name || '',
      tx.description || '',
      tx.amount.toLocaleString('id-ID'),
    ])

    autoTable(doc, {
      startY: ((doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY || 46) + 6,
      head: [['Tanggal', 'Tipe', 'Kategori', 'Deskripsi', 'Nominal (Rp)']],
      body: tableBody,
      headStyles: { fillColor: [184, 102, 59] },
      styles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [250, 246, 240] },
      margin: { left: 14 },
    })

    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setTextColor(156, 142, 130)
      doc.text(
        `Halaman ${i} dari ${pageCount} - Dibuat oleh RaLaEX`,
        (doc as unknown as { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.width - 14,
        (doc as unknown as { internal: { pageSize: { width: number; height: number } } }).internal.pageSize.height - 8,
        { align: 'right' }
      )
    }

    doc.save(getFileName())
  }

  const handleExport = async () => {
    if (periodType === 'custom' && (!startDate || !endDate)) return

    setError(null)
    setExporting(true)
    try {
      const [transactions, categories] = await Promise.all([fetchData(), getCategories()])

      if (format === 'xlsx') {
        await exportXLSX(transactions, categories)
      } else if (format === 'csv') {
        exportCSV(transactions)
      } else {
        await exportPDF(transactions)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal mengekspor data'
      setError(message)
    } finally {
      if (isMountedRef.current) {
        setExporting(false)
      }
    }
  }

  const currentYear = new Date().getFullYear()
  const canExport = periodType !== 'custom' || (startDate && endDate)

  return (
    <div className="export-section">
      <h2 className="export-section-title">Unduh Data</h2>

      <div className="export-form">
        <div className="export-row">
          <label>Format</label>
          <div className="format-selector">
            <button
              className={`format-option ${format === 'xlsx' ? 'active' : ''}`}
              onClick={() => setFormat('xlsx')}
            >
              <FileSpreadsheet size={16} />
              Excel
            </button>
            <button
              className={`format-option ${format === 'csv' ? 'active' : ''}`}
              onClick={() => setFormat('csv')}
            >
              <FileText size={16} />
              CSV
            </button>
            <button
              className={`format-option ${format === 'pdf' ? 'active' : ''}`}
              onClick={() => setFormat('pdf')}
            >
              <File size={16} />
              PDF
            </button>
          </div>
        </div>

        <div className="export-row">
          <label>Periode</label>
          <div className="format-selector">
            <button
              className={`format-option ${periodType === 'monthly' ? 'active' : ''}`}
              onClick={() => setPeriodType('monthly')}
            >
              Bulanan
            </button>
            <button
              className={`format-option ${periodType === 'yearly' ? 'active' : ''}`}
              onClick={() => setPeriodType('yearly')}
            >
              Tahunan
            </button>
            <button
              className={`format-option ${periodType === 'custom' ? 'active' : ''}`}
              onClick={() => setPeriodType('custom')}
            >
              Custom
            </button>
          </div>
        </div>

        {periodType === 'monthly' && (
          <div className="export-row">
            <label>Bulan</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              max={`${currentYear}-12`}
            />
          </div>
        )}

        {periodType === 'yearly' && (
          <div className="export-row">
            <label>Tahun</label>
            <select value={year} onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 5 }, (_, i) => {
                const y = currentYear - i
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {periodType === 'custom' && (
          <div className="export-date-row">
            <div className="export-row">
              <label>Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="export-row">
              <label>Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        <div className="export-row">
          <label>Tipe Data</label>
          <select value={txType} onChange={(e) => setTxType(e.target.value as TransactionType)}>
            <option value="all">Semua</option>
            <option value="income">Pemasukan saja</option>
            <option value="outcome">Pengeluaran saja</option>
          </select>
        </div>

        {error && (
          <p style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
            {error}
          </p>
        )}

        <button
          className="export-btn"
          onClick={handleExport}
          disabled={!canExport || exporting}
        >
          {exporting ? (
            <>
              <div className="export-btn-loading" />
              Mengekspor...
            </>
          ) : (
            <>
              <Download size={18} />
              Unduh {format === 'xlsx' ? 'Excel' : format === 'csv' ? 'CSV' : 'PDF'}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

function getMonthName(m: number): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return months[m - 1] || ''
}
