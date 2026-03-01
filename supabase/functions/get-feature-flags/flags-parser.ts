export const FEATURE_FLAGS_CONFIG_INVALID = "FEATURE_FLAGS_CONFIG_INVALID";

export interface FeatureFlagsPayload {
  require_phone_verification: boolean;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export const parseFeatureFlagsRecord = (value: unknown): FeatureFlagsPayload => {
  if (!isPlainObject(value)) {
    throw new Error(FEATURE_FLAGS_CONFIG_INVALID);
  }

  const requirePhone = value.require_phone_verification;
  if (typeof requirePhone !== "boolean") {
    throw new Error(FEATURE_FLAGS_CONFIG_INVALID);
  }

  return {
    require_phone_verification: requirePhone,
  };
};
