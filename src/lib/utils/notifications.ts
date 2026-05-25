import { createClient } from '@/lib/supabase/client'
import { getWeekRange, getMonthRange } from './date'

function getPeriodLabel(period: 'weekly' | 'monthly'): string {
  return period === 'weekly' ? 'minggu ini' : 'bulan ini'
}

export async function checkBudgetNotifications(categoryId: string) {
  const supabase = createClient()

  const { data: budgets } = await supabase
    .from('budgets')
    .select('*, categories(id, name)')
    .eq('is_active', true)
    .or(`category_id.eq.${categoryId},category_id.is.null`)

  if (!budgets || budgets.length === 0) return

  for (const budget of budgets) {
    const b = budget as {
      id: string
      category_id: string | null
      amount: number
      period: 'weekly' | 'monthly'
      categories?: { name: string } | null
    }

    let budgetStart: string
    let budgetEnd: string

    if (b.period === 'weekly') {
      const wr = getWeekRange()
      budgetStart = wr.start
      budgetEnd = wr.end
    } else {
      const mr = getMonthRange()
      budgetStart = mr.start
      budgetEnd = mr.end
    }

    let query = supabase
      .from('transactions')
      .select('amount')
      .eq('type', 'outcome')
      .gte('date', budgetStart)
      .lte('date', budgetEnd)

    if (b.category_id) {
      query = query.eq('category_id', b.category_id)
    }

    const { data: outcomeData } = await query
    const spent = (outcomeData || []).reduce((sum, t) => sum + t.amount, 0)
    const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0

    if (percentage < 80) continue

    const categoryName = b.category_id
      ? (b.categories?.name || 'Kategori')
      : 'Keseluruhan'

    const periodLabel = getPeriodLabel(b.period)

    const isExceeded = percentage >= 100
    const notifType = isExceeded ? 'budget_exceeded' : 'budget_warning'

    const { data: existingNotif } = await supabase
      .from('notifications')
      .select('id')
      .eq('type', notifType)
      .eq('related_id', b.id)
      .gte('created_at', `${budgetStart}T00:00:00`)
      .lte('created_at', `${budgetEnd}T23:59:59`)
      .limit(1)

    if (existingNotif && existingNotif.length > 0) continue

    const title = isExceeded
      ? 'Anggaran Melebihi Batas'
      : 'Anggaran Hampir Penuh'

    const message = isExceeded
      ? `Anggaran ${categoryName} ${periodLabel} sudah melebihi batas: Rp ${spent.toLocaleString('id-ID')} dari Rp ${b.amount.toLocaleString('id-ID')}`
      : `Anggaran ${categoryName} ${periodLabel} sudah terpakai ${percentage}% (Rp ${spent.toLocaleString('id-ID')} dari Rp ${b.amount.toLocaleString('id-ID')})`

    await supabase.from('notifications').insert([
      {
        type: notifType,
        title,
        message,
        related_id: b.id,
      },
    ])
  }
}
