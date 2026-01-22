-- Create team_invitations table for managing team member invites

CREATE TABLE IF NOT EXISTS team_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'manager', 'receptionist', 'staff')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  invite_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  accepted_at timestamptz,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL -- Set when invitation is accepted
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_team_invitations_email ON team_invitations(email);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(invite_token);
CREATE INDEX IF NOT EXISTS idx_team_invitations_status ON team_invitations(status);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_team_invitations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists, then create it
DROP TRIGGER IF EXISTS team_invitations_updated_at ON team_invitations;

CREATE TRIGGER team_invitations_updated_at
  BEFORE UPDATE ON team_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_team_invitations_updated_at();

-- Add RLS policies
ALTER TABLE team_invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Admins and managers can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can update invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can delete invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can view their own invitation by token" ON team_invitations;

-- Admins and managers can view all invitations
CREATE POLICY "Admins and managers can view invitations"
  ON team_invitations
  FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email LIKE '%@brooklynhillsapartment.com'
  ));

-- Admins and managers can create invitations
CREATE POLICY "Admins and managers can create invitations"
  ON team_invitations
  FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM auth.users WHERE email LIKE '%@brooklynhillsapartment.com'
  ));

-- Admins and managers can update invitations
CREATE POLICY "Admins and managers can update invitations"
  ON team_invitations
  FOR UPDATE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email LIKE '%@brooklynhillsapartment.com'
  ));

-- Admins and managers can delete invitations
CREATE POLICY "Admins and managers can delete invitations"
  ON team_invitations
  FOR DELETE
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email LIKE '%@brooklynhillsapartment.com'
  ));

-- Anyone with a valid token can view their own invitation (for acceptance flow)
CREATE POLICY "Users can view their own invitation by token"
  ON team_invitations
  FOR SELECT
  USING (invite_token IS NOT NULL);

-- Add comments for documentation
COMMENT ON TABLE team_invitations IS 'Stores team member invitation records';
COMMENT ON COLUMN team_invitations.role IS 'Role to be assigned: admin, manager, receptionist, or staff';
COMMENT ON COLUMN team_invitations.invite_token IS 'Unique token sent in invitation email for acceptance';
COMMENT ON COLUMN team_invitations.expires_at IS 'Invitation expires 7 days after creation';
COMMENT ON COLUMN team_invitations.status IS 'Current status: pending, accepted, expired, or revoked';
