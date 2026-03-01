# Auth Unblock Runbook (`itdzdyhdkbcxbqgukzis`)

Canonical Supabase project: `itdzdyhdkbcxbqgukzis`

Primary source of truth: [docs/environment-matrix.md](./environment-matrix.md)

## 1) Validate Runtime Target

Confirm these point to the same project:

- `.env` (`VITE_SUPABASE_PROJECT_ID`, `VITE_SUPABASE_URL`)
- `supabase/config.toml` (`project_id`)
- deployed site bundle endpoint

Do not repoint to `nhpbxlvogqnqutmflwlk` unless running a planned migration.

## 2) Configure Providers in Supabase Dashboard

Project: `itdzdyhdkbcxbqgukzis`

1. `Authentication -> SMTP Settings`
- Set host, port, username, password, sender email.
- Confirm domain SPF + DKIM + DMARC.

2. `Authentication -> Providers -> Phone`
- Enable provider.
- Set Twilio Account SID, Auth Token, Message Service SID.

3. `Authentication -> Providers -> Google`
- Enable provider.
- Set Google OAuth client ID and secret.
- Ensure redirect URI is registered in Google Cloud Console.

## 3) Hard Validation

Run:

```bash
npm run check:project-alignment
npm run check:auth-settings
```

Expected:
- `disable_signup=false`
- `external.email=true`
- `external.phone=true` when `feature_flags.require_phone_verification=true`
- `external.google=true` when `VITE_REQUIRE_GOOGLE_AUTH=true`

## 4) Fallback Policy

Default strict mode (DB-controlled):

```sql
update public.app_config
set value_json = jsonb_set(value_json, '{require_phone_verification}', 'true'::jsonb, true)
where key = 'auth_policy';
```

Temporary incident mode (only if SMS provider is down):

```sql
update public.app_config
set value_json = jsonb_set(value_json, '{require_phone_verification}', 'false'::jsonb, true)
where key = 'auth_policy';
```

When fallback mode is active:
- Onboarding can continue without phone OTP.
- Lobby gate requires selfie + safety pledge.
- UI shows continuity-mode notice.

Re-enable strict mode immediately after phone provider recovery and redeploy.

## 5) End-to-End Verification Checklist

1. Sign up at `/auth` with a fresh email.
2. Verify email arrives and link works.
3. Complete onboarding phone OTP in strict mode.
4. Reach `/lobby` and join a live Drop.
