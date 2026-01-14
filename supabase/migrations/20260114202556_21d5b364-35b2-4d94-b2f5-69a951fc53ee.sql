-- Drop existing overly permissive policies on staff_attendance table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.staff_attendance;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.staff_attendance;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.staff_attendance;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.staff_attendance;

-- Create properly restricted RLS policies for staff_attendance table
-- Only admins and facility managers can view attendance records
CREATE POLICY "Admins and facility managers can view attendance"
ON public.staff_attendance
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can insert attendance records
CREATE POLICY "Admins and facility managers can insert attendance"
ON public.staff_attendance
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.has_role(auth.uid(), 'facility_manager')
);

-- Only admins and facility managers can update attendance records
CREATE POLICY "Admins and facility managers can update attendance"
ON public.staff_attendance
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

-- Only admins can delete attendance records
CREATE POLICY "Admins can delete attendance"
ON public.staff_attendance
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));