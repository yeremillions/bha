-- Update existing walk-in bookings to 'paid' status
-- Walk-in customers typically pay immediately at the time of booking

UPDATE bookings
SET payment_status = 'paid'
WHERE source = 'walk_in'
  AND payment_status = 'pending';
