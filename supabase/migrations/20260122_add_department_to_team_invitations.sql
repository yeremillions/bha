-- Add department field to team_invitations
-- This allows specifying which department the invited user will work in

ALTER TABLE team_invitations
ADD COLUMN IF NOT EXISTS department text;

-- Add check constraint for valid departments
ALTER TABLE team_invitations
ADD CONSTRAINT team_invitations_department_check
CHECK (department IS NULL OR department IN (
  'management',
  'reception',
  'housekeeping',
  'bar',
  'maintenance',
  'security'
));

-- Set default department
ALTER TABLE team_invitations
ALTER COLUMN department SET DEFAULT 'reception';

-- Make department required for new invitations
ALTER TABLE team_invitations
ALTER COLUMN department SET NOT NULL;

-- Add comment
COMMENT ON COLUMN team_invitations.department IS 'Department determines module access for invited user';
