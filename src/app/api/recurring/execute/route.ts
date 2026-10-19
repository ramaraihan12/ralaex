import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function computeNextDate(frequency: 'weekly' | 'monthly', currentDate: string): string {
  const d = new Date(currentDate)

  if (frequency === 'weekly') {
    d.setDate(d.getDate() + 7)
  } else {
    d.setMonth(d.getMonth() + 1)
  }

  return d.toISOString().split('T')[0]
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  // Without this check an unset secret would accept "Bearer undefined".
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: recurringItems, error: fetchErr } = await supabase
    .from('recurring_transactions')
    .select('*, categories(id, name)')
    .eq('is_active', true)
    .lte('next_execution', today)

  if (fetchErr) {
    return NextResponse.json({ error: fetchErr.message }, { status: 500 })
  }

  if (!recurringItems || recurringItems.length === 0) {
    return NextResponse.json({ executed: 0, message: 'No items to execute' })
  }

  const results: { id: string; executed: boolean; skipped: boolean }[] = []

  for (const item of recurringItems) {
    const r = item as {
      id: string
      type: 'income' | 'outcome'
      amount: number
      category_id: string
      description: string | null
      frequency: 'weekly' | 'monthly'
      day_of_week: number | null
      day_of_month: number | null
      next_execution: string
      categories?: { name: string } | null
    }

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', 'recurring_reminder')
      .eq('related_id', r.id)
      .gte('created_at', `${today}T00:00:00`)
      .limit(1)

    if (existingNotif && existingNotif.length > 0) {
      results.push({ id: r.id, executed: false, skipped: true })
      continue
    }

    const { error: insertErr } = await supabase.from('transactions').insert([
      {
        type: r.type,
        amount: r.amount,
        category_id: r.category_id,
        description: r.description,
        date: today,
      },
    ])

    if (insertErr) {
      results.push({ id: r.id, executed: false, skipped: false })
      continue
    }

    const nextExecution = computeNextDate(r.frequency, r.next_execution)

    await supabase
      .from('recurring_transactions')
      .update({ next_execution: nextExecution })
      .eq('id', r.id)

    const categoryName = r.categories?.name || 'Kategori'
    const typeLabel = r.type === 'income' ? 'pemasukan' : 'pengeluaran'
    const notifTitle = 'Transaksi Otomatis'
    const notifMessage = `Transaksi berulang "${r.description || categoryName}" sebesar Rp ${r.amount.toLocaleString('id-ID')} telah dicatat sebagai ${typeLabel}.`

    await supabase.from('notifications').insert([
      {
        type: 'recurring_reminder',
        title: notifTitle,
        message: notifMessage,
        related_id: r.id,
      },
    ])

    results.push({ id: r.id, executed: true, skipped: false })
  }

  const executedCount = results.filter((r) => r.executed).length
  const skippedCount = results.filter((r) => r.skipped).length

  return NextResponse.json({
    executed: executedCount,
    skipped: skippedCount,
    results,
    message: `${executedCount} executed, ${skippedCount} skipped`,
  })
}
