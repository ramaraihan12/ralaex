export interface Category {
  id: string
  name: string
  type: 'income' | 'outcome'
  icon: string
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  type: 'income' | 'outcome'
  amount: number
  category_id: string
  description: string | null
  date: string
  receipt_url: string | null
  created_at: string
  updated_at: string
}

export interface Budget {
  id: string
  category_id: string | null
  amount: number
  period: 'weekly' | 'monthly'
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  type: 'income' | 'outcome'
  amount: number
  category_id: string
  description: string | null
  frequency: 'weekly' | 'monthly'
  day_of_week: number | null
  day_of_month: number | null
  next_execution: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  type: 'budget_warning' | 'budget_exceeded' | 'recurring_reminder' | 'yearly_cleanup' | 'bill_reminder'
  title: string
  message: string
  is_read: boolean
  related_id: string | null
  created_at: string
}
