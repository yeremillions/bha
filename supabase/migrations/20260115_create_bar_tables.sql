-- =====================================================
-- Brooklyn Hills Apartments - Bar Management System
-- Created: January 15, 2026
-- =====================================================

-- =====================================================
-- 1. BAR ITEMS TABLE
-- =====================================================

CREATE TABLE public.bar_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('beer', 'wine', 'spirits', 'soft_drinks', 'cocktails', 'snacks', 'other')),
  price numeric(8,2) NOT NULL CHECK (price >= 0),
  cost numeric(8,2) CHECK (cost >= 0),
  stock_quantity integer DEFAULT 0 CHECK (stock_quantity >= 0),
  min_stock_level integer DEFAULT 5 CHECK (min_stock_level >= 0),
  unit text DEFAULT 'bottle',
  active boolean DEFAULT true,
  image_url text,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Index for common queries
CREATE INDEX idx_bar_items_category ON public.bar_items(category);
CREATE INDEX idx_bar_items_active ON public.bar_items(active) WHERE active = true;
CREATE INDEX idx_bar_items_low_stock ON public.bar_items(stock_quantity) WHERE stock_quantity <= min_stock_level;

-- Enable RLS
ALTER TABLE public.bar_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can view active bar items"
ON public.bar_items
FOR SELECT
USING (active = true);

CREATE POLICY "Authenticated users can view all bar items"
ON public.bar_items
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and barmen can manage bar items"
ON public.bar_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'barman')
  )
);

-- =====================================================
-- 2. BAR TABS TABLE
-- =====================================================

CREATE TABLE public.bar_tabs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_number text UNIQUE NOT NULL,
  booking_id uuid REFERENCES public.bookings(id),
  customer_id uuid REFERENCES public.customers(id),
  customer_name text NOT NULL,
  room_number text,
  opened_by uuid REFERENCES auth.users(id),
  opened_at timestamp with time zone DEFAULT now(),
  closed_at timestamp with time zone,
  closed_by uuid REFERENCES auth.users(id),
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  subtotal numeric(10,2) DEFAULT 0 CHECK (subtotal >= 0),
  tax_rate numeric(5,2) DEFAULT 7.5,
  tax_amount numeric(10,2) DEFAULT 0 CHECK (tax_amount >= 0),
  discount_amount numeric(10,2) DEFAULT 0 CHECK (discount_amount >= 0),
  total numeric(10,2) DEFAULT 0 CHECK (total >= 0),
  payment_method text CHECK (payment_method IN ('cash', 'card', 'transfer', 'room_charge')),
  payment_reference text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Generate tab number function
CREATE OR REPLACE FUNCTION generate_tab_number()
RETURNS text AS $$
DECLARE
  next_number integer;
  new_tab_number text;
BEGIN
  -- Get the highest tab number
  SELECT COALESCE(MAX(CAST(SUBSTRING(tab_number FROM 4) AS integer)), 0) + 1
  INTO next_number
  FROM public.bar_tabs;

  -- Format as TAB001, TAB002, etc.
  new_tab_number := 'TAB' || LPAD(next_number::text, 3, '0');

  RETURN new_tab_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-generate tab number
CREATE OR REPLACE FUNCTION set_tab_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tab_number IS NULL OR NEW.tab_number = '' THEN
    NEW.tab_number := generate_tab_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_tab_number_trigger
BEFORE INSERT ON public.bar_tabs
FOR EACH ROW
EXECUTE FUNCTION set_tab_number();

-- Index for common queries
CREATE INDEX idx_bar_tabs_status ON public.bar_tabs(status);
CREATE INDEX idx_bar_tabs_booking ON public.bar_tabs(booking_id);
CREATE INDEX idx_bar_tabs_customer ON public.bar_tabs(customer_id);
CREATE INDEX idx_bar_tabs_opened_at ON public.bar_tabs(opened_at DESC);

-- Enable RLS
ALTER TABLE public.bar_tabs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view bar tabs"
ON public.bar_tabs
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and barmen can manage bar tabs"
ON public.bar_tabs
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'barman')
  )
);

-- =====================================================
-- 3. BAR TAB ITEMS TABLE (Line Items)
-- =====================================================

