-- ============================================================================
-- FINANCIAL TRANSACTIONS MODULE
-- Track all income and expenses for comprehensive financial reporting
-- ============================================================================

-- Transaction types enum
CREATE TYPE transaction_type AS ENUM ('income', 'expense');

-- Transaction categories
CREATE TYPE transaction_category AS ENUM (
  -- Income categories
  'accommodation',
  'bar_sales',
  'other_services',
  'deposit',
  'additional_charges',

  -- Expense categories
  'staff_salaries',
  'housekeeping',
  'utilities',
  'maintenance',
  'supplies',
  'inventory',
  'marketing',
  'insurance',
  'taxes',
  'other_expenses'
);

-- Payment methods
CREATE TYPE payment_method AS ENUM (
  'cash',
  'bank_transfer',
  'card',
  'paystack',
  'pos',
  'other'
);

-- Financial transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Transaction details
  transaction_type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  payment_method payment_method,

  -- References
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,

  -- Description
  description TEXT,
  notes TEXT,

  -- Dates
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_booking ON transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_property ON transactions(property_id);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS transactions_updated_at ON transactions;
CREATE TRIGGER transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_transactions_updated_at();

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for all users" ON transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON transactions;

CREATE POLICY "Enable read access for all users" ON transactions FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users only" ON transactions FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users only" ON transactions FOR DELETE USING (true);

-- Function to automatically create transaction when booking is confirmed
CREATE OR REPLACE FUNCTION create_booking_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create transaction when booking is confirmed and no transaction exists
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO transactions (
      transaction_type,
      category,
      amount,
      payment_method,
      booking_id,
      property_id,
      description,
      transaction_date
    ) VALUES (
      'income',
      'accommodation',
      NEW.total_amount,
      CASE
        WHEN NEW.payment_status = 'paid' THEN 'bank_transfer'
        ELSE 'cash'
      END,
      NEW.id,
      NEW.property_id,
      'Booking revenue for ' || (SELECT name FROM properties WHERE id = NEW.property_id),
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-create transactions for confirmed bookings
DROP TRIGGER IF EXISTS trigger_create_booking_transaction ON bookings;
CREATE TRIGGER trigger_create_booking_transaction
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_booking_transaction();

-- Create transactions for existing confirmed bookings (one-time data migration)
INSERT INTO transactions (
  transaction_type,
  category,
  amount,
  payment_method,
  booking_id,
  property_id,
  description,
  transaction_date,
  created_at
)
SELECT
  'income',
  'accommodation',
  b.total_amount,
  'bank_transfer',
  b.id,
  b.property_id,
  'Booking revenue for ' || p.name,
  b.created_at,
  b.created_at
FROM bookings b
JOIN properties p ON b.property_id = p.id
WHERE b.status IN ('confirmed', 'checked_in', 'checked_out', 'completed')
  AND NOT EXISTS (
    SELECT 1 FROM transactions t WHERE t.booking_id = b.id
  );
