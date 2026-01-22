-- Seed initial admin user profile
-- This ensures the current user has admin role and can send invitations

-- Insert admin profile for existing users
-- Note: Replace the email below with your actual admin email if needed
INSERT INTO user_profiles (id, email, full_name, role)
SELECT
  id,
  email,
  COALESCE(raw_user_meta_data->>'full_name', 'Admin User'),
  'admin'
FROM auth.users
WHERE email = 'admin@brooklynhillsapartment.com' -- Update this to your actual admin email
ON CONFLICT (id) DO UPDATE
SET role = 'admin', updated_at = now();

-- If you want to make ALL existing users admins (for initial setup), uncomment below:
-- INSERT INTO user_profiles (id, email, full_name, role)
-- SELECT
--   id,
--   email,
--   COALESCE(raw_user_meta_data->>'full_name', 'User'),
--   'admin'
-- FROM auth.users
-- ON CONFLICT (id) DO UPDATE
-- SET role = 'admin', updated_at = now();
