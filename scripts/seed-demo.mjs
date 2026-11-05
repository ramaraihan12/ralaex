// Fills the public demo with fictional household data, logged in as the demo
// account like any visitor. It only adds what's missing, so it's safe to re-run:
// the demo-upkeep workflow uses it to roll the data into each new day and month
// and to put back whatever a visitor deleted.
//
//   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... node scripts/seed-demo.mjs

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY first.')
  process.exit(1)
}

const MONTHS_OF_HISTORY = 6

const CATEGORIES = [
  { name: 'Gaji', type: 'income', icon: 'Briefcase', color: '#4F7F52' },
  { name: 'Freelance', type: 'income', icon: 'Coins', color: '#2F7F86' },
  { name: 'Makan & Jajan', type: 'outcome', icon: 'Utensils', color: '#B8663B' },
  { name: 'Belanja Bulanan', type: 'outcome', icon: 'ShoppingCart', color: '#C98A2C' },
  { name: 'Transportasi', type: 'outcome', icon: 'Car', color: '#5B7FA6' },
  { name: 'Listrik & Air', type: 'outcome', icon: 'Zap', color: '#8C6BB1' },
  { name: 'Internet', type: 'outcome', icon: 'Wifi', color: '#3F8F8B' },
  { name: 'Kesehatan', type: 'outcome', icon: 'Stethoscope', color: '#B85C6E' },
  { name: 'Hiburan', type: 'outcome', icon: 'Film', color: '#6E8B4E' },
]

// The same month repeats with small changes, so the charts have some shape.
const MONTH_VARIATION = [1, 1.08, 0.94, 1.12, 0.97, 1.05, 0.91, 1.1, 1.02, 0.96, 1.07, 0.93]

const MONTH_TEMPLATE = [
  { day: 1, category: 'Gaji', amount: 9500000, description: 'Gaji PT Contoh Sejahtera', fixed: true },
  { day: 1, category: 'Internet', amount: 350000, description: 'Tagihan internet Contoh Net', fixed: true },
  { day: 2, category: 'Hiburan', amount: 180000, description: 'Nonton di Bioskop Contoh' },
  { day: 3, category: 'Belanja Bulanan', amount: 1450000, description: 'Belanja bulanan Toko Contoh' },
  { day: 4, category: 'Makan & Jajan', amount: 215000, description: 'Makan malam Warung Bu Contoh' },
  { day: 5, category: 'Transportasi', amount: 150000, description: 'Bensin SPBU Contoh' },
  { day: 8, category: 'Makan & Jajan', amount: 320000, description: 'Pesan antar Resto Contoh' },
  { day: 10, category: 'Listrik & Air', amount: 480000, description: 'Token listrik dan air Contoh' },
  { day: 12, category: 'Transportasi', amount: 120000, description: 'Ojek bulanan Contoh' },
  { day: 14, category: 'Makan & Jajan', amount: 260000, description: 'Sarapan keluarga Kedai Contoh' },
  { day: 15, category: 'Freelance', amount: 1750000, description: 'Proyek Klien Contoh' },
  { day: 17, category: 'Belanja Bulanan', amount: 410000, description: 'Belanja tambahan Pasar Contoh' },
  { day: 19, category: 'Transportasi', amount: 150000, description: 'Bensin SPBU Contoh kedua' },
  { day: 20, category: 'Kesehatan', amount: 225000, description: 'Vitamin Apotek Contoh' },
  { day: 22, category: 'Makan & Jajan', amount: 340000, description: 'Makan bersama Resto Contoh' },
  { day: 25, category: 'Hiburan', amount: 95000, description: 'Langganan film Contoh' },
  { day: 26, category: 'Makan & Jajan', amount: 290000, description: 'Jajan akhir pekan Kedai Contoh' },
  { day: 28, category: 'Transportasi', amount: 130000, description: 'Parkir dan tol Contoh' },
]

const BUDGETS = [
  { category: null, amount: 7000000, period: 'monthly' },
  { category: 'Makan & Jajan', amount: 1500000, period: 'monthly' },
  { category: 'Belanja Bulanan', amount: 2000000, period: 'monthly' },
  { category: 'Transportasi', amount: 600000, period: 'monthly' },
  { category: 'Hiburan', amount: 200000, period: 'monthly' },
]

const RECURRING = [
  { type: 'income', category: 'Gaji', amount: 9500000, description: 'Gaji PT Contoh Sejahtera', frequency: 'monthly', day_of_month: 1 },
  { type: 'outcome', category: 'Internet', amount: 350000, description: 'Tagihan internet Contoh Net', frequency: 'monthly', day_of_month: 1 },
  { type: 'outcome', category: 'Transportasi', amount: 100000, description: 'Isi saldo tol Contoh', frequency: 'weekly', day_of_week: 1 },
]

