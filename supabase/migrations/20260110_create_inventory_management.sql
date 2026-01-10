-- ============================================================================
-- INVENTORY MANAGEMENT MODULE
-- Complete inventory tracking system with categories, suppliers, and alerts
-- ============================================================================

-- Inventory categories
CREATE TABLE IF NOT EXISTS inventory_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Suppliers
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  supplier_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  payment_terms TEXT, -- net_30, net_60, cash_on_delivery, etc.
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory items
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_code TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  category_id UUID REFERENCES inventory_categories(id) ON DELETE SET NULL,
  description TEXT,

  -- Stock information
  unit_of_measure TEXT NOT NULL, -- pieces, bottles, kg, liters, rolls, sets, etc.
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  minimum_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  reorder_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  maximum_stock_level DECIMAL(10, 2),

  -- Pricing
  unit_cost DECIMAL(10, 2),
  selling_price DECIMAL(10, 2),
  currency TEXT DEFAULT 'NGN',

  -- Supplier
  primary_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Storage location
  storage_location TEXT,

  -- Status
  status TEXT NOT NULL DEFAULT 'active', -- active, discontinued, out_of_stock

  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock movements (transactions)
CREATE TABLE IF NOT EXISTS inventory_stock_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  movement_type TEXT NOT NULL, -- purchase, sale, adjustment, return, damage, transfer, usage
  quantity DECIMAL(10, 2) NOT NULL, -- positive for incoming, negative for outgoing

  -- Before/after stock levels
  stock_before DECIMAL(10, 2) NOT NULL,
  stock_after DECIMAL(10, 2) NOT NULL,

  -- Transaction details
  reference_number TEXT,
  reference_type TEXT, -- purchase_order, booking, maintenance, etc.
  reference_id UUID,

  -- Supplier/destination
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,

  -- Cost information
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),

  -- Additional info
  notes TEXT,
  performed_by UUID REFERENCES staff(id) ON DELETE SET NULL,
  movement_date TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase orders
