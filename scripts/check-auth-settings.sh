#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env}"
ENV_FALLBACK_FILE="${2:-.env.production}"

ENV_FILES=("$ENV_FILE")
if [[ "$ENV_FALLBACK_FILE" != "$ENV_FILE" ]]; then
  ENV_FILES+=("$ENV_FALLBACK_FILE")
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required for this script" >&2
  exit 1
fi

read_env_var() {
  local key="$1"
  # Prefer env var already set in environment
  local env_val
  env_val="$(printenv "$key" 2>/dev/null || true)"
  if [[ -n "$env_val" ]]; then
    echo "$env_val"
    return 0
  fi
  # Fall back to reading from env files if accessible
  local env_file
  for env_file in "${ENV_FILES[@]}"; do
    if [[ ! -f "$env_file" ]]; then
      continue
    fi
    local line
    line="$(grep -E "^${key}=" "$env_file" | tail -n 1 || true)"
    if [[ -z "$line" ]]; then
      continue
    fi
    local value="${line#*=}"
    value="${value%\"}"
    value="${value#\"}"
    echo "$value"
    return 0
  done

  echo ""
}

SUPA_URL="$(read_env_var "VITE_SUPABASE_URL")"
ANON_KEY="$(read_env_var "VITE_SUPABASE_PUBLISHABLE_KEY")"
REQUIRE_GOOGLE_FLAG="$(read_env_var "VITE_REQUIRE_GOOGLE_AUTH")"
REQUIRE_GOOGLE="${REQUIRE_GOOGLE_FLAG:-false}"
REQUIRE_GOOGLE_LOWER="$(echo "$REQUIRE_GOOGLE" | tr '[:upper:]' '[:lower:]')"

if [[ -z "$SUPA_URL" || -z "$ANON_KEY" ]]; then
  echo "Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in env context or ${ENV_FILES[*]}" >&2
  exit 1
fi

SETTINGS_JSON="$(
  curl -fsS "$SUPA_URL/auth/v1/settings" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY"
)"

FLAGS_RESPONSE="$(
  curl -sS -w '\n%{http_code}' "$SUPA_URL/functions/v1/get-feature-flags" \
    -H "apikey: $ANON_KEY" \
    -H "Authorization: Bearer $ANON_KEY" \
    -H "Content-Type: application/json" \
    -d '{}'
)"

FLAGS_STATUS="$(echo "$FLAGS_RESPONSE" | tail -n 1)"
FLAGS_BODY="$(echo "$FLAGS_RESPONSE" | sed '$d')"

if [[ "$FLAGS_STATUS" != "200" ]]; then
  echo "FAIL: get-feature-flags returned HTTP $FLAGS_STATUS." >&2
  echo "$FLAGS_BODY" >&2
  exit 2
fi

REQUIRE_PHONE_JSON="$(echo "$FLAGS_BODY" | jq -r '.require_phone_verification')"
if [[ "$REQUIRE_PHONE_JSON" != "true" && "$REQUIRE_PHONE_JSON" != "false" ]]; then
  echo "FAIL: get-feature-flags response is invalid (require_phone_verification must be boolean)." >&2
  echo "$FLAGS_BODY" >&2
  exit 2
fi

echo "$SETTINGS_JSON" | jq '{disable_signup, mailer_autoconfirm, external:{email:.external.email, phone:.external.phone, google:.external.google}}'
echo "$FLAGS_BODY" | jq '{feature_flags:{require_phone_verification:.require_phone_verification}}'

DISABLE_SIGNUP="$(echo "$SETTINGS_JSON" | jq -r '.disable_signup')"
EMAIL_ENABLED="$(echo "$SETTINGS_JSON" | jq -r '.external.email')"
PHONE_ENABLED="$(echo "$SETTINGS_JSON" | jq -r '.external.phone')"
GOOGLE_ENABLED="$(echo "$SETTINGS_JSON" | jq -r '.external.google')"

if [[ "$DISABLE_SIGNUP" != "false" ]]; then
  echo "FAIL: disable_signup must be false." >&2
  exit 2
fi

if [[ "$EMAIL_ENABLED" != "true" ]]; then
  echo "FAIL: external.email must be true." >&2
  exit 2
fi

if [[ "$REQUIRE_PHONE_JSON" == "true" && "$PHONE_ENABLED" != "true" ]]; then
  echo "FAIL: external.phone must be true while require_phone_verification=true." >&2
  exit 2
fi

if [[ "$REQUIRE_PHONE_JSON" != "true" && "$PHONE_ENABLED" != "true" ]]; then
  echo "WARN: phone provider is disabled and fallback mode is active." >&2
fi

if [[ "$REQUIRE_GOOGLE_LOWER" == "true" && "$GOOGLE_ENABLED" != "true" ]]; then
  echo "FAIL: external.google must be true while VITE_REQUIRE_GOOGLE_AUTH=true." >&2
  exit 2
fi

echo "PASS: Auth settings match current runtime policy."
