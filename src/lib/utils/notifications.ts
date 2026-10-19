import { createClient } from '@/lib/supabase/client'
import { budgetAlert, budgetPercentage, budgetRange } from './budget'

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

    const { start: budgetStart, end: budgetEnd } = budgetRange(b.period)

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
    const percentage = budgetPercentage(spent, b.amount)
    const notifType = budgetAlert(percentage)

    if (!notifType) continue

    const categoryName = b.category_id
      ? (b.categories?.name || 'Kategori')
      : 'Keseluruhan'

    const periodLabel = getPeriodLabel(b.period)

    const isExceeded = notifType === 'budget_exceeded'

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
