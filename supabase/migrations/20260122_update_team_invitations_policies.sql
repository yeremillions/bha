-- Update team_invitations RLS policies to use user_profiles table
-- This avoids the "permission denied for table auth.users" error

-- Drop old policies that referenced auth.users
DROP POLICY IF EXISTS "Admins and managers can view invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can create invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can update invitations" ON team_invitations;
DROP POLICY IF EXISTS "Admins and managers can delete invitations" ON team_invitations;
DROP POLICY IF EXISTS "Users can view their own invitation by token" ON team_invitations;

-- Create new policies using user_profiles table

-- Only admins and managers can view invitations
CREATE POLICY "Admins and managers can view invitations"
  ON team_invitations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Only admins and managers can create invitations
CREATE POLICY "Admins and managers can create invitations"
  ON team_invitations
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Only admins and managers can update invitations
CREATE POLICY "Admins and managers can update invitations"
  ON team_invitations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Only admins and managers can delete invitations
CREATE POLICY "Admins and managers can delete invitations"
  ON team_invitations
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'manager')
    )
  );

-- Anyone with a valid token can view their invitation (for acceptance flow)
CREATE POLICY "Users can view invitation by token"
  ON team_invitations
  FOR SELECT
  USING (invite_token IS NOT NULL);
