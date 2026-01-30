-- Fix all functions missing SET search_path = public
-- This prevents search path manipulation attacks

-- 1. generate_booking_number
CREATE OR REPLACE FUNCTION public.generate_booking_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  next_number integer;
  booking_num text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(booking_number FROM 3) AS integer)), 0) + 1 INTO next_number
  FROM public.bookings WHERE booking_number ~ '^BK[0-9]+$';
  booking_num := 'BK' || LPAD(next_number::text, 3, '0');
  RETURN booking_num;
END;
$function$;

-- 2. check_property_availability
CREATE OR REPLACE FUNCTION public.check_property_availability(p_property_id uuid, p_check_in date, p_check_out date)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE overlapping_bookings integer;
BEGIN
  SELECT COUNT(*) INTO overlapping_bookings FROM public.bookings
  WHERE property_id = p_property_id AND status NOT IN ('cancelled', 'completed')
    AND ((p_check_in >= check_in_date AND p_check_in < check_out_date)
      OR (p_check_out > check_in_date AND p_check_out <= check_out_date)
      OR (p_check_in <= check_in_date AND p_check_out >= check_out_date));
  RETURN overlapping_bookings = 0;
END;
$function$;

-- 3. generate_tab_number (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.generate_tab_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  next_number integer;
  new_tab_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(tab_number FROM 4) AS integer)), 0) + 1
  INTO next_number
  FROM public.bar_tabs;
  new_tab_number := 'TAB' || LPAD(next_number::text, 3, '0');
  RETURN new_tab_number;
END;
$function$;

-- 4. set_tab_number
CREATE OR REPLACE FUNCTION public.set_tab_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.tab_number IS NULL OR NEW.tab_number = '' THEN
    NEW.tab_number := generate_tab_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- 5. update_user_profiles_updated_at
CREATE OR REPLACE FUNCTION public.update_user_profiles_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 6. update_team_invitations_updated_at
CREATE OR REPLACE FUNCTION public.update_team_invitations_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 7. set_booking_number
CREATE OR REPLACE FUNCTION public.set_booking_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := generate_booking_number();
  END IF;
  RETURN NEW;
END;
$function$;

-- 8. update_customer_stats
CREATE OR REPLACE FUNCTION public.update_customer_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  UPDATE public.customers SET
    total_bookings = (SELECT COUNT(*) FROM public.bookings WHERE customer_id = NEW.customer_id AND status NOT IN ('cancelled')),
    total_spent = (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE customer_id = NEW.customer_id AND payment_status = 'paid'),
    vip_status = (SELECT COALESCE(SUM(total_amount), 0) FROM public.bookings WHERE customer_id = NEW.customer_id AND payment_status = 'paid') >= 500000
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$function$;

-- 9. auto_assign_housekeeping_task
CREATE OR REPLACE FUNCTION public.auto_assign_housekeeping_task(task_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  selected_staff_id UUID;
  task_scheduled_time TIMESTAMPTZ;
  task_property_id UUID;
BEGIN
  SELECT scheduled_for, property_id INTO task_scheduled_time, task_property_id
  FROM housekeeping_tasks WHERE id = task_id;

  SELECT s.id INTO selected_staff_id
  FROM staff s
  WHERE s.department = 'housekeeping' AND s.employment_status = 'active'
  ORDER BY (
    SELECT COUNT(*) FROM housekeeping_tasks ht
    WHERE ht.assigned_to = s.id
      AND ht.scheduled_for::DATE = task_scheduled_time::DATE
      AND ht.status NOT IN ('cancelled', 'completed')
  ) ASC
  LIMIT 1;

  IF selected_staff_id IS NULL THEN RETURN NULL; END IF;

  UPDATE housekeeping_tasks
  SET assigned_to = selected_staff_id, assigned_at = NOW(), assignment_method = 'automatic', status = 'assigned'
  WHERE id = task_id;

  RETURN selected_staff_id;
END;
$function$;

-- 10. update_tab_totals (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_tab_totals()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  tab_subtotal numeric(10,2);
  tab_tax numeric(10,2);
  tab_total numeric(10,2);
  tab_tax_rate numeric(5,2);
BEGIN
  SELECT tax_rate INTO tab_tax_rate FROM public.bar_tabs WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);
  SELECT COALESCE(SUM(total), 0) INTO tab_subtotal FROM public.bar_tab_items WHERE tab_id = COALESCE(NEW.tab_id, OLD.tab_id);
  tab_tax := ROUND(tab_subtotal * (tab_tax_rate / 100), 2);
  SELECT ROUND(tab_subtotal + tab_tax - COALESCE(discount_amount, 0), 2) INTO tab_total FROM public.bar_tabs WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);
  UPDATE public.bar_tabs SET subtotal = tab_subtotal, tax_amount = tab_tax, total = tab_total, updated_at = now() WHERE id = COALESCE(NEW.tab_id, OLD.tab_id);
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 11. create_checkout_housekeeping_task
CREATE OR REPLACE FUNCTION public.create_checkout_housekeeping_task()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  auto_create BOOLEAN;
  assignment_mode TEXT;
  new_task_id UUID;
  task_num TEXT;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    SELECT (setting_value)::boolean INTO auto_create FROM system_settings WHERE setting_key = 'housekeeping_auto_create_on_checkout';
    IF auto_create THEN
      SELECT (setting_value)::text INTO assignment_mode FROM system_settings WHERE setting_key = 'housekeeping_assignment_mode';
      assignment_mode := TRIM(BOTH '"' FROM assignment_mode);
      task_num := generate_task_number();
      INSERT INTO housekeeping_tasks (task_number, property_id, booking_id, task_type, priority, status, scheduled_for, estimated_duration_minutes, description)
      VALUES (task_num, NEW.property_id, NEW.id, 'checkout_clean', 'urgent', 'unassigned', NEW.check_out_date, 180, 'Post-checkout deep clean for booking ' || NEW.booking_number)
      RETURNING id INTO new_task_id;
      IF assignment_mode = 'automatic' THEN PERFORM auto_assign_housekeeping_task(new_task_id); END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 12. update_staff_task_count
