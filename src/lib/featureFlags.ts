export interface FeatureFlags {
  requirePhoneVerification: boolean;
}

interface FeatureFlagsPayload {
  require_phone_verification: boolean;
}

export const FEATURE_FLAGS_CONFIG_INVALID = "FEATURE_FLAGS_CONFIG_INVALID";

const isFeatureFlagsPayload = (value: unknown): value is FeatureFlagsPayload => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
  return typeof (value as { require_phone_verification?: unknown }).require_phone_verification === "boolean";
};

export const parseFeatureFlagsPayload = (value: unknown): FeatureFlags => {
  if (!isFeatureFlagsPayload(value)) {
    throw new Error(FEATURE_FLAGS_CONFIG_INVALID);
  }

  return {
    requirePhoneVerification: value.require_phone_verification,
  };
};

export const fetchFeatureFlags = async (): Promise<FeatureFlags> => {
  const { supabase } = await import("@/integrations/supabase/client");
  const { data, error } = await supabase.functions.invoke("get-feature-flags", {
    body: {},
  });

  if (error) {
    throw new Error(error.message || FEATURE_FLAGS_CONFIG_INVALID);
  }

  return parseFeatureFlagsPayload(data);
};
