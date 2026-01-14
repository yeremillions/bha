-- Drop existing overly permissive policies on staff table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.staff;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.staff;

-- Create properly restricted RLS policies for staff table
-- Only admins and facility managers can view staff data
CREATE POLICY "Admins and facility managers can view staff"
ON public.staff
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins can insert new staff members
CREATE POLICY "Admins can insert staff"
ON public.staff
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update staff data
CREATE POLICY "Admins can update staff"
ON public.staff
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can delete staff
CREATE POLICY "Admins can delete staff"
ON public.staff
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));