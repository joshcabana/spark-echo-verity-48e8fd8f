export interface AuthCapabilities {
  disableSignup: boolean;
  mailerAutoconfirm: boolean;
  emailEnabled: boolean;
  phoneEnabled: boolean;
  googleEnabled: boolean;
}

interface AuthSettingsResponse {
  disable_signup?: boolean;
  mailer_autoconfirm?: boolean;
  external?: {
    email?: boolean;
    phone?: boolean;
    google?: boolean;
  };
}

export const mapAuthSettingsToCapabilities = (settings: AuthSettingsResponse): AuthCapabilities => {
  return {
    disableSignup: settings.disable_signup ?? true,
    mailerAutoconfirm: settings.mailer_autoconfirm ?? false,
    emailEnabled: settings.external?.email ?? false,
    phoneEnabled: settings.external?.phone ?? false,
    googleEnabled: settings.external?.google ?? false,
  };
};

export const fetchAuthCapabilities = async (): Promise<AuthCapabilities> => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !anonKey) {
    throw new Error("Missing Supabase URL or publishable key");
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to load auth capabilities (${response.status})`);
  }

  const settings = await response.json() as AuthSettingsResponse;
  return mapAuthSettingsToCapabilities(settings);
};
