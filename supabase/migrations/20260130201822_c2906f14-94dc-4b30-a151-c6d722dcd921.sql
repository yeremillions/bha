-- Fix housekeeping_staff RLS to prevent housekeepers from viewing all contact info
-- Remove housekeeper role from the SELECT policy - only admins/managers need full access

DROP POLICY IF EXISTS "Admins and facility managers can view housekeeping staff" ON public.housekeeping_staff;

-- Recreate policy without housekeeper access
CREATE POLICY "Admins and facility managers can view housekeeping staff" 
ON public.housekeeping_staff 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'facility_manager'::app_role) OR
  has_role(auth.uid(), 'manager'::app_role)
);