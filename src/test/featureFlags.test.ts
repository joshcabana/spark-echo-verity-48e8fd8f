import { describe, expect, it } from "vitest";
import { FEATURE_FLAGS_CONFIG_INVALID, parseFeatureFlagsPayload } from "@/lib/featureFlags";

describe("parseFeatureFlagsPayload", () => {
  it("maps valid payload to camelCase FeatureFlags", () => {
    expect(parseFeatureFlagsPayload({ require_phone_verification: false })).toEqual({
      requirePhoneVerification: false,
    });

    expect(parseFeatureFlagsPayload({ require_phone_verification: true })).toEqual({
      requirePhoneVerification: true,
    });
  });

  it("throws FEATURE_FLAGS_CONFIG_INVALID for malformed payload", () => {
    expect(() => parseFeatureFlagsPayload(null)).toThrow(FEATURE_FLAGS_CONFIG_INVALID);
    expect(() => parseFeatureFlagsPayload({})).toThrow(FEATURE_FLAGS_CONFIG_INVALID);
    expect(() => parseFeatureFlagsPayload({ require_phone_verification: "false" })).toThrow(
      FEATURE_FLAGS_CONFIG_INVALID,
    );
  });
});
