-- Step 2: Update existing roles from facility_manager to manager
UPDATE public.user_roles SET role = 'manager' WHERE role = 'facility_manager';

-- Update the handle_new_user function to use 'manager' instead of 'facility_manager'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role app_role;
  v_department app_department;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''))
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  -- Map UI role to database enum
  v_role := CASE COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'manager' THEN 'manager'::app_role
    WHEN 'staff' THEN 'housekeeper'::app_role
    WHEN 'receptionist' THEN 'housekeeper'::app_role
    ELSE 'admin'::app_role
  END;

  -- Map UI department to database enum
  v_department := CASE COALESCE(NEW.raw_user_meta_data->>'department', 'management')
    WHEN 'management' THEN 'management'::app_department
    WHEN 'reception' THEN 'reception'::app_department
    WHEN 'housekeeping' THEN 'housekeeping'::app_department
    WHEN 'bar' THEN 'bar'::app_department
    WHEN 'maintenance' THEN 'maintenance'::app_department
    WHEN 'security' THEN 'security'::app_department
    ELSE 'management'::app_department
  END;

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert department
  INSERT INTO public.user_departments (user_id, department, is_owner)
  VALUES (NEW.id, v_department, false)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Update RLS policies to use 'manager' instead of 'facility_manager'
-- Properties
DROP POLICY IF EXISTS "Admins and facility managers can manage properties" ON public.properties;
CREATE POLICY "Admins and managers can manage properties" ON public.properties FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Bookings
DROP POLICY IF EXISTS "Admins and facility managers can manage bookings" ON public.bookings;
CREATE POLICY "Admins and managers can manage bookings" ON public.bookings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Customers
DROP POLICY IF EXISTS "Admins and facility managers can view customers" ON public.customers;
DROP POLICY IF EXISTS "Admins and facility managers can manage customers" ON public.customers;
CREATE POLICY "Admins and managers can view customers" ON public.customers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can manage customers" ON public.customers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Housekeeping staff
DROP POLICY IF EXISTS "Admins and facility managers can manage housekeeping staff" ON public.housekeeping_staff;
CREATE POLICY "Admins and managers can manage housekeeping staff" ON public.housekeeping_staff FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Housekeeping tasks
DROP POLICY IF EXISTS "Admins and facility managers can manage housekeeping tasks" ON public.housekeeping_tasks;
CREATE POLICY "Admins and managers can manage housekeeping tasks" ON public.housekeeping_tasks FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Maintenance issues
DROP POLICY IF EXISTS "Admins and facility managers can manage maintenance issues" ON public.maintenance_issues;
CREATE POLICY "Admins and managers can manage maintenance issues" ON public.maintenance_issues FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Inventory items
DROP POLICY IF EXISTS "Admins and facility managers can manage inventory" ON public.inventory_items;
CREATE POLICY "Admins and managers can manage inventory" ON public.inventory_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Inventory categories
DROP POLICY IF EXISTS "Admins and facility managers can manage inventory categories" ON public.inventory_categories;
CREATE POLICY "Admins and managers can manage inventory categories" ON public.inventory_categories FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Inventory stock movements
DROP POLICY IF EXISTS "Admins and facility managers can manage stock movements" ON public.inventory_stock_movements;
CREATE POLICY "Admins and managers can manage stock movements" ON public.inventory_stock_movements FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Inventory alerts
DROP POLICY IF EXISTS "Admins and facility managers can manage inventory alerts" ON public.inventory_alerts;
CREATE POLICY "Admins and managers can manage inventory alerts" ON public.inventory_alerts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Staff
DROP POLICY IF EXISTS "Admins and facility managers can view staff" ON public.staff;
DROP POLICY IF EXISTS "Admins and facility managers can manage staff" ON public.staff;
CREATE POLICY "Admins and managers can view staff" ON public.staff FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));
CREATE POLICY "Admins and managers can manage staff" ON public.staff FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Staff attendance
DROP POLICY IF EXISTS "Admins and facility managers can manage attendance" ON public.staff_attendance;
CREATE POLICY "Admins and managers can manage attendance" ON public.staff_attendance FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Staff shifts
DROP POLICY IF EXISTS "Admins and facility managers can manage shifts" ON public.staff_shifts;
CREATE POLICY "Admins and managers can manage shifts" ON public.staff_shifts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Staff leave requests
DROP POLICY IF EXISTS "Admins and facility managers can manage leave requests" ON public.staff_leave_requests;
CREATE POLICY "Admins and managers can manage leave requests" ON public.staff_leave_requests FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Staff performance reviews
DROP POLICY IF EXISTS "Admins and facility managers can manage performance reviews" ON public.staff_performance_reviews;
CREATE POLICY "Admins and managers can manage performance reviews" ON public.staff_performance_reviews FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Bar items
DROP POLICY IF EXISTS "Admins and facility managers can manage bar items" ON public.bar_items;
CREATE POLICY "Admins and managers can manage bar items" ON public.bar_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Bar tabs
DROP POLICY IF EXISTS "Admins and facility managers can manage bar tabs" ON public.bar_tabs;
CREATE POLICY "Admins and managers can manage bar tabs" ON public.bar_tabs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Bar tab items
DROP POLICY IF EXISTS "Admins and facility managers can manage bar tab items" ON public.bar_tab_items;
CREATE POLICY "Admins and managers can manage bar tab items" ON public.bar_tab_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Transactions
DROP POLICY IF EXISTS "Admins and facility managers can manage transactions" ON public.transactions;
CREATE POLICY "Admins and managers can manage transactions" ON public.transactions FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Suppliers
DROP POLICY IF EXISTS "Admins and facility managers can manage suppliers" ON public.suppliers;
CREATE POLICY "Admins and managers can manage suppliers" ON public.suppliers FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Purchase orders
DROP POLICY IF EXISTS "Admins and facility managers can manage purchase orders" ON public.inventory_purchase_orders;
CREATE POLICY "Admins and managers can manage purchase orders" ON public.inventory_purchase_orders FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Purchase order items
DROP POLICY IF EXISTS "Admins and facility managers can manage purchase order items" ON public.inventory_purchase_order_items;
CREATE POLICY "Admins and managers can manage purchase order items" ON public.inventory_purchase_order_items FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- System settings
DROP POLICY IF EXISTS "Admins and facility managers can manage system settings" ON public.system_settings;
CREATE POLICY "Admins and managers can manage system settings" ON public.system_settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Settings
DROP POLICY IF EXISTS "Admins and facility managers can manage settings" ON public.settings;
CREATE POLICY "Admins and managers can manage settings" ON public.settings FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Seasonal pricing
DROP POLICY IF EXISTS "Admins and facility managers can manage seasonal pricing" ON public.seasonal_pricing;
CREATE POLICY "Admins and managers can manage seasonal pricing" ON public.seasonal_pricing FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Team invitations
DROP POLICY IF EXISTS "Admins and facility managers can manage team invitations" ON public.team_invitations;
CREATE POLICY "Admins and managers can manage team invitations" ON public.team_invitations FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Vendor jobs
DROP POLICY IF EXISTS "Admins and facility managers can manage vendor jobs" ON public.vendor_jobs;
CREATE POLICY "Admins and managers can manage vendor jobs" ON public.vendor_jobs FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));