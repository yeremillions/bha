-- Add is_owner column to user_profiles
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT FALSE;

-- Create index for owner lookup
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_owner ON public.user_profiles(is_owner) WHERE is_owner = TRUE;

-- Set the first admin as owner (if none exists)
-- This will mark the oldest admin user as the owner
UPDATE public.user_profiles
SET is_owner = TRUE
WHERE id = (
  SELECT id FROM public.user_profiles 
  WHERE role = 'admin' 
  ORDER BY created_at ASC 
  LIMIT 1
)
AND NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE is_owner = TRUE);

-- Create a function to prevent owner demotion
CREATE OR REPLACE FUNCTION public.prevent_owner_demotion()
RETURNS TRIGGER AS $$
BEGIN
  -- Prevent changing owner's role from admin
  IF OLD.is_owner = TRUE AND NEW.role != 'admin' THEN
    RAISE EXCEPTION 'Cannot change role of account owner. Transfer ownership first.';
  END IF;
  
  -- Prevent removing owner status without transferring
  IF OLD.is_owner = TRUE AND NEW.is_owner = FALSE THEN
    RAISE EXCEPTION 'Cannot remove owner status. Use transfer ownership instead.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for owner protection
DROP TRIGGER IF EXISTS protect_owner_demotion ON public.user_profiles;
CREATE TRIGGER protect_owner_demotion
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_owner_demotion();

-- Function to transfer ownership (only current owner can do this)
CREATE OR REPLACE FUNCTION public.transfer_ownership(new_owner_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_user_id UUID;
  is_current_owner BOOLEAN;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  
  -- Check if current user is owner
  SELECT is_owner INTO is_current_owner
  FROM public.user_profiles
  WHERE id = current_user_id;
  
  IF NOT is_current_owner THEN
    RAISE EXCEPTION 'Only the current owner can transfer ownership';
  END IF;
  
  -- Ensure new owner exists and is admin
  IF NOT EXISTS (SELECT 1 FROM public.user_profiles WHERE id = new_owner_id AND role = 'admin') THEN
    RAISE EXCEPTION 'New owner must be an existing admin user';
  END IF;
  
  -- Transfer ownership (disable trigger temporarily)
  ALTER TABLE public.user_profiles DISABLE TRIGGER protect_owner_demotion;
  
  UPDATE public.user_profiles SET is_owner = FALSE WHERE id = current_user_id;
  UPDATE public.user_profiles SET is_owner = TRUE WHERE id = new_owner_id;
  
  ALTER TABLE public.user_profiles ENABLE TRIGGER protect_owner_demotion;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;