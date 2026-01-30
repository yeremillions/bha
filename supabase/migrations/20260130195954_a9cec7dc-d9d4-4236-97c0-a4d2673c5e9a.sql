-- Remove overly permissive SELECT policies that expose tokens to the public
DROP POLICY IF EXISTS "Users can view invitation by token" ON public.team_invitations;
DROP POLICY IF EXISTS "Users can view their own invitation by token" ON public.team_invitations;

-- Keep the existing admin/manager policies which properly restrict access
-- The accept-invitation edge function uses service role and bypasses RLS