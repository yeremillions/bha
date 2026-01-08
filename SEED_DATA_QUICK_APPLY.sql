-- =====================================================
-- BROOKLYN HILLS APARTMENTS - SAMPLE DATA
-- Safe to run multiple times (clears old data first)
-- =====================================================

-- Clear existing data (safe because of CASCADE)
TRUNCATE TABLE public.transactions CASCADE;
TRUNCATE TABLE public.bookings CASCADE;
TRUNCATE TABLE public.customers CASCADE;
TRUNCATE TABLE public.properties CASCADE;

-- Insert 4 Sample Properties (All 2-Bedroom Duplexes in Uyo)
INSERT INTO public.properties (id, name, type, description, location, address, bedrooms, bathrooms, max_guests, base_price_per_night, cleaning_fee, amenities, images, status, featured, rating, review_count) VALUES
('11111111-1111-1111-1111-111111111111', 'Brooklyn Hills Duplex A', 'House', 'Modern 2-bedroom duplex with contemporary finishes, fully equipped kitchen, and spacious living area. Perfect for families and small groups.', 'Uyo, Akwa Ibom State', 'Brooklyn Hills Estate, Uyo, Akwa Ibom State', 2, 2, 4, 45000, 10000, ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'], ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&h=400&fit=crop'], 'available', true, 4.8, 32),
('22222222-2222-2222-2222-222222222222', 'Brooklyn Hills Duplex B', 'House', 'Elegant 2-bedroom duplex featuring premium amenities, high-speed internet, and backup power. Ideal for business travelers and families.', 'Uyo, Akwa Ibom State', 'Brooklyn Hills Estate, Uyo, Akwa Ibom State', 2, 2, 4, 45000, 10000, ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'], ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&h=400&fit=crop'], 'occupied', true, 4.9, 28),
('33333333-3333-3333-3333-333333333333', 'Brooklyn Hills Duplex C', 'House', 'Comfortable 2-bedroom duplex with excellent security, modern appliances, and serene environment. Great for extended stays.', 'Uyo, Akwa Ibom State', 'Brooklyn Hills Estate, Uyo, Akwa Ibom State', 2, 2, 4, 45000, 10000, ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'], ARRAY['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&h=400&fit=crop'], 'available', false, 4.7, 25),
('44444444-4444-4444-4444-444444444444', 'Brooklyn Hills Duplex D', 'House', 'Well-appointed 2-bedroom duplex with stylish interiors, reliable power supply, and complete kitchen setup. Perfect for your stay in Uyo.', 'Uyo, Akwa Ibom State', 'Brooklyn Hills Estate, Uyo, Akwa Ibom State', 2, 2, 4, 45000, 10000, ARRAY['security', 'power', 'wifi', 'entertainment', 'kitchen'], ARRAY['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&h=400&fit=crop'], 'maintenance', false, 4.6, 18);

-- Insert 6 Sample Customers
INSERT INTO public.customers (id, full_name, email, phone, whatsapp, date_of_birth, nationality, id_type, id_number, emergency_contact_name, emergency_contact_phone, vip_status, notes) VALUES
('c1111111-1111-1111-1111-111111111111', 'Adebayo Johnson', 'adebayo.j@email.com', '+234 803 456 7890', '+234 803 456 7890', '1985-03-15', 'Nigerian', 'passport', 'A12345678', 'Funke Johnson', '+234 805 123 4567', false, 'Regular business traveler. Prefers quiet rooms.'),
('c2222222-2222-2222-2222-222222222222', 'Chioma Okafor', 'chioma.ok@email.com', '+234 806 789 0123', '+234 806 789 0123', '1990-07-22', 'Nigerian', 'drivers_license', 'LAG-234567', 'Emeka Okafor', '+234 807 234 5678', false, 'Vegetarian. Allergic to nuts.'),
('c3333333-3333-3333-3333-333333333333', 'Tunde Williams', 'tunde.w@email.com', '+234 809 012 3456', '+234 809 012 3456', '1982-11-08', 'Nigerian', 'national_id', '12345678901', 'Bola Williams', '+234 808 345 6789', false, 'Frequent guest. Likes early check-in.'),
('c4444444-4444-4444-4444-444444444444', 'Grace Eze', 'grace.eze@email.com', '+234 810 234 5678', '+234 810 234 5678', '1988-05-18', 'Nigerian', 'passport', 'B98765432', 'Peter Eze', '+234 811 456 7890', true, 'VIP guest. Family celebrations only.'),
('c5555555-5555-5555-5555-555555555555', 'Ibrahim Musa', 'ibrahim.m@email.com', '+234 812 345 6789', '+234 812 345 6789', '1975-09-30', 'Nigerian', 'national_id', '98765432109', 'Aisha Musa', '+234 813 567 8901', true, 'Corporate guest. Requires invoices for all stays.'),
('c6666666-6666-6666-6666-666666666666', 'Folake Adeyemi', 'folake.a@email.com', '+234 814 567 8901', '+234 814 567 8901', '1993-12-25', 'Nigerian', 'drivers_license', 'LAG-789012', 'Ayo Adeyemi', '+234 815 678 9012', false, 'First-time guest. Referred by Chioma Okafor.');

-- Insert 6 Sample Bookings
INSERT INTO public.bookings (id, booking_number, property_id, customer_id, check_in_date, check_out_date, num_guests, guest_names, base_amount, cleaning_fee, tax_amount, discount_amount, total_amount, status, payment_status, special_requests, arrival_time, booked_via, source) VALUES
('b1111111-1111-1111-1111-111111111111', 'BK001', '11111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '2024-12-24', '2024-12-27', 4, ARRAY['Adebayo Johnson', 'Funke Johnson', 'Temi Johnson', 'Kemi Johnson'], 135000, 10000, 9000, 0, 154000, 'confirmed', 'paid', 'Early check-in if possible', '14:00', 'dashboard', 'Direct booking'),
('b2222222-2222-2222-2222-222222222222', 'BK002', '33333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', '2024-12-22', '2024-12-25', 3, ARRAY['Chioma Okafor', 'Emeka Okafor', 'Ada Okafor'], 135000, 10000, 9000, 0, 154000, 'pending', 'pending', 'Vegetarian meals preferred', '15:00', 'website', 'Online booking'),
('b3333333-3333-3333-3333-333333333333', 'BK003', '22222222-2222-2222-2222-222222222222', 'c3333333-3333-3333-3333-333333333333', '2024-12-19', '2024-12-21', 2, ARRAY['Tunde Williams', 'Bola Williams'], 90000, 10000, 6000, 0, 106000, 'checked_in', 'paid', 'Late checkout needed', '12:00', 'phone', 'Phone booking'),
('b4444444-4444-4444-4444-444444444444', 'BK004', '11111111-1111-1111-1111-111111111111', 'c4444444-4444-4444-4444-444444444444', '2024-12-27', '2025-01-01', 4, ARRAY['Grace Eze', 'Peter Eze', 'John Eze', 'Mary Eze'], 225000, 10000, 15000, 0, 250000, 'confirmed', 'paid', 'Family reunion. Need extra chairs.', '16:00', 'dashboard', 'VIP booking'),
('b5555555-5555-5555-5555-555555555555', 'BK005', '33333333-3333-3333-3333-333333333333', 'c5555555-5555-5555-5555-555555555555', '2024-12-14', '2024-12-16', 4, ARRAY['Ibrahim Musa', 'Aisha Musa', 'Fatima Musa', 'Hassan Musa'], 90000, 10000, 6000, 0, 106000, 'completed', 'paid', 'Invoice required for company reimbursement', '13:00', 'email', 'Corporate booking'),
('b6666666-6666-6666-6666-666666666666', 'BK006', '44444444-4444-4444-4444-444444444444', 'c6666666-6666-6666-6666-666666666666', '2024-12-21', '2024-12-23', 2, ARRAY['Folake Adeyemi', 'Ayo Adeyemi'], 90000, 10000, 6000, 0, 106000, 'cancelled', 'refunded', 'Change of travel plans', '15:00', 'whatsapp', 'WhatsApp booking');

-- Insert 5 Sample Transactions
INSERT INTO public.transactions (id, booking_id, customer_id, transaction_type, category, amount, payment_method, payment_reference, status, description, processed_at) VALUES
('t1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'booking', 'accommodation', 154000, 'paystack', 'PSK_REF_12345678', 'completed', 'Payment for booking BK001', '2024-12-20 10:30:00+00'),
('t3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'c3333333-3333-3333-3333-333333333333', 'booking', 'accommodation', 106000, 'bank_transfer', 'TRF_987654321', 'completed', 'Payment for booking BK003', '2024-12-18 14:15:00+00'),
('t4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'c4444444-4444-4444-4444-444444444444', 'booking', 'accommodation', 250000, 'card', 'CARD_456789123', 'completed', 'Payment for booking BK004', '2024-12-25 09:00:00+00'),
('t5555555-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', 'c5555555-5555-5555-5555-555555555555', 'booking', 'accommodation', 106000, 'paystack', 'PSK_REF_98765432', 'completed', 'Payment for booking BK005', '2024-12-13 16:45:00+00'),
('t6666666-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', 'c6666666-6666-6666-6666-666666666666', 'refund', 'accommodation', 106000, 'paystack', 'PSK_REFUND_123456', 'completed', 'Refund for cancelled booking BK006', '2024-12-20 11:00:00+00');

-- Update customer statistics based on bookings
UPDATE public.customers c SET
  total_bookings = (SELECT COUNT(*) FROM public.bookings b WHERE b.customer_id = c.id AND b.status NOT IN ('cancelled')),
  total_spent = (SELECT COALESCE(SUM(b.total_amount), 0) FROM public.bookings b WHERE b.customer_id = c.id AND b.payment_status = 'paid');

-- Set VIP status for customers who have spent over ₦500,000
UPDATE public.customers SET vip_status = true WHERE total_spent >= 500000;

-- Show success message
DO $$
BEGIN
  RAISE NOTICE '✅ Seed data loaded successfully!';
  RAISE NOTICE 'Properties: %', (SELECT COUNT(*) FROM public.properties);
  RAISE NOTICE 'Customers: %', (SELECT COUNT(*) FROM public.customers);
  RAISE NOTICE 'Bookings: %', (SELECT COUNT(*) FROM public.bookings);
  RAISE NOTICE 'Transactions: %', (SELECT COUNT(*) FROM public.transactions);
END $$;
