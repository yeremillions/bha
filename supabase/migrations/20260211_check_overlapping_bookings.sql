-- Migration: Check for Overlapping Bookings
-- Run this BEFORE enabling the overlapping bookings trigger
-- Date: 2026-02-11

-- =====================================================
-- QUERY 1: Find All Overlapping Bookings
-- =====================================================
-- This query finds bookings that overlap for the same property
-- Run this in the SQL Editor to check your data

/*
WITH overlapping_bookings AS (
  SELECT 
    b1.id as booking_1_id,
    b1.booking_number as booking_1_number,
    b1.property_id,
    b1.check_in_date as booking_1_check_in,
    b1.check_out_date as booking_1_check_out,
    b1.status as booking_1_status,
    b2.id as booking_2_id,
    b2.booking_number as booking_2_number,
    b2.check_in_date as booking_2_check_in,
    b2.check_out_date as booking_2_check_out,
    b2.status as booking_2_status,
    p.name as property_name
  FROM bookings b1
  JOIN bookings b2 ON b1.property_id = b2.property_id 
    AND b1.id < b2.id  -- Avoid duplicates (A,B) and (B,A)
    AND b1.status NOT IN ('cancelled', 'no_show')
    AND b2.status NOT IN ('cancelled', 'no_show')
  JOIN properties p ON b1.property_id = p.id
  WHERE 
    -- Check for overlap: booking1 starts before booking2 ends AND booking1 ends after booking2 starts
    b1.check_in_date < b2.check_out_date 
    AND b1.check_out_date > b2.check_in_date
)
SELECT 
  property_name,
  booking_1_number,
  booking_1_check_in,
  booking_1_check_out,
  booking_1_status,
  booking_2_number,
  booking_2_check_in,
  booking_2_check_out,
  booking_2_status
FROM overlapping_bookings
ORDER BY property_name, booking_1_check_in;
*/

-- =====================================================
-- QUERY 2: Summary Count of Overlapping Bookings
-- =====================================================
-- Quick check: just get the count

/*
SELECT COUNT(*) as overlap_count
FROM bookings b1
JOIN bookings b2 ON b1.property_id = b2.property_id 
  AND b1.id < b2.id
  AND b1.status NOT IN ('cancelled', 'no_show')
  AND b2.status NOT IN ('cancelled', 'no_show')
WHERE 
  b1.check_in_date < b2.check_out_date 
  AND b1.check_out_date > b2.check_in_date;
*/

-- =====================================================
-- QUERY 3: Detailed Overlap Analysis with Customer Info
-- =====================================================
-- Shows overlapping bookings with customer details for resolution

/*
WITH overlapping_bookings AS (
  SELECT 
    b1.id as booking_1_id,
    b1.booking_number as booking_1_number,
    b1.property_id,
    b1.check_in_date as booking_1_check_in,
    b1.check_out_date as booking_1_check_out,
    b1.status as booking_1_status,
    b1.total_amount as booking_1_amount,
    c1.full_name as customer_1_name,
    c1.email as customer_1_email,
    b2.id as booking_2_id,
    b2.booking_number as booking_2_number,
    b2.check_in_date as booking_2_check_in,
    b2.check_out_date as booking_2_check_out,
    b2.status as booking_2_status,
    b2.total_amount as booking_2_amount,
    c2.full_name as customer_2_name,
    c2.email as customer_2_email,
    p.name as property_name,
    GREATEST(b1.check_in_date, b2.check_in_date) as overlap_start,
    LEAST(b1.check_out_date, b2.check_out_date) as overlap_end
  FROM bookings b1
  JOIN bookings b2 ON b1.property_id = b2.property_id 
    AND b1.id < b2.id
    AND b1.status NOT IN ('cancelled', 'no_show')
    AND b2.status NOT IN ('cancelled', 'no_show')
  JOIN properties p ON b1.property_id = p.id
  LEFT JOIN customers c1 ON b1.customer_id = c1.id
  LEFT JOIN customers c2 ON b2.customer_id = c2.id
  WHERE 
    b1.check_in_date < b2.check_out_date 
    AND b1.check_out_date > b2.check_in_date
)
SELECT 
  property_name,
  booking_1_number,
  customer_1_name,
  customer_1_email,
  booking_1_check_in,
  booking_1_check_out,
  booking_1_status,
  booking_1_amount,
  booking_2_number,
  customer_2_name,
  customer_2_email,
  booking_2_check_in,
  booking_2_check_out,
  booking_2_status,
  booking_2_amount,
  overlap_start,
  overlap_end,
  (overlap_end - overlap_start) as overlap_days
FROM overlapping_bookings
ORDER BY property_name, overlap_start;
*/

