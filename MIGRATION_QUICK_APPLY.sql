-- =====================================================
-- BROOKLYN HILLS APARTMENTS - COMPLETE DATABASE SETUP
-- Single file for easy copy-paste into Supabase
-- =====================================================

-- Step 1: Create Properties Table
CREATE TABLE IF NOT EXISTS public.properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Studio', 'Apartment', 'Penthouse', 'House', 'Villa', 'Loft')),
  description text,
  location text NOT NULL,
  address text,
  bedrooms integer NOT NULL CHECK (bedrooms >= 0),
  bathrooms integer NOT NULL CHECK (bathrooms >= 0),
  max_guests integer NOT NULL CHECK (max_guests > 0),
  base_price_per_night numeric(10,2) NOT NULL CHECK (base_price_per_night >= 0),
  cleaning_fee numeric(10,2) DEFAULT 0 CHECK (cleaning_fee >= 0),
  amenities text[] DEFAULT '{}',
  images text[] DEFAULT '{}',
  status text DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'inactive')),
  featured boolean DEFAULT false,
  rating numeric(2,1) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5.0),
  review_count integer DEFAULT 0 CHECK (review_count >= 0),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Step 2: Create Customers Table
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  whatsapp text,
  date_of_birth date,
  nationality text,
  id_type text CHECK (id_type IN ('passport', 'drivers_license', 'national_id', 'other')),
  id_number text,
  emergency_contact_name text,
  emergency_contact_phone text,
  preferences jsonb DEFAULT '{}',
  vip_status boolean DEFAULT false,
  total_bookings integer DEFAULT 0 CHECK (total_bookings >= 0),
  total_spent numeric(12,2) DEFAULT 0 CHECK (total_spent >= 0),
  average_rating numeric(2,1) DEFAULT 0.0 CHECK (average_rating >= 0 AND average_rating <= 5.0),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(email)
);

-- Step 3: Create Bookings Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_number text UNIQUE NOT NULL,
  property_id uuid REFERENCES public.properties(id) ON DELETE RESTRICT NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE RESTRICT NOT NULL,
  check_in_date date NOT NULL,
  check_out_date date NOT NULL,
  nights integer GENERATED ALWAYS AS (check_out_date - check_in_date) STORED,
  num_guests integer NOT NULL CHECK (num_guests > 0),
  guest_names text[] DEFAULT '{}',
  base_amount numeric(10,2) NOT NULL CHECK (base_amount >= 0),
  cleaning_fee numeric(10,2) DEFAULT 0 CHECK (cleaning_fee >= 0),
  tax_amount numeric(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount numeric(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total_amount numeric(10,2) NOT NULL CHECK (total_amount >= 0),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled')),
  payment_status text DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  special_requests text,
  arrival_time text,
  booked_via text DEFAULT 'dashboard' CHECK (booked_via IN ('dashboard', 'website', 'phone', 'whatsapp', 'email')),
  source text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  cancelled_at timestamp with time zone,
  cancellation_reason text,
  CONSTRAINT valid_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT valid_total CHECK (total_amount = base_amount + cleaning_fee + tax_amount - discount_amount)
);

-- Step 4: Create Transactions Table
CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  transaction_type text NOT NULL CHECK (transaction_type IN ('booking', 'bar_sale', 'damage_charge', 'refund', 'expense', 'other')),
  category text,
  amount numeric(10,2) NOT NULL,
  payment_method text CHECK (payment_method IN ('cash', 'card', 'bank_transfer', 'paystack', 'other')),
  payment_reference text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  description text,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  processed_at timestamp with time zone
);

