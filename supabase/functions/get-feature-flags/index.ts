import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { FEATURE_FLAGS_CONFIG_INVALID, parseFeatureFlagsRecord } from "./flags-parser.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(
        JSON.stringify({
          error: FEATURE_FLAGS_CONFIG_INVALID,
          detail: "Supabase service credentials are not configured",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await admin
      .from("app_config")
      .select("value_json")
      .eq("key", "auth_policy")
      .maybeSingle();

    if (error || !data) {
      return new Response(
        JSON.stringify({
          error: FEATURE_FLAGS_CONFIG_INVALID,
          detail: "Missing app_config.auth_policy",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const parsed = parseFeatureFlagsRecord(data.value_json);

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : FEATURE_FLAGS_CONFIG_INVALID;
    return new Response(
      JSON.stringify({
        error: code,
        detail: "Unable to resolve feature flags",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
