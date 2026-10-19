-- ============================================================================
-- RaLaEX Database Setup
-- Jalankan semua SQL ini di Supabase SQL Editor
-- ============================================================================

-- TABEL: categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'outcome')),
  icon VARCHAR(50) DEFAULT 'circle',
  color VARCHAR(7) DEFAULT '#B8663B',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- TABEL: transactions
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'outcome')),
  amount BIGINT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type_date ON transactions(type, date);

-- TABEL: budgets
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount BIGINT NOT NULL,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'monthly')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_period ON budgets(period);

-- TABEL: recurring_transactions
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'outcome')),
  amount BIGINT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  description TEXT,
  frequency VARCHAR(10) NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
  day_of_week INT CHECK (day_of_week BETWEEN 0 AND 6),
  day_of_month INT CHECK (day_of_month BETWEEN 1 AND 31),
  next_execution DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABEL: notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(30) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_yearly_unique
  ON notifications(type, (EXTRACT(YEAR FROM (created_at AT TIME ZONE 'UTC'))))
  WHERE type = 'yearly_cleanup';

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated full access" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON budgets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON recurring_transactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated full access" ON notifications
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================================
-- TRIGGER: updated_at auto-update on row modification
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STORAGE: receipts bucket
-- ⚠️ Jalankan SQL ini di Supabase SQL Editor (https://supabase.com/dashboard)
--    Jika bucket "receipts" belum ada, INSERT di bawah akan membuatkannya.
--    Policies memberikan akses upload/read/delete hanya ke user authenticated.
-- ============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can read receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'receipts');

CREATE POLICY "Authenticated users can delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'receipts');
