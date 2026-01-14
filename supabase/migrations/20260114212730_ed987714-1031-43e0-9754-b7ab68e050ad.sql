-- =============================================
-- FIX ALL OVERLY PERMISSIVE RLS POLICIES
-- =============================================

-- 1. HOUSEKEEPING_STAFF TABLE
DROP POLICY IF EXISTS "Allow authenticated users to manage staff" ON public.housekeeping_staff;
DROP POLICY IF EXISTS "Allow authenticated users to read staff" ON public.housekeeping_staff;

CREATE POLICY "Admins and facility managers can view housekeeping staff"
ON public.housekeeping_staff FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager') OR public.has_role(auth.uid(), 'housekeeper'));

CREATE POLICY "Admins and facility managers can insert housekeeping staff"
ON public.housekeeping_staff FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update housekeeping staff"
ON public.housekeeping_staff FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete housekeeping staff"
ON public.housekeeping_staff FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. HOUSEKEEPING_TASKS TABLE
DROP POLICY IF EXISTS "Allow authenticated users to manage tasks" ON public.housekeeping_tasks;
DROP POLICY IF EXISTS "Allow authenticated users to read tasks" ON public.housekeeping_tasks;

CREATE POLICY "Admins facility managers and housekeepers can view tasks"
ON public.housekeeping_tasks FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager') OR public.has_role(auth.uid(), 'housekeeper'));

CREATE POLICY "Admins and facility managers can insert tasks"
ON public.housekeeping_tasks FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins facility managers and housekeepers can update tasks"
ON public.housekeeping_tasks FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager') OR public.has_role(auth.uid(), 'housekeeper'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager') OR public.has_role(auth.uid(), 'housekeeper'));

CREATE POLICY "Admins can delete tasks"
ON public.housekeeping_tasks FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. INVENTORY_ALERTS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_alerts;

CREATE POLICY "Admins and facility managers can view inventory alerts"
ON public.inventory_alerts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert inventory alerts"
ON public.inventory_alerts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update inventory alerts"
ON public.inventory_alerts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete inventory alerts"
ON public.inventory_alerts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. INVENTORY_PURCHASE_ORDER_ITEMS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_purchase_order_items;

CREATE POLICY "Admins and facility managers can view po items"
ON public.inventory_purchase_order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert po items"
ON public.inventory_purchase_order_items FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update po items"
ON public.inventory_purchase_order_items FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete po items"
ON public.inventory_purchase_order_items FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. INVENTORY_STOCK_MOVEMENTS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_stock_movements;

CREATE POLICY "Admins and facility managers can view stock movements"
ON public.inventory_stock_movements FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert stock movements"
ON public.inventory_stock_movements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update stock movements"
ON public.inventory_stock_movements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete stock movements"
ON public.inventory_stock_movements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. STAFF_LEAVE_REQUESTS TABLE
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.staff_leave_requests;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff_leave_requests;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_leave_requests;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.staff_leave_requests;

CREATE POLICY "Admins and facility managers can view all leave requests"
ON public.staff_leave_requests FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert leave requests"
ON public.staff_leave_requests FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update leave requests"
ON public.staff_leave_requests FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete leave requests"
ON public.staff_leave_requests FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. STAFF_PERFORMANCE_REVIEWS TABLE
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.staff_performance_reviews;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff_performance_reviews;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_performance_reviews;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.staff_performance_reviews;

CREATE POLICY "Admins and facility managers can view performance reviews"
ON public.staff_performance_reviews FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert performance reviews"
ON public.staff_performance_reviews FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update performance reviews"
ON public.staff_performance_reviews FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete performance reviews"
ON public.staff_performance_reviews FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. STAFF_SHIFTS TABLE
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.staff_shifts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff_shifts;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_shifts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.staff_shifts;

CREATE POLICY "Admins and facility managers can view shifts"
ON public.staff_shifts FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert shifts"
ON public.staff_shifts FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update shifts"
ON public.staff_shifts FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete shifts"
ON public.staff_shifts FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. SUPPLIERS TABLE
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.suppliers;

CREATE POLICY "Admins and facility managers can view suppliers"
ON public.suppliers FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can insert suppliers"
ON public.suppliers FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins and facility managers can update suppliers"
ON public.suppliers FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'facility_manager'));

CREATE POLICY "Admins can delete suppliers"
ON public.suppliers FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. SYSTEM_SETTINGS TABLE - Fix UPDATE policy
DROP POLICY IF EXISTS "Allow authenticated users to update settings" ON public.system_settings;

CREATE POLICY "Admins can update system settings"
ON public.system_settings FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));