-- =====================================================
-- QUERY 4: Check by Property
-- =====================================================
-- See which properties have overlapping bookings

/*
SELECT 
  p.name as property_name,
  COUNT(*) as overlap_count
FROM bookings b1
JOIN bookings b2 ON b1.property_id = b2.property_id 
  AND b1.id < b2.id
  AND b1.status NOT IN ('cancelled', 'no_show')
  AND b2.status NOT IN ('cancelled', 'no_show')
JOIN properties p ON b1.property_id = p.id
WHERE 
  b1.check_in_date < b2.check_out_date 
  AND b1.check_out_date > b2.check_in_date
GROUP BY p.id, p.name
ORDER BY overlap_count DESC;
*/

-- =====================================================
-- FUNCTION: Check for overlapping bookings
-- =====================================================
-- Create a function that can be called to check for overlaps

CREATE OR REPLACE FUNCTION check_overlapping_bookings()
RETURNS TABLE (
  property_name TEXT,
  booking_1_number TEXT,
  booking_1_check_in DATE,
  booking_1_check_out DATE,
  booking_1_status TEXT,
  booking_2_number TEXT,
  booking_2_check_in DATE,
  booking_2_check_out DATE,
  booking_2_status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.name::TEXT as property_name,
    b1.booking_number::TEXT as booking_1_number,
    b1.check_in_date::DATE as booking_1_check_in,
    b1.check_out_date::DATE as booking_1_check_out,
    b1.status::TEXT as booking_1_status,
    b2.booking_number::TEXT as booking_2_number,
    b2.check_in_date::DATE as booking_2_check_in,
    b2.check_out_date::DATE as booking_2_check_out,
    b2.status::TEXT as booking_2_status
  FROM bookings b1
  JOIN bookings b2 ON b1.property_id = b2.property_id 
    AND b1.id < b2.id
    AND b1.status NOT IN ('cancelled', 'no_show')
    AND b2.status NOT IN ('cancelled', 'no_show')
  JOIN properties p ON b1.property_id = p.id
  WHERE 
    b1.check_in_date < b2.check_out_date 
    AND b1.check_out_date > b2.check_in_date
  ORDER BY p.name, b1.check_in_date;
END;
$$ LANGUAGE plpgsql;

-- Function to get count of overlapping bookings
CREATE OR REPLACE FUNCTION count_overlapping_bookings()
RETURNS INTEGER AS $$
DECLARE
  overlap_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO overlap_count
  FROM bookings b1
  JOIN bookings b2 ON b1.property_id = b2.property_id 
    AND b1.id < b2.id
    AND b1.status NOT IN ('cancelled', 'no_show')
    AND b2.status NOT IN ('cancelled', 'no_show')
  WHERE 
    b1.check_in_date < b2.check_out_date 
    AND b1.check_out_date > b2.check_in_date;
  
  RETURN overlap_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION check_overlapping_bookings() TO authenticated;
GRANT EXECUTE ON FUNCTION count_overlapping_bookings() TO authenticated;

-- Add comments
COMMENT ON FUNCTION check_overlapping_bookings() IS 'Returns all overlapping bookings for the same property. Run this before enabling the overlapping bookings trigger.';
COMMENT ON FUNCTION count_overlapping_bookings() IS 'Returns the count of overlapping bookings. Use this for quick verification.';

-- =====================================================
-- INSTRUCTIONS
-- =====================================================
/*

STEP 1: Run the check function
-----------------------------
SELECT count_overlapping_bookings();

If result is 0: No overlaps found, safe to enable trigger
If result > 0: Run the detailed check to see overlaps

STEP 2: If overlaps exist, view them
-------------------------------------
SELECT * FROM check_overlapping_bookings();

This will show you:
- Which properties have overlaps
- Which bookings overlap
- Check-in/out dates for both bookings
- Current status of each booking

STEP 3: Resolve overlaps manually
----------------------------------
For each overlap, decide:
1. Cancel one of the bookings (if duplicate/error)
2. Change dates for one booking (if customer can be moved)
3. Contact customers to resolve conflict

Example cancellation:
UPDATE bookings 
SET status = 'cancelled', 
    cancellation_reason = 'Duplicate booking - overlapping dates'
WHERE booking_number = 'BK-XXXXX';

STEP 4: Re-verify
-----------------
Run again: SELECT count_overlapping_bookings();

Once count is 0, you can safely enable the overlapping bookings trigger.

STEP 5: Enable the trigger (after confirming no overlaps)
----------------------------------------------------------
Uncomment and run the trigger creation from the concurrency protection migration:

CREATE TRIGGER prevent_overlapping_bookings_trigger
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_overlap();

*/
