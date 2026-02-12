-- Migration: Add concurrency protection for booking creation
-- This prevents double-booking in high-traffic scenarios
-- Date: 2026-02-11

-- =====================================================
-- 1. IMPROVED AVAILABILITY CHECK WITH LOCKING
-- =====================================================
-- This function uses advisory locks to prevent concurrent bookings
-- of the same property for overlapping dates

CREATE OR REPLACE FUNCTION check_property_availability_safe(
  p_property_id uuid,
  p_check_in date,
  p_check_out date
)
RETURNS boolean AS $$
DECLARE
  v_count integer;
  v_lock_id bigint;
BEGIN
  -- Generate a consistent lock ID based on property and dates
  -- This ensures concurrent requests for the same property/dates block each other
  v_lock_id := ('x' || substr(md5(p_property_id::text || p_check_in::text || p_check_out::text), 1, 16))::bit(64)::bigint;
  
  -- Try to acquire advisory lock (will wait if another transaction holds it)
  -- Timeout is handled at the application level or via statement_timeout
  PERFORM pg_advisory_xact_lock(v_lock_id);
  
  -- Now check for overlapping bookings
  -- Use FOR UPDATE to lock any existing booking rows that might conflict
  SELECT COUNT(*) INTO v_count
  FROM bookings
  WHERE property_id = p_property_id
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (p_check_in >= check_in_date AND p_check_in < check_out_date)
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date)
    )
  FOR UPDATE SKIP LOCKED;
  
  RETURN v_count = 0;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. ATOMIC BOOKING CREATION FUNCTION
-- =====================================================
-- This function combines availability check and booking creation
-- in a single atomic operation

CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_property_id uuid,
  p_customer_id uuid,
  p_check_in date,
  p_check_out date,
  p_num_guests integer,
  p_base_amount numeric,
  p_cleaning_fee numeric,
  p_tax_amount numeric,
  p_discount_amount numeric,
  p_total_amount numeric,
  p_special_requests text DEFAULT NULL
)
RETURNS TABLE (
  booking_id uuid,
  booking_number text,
  success boolean,
  error_message text
) AS $$
DECLARE
  v_available boolean;
  v_booking_id uuid;
  v_booking_number text;
  v_lock_id bigint;
BEGIN
  -- Generate lock ID for this property/date combination
  v_lock_id := ('x' || substr(md5(p_property_id::text || p_check_in::text || p_check_out::text), 1, 16))::bit(64)::bigint;
  
  -- Acquire advisory lock for the duration of this transaction
  PERFORM pg_advisory_xact_lock(v_lock_id);
  
  -- Check availability with row locking
  SELECT COUNT(*) = 0 INTO v_available
  FROM bookings
  WHERE property_id = p_property_id
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (p_check_in >= check_in_date AND p_check_in < check_out_date)
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date)
    )
  FOR UPDATE SKIP LOCKED;
  
  IF NOT v_available THEN
    RETURN QUERY SELECT NULL::uuid, NULL::text, false, 'Property is not available for the selected dates'::text;
    RETURN;
  END IF;
  
  -- Create the booking
  INSERT INTO bookings (
    property_id,
    customer_id,
    check_in_date,
    check_out_date,
    num_guests,
    base_amount,
    cleaning_fee,
    tax_amount,
    discount_amount,
    total_amount,
    special_requests,
    booked_via,
    source,
    status,
    payment_status
  ) VALUES (
    p_property_id,
    p_customer_id,
    p_check_in,
    p_check_out,
    p_num_guests,
    p_base_amount,
    p_cleaning_fee,
    p_tax_amount,
    p_discount_amount,
    p_total_amount,
    p_special_requests,
    'website',
    'direct',
    'pending',
    'pending'
  )
  RETURNING id, booking_number INTO v_booking_id, v_booking_number;
  
  RETURN QUERY SELECT v_booking_id, v_booking_number, true, NULL::text;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. BOOKING VALIDATION TRIGGER
-- =====================================================
-- This trigger prevents inserting overlapping bookings at the database level

CREATE OR REPLACE FUNCTION prevent_overlapping_bookings()
RETURNS trigger AS $$
DECLARE
  v_overlap_count integer;
BEGIN
  -- Check for overlapping bookings (excluding cancelled/completed)
  SELECT COUNT(*) INTO v_overlap_count
  FROM bookings
  WHERE property_id = NEW.property_id
    AND id != NEW.id  -- Exclude the current row for updates
    AND status NOT IN ('cancelled', 'completed')
    AND (
      (NEW.check_in_date >= check_in_date AND NEW.check_in_date < check_out_date)
      OR (NEW.check_out_date > check_in_date AND NEW.check_out_date <= check_out_date)
      OR (NEW.check_in_date <= check_in_date AND NEW.check_out_date >= check_out_date)
    );
  
  IF v_overlap_count > 0 THEN
    RAISE EXCEPTION 'Property is not available for the selected dates. Overlapping booking exists.'
      USING ERRCODE = 'unique_violation';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger (run this after ensuring no overlapping bookings exist)
-- DROP TRIGGER IF EXISTS prevent_overlapping_bookings_trigger ON bookings;
-- CREATE TRIGGER prevent_overlapping_bookings_trigger
--   BEFORE INSERT OR UPDATE ON bookings
--   FOR EACH ROW
--   EXECUTE FUNCTION prevent_overlapping_bookings();

-- =====================================================
-- 4. EXCLUSION CONSTRAINT (Alternative Approach)
-- =====================================================
-- This uses PostgreSQL's exclusion constraints with btree_gist extension
-- It's the most robust solution but requires the btree_gist extension

-- Note: Uncomment and run this if you have btree_gist extension available
/*
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE bookings
ADD CONSTRAINT no_overlapping_bookings
  EXCLUDE USING gist (
    property_id WITH =,
    daterange(check_in_date, check_out_date, '[)') WITH &&
  )
  WHERE (status NOT IN ('cancelled', 'completed'));
*/

-- =====================================================
-- 5. INDEXES FOR PERFORMANCE
-- =====================================================
-- These indexes improve the performance of availability checks

CREATE INDEX IF NOT EXISTS idx_bookings_property_dates 
  ON bookings(property_id, check_in_date, check_out_date)
  WHERE status NOT IN ('cancelled', 'completed');

CREATE INDEX IF NOT EXISTS idx_bookings_overlap_check 
  ON bookings(property_id, check_in_date, check_out_date, status);

-- =====================================================
-- 6. CLEANUP FUNCTION
-- =====================================================
-- Function to release all advisory locks (useful for debugging)

CREATE OR REPLACE FUNCTION release_all_booking_locks()
RETURNS void AS $$
DECLARE
  v_released integer;
BEGIN
  SELECT count(*) INTO v_released FROM pg_advisory_unlock_all();
  RAISE NOTICE 'Released % advisory locks', v_released;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON FUNCTION check_property_availability_safe IS 'Checks availability with advisory locking to prevent race conditions';
COMMENT ON FUNCTION create_booking_atomic IS 'Atomically checks availability and creates booking to prevent double-booking';
COMMENT ON FUNCTION prevent_overlapping_bookings IS 'Trigger function to prevent overlapping bookings at the database level';
