import { describe, expect, it } from "vitest";
import { mapAuthSettingsToCapabilities } from "@/lib/authCapabilities";

describe("auth capabilities helpers", () => {
  it("maps auth settings response into stable capability flags", () => {
    const capabilities = mapAuthSettingsToCapabilities({
      disable_signup: false,
      mailer_autoconfirm: false,
      external: {
        email: true,
        phone: false,
        google: false,
      },
    });

    expect(capabilities).toEqual({
      disableSignup: false,
      mailerAutoconfirm: false,
      emailEnabled: true,
      phoneEnabled: false,
      googleEnabled: false,
    });
  });
});