CREATE TABLE public.bar_tab_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tab_id uuid NOT NULL REFERENCES public.bar_tabs(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.bar_items(id),
  item_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric(8,2) NOT NULL CHECK (unit_price >= 0),
  total numeric(8,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  added_at timestamp with time zone DEFAULT now(),
  added_by uuid REFERENCES auth.users(id),
  notes text
);

-- Index for common queries
CREATE INDEX idx_bar_tab_items_tab ON public.bar_tab_items(tab_id);
CREATE INDEX idx_bar_tab_items_item ON public.bar_tab_items(item_id);

-- Enable RLS
ALTER TABLE public.bar_tab_items ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view bar tab items"
ON public.bar_tab_items
FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admins and barmen can manage bar tab items"
ON public.bar_tab_items
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'barman')
  )
);

-- =====================================================
-- 4. FUNCTIONS FOR TAB CALCULATIONS
-- =====================================================

-- Function to update tab totals
CREATE OR REPLACE FUNCTION update_tab_totals()
RETURNS TRIGGER AS $$
DECLARE
  tab_subtotal numeric(10,2);
  tab_tax numeric(10,2);
  tab_total numeric(10,2);
  tab_tax_rate numeric(5,2);
BEGIN
  -- Get the tab's tax rate
  SELECT tax_rate INTO tab_tax_rate
  FROM public.bar_tabs
  WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);

  -- Calculate subtotal from all items in the tab
  SELECT COALESCE(SUM(total), 0)
  INTO tab_subtotal
  FROM public.bar_tab_items
  WHERE tab_id = COALESCE(NEW.tab_id, OLD.tab_id);

  -- Calculate tax
  tab_tax := ROUND(tab_subtotal * (tab_tax_rate / 100), 2);

  -- Calculate total (subtotal + tax - discount)
  SELECT ROUND(tab_subtotal + tab_tax - COALESCE(discount_amount, 0), 2)
  INTO tab_total
  FROM public.bar_tabs
  WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);

  -- Update the tab
  UPDATE public.bar_tabs
  SET
    subtotal = tab_subtotal,
    tax_amount = tab_tax,
    total = tab_total,
    updated_at = now()
  WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update tab totals when items change
CREATE TRIGGER update_tab_totals_on_insert
AFTER INSERT ON public.bar_tab_items
FOR EACH ROW
EXECUTE FUNCTION update_tab_totals();

CREATE TRIGGER update_tab_totals_on_update
AFTER UPDATE ON public.bar_tab_items
FOR EACH ROW
EXECUTE FUNCTION update_tab_totals();

CREATE TRIGGER update_tab_totals_on_delete
AFTER DELETE ON public.bar_tab_items
FOR EACH ROW
EXECUTE FUNCTION update_tab_totals();

-- =====================================================
-- 5. FUNCTION TO DEDUCT STOCK ON TAB CLOSE
-- =====================================================

