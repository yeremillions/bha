-- Drop the overly permissive public SELECT policy on user_profiles
DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.user_profiles;

-- Create a policy that only allows authenticated users to view profiles
CREATE POLICY "Authenticated users can view profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);