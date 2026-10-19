import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 1000

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  // Without this check an unset secret would accept "Bearer undefined".
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const currentYear = new Date().getFullYear()

  const { data: existingNotif } = await supabase
    .from('notifications')
    .select('id')
    .eq('type', 'yearly_cleanup')
    .gte('created_at', `${currentYear}-01-01`)
    .limit(1)

  if (existingNotif && existingNotif.length > 0) {
    return NextResponse.json({ created: false, message: 'Notification already exists for this year' })
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('date')
    .lt('date', `${currentYear}-01-01`)
    .limit(1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data || data.length === 0) {
    return NextResponse.json({ created: false, message: 'No previous years data found' })
  }

  const yearCounts = new Map<number, number>()
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const { data: yearsData } = await supabase
      .from('transactions')
      .select('date')
      .lt('date', `${currentYear}-01-01`)
      .range(offset, offset + PAGE_SIZE - 1)

    if (yearsData && yearsData.length > 0) {
      ;(yearsData as { date: string }[]).forEach((tx) => {
        const y = new Date(tx.date).getFullYear()
        yearCounts.set(y, (yearCounts.get(y) || 0) + 1)
      })
      offset += PAGE_SIZE
      hasMore = yearsData.length === PAGE_SIZE
    } else {
      hasMore = false
    }
  }

  const years = Array.from(yearCounts.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => b.year - a.year)

  const yearList = years
    .map(({ year, count }) => `${year} (${count} transaksi)`)
    .join(', ')

  const { error: insertErr } = await supabase.from('notifications').insert([
    {
      type: 'yearly_cleanup',
      title: 'Pengingat Backup Data',
      message: `Data tahun sebelumnya (${yearList}) masih tersimpan. Silakan ekspor data sebelum melakukan pembersihan tahunan.`,
    },
  ])

  if (insertErr) {
    if (insertErr.code === '23505') {
      return NextResponse.json({ created: false, message: 'Notification already exists for this year' })
    }
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({
    created: true,
    message: `Cleanup notification created for years: ${yearList}`,
  })
}
