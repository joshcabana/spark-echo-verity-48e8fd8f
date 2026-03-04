
-- public_profiles is a security_invoker view on profiles.
-- Currently profiles SELECT only allows owner + admin.
-- We need authenticated users to read profiles through the public_profiles view.
-- Since views with security_invoker use the caller's RLS, we add a policy
-- that allows authenticated users to SELECT from profiles.
-- The view already limits columns to (id, user_id, display_name, avatar_url).

-- Add policy allowing authenticated users to read any profile
-- (the public_profiles view restricts which columns are visible)
CREATE POLICY "Authenticated can read profiles for public view"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Drop the old restrictive owner-only SELECT since new policy is broader
-- Actually keep it - Postgres OR's multiple SELECT policies, so this is fine.
-- The old "Users can view own profile" is now redundant but harmless.