-- Step 5: Create Indexes
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON public.properties(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_vip_status ON public.customers(vip_status) WHERE vip_status = true;
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_payment_status ON public.bookings(payment_status);
CREATE INDEX IF NOT EXISTS idx_bookings_check_in_date ON public.bookings(check_in_date);
CREATE INDEX IF NOT EXISTS idx_bookings_check_out_date ON public.bookings(check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_date_range ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_number ON public.bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_transactions_booking_id ON public.transactions(booking_id);
CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON public.transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_transactions_payment_reference ON public.transactions(payment_reference);

-- Step 6: Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Step 7: RLS Policies for Properties
DROP POLICY IF EXISTS "Anyone can view available properties" ON public.properties;
CREATE POLICY "Anyone can view available properties" ON public.properties FOR SELECT USING (status = 'available' OR status = 'occupied');

DROP POLICY IF EXISTS "Admins can view all properties" ON public.properties;
CREATE POLICY "Admins can view all properties" ON public.properties FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can insert properties" ON public.properties;
CREATE POLICY "Admins can insert properties" ON public.properties FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can update properties" ON public.properties;
CREATE POLICY "Admins can update properties" ON public.properties FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can delete properties" ON public.properties;
CREATE POLICY "Admins can delete properties" ON public.properties FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Step 8: RLS Policies for Customers
DROP POLICY IF EXISTS "Admins can view all customers" ON public.customers;
CREATE POLICY "Admins can view all customers" ON public.customers FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Users can view their own customer profile" ON public.customers;
CREATE POLICY "Users can view their own customer profile" ON public.customers FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can insert customers" ON public.customers;
CREATE POLICY "Admins can insert customers" ON public.customers FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can update customers" ON public.customers;
CREATE POLICY "Admins can update customers" ON public.customers FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Users can update their own customer profile" ON public.customers;
CREATE POLICY "Users can update their own customer profile" ON public.customers FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can delete customers" ON public.customers;
CREATE POLICY "Admins can delete customers" ON public.customers FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Step 9: RLS Policies for Bookings
DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;
CREATE POLICY "Admins can view all bookings" ON public.bookings FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Customers can view their own bookings" ON public.bookings;
CREATE POLICY "Customers can view their own bookings" ON public.bookings FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert bookings" ON public.bookings;
CREATE POLICY "Admins can insert bookings" ON public.bookings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can update bookings" ON public.bookings;
CREATE POLICY "Admins can update bookings" ON public.bookings FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can delete bookings" ON public.bookings;
CREATE POLICY "Admins can delete bookings" ON public.bookings FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Step 10: RLS Policies for Transactions
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Customers can view their own transactions" ON public.transactions;
CREATE POLICY "Customers can view their own transactions" ON public.transactions FOR SELECT USING (customer_id IN (SELECT id FROM public.customers WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "Admins can insert transactions" ON public.transactions;
CREATE POLICY "Admins can insert transactions" ON public.transactions FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can update transactions" ON public.transactions;
CREATE POLICY "Admins can update transactions" ON public.transactions FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

DROP POLICY IF EXISTS "Admins can delete transactions" ON public.transactions;
CREATE POLICY "Admins can delete transactions" ON public.transactions FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Step 11: Create Helper Functions
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  booking_num text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 3) AS integer)), 0) + 1 INTO next_number
  FROM public.bookings WHERE booking_number ~ '^BK[0-9]+$';
  booking_num := 'BK' || LPAD(next_number::text, 3, '0');
  RETURN booking_num;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_booking_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_booking_number_trigger ON public.bookings;
CREATE TRIGGER set_booking_number_trigger
BEFORE INSERT ON public.bookings
FOR EACH ROW EXECUTE FUNCTION set_booking_number();

CREATE OR REPLACE FUNCTION check_property_availability(p_property_id uuid, p_check_in date, p_check_out date)
RETURNS boolean AS $$
DECLARE overlapping_bookings integer;
BEGIN
  SELECT COUNT(*) INTO overlapping_bookings FROM public.bookings
  WHERE property_id = p_property_id AND status NOT IN ('cancelled', 'completed')
    AND ((p_check_in >= check_in_date AND p_check_in < check_out_date)
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date));
  RETURN overlapping_bookings = 0;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS trigger AS $$
BEGIN
  UPDATE public.customers SET
    total_bookings = (SELECT COUNT(*) FROM public.bookings WHERE customer_id = NEW.customer_id AND status NOT IN ('cancelled')),
    total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE customer_id = NEW.customer_id AND payment_status = 'paid'),
    vip_status = (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE customer_id = NEW.customer_id AND payment_status = 'paid') >= 500000
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_customer_stats_trigger ON public.bookings;
CREATE TRIGGER update_customer_stats_trigger
AFTER INSERT OR UPDATE ON public.bookings
FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Step 12: Create Storage Bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('property-images', 'property-images', true) ON CONFLICT (id) DO NOTHING;

-- Step 13: Storage Policies
DROP POLICY IF EXISTS "Admins can upload property images" ON storage.objects;
CREATE POLICY "Admins can upload property images" ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager')));

DROP POLICY IF EXISTS "Anyone can view property images" ON storage.objects;
CREATE POLICY "Anyone can view property images" ON storage.objects FOR SELECT USING (bucket_id = 'property-images');

DROP POLICY IF EXISTS "Admins can update property images" ON storage.objects;
CREATE POLICY "Admins can update property images" ON storage.objects FOR UPDATE
USING (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager')));

DROP POLICY IF EXISTS "Admins can delete property images" ON storage.objects;
CREATE POLICY "Admins can delete property images" ON storage.objects FOR DELETE
USING (bucket_id = 'property-images' AND (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager')));

-- SUCCESS MESSAGE
DO $$ BEGIN RAISE NOTICE '✅ Migration complete! Tables created successfully.'; END $$;
