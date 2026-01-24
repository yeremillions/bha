-- Phase 1: Create user_departments table and migrate data

-- Step 1: Create the app_department enum
CREATE TYPE public.app_department AS ENUM (
  'management', 'reception', 'housekeeping', 
  'bar', 'maintenance', 'security'
);

-- Step 2: Create user_departments table
CREATE TABLE public.user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  department app_department NOT NULL DEFAULT 'reception',
  is_owner BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Step 3: Enable RLS
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;

-- Step 4: RLS policies for user_departments
-- Users can view their own department
CREATE POLICY "Users can view their own department"
ON public.user_departments FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all departments
CREATE POLICY "Admins can view all departments"
ON public.user_departments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update departments
CREATE POLICY "Admins can update departments"
ON public.user_departments FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Step 5: Migrate existing data from user_profiles to user_departments
INSERT INTO public.user_departments (user_id, department, is_owner, created_at)
SELECT 
  id as user_id,
  CASE department
    WHEN 'management' THEN 'management'::app_department
    WHEN 'reception' THEN 'reception'::app_department
    WHEN 'housekeeping' THEN 'housekeeping'::app_department
    WHEN 'bar' THEN 'bar'::app_department
    WHEN 'maintenance' THEN 'maintenance'::app_department
    WHEN 'security' THEN 'security'::app_department
    ELSE 'reception'::app_department
  END as department,
  COALESCE(is_owner, false) as is_owner,
  created_at
FROM public.user_profiles
ON CONFLICT (user_id) DO NOTHING;

-- Step 6: Sync profiles table with user_profiles data (in case profiles is missing entries)
INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
SELECT 
  id,
  email,
  full_name,
  created_at,
  updated_at
FROM public.user_profiles
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  updated_at = EXCLUDED.updated_at;

-- Step 7: Update handle_new_user trigger to use new tables
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
  
  -- Determine role from metadata (default to 'admin' for first user, 'staff' otherwise)
  v_role := COALESCE(
    (NEW.raw_user_meta_data->>'role')::app_role,
    'admin'::app_role
  );
  
  -- Insert into user_roles (permissions)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, v_role)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Determine department from metadata (default to 'management' for admins)
  v_department := COALESCE(
    (NEW.raw_user_meta_data->>'department')::app_department,
    'management'::app_department
  );
  
  -- Insert into user_departments (department access)
  INSERT INTO public.user_departments (user_id, department, is_owner)
  VALUES (NEW.id, v_department, false)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Step 8: Create transfer_ownership function that works with new schema
CREATE OR REPLACE FUNCTION public.transfer_ownership(new_owner_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_owner_id UUID;
BEGIN
  -- Get current owner
  SELECT user_id INTO current_owner_id
  FROM public.user_departments
  WHERE is_owner = true
  LIMIT 1;
  
  -- Verify caller is current owner
  IF current_owner_id IS NULL OR current_owner_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the current owner can transfer ownership';
  END IF;
  
  -- Remove ownership from current owner
  UPDATE public.user_departments
  SET is_owner = false
  WHERE user_id = current_owner_id;
  
  -- Assign ownership to new owner
  UPDATE public.user_departments
  SET is_owner = true
  WHERE user_id = new_owner_id;
  
  RETURN true;
END;
$$;