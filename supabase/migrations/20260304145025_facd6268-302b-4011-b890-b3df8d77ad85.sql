
-- URGENT: Remove overly broad profiles SELECT policy
DROP POLICY IF EXISTS "Authenticated can read profiles for public view" ON public.profiles;

-- Instead, recreate public_profiles as a SECURITY DEFINER view (runs as owner, not caller)
-- This way it doesn't need the caller to have SELECT on profiles
DROP VIEW IF EXISTS public.public_profiles;

CREATE VIEW public.public_profiles AS
  SELECT id, user_id, display_name, avatar_url
  FROM public.profiles;

-- Grant SELECT on the view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