CREATE OR REPLACE FUNCTION public.update_staff_task_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    IF NEW.assigned_to IS NOT NULL THEN
      UPDATE housekeeping_staff SET
        total_tasks_completed = total_tasks_completed + 1,
        rating = CASE WHEN NEW.quality_rating IS NOT NULL THEN ((rating * total_tasks_completed) + NEW.quality_rating) / (total_tasks_completed + 1) ELSE rating END
      WHERE id = NEW.assigned_to;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 13. deduct_bar_stock_on_close (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.deduct_bar_stock_on_close()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF OLD.status = 'open' AND NEW.status = 'closed' THEN
    UPDATE public.bar_items bi SET stock_quantity = bi.stock_quantity - bti.quantity, updated_at = now()
    FROM public.bar_tab_items bti WHERE bti.tab_id = NEW.id AND bti.item_id = bi.id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 14. get_low_stock_items (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_low_stock_items()
 RETURNS TABLE(id uuid, name text, category text, stock_quantity integer, min_stock_level integer, difference integer)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT bi.id, bi.name, bi.category, bi.stock_quantity, bi.min_stock_level, (bi.stock_quantity - bi.min_stock_level) as difference
  FROM public.bar_items bi WHERE bi.active = true AND bi.stock_quantity <= bi.min_stock_level
  ORDER BY (bi.stock_quantity - bi.min_stock_level) ASC;
END;
$function$;

-- 15. generate_vendor_job_number (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.generate_vendor_job_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  next_number integer;
  new_job_number text;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS integer)), 0) + 1 INTO next_number FROM public.vendor_jobs;
  new_job_number := 'VJ' || LPAD(next_number::text, 4, '0');
  RETURN new_job_number;
END;
$function$;

-- 16. set_vendor_job_number
CREATE OR REPLACE FUNCTION public.set_vendor_job_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.job_number IS NULL OR NEW.job_number = '' THEN NEW.job_number := generate_vendor_job_number(); END IF;
  RETURN NEW;
END;
$function$;

