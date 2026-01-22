-- Add department field to user_profiles for module access control
-- This enables different dashboards for different staff types

ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS department text;

-- Add check constraint for valid departments
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_department_check
CHECK (department IS NULL OR department IN (
  'management',
  'reception',
  'housekeeping',
  'bar',
  'maintenance',
  'security'
));

-- Update existing users to have management department (can see all modules)
UPDATE user_profiles
SET department = 'management'
WHERE department IS NULL;

-- Make department required for new records
ALTER TABLE user_profiles
ALTER COLUMN department SET DEFAULT 'reception';

ALTER TABLE user_profiles
ALTER COLUMN department SET NOT NULL;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_department ON user_profiles(department);

-- Add comments
COMMENT ON COLUMN user_profiles.department IS 'Department determines which modules user can access';
