-- =====================================================
-- Brooklyn Hills Apartments - Seed Data
-- Development and Testing Data
-- =====================================================

-- Clear existing data (be careful in production!)
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.properties CASCADE;

-- =====================================================
-- 1. SEED PROPERTIES
-- =====================================================

INSERT INTO public.properties (
  id,
  name,
  type,
  description,
  location,
  address,
  bedrooms,
  bathrooms,
  max_guests,
  base_price_per_night,
  cleaning_fee,
  amenities,
  images,
  status,
  featured,
  rating,
  review_count
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'Luxury 3-Bedroom Penthouse',
    'Penthouse',
    'Experience luxury living in this stunning 3-bedroom penthouse with panoramic city views, modern amenities, and premium finishes.',
    'Victoria Island, Lagos',
    '15 Ahmadu Bello Way, Victoria Island, Lagos',
    3,
    2,
    6,
    75000,
    15000,
    ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'],
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'],
    'available',
    true,
    4.9,
    24
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    'Executive Studio Suite',
    'Studio',
    'Perfect for solo travelers or couples, this executive studio offers comfort and convenience with all essential amenities.',
    'Lekki Phase 1, Lagos',
    '23 Admiralty Way, Lekki Phase 1, Lagos',
    1,
    1,
    2,
    35000,
    8000,
    ARRAY['security', 'power', 'wifi', 'entertainment'],
    ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'],
    'occupied',
    false,
    4.7,
    18
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    'Cozy 2-Bedroom Apartment',
    'Apartment',
    'A warm and inviting 2-bedroom apartment ideal for small families or groups seeking comfort and value.',
    'Ikoyi, Lagos',
    '8 Kingsway Road, Ikoyi, Lagos',
    2,
    2,
    4,
    55000,
    12000,
    ARRAY['security', 'power', 'wifi', 'kitchen'],
    ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop'],
    'available',
    true,
    4.8,
    31
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'Family Home with Garden',
    'House',
    'Spacious 4-bedroom family home with a private garden, perfect for extended stays and family gatherings.',
    'Ikeja GRA, Lagos',
    '12 Obafemi Awolowo Way, Ikeja GRA, Lagos',
    4,
    3,
    8,
    95000,
    20000,
    ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'],
    ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop'],
    'maintenance',
    false,
    4.6,
    12
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    'Modern Loft Space',
    'Loft',
    'Contemporary loft with open-plan living, high ceilings, and designer furnishings for the modern traveler.',
    'Victoria Island, Lagos',
    '45 Adeola Odeku Street, Victoria Island, Lagos',
    1,
    1,
    2,
    45000,
    10000,
    ARRAY['power', 'wifi', 'entertainment'],
    ARRAY['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&h=400&fit=crop'],
    'available',
    true,
    4.9,
    27
  ),
  (
    '66666666-6666-6666-6666-666666666666',
    'Beachfront Villa',
    'Villa',
    'Exclusive beachfront villa with 5 bedrooms, private pool, and direct beach access. Ultimate luxury experience.',
    'Lekki, Lagos',
    '1 Ocean View Drive, Lekki, Lagos',
    5,
    4,
    10,
    150000,
    25000,
    ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'],
    ARRAY['https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&h=400&fit=crop'],
    'available',
    true,
    5.0,
    8
  );

-- =====================================================
-- 2. SEED CUSTOMERS
-- =====================================================

