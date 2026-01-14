-- Drop existing overly permissive policy on inventory_items table
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_items;

-- Create properly restricted RLS policies for inventory_items table
-- Only admins and facility managers can view inventory items
CREATE POLICY "Admins and facility managers can view inventory items"
ON public.inventory_items
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can insert inventory items
CREATE POLICY "Admins and facility managers can insert inventory items"
ON public.inventory_items
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can update inventory items
CREATE POLICY "Admins and facility managers can update inventory items"
ON public.inventory_items
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

-- Only admins can delete inventory items
CREATE POLICY "Admins can delete inventory items"
ON public.inventory_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));