const fictional = (text) => `${text} (fiktif)`
const pad = (n) => String(n).padStart(2, '0')
const toDate = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`

// The household lives in WIB, wherever this happens to run.
const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(new Date())
const [year, month, day] = today.split('-').map(Number)

function monthlyEntries() {
  const entries = []
  for (let back = MONTHS_OF_HISTORY - 1; back >= 0; back--) {
    const first = new Date(Date.UTC(year, month - 1 - back, 1))
    const y = first.getUTCFullYear()
    const m = first.getUTCMonth()
    for (const item of MONTH_TEMPLATE) {
      const date = toDate(y, m, item.day)
      if (date > today) continue
      const factor = item.fixed ? 1 : MONTH_VARIATION[m]
      entries.push({
        category: item.category,
        date,
        amount: Math.round((item.amount * factor) / 1000) * 1000,
        description: fictional(item.description),
      })
    }
  }
  return entries
}

function nextRun({ frequency, day_of_month, day_of_week }) {
  if (frequency === 'monthly') {
    const candidate = new Date(Date.UTC(year, month - 1, day_of_month))
    if (day_of_month <= day) candidate.setUTCMonth(candidate.getUTCMonth() + 1)
    return candidate.toISOString().slice(0, 10)
  }
  const candidate = new Date(Date.UTC(year, month - 1, day))
  do candidate.setUTCDate(candidate.getUTCDate() + 1)
  while (candidate.getUTCDay() !== day_of_week)
  return candidate.toISOString().slice(0, 10)
}

const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: 'POST',
  headers: { apikey: key, 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'demo@example.com', password: 'demo-ralaex-2026' }),
})
if (!login.ok) throw new Error(`Demo login failed with status ${login.status}`)
const { access_token: token } = await login.json()

async function rest(path, { method = 'GET', body } = {}) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: key,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) throw new Error(`${method} ${path.split('?')[0]} failed: ${res.status} ${await res.text()}`)
  return res.json()
}

const existingCategories = await rest('categories?select=id,name,type')
const missingCategories = CATEGORIES.filter(
  (c) => !existingCategories.some((e) => e.name === c.name && e.type === c.type)
)
const created = missingCategories.length
  ? await rest('categories', { method: 'POST', body: missingCategories })
  : []
const categories = [...existingCategories, ...created]
const categoryId = (name) => categories.find((c) => c.name === name).id
const categoryType = (name) => CATEGORIES.find((c) => c.name === name).type

const entries = monthlyEntries()
const existing = await rest(
  `transactions?select=date,description&date=gte.${entries[0].date}&description=ilike.*fiktif*&limit=1000`
)
const seen = new Set(existing.map((t) => `${t.date}|${t.description}`))
const missingEntries = entries
  .filter((e) => !seen.has(`${e.date}|${e.description}`))
  .map((e) => ({
    type: categoryType(e.category),
    amount: e.amount,
    category_id: categoryId(e.category),
    description: e.description,
    date: e.date,
  }))
if (missingEntries.length) await rest('transactions', { method: 'POST', body: missingEntries })

const existingBudgets = await rest('budgets?select=category_id,period')
const missingBudgets = BUDGETS.map((b) => ({
  category_id: b.category ? categoryId(b.category) : null,
  amount: b.amount,
  period: b.period,
})).filter((b) => !existingBudgets.some((e) => e.category_id === b.category_id && e.period === b.period))
if (missingBudgets.length) await rest('budgets', { method: 'POST', body: missingBudgets })

// The cron routes don't post these yet, so move the date on by hand. Otherwise
// the recurring page would show a next run that's long gone.
const existingRecurring = await rest('recurring_transactions?select=id,description,next_execution')
let addedRecurring = 0
for (const { category, ...item } of RECURRING) {
  const description = fictional(item.description)
  const next_execution = nextRun(item)
  const found = existingRecurring.find((r) => r.description === description)
  if (!found) {
    await rest('recurring_transactions', {
      method: 'POST',
      body: { ...item, description, category_id: categoryId(category), next_execution },
    })
    addedRecurring++
  } else if (found.next_execution <= today) {
    await rest(`recurring_transactions?id=eq.${found.id}`, { method: 'PATCH', body: { next_execution } })
  }
}

console.log(
  `Added ${created.length} categories, ${missingEntries.length} transactions, ` +
    `${missingBudgets.length} budgets, ${addedRecurring} recurring items.`
)
