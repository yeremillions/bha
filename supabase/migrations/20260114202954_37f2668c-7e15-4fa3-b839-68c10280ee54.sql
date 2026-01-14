-- Drop existing overly permissive policy on inventory_categories table
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.inventory_categories;

-- Create properly restricted RLS policies for inventory_categories table
-- Only admins and facility managers can view inventory categories
CREATE POLICY "Admins and facility managers can view inventory categories"
ON public.inventory_categories
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can insert inventory categories
CREATE POLICY "Admins and facility managers can insert inventory categories"
ON public.inventory_categories
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can update inventory categories
CREATE POLICY "Admins and facility managers can update inventory categories"
ON public.inventory_categories
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

-- Only admins can delete inventory categories
CREATE POLICY "Admins can delete inventory categories"
ON public.inventory_categories
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));