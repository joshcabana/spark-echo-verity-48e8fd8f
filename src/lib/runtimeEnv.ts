const REQUIRED_RUNTIME_KEYS = [
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_PUBLISHABLE_KEY",
] as const;

export type RequiredRuntimeKey = (typeof REQUIRED_RUNTIME_KEYS)[number];

// Platform-level fallback: if env vars aren't injected (config.toml mismatch),
// use the known Lovable Cloud project credentials (publishable/anon only).
const CLOUD_FALLBACKS: Record<RequiredRuntimeKey, string> = {
  VITE_SUPABASE_URL: "https://itdzdyhdkbcxbqgukzis.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0ZHpkeWhka2JjeGJxZ3VremlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMDA5MTcsImV4cCI6MjA4NzY3NjkxN30.06IYR1KfgqKb9kgiWJQYmEEti5Sts0HaBvEgTooSlho",
};

const readRuntimeValue = (key: RequiredRuntimeKey): string | undefined => {
  const rawValue = (import.meta.env as Record<string, string | undefined>)[key];
  if (!rawValue) return undefined;
  const trimmedValue = rawValue.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
};

export const getMissingRuntimeEnvKeys = (): RequiredRuntimeKey[] => {
  return REQUIRED_RUNTIME_KEYS.filter(
    (key) => !readRuntimeValue(key) && !CLOUD_FALLBACKS[key],
  );
};

export const getSupabaseRuntimeConfig = (): {
  supabaseUrl: string;
  supabasePublishableKey: string;
} => {
  const url = readRuntimeValue("VITE_SUPABASE_URL") ?? CLOUD_FALLBACKS.VITE_SUPABASE_URL;
  const key =
    readRuntimeValue("VITE_SUPABASE_PUBLISHABLE_KEY") ??
    CLOUD_FALLBACKS.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      `[Verity] Missing runtime environment configuration.`,
    );
  }

  return { supabaseUrl: url, supabasePublishableKey: key };
};
