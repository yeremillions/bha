-- Fix the handle_new_user trigger to use correct ON CONFLICT clauses

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
  -- Insert into profiles (identity)
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = now();
  
  -- Map invitation role to database app_role enum
  -- Invitation uses: admin, manager, receptionist, staff
  -- Database uses: admin, facility_manager, housekeeper, maintenance, barman
  v_role := CASE COALESCE(NEW.raw_user_meta_data->>'role', 'admin')
    WHEN 'admin' THEN 'admin'::app_role
    WHEN 'manager' THEN 'facility_manager'::app_role
    WHEN 'receptionist' THEN 'admin'::app_role  -- Map to admin for now
    WHEN 'staff' THEN 'housekeeper'::app_role   -- Default staff role
    ELSE 'admin'::app_role
  END;
  
  -- Insert into user_roles (permissions) - use (user_id, role) composite unique
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Determine department from metadata (default to 'management' for admins)
  v_department := CASE COALESCE(NEW.raw_user_meta_data->>'department', 'management')
    WHEN 'management' THEN 'management'::app_department
    WHEN 'reception' THEN 'reception'::app_department
    WHEN 'housekeeping' THEN 'housekeeping'::app_department
    WHEN 'bar' THEN 'bar'::app_department
    WHEN 'maintenance' THEN 'maintenance'::app_department
    WHEN 'security' THEN 'security'::app_department
    ELSE 'management'::app_department
  END;
  
  -- Insert into user_departments (department access) - has unique constraint on user_id
  INSERT INTO public.user_departments (user_id, department, is_owner)
  VALUES (NEW.id, v_department, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;