INSERT INTO public.customers (
  id,
  full_name,
  email,
  phone,
  whatsapp,
  date_of_birth,
  nationality,
  id_type,
  id_number,
  emergency_contact_name,
  emergency_contact_phone,
  vip_status,
  notes
) VALUES
  (
    'c1111111-1111-1111-1111-111111111111',
    'Adebayo Johnson',
    'adebayo.j@email.com',
    '+234 803 456 7890',
    '+234 803 456 7890',
    '1985-03-15',
    'Nigerian',
    'passport',
    'A12345678',
    'Funke Johnson',
    '+234 805 123 4567',
    false,
    'Regular business traveler. Prefers quiet rooms.'
  ),
  (
    'c2222222-2222-2222-2222-222222222222',
    'Chioma Okafor',
    'chioma.ok@email.com',
    '+234 806 789 0123',
    '+234 806 789 0123',
    '1990-07-22',
    'Nigerian',
    'drivers_license',
    'LAG-234567',
    'Emeka Okafor',
    '+234 807 234 5678',
    false,
    'Vegetarian. Allergic to nuts.'
  ),
  (
    'c3333333-3333-3333-3333-333333333333',
    'Tunde Williams',
    'tunde.w@email.com',
    '+234 809 012 3456',
    '+234 809 012 3456',
    '1982-11-08',
    'Nigerian',
    'national_id',
    '12345678901',
    'Bola Williams',
    '+234 808 345 6789',
    false,
    'Frequent guest. Likes early check-in.'
  ),
  (
    'c4444444-4444-4444-4444-444444444444',
    'Grace Eze',
    'grace.eze@email.com',
    '+234 810 234 5678',
    '+234 810 234 5678',
    '1988-05-18',
    'Nigerian',
    'passport',
    'B98765432',
    'Peter Eze',
    '+234 811 456 7890',
    true,
    'VIP guest. Family celebrations only.'
  ),
  (
    'c5555555-5555-5555-5555-555555555555',
    'Ibrahim Musa',
    'ibrahim.m@email.com',
    '+234 812 345 6789',
    '+234 812 345 6789',
    '1975-09-30',
    'Nigerian',
    'national_id',
    '98765432109',
    'Aisha Musa',
    '+234 813 567 8901',
    true,
    'Corporate guest. Requires invoices for all stays.'
  ),
  (
    'c6666666-6666-6666-6666-666666666666',
    'Folake Adeyemi',
    'folake.a@email.com',
    '+234 814 567 8901',
    '+234 814 567 8901',
    '1993-12-25',
    'Nigerian',
    'drivers_license',
    'LAG-789012',
    'Ayo Adeyemi',
    '+234 815 678 9012',
    false,
    'First-time guest. Referred by Chioma Okafor.'
  );

-- =====================================================
-- 3. SEED BOOKINGS
-- =====================================================

INSERT INTO public.bookings (
  id,
  booking_number,
  property_id,
  customer_id,
  check_in_date,
  check_out_date,
  num_guests,
  guest_names,
  base_amount,
  cleaning_fee,
  tax_amount,
  discount_amount,
  total_amount,
  status,
  payment_status,
  special_requests,
  arrival_time,
  booked_via,
  source
) VALUES
  (
    'b1111111-1111-1111-1111-111111111111',
    'BK001',
    '11111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    '2024-12-24',
    '2024-12-27',
    4,
    ARRAY['Adebayo Johnson', 'Funke Johnson', 'Temi Johnson', 'Kemi Johnson'],
    450000,
    15000,
    30000,
    0,
    495000,
    'confirmed',
    'paid',
    'Early check-in if possible',
    '14:00',
    'dashboard',
    'Direct booking'
  ),
  (
    'b2222222-2222-2222-2222-222222222222',
    'BK002',
    '33333333-3333-3333-3333-333333333333',
    'c2222222-2222-2222-2222-222222222222',
    '2024-12-22',
    '2024-12-25',
    3,
    ARRAY['Chioma Okafor', 'Emeka Okafor', 'Ada Okafor'],
    275000,
    12000,
    21000,
    0,
    308000,
    'pending',
    'pending',
    'Vegetarian meals preferred',
    '15:00',
    'website',
    'Online booking'
  ),
  (
    'b3333333-3333-3333-3333-333333333333',
    'BK003',
    '22222222-2222-2222-2222-222222222222',
    'c3333333-3333-3333-3333-333333333333',
    '2024-12-19',
    '2024-12-21',
    2,
    ARRAY['Tunde Williams', 'Bola Williams'],
    210000,
    8000,
    24000,
    0,
    242000,
    'checked_in',
    'paid',
    'Late checkout needed',
    '12:00',
    'phone',
    'Phone booking'
  ),
  (
    'b4444444-4444-4444-4444-444444444444',
    'BK004',
    '44444444-4444-4444-4444-444444444444',
    'c4444444-4444-4444-4444-444444444444',
    '2024-12-27',
    '2025-01-01',
    8,
    ARRAY['Grace Eze', 'Peter Eze', 'John Eze', 'Mary Eze', 'Paul Eze', 'Ruth Eze', 'David Eze', 'Sarah Eze'],
    1350000,
    20000,
    60000,
    0,
    1430000,
    'confirmed',
    'paid',
    'Family reunion. Need extra chairs.',
    '16:00',
    'dashboard',
    'VIP booking'
  ),
  (
    'b5555555-5555-5555-5555-555555555555',
    'BK005',
    '11111111-1111-1111-1111-111111111111',
    'c5555555-5555-5555-5555-555555555555',
    '2024-12-14',
    '2024-12-16',
    5,
    ARRAY['Ibrahim Musa', 'Aisha Musa', 'Fatima Musa', 'Hassan Musa', 'Amina Musa'],
    300000,
    15000,
    135000,
    0,
    450000,
    'completed',
    'paid',
    'Invoice required for company reimbursement',
    '13:00',
    'email',
    'Corporate booking'
  ),
  (
    'b6666666-6666-6666-6666-666666666666',
    'BK006',
    '33333333-3333-3333-3333-333333333333',
    'c6666666-6666-6666-6666-666666666666',
    '2024-12-21',
    '2024-12-23',
    2,
    ARRAY['Folake Adeyemi', 'Ayo Adeyemi'],
    220000,
    12000,
    48000,
    0,
    280000,
    'cancelled',
    'refunded',
    'Change of travel plans',
    '15:00',
    'whatsapp',
    'WhatsApp booking'
  );

