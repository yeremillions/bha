-- Add fields for partial payments and approval workflow

-- Add amount_paid to track partial payments
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS amount_paid numeric(10,2) DEFAULT 0 CHECK (amount_paid >= 0);

-- Add approval_status for bookings requiring manager approval
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'approved' CHECK (
  approval_status IN ('approved', 'pending', 'rejected')
);

-- Add approved_by to track who approved the booking
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Add approved_at timestamp
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS approved_at timestamptz;

-- Update existing bookings: set amount_paid = total_amount for paid bookings
UPDATE bookings
SET amount_paid = total_amount
WHERE payment_status = 'paid';

-- Create index for faster approval queries
CREATE INDEX IF NOT EXISTS idx_bookings_approval_status ON bookings(approval_status) WHERE approval_status = 'pending';

-- Add comment for documentation
COMMENT ON COLUMN bookings.amount_paid IS 'Amount actually paid by customer. Used for tracking partial/deposit payments.';
COMMENT ON COLUMN bookings.approval_status IS 'Approval status for bookings without payment: approved, pending, rejected';
COMMENT ON COLUMN bookings.approved_by IS 'User ID of manager who approved/rejected the booking';