CREATE OR REPLACE FUNCTION deduct_bar_stock_on_close()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process if status changed from 'open' to 'closed'
  IF OLD.status = 'open' AND NEW.status = 'closed' THEN
    -- Deduct stock for all items in the tab
    UPDATE public.bar_items bi
    SET
      stock_quantity = bi.stock_quantity - bti.quantity,
      updated_at = now()
    FROM public.bar_tab_items bti
    WHERE bti.tab_id = NEW.id
      AND bti.item_id = bi.id;

    -- Create a financial transaction for the tab
    INSERT INTO public.transactions (
      transaction_type,
      category,
      amount,
      payment_method,
      description,
      reference_number,
      transaction_date,
      created_by
    ) VALUES (
      'income',
      'bar_sales',
      NEW.total,
      NEW.payment_method,
      'Bar tab: ' || NEW.tab_number || ' - ' || NEW.customer_name,
      NEW.payment_reference,
      NEW.closed_at,
      NEW.closed_by
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to deduct stock when tab is closed
CREATE TRIGGER deduct_stock_on_tab_close
AFTER UPDATE ON public.bar_tabs
FOR EACH ROW
EXECUTE FUNCTION deduct_bar_stock_on_close();

-- =====================================================
-- 6. FUNCTION TO GET LOW STOCK ITEMS
-- =====================================================

CREATE OR REPLACE FUNCTION get_low_stock_items()
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  stock_quantity integer,
  min_stock_level integer,
  difference integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    bi.id,
    bi.name,
    bi.category,
    bi.stock_quantity,
    bi.min_stock_level,
    (bi.stock_quantity - bi.min_stock_level) as difference
  FROM public.bar_items bi
  WHERE bi.active = true
    AND bi.stock_quantity <= bi.min_stock_level
  ORDER BY (bi.stock_quantity - bi.min_stock_level) ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 7. UPDATED_AT TRIGGERS
-- =====================================================

CREATE TRIGGER update_bar_items_updated_at
BEFORE UPDATE ON public.bar_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bar_tabs_updated_at
BEFORE UPDATE ON public.bar_tabs
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. SEED DATA (Sample Bar Items)
-- =====================================================

INSERT INTO public.bar_items (name, category, price, cost, stock_quantity, min_stock_level, unit, description) VALUES
  -- Beer
  ('Heineken', 'beer', 1500, 800, 50, 10, 'bottle', 'Premium lager beer'),
  ('Guinness', 'beer', 1800, 900, 40, 10, 'bottle', 'Rich stout beer'),
  ('Star Lager', 'beer', 1000, 500, 60, 15, 'bottle', 'Local premium lager'),
  ('Trophy Lager', 'beer', 800, 400, 50, 15, 'bottle', 'Popular Nigerian beer'),

  -- Wine
  ('Chardonnay', 'wine', 8500, 4000, 20, 5, 'bottle', 'White wine'),
  ('Cabernet Sauvignon', 'wine', 9000, 4500, 15, 5, 'bottle', 'Red wine'),
  ('Rosé Wine', 'wine', 7500, 3500, 10, 3, 'bottle', 'Rose wine'),

  -- Spirits
  ('Hennessy VSOP', 'spirits', 25000, 12000, 10, 3, 'bottle', 'Premium cognac'),
  ('Jack Daniels', 'spirits', 18000, 9000, 12, 3, 'bottle', 'Tennessee whiskey'),
  ('Ciroc Vodka', 'spirits', 20000, 10000, 8, 3, 'bottle', 'Premium vodka'),
  ('Baileys', 'spirits', 15000, 7500, 15, 5, 'bottle', 'Irish cream liqueur'),

  -- Cocktails (prepared drinks)
  ('Mojito', 'cocktails', 3500, 1200, 0, 0, 'glass', 'Fresh mint cocktail'),
  ('Margarita', 'cocktails', 4000, 1500, 0, 0, 'glass', 'Classic tequila cocktail'),
  ('Pina Colada', 'cocktails', 4500, 1600, 0, 0, 'glass', 'Tropical coconut cocktail'),

  -- Soft Drinks
  ('Coca Cola', 'soft_drinks', 500, 200, 100, 20, 'bottle', '50cl bottle'),
  ('Sprite', 'soft_drinks', 500, 200, 100, 20, 'bottle', '50cl bottle'),
  ('Fanta', 'soft_drinks', 500, 200, 100, 20, 'bottle', '50cl bottle'),
  ('Water', 'soft_drinks', 300, 100, 150, 30, 'bottle', 'Bottled water'),
  ('Fresh Orange Juice', 'soft_drinks', 1500, 600, 0, 0, 'glass', 'Freshly squeezed'),

  -- Snacks
  ('Chips', 'snacks', 800, 400, 50, 10, 'pack', 'Potato chips'),
  ('Peanuts', 'snacks', 600, 300, 60, 15, 'pack', 'Roasted peanuts'),
  ('Popcorn', 'snacks', 500, 250, 40, 10, 'bowl', 'Fresh popcorn');

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.bar_items TO authenticated;
GRANT ALL ON public.bar_tabs TO authenticated;
GRANT ALL ON public.bar_tab_items TO authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Bar management tables created successfully!';
  RAISE NOTICE 'Tables: bar_items, bar_tabs, bar_tab_items';
  RAISE NOTICE 'Sample data: 22 bar items inserted';
END $$;