CREATE TABLE IF NOT EXISTS inventory_purchase_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  po_number TEXT UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,

  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,

  status TEXT NOT NULL DEFAULT 'draft', -- draft, sent, confirmed, partially_received, received, cancelled

  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,

  notes TEXT,
  created_by UUID REFERENCES staff(id),
  approved_by UUID REFERENCES staff(id),
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Purchase order items
CREATE TABLE IF NOT EXISTS inventory_purchase_order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  purchase_order_id UUID NOT NULL REFERENCES inventory_purchase_orders(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,

  quantity_ordered DECIMAL(10, 2) NOT NULL,
  quantity_received DECIMAL(10, 2) DEFAULT 0,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total_cost DECIMAL(10, 2) NOT NULL,

  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stock alerts/notifications
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL, -- low_stock, out_of_stock, overstock, expiring_soon
  severity TEXT NOT NULL, -- critical, warning, info
  message TEXT NOT NULL,
  is_acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by UUID REFERENCES staff(id),
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(primary_supplier_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_status ON inventory_items(status);
CREATE INDEX IF NOT EXISTS idx_stock_movements_item ON inventory_stock_movements(item_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_date ON inventory_stock_movements(movement_date);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON inventory_purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON inventory_purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_item ON inventory_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_acknowledged ON inventory_alerts(is_acknowledged);

-- Updated at triggers
CREATE TRIGGER inventory_categories_updated_at BEFORE UPDATE ON inventory_categories
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER inventory_items_updated_at BEFORE UPDATE ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

CREATE TRIGGER purchase_orders_updated_at BEFORE UPDATE ON inventory_purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_staff_updated_at();

-- RLS Policies
ALTER TABLE inventory_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all for authenticated users" ON inventory_categories FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON suppliers FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_stock_movements FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_purchase_orders FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_purchase_order_items FOR ALL USING (true);
CREATE POLICY "Enable all for authenticated users" ON inventory_alerts FOR ALL USING (true);

-- Auto-generate item codes
CREATE OR REPLACE FUNCTION generate_item_code(category_name TEXT)
RETURNS TEXT AS $$
DECLARE
  prefix TEXT;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generate prefix from category (first 3 letters uppercase)
  prefix := UPPER(SUBSTRING(category_name FROM 1 FOR 3));

  LOOP
    new_code := prefix || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM inventory_items WHERE item_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate PO numbers
CREATE OR REPLACE FUNCTION generate_po_number()
RETURNS TEXT AS $$
DECLARE
  new_po TEXT;
  po_exists BOOLEAN;
BEGIN
  LOOP
    new_po := 'PO' || TO_CHAR(NOW(), 'YYYYMM') || LPAD(FLOOR(RANDOM() * 1000)::TEXT, 3, '0');
    SELECT EXISTS(SELECT 1 FROM inventory_purchase_orders WHERE po_number = new_po) INTO po_exists;
    EXIT WHEN NOT po_exists;
  END LOOP;
  RETURN new_po;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_po_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN
    NEW.po_number := generate_po_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_po_number_trigger BEFORE INSERT ON inventory_purchase_orders
  FOR EACH ROW EXECUTE FUNCTION set_po_number();

-- Automatically create/update stock alerts
CREATE OR REPLACE FUNCTION check_stock_levels()
RETURNS TRIGGER AS $$
DECLARE
  alert_exists BOOLEAN;
BEGIN
  -- Check for low stock
  IF NEW.current_stock <= NEW.reorder_level AND NEW.current_stock > 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM inventory_alerts
      WHERE item_id = NEW.id
      AND alert_type = 'low_stock'
      AND is_acknowledged = FALSE
    ) INTO alert_exists;

    IF NOT alert_exists THEN
      INSERT INTO inventory_alerts (item_id, alert_type, severity, message)
      VALUES (
        NEW.id,
        'low_stock',
        'warning',
        'Stock level for ' || NEW.item_name || ' is below reorder level (' || NEW.current_stock || ' ' || NEW.unit_of_measure || ')'
      );
    END IF;
  END IF;

  -- Check for out of stock
  IF NEW.current_stock <= 0 THEN
    SELECT EXISTS(
      SELECT 1 FROM inventory_alerts
      WHERE item_id = NEW.id
      AND alert_type = 'out_of_stock'
      AND is_acknowledged = FALSE
    ) INTO alert_exists;

    IF NOT alert_exists THEN
      INSERT INTO inventory_alerts (item_id, alert_type, severity, message)
      VALUES (
        NEW.id,
        'out_of_stock',
        'critical',
        NEW.item_name || ' is out of stock!'
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stock_levels_trigger AFTER INSERT OR UPDATE OF current_stock
  ON inventory_items
  FOR EACH ROW EXECUTE FUNCTION check_stock_levels();

-- Update item stock after movement
CREATE OR REPLACE FUNCTION update_item_stock_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_items
  SET current_stock = current_stock + NEW.quantity
  WHERE id = NEW.item_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stock_trigger AFTER INSERT ON inventory_stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_item_stock_after_movement();

-- Calculate PO totals
CREATE OR REPLACE FUNCTION calculate_po_item_total()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_cost := NEW.quantity_ordered * NEW.unit_cost;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_po_item_total_trigger BEFORE INSERT OR UPDATE ON inventory_purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION calculate_po_item_total();

-- Update PO total when items change
CREATE OR REPLACE FUNCTION update_po_total()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE inventory_purchase_orders
  SET subtotal = (
    SELECT COALESCE(SUM(total_cost), 0)
    FROM inventory_purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id
  ),
  total_amount = (
    SELECT COALESCE(SUM(total_cost), 0)
    FROM inventory_purchase_order_items
    WHERE purchase_order_id = NEW.purchase_order_id
  ) + COALESCE((SELECT tax_amount FROM inventory_purchase_orders WHERE id = NEW.purchase_order_id), 0)
  WHERE id = NEW.purchase_order_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_po_total_trigger AFTER INSERT OR UPDATE OR DELETE ON inventory_purchase_order_items
  FOR EACH ROW EXECUTE FUNCTION update_po_total();

-- Insert sample categories
INSERT INTO inventory_categories (name, description) VALUES
  ('Linens', 'Bed linens, towels, and other textile items'),
  ('Amenities', 'Guest amenities and toiletries'),
  ('Bar Stock', 'Alcoholic and non-alcoholic beverages'),
  ('Cleaning Supplies', 'Cleaning products and equipment'),
  ('Maintenance Items', 'Tools and materials for property maintenance'),
  ('Kitchen Supplies', 'Kitchen equipment and consumables'),
  ('Office Supplies', 'Stationery and office equipment')
ON CONFLICT (name) DO NOTHING;

-- Insert sample inventory items
INSERT INTO inventory_items (item_code, item_name, category_id, unit_of_measure, current_stock, minimum_stock_level, reorder_level, unit_cost, selling_price, storage_location)
SELECT
  'LIN001', 'Towel Sets', id, 'sets', 3, 5, 8, 2500.00, NULL, 'Storage Room A'
FROM inventory_categories WHERE name = 'Linens'
ON CONFLICT (item_code) DO NOTHING;

INSERT INTO inventory_items (item_code, item_name, category_id, unit_of_measure, current_stock, minimum_stock_level, reorder_level, unit_cost, selling_price, storage_location)
SELECT
  'LIN002', 'Bed Linens (Queen)', id, 'sets', 5, 8, 10, 4000.00, NULL, 'Storage Room A'
FROM inventory_categories WHERE name = 'Linens'
ON CONFLICT (item_code) DO NOTHING;

INSERT INTO inventory_items (item_code, item_name, category_id, unit_of_measure, current_stock, minimum_stock_level, reorder_level, unit_cost, selling_price, storage_location)
SELECT
  'AME001', 'Toilet Paper (Rolls)', id, 'rolls', 15, 20, 20, 150.00, NULL, 'Storage Room B'
FROM inventory_categories WHERE name = 'Amenities'
ON CONFLICT (item_code) DO NOTHING;

INSERT INTO inventory_items (item_code, item_name, category_id, unit_of_measure, current_stock, minimum_stock_level, reorder_level, unit_cost, selling_price, storage_location)
SELECT
  'CLE001', 'Cleaning Supplies Kit', id, 'kits', 12, 5, 10, 3500.00, NULL, 'Storage Room C'
FROM inventory_categories WHERE name = 'Cleaning Supplies'
ON CONFLICT (item_code) DO NOTHING;
