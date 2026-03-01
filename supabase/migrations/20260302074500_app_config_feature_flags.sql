-- App-wide runtime policy configuration for feature flags.
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role can read app config" ON public.app_config;
CREATE POLICY "Service role can read app config"
ON public.app_config
FOR SELECT
TO service_role
USING (true);

DROP TRIGGER IF EXISTS update_app_config_updated_at ON public.app_config;
CREATE TRIGGER update_app_config_updated_at
BEFORE UPDATE ON public.app_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.app_config (key, value_json)
VALUES ('auth_policy', '{"require_phone_verification": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;

REVOKE ALL ON public.app_config FROM anon, authenticated;
GRANT SELECT ON public.app_config TO service_role;