-- 17. update_vendor_stats (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.update_vendor_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.vendors SET
      total_jobs = (SELECT COUNT(*) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id),
      completed_jobs = (SELECT COUNT(*) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id AND status = 'completed'),
      rating = (SELECT AVG(rating) FROM public.vendor_jobs WHERE vendor_id = NEW.vendor_id AND rating IS NOT NULL),
      updated_at = now()
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 18. create_vendor_payment_transaction (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.create_vendor_payment_transaction()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.payment_status = 'paid' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'paid') THEN
    INSERT INTO public.transactions (transaction_type, category, amount, payment_method, description, reference_number, transaction_date, created_by)
    VALUES ('expense', 'vendor_services', NEW.actual_cost, 'transfer', 'Vendor job: ' || NEW.job_number || ' - ' || NEW.title, NEW.invoice_number, NEW.payment_date, NEW.completed_by);
  END IF;
  RETURN NEW;
END;
$function$;

-- 19. link_maintenance_issue_to_vendor (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.link_maintenance_issue_to_vendor()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  IF NEW.maintenance_issue_id IS NOT NULL AND NEW.status = 'scheduled' THEN
    UPDATE public.maintenance_issues SET status = 'in_progress', updated_at = now() WHERE id = NEW.maintenance_issue_id;
  END IF;
  IF NEW.maintenance_issue_id IS NOT NULL AND NEW.status = 'completed' THEN
    UPDATE public.maintenance_issues SET status = 'resolved', resolved_at = NEW.completed_at, updated_at = now() WHERE id = NEW.maintenance_issue_id;
  END IF;
  RETURN NEW;
END;
$function$;

-- 20. update_staff_updated_at
CREATE OR REPLACE FUNCTION public.update_staff_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

-- 21. generate_employee_id
CREATE OR REPLACE FUNCTION public.generate_employee_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    new_id := 'EMP' || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM staff WHERE employee_id = new_id) INTO id_exists;
    EXIT WHEN NOT id_exists;
  END LOOP;
  RETURN new_id;
END;
$function$;

-- 22. set_employee_id
CREATE OR REPLACE FUNCTION public.set_employee_id()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.employee_id IS NULL OR NEW.employee_id = '' THEN NEW.employee_id := generate_employee_id(); END IF;
  RETURN NEW;
END;
$function$;

-- 23. calculate_attendance_hours
CREATE OR REPLACE FUNCTION public.calculate_attendance_hours()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.clock_in_time IS NOT NULL AND NEW.clock_out_time IS NOT NULL THEN
    NEW.hours_worked := EXTRACT(EPOCH FROM (NEW.clock_out_time - NEW.clock_in_time)) / 3600;
  END IF;
  RETURN NEW;
END;
$function$;

-- 24. generate_item_code
CREATE OR REPLACE FUNCTION public.generate_item_code(category_name text)
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  prefix TEXT;
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  prefix := UPPER(SUBSTRING(category_name FROM 1 FOR 3));
  LOOP
    new_code := prefix || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    SELECT EXISTS(SELECT 1 FROM inventory_items WHERE item_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- 25. generate_po_number
CREATE OR REPLACE FUNCTION public.generate_po_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
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
$function$;

-- 26. set_po_number
CREATE OR REPLACE FUNCTION public.set_po_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.po_number IS NULL OR NEW.po_number = '' THEN NEW.po_number := generate_po_number(); END IF;
  RETURN NEW;
END;
$function$;

-- 27. check_stock_levels
CREATE OR REPLACE FUNCTION public.check_stock_levels()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  alert_exists BOOLEAN;
BEGIN
  IF NEW.current_stock <= NEW.reorder_level AND NEW.current_stock > 0 THEN
    SELECT EXISTS(SELECT 1 FROM inventory_alerts WHERE item_id = NEW.id AND alert_type = 'low_stock' AND is_acknowledged = FALSE) INTO alert_exists;
    IF NOT alert_exists THEN
      INSERT INTO inventory_alerts (item_id, alert_type, severity, message)
      VALUES (NEW.id, 'low_stock', 'warning', 'Stock level for ' || NEW.item_name || ' is below reorder level (' || NEW.current_stock || ' ' || NEW.unit_of_measure || ')');
    END IF;
  END IF;
  IF NEW.current_stock <= 0 THEN
    SELECT EXISTS(SELECT 1 FROM inventory_alerts WHERE item_id = NEW.id AND alert_type = 'out_of_stock' AND is_acknowledged = FALSE) INTO alert_exists;
    IF NOT alert_exists THEN
      INSERT INTO inventory_alerts (item_id, alert_type, severity, message) VALUES (NEW.id, 'out_of_stock', 'critical', NEW.item_name || ' is out of stock!');
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;

-- 28. update_item_stock_after_movement
CREATE OR REPLACE FUNCTION public.update_item_stock_after_movement()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  UPDATE inventory_items SET current_stock = current_stock + NEW.quantity WHERE id = NEW.item_id;
  RETURN NEW;
END;
$function$;

-- 29. calculate_po_item_total
CREATE OR REPLACE FUNCTION public.calculate_po_item_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.total_cost := NEW.quantity_ordered * NEW.unit_cost;
  RETURN NEW;
END;
$function$;

-- 30. update_po_total
CREATE OR REPLACE FUNCTION public.update_po_total()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  UPDATE inventory_purchase_orders
  SET subtotal = (SELECT COALESCE(SUM(total_cost), 0) FROM inventory_purchase_order_items WHERE purchase_order_id = NEW.purchase_order_id),
  total_amount = (SELECT COALESCE(SUM(total_cost), 0) FROM inventory_purchase_order_items WHERE purchase_order_id = NEW.purchase_order_id) 
    + COALESCE((SELECT tax_amount FROM inventory_purchase_orders WHERE id = NEW.purchase_order_id), 0)
  WHERE id = NEW.purchase_order_id;
  RETURN NEW;
END;
$function$;

-- 31. set_task_number
CREATE OR REPLACE FUNCTION public.set_task_number()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  IF NEW.task_number IS NULL OR NEW.task_number = '' THEN NEW.task_number := generate_task_number(); END IF;
  RETURN NEW;
END;
$function$;

-- 32. generate_task_number
CREATE OR REPLACE FUNCTION public.generate_task_number()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
DECLARE
  next_number INTEGER;
  new_number TEXT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(housekeeping_tasks.task_number FROM 3) AS INTEGER)), 0) + 1
  INTO next_number FROM housekeeping_tasks WHERE housekeeping_tasks.task_number ~ '^CL[0-9]+$';
  new_number := 'CL' || LPAD(next_number::TEXT, 3, '0');
  RETURN new_number;
END;
$function$;

-- 33. update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;