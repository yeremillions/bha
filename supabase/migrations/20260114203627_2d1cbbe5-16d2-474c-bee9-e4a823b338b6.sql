-- Drop existing overly permissive policy on inventory_purchase_orders table
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_purchase_orders;

-- Create properly restricted RLS policies for inventory_purchase_orders table
-- Only admins and facility managers can view purchase orders
CREATE POLICY "Admins and facility managers can view purchase orders"
ON public.inventory_purchase_orders
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can insert purchase orders
CREATE POLICY "Admins and facility managers can insert purchase orders"
ON public.inventory_purchase_orders
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can update purchase orders
CREATE POLICY "Admins and facility managers can update purchase orders"
ON public.inventory_purchase_orders
FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
)
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins can delete purchase orders
CREATE POLICY "Admins can delete purchase orders"
ON public.inventory_purchase_orders
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));