-- =====================================================
-- 4. SEED TRANSACTIONS
-- =====================================================

INSERT INTO public.transactions (
  id,
  booking_id,
  customer_id,
  transaction_type,
  category,
  amount,
  payment_method,
  payment_reference,
  status,
  description,
  processed_at
) VALUES
  (
    't1111111-1111-1111-1111-111111111111',
    'b1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'booking',
    'accommodation',
    495000,
    'paystack',
    'PSK_REF_12345678',
    'completed',
    'Payment for booking BK001',
    '2024-12-20 10:30:00+00'
  ),
  (
    't3333333-3333-3333-3333-333333333333',
    'b3333333-3333-3333-3333-333333333333',
    'c3333333-3333-3333-3333-333333333333',
    'booking',
    'accommodation',
    242000,
    'bank_transfer',
    'TRF_987654321',
    'completed',
    'Payment for booking BK003',
    '2024-12-18 14:15:00+00'
  ),
  (
    't4444444-4444-4444-4444-444444444444',
    'b4444444-4444-4444-4444-444444444444',
    'c4444444-4444-4444-4444-444444444444',
    'booking',
    'accommodation',
    1430000,
    'card',
    'CARD_456789123',
    'completed',
    'Payment for booking BK004',
    '2024-12-25 09:00:00+00'
  ),
  (
    't5555555-5555-5555-5555-555555555555',
    'b5555555-5555-5555-5555-555555555555',
    'c5555555-5555-5555-5555-555555555555',
    'booking',
    'accommodation',
    450000,
    'paystack',
    'PSK_REF_98765432',
    'completed',
    'Payment for booking BK005',
    '2024-12-13 16:45:00+00'
  ),
  (
    't6666666-6666-6666-6666-666666666666',
    'b6666666-6666-6666-6666-666666666666',
    'c6666666-6666-6666-6666-666666666666',
    'refund',
    'accommodation',
    -280000,
    'paystack',
    'PSK_REFUND_123456',
    'completed',
    'Refund for cancelled booking BK006',
    '2024-12-20 11:00:00+00'
  );

-- =====================================================
-- 5. UPDATE CUSTOMER STATS
-- =====================================================

-- Update customer statistics based on bookings
UPDATE public.customers c
SET
  total_bookings = (
    SELECT COUNT(*)
    FROM public.bookings b
    WHERE b.customer_id = c.id
      AND b.status NOT IN ('cancelled')
  ),
  total_spent = (
    SELECT COALESCE(SUM(b.total_amount), 0)
    FROM public.bookings b
    WHERE b.customer_id = c.id
      AND b.payment_status = 'paid'
  );

-- Set VIP status for customers who have spent over ₦500,000
UPDATE public.customers
SET vip_status = true
WHERE total_spent >= 500000;

-- =====================================================
-- SEED DATA COMPLETE
-- =====================================================

-- Verify data
DO $$
BEGIN
  RAISE NOTICE 'Seed data inserted successfully!';
  RAISE NOTICE 'Properties: %', (SELECT COUNT(*) FROM public.properties);
  RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM public.customers);
  RAISE NOTICE 'Bookings: %', (SELECT COUNT(*) FROM public.bookings);
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM public.transactions);
END $$;
