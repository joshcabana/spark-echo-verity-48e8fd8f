import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function generateCode(len = 8): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAuth = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } =
      await supabaseAuth.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;

    const { drop_id } = await req.json();
    if (!drop_id) {
      return new Response(JSON.stringify({ error: "drop_id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check drop exists
    const { data: drop, error: dropErr } = await supabaseAdmin
      .from("drops")
      .select("id, title")
      .eq("id", drop_id)
      .single();

    if (dropErr || !drop) {
      return new Response(JSON.stringify({ error: "Drop not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check if user already has an invite code for this drop
    const { data: existing } = await supabaseAdmin
      .from("drop_rsvps")
      .select("friend_invite_code")
      .eq("user_id", userId)
      .eq("drop_id", drop_id)
      .not("friend_invite_code", "is", null)
      .maybeSingle();

    let code: string;

    if (existing?.friend_invite_code) {
      code = existing.friend_invite_code;
    } else {
      code = generateCode();

      // Upsert RSVP with invite code
      const { error: upsertErr } = await supabaseAdmin
        .from("drop_rsvps")
        .upsert(
          {
            user_id: userId,
            drop_id,
            friend_invite_code: code,
          },
          { onConflict: "user_id,drop_id" }
        );

      // If upsert fails due to no unique constraint, try insert then update
      if (upsertErr) {
        // Try to find existing RSVP and update it
        const { data: existingRsvp } = await supabaseAdmin
          .from("drop_rsvps")
          .select("id")
          .eq("user_id", userId)
          .eq("drop_id", drop_id)
          .maybeSingle();

        if (existingRsvp) {
          await supabaseAdmin
            .from("drop_rsvps")
            .update({ friend_invite_code: code })
            .eq("id", existingRsvp.id);
        } else {
          const { error: insertErr } = await supabaseAdmin
            .from("drop_rsvps")
            .insert({
              user_id: userId,
              drop_id,
              friend_invite_code: code,
            });

          if (insertErr) {
            return new Response(
              JSON.stringify({ error: "Failed to create invite" }),
              {
                status: 500,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
              }
            );
          }
        }
      }
    }

    const baseUrl = "https://getverity.com.au";
    const inviteUrl = `${baseUrl}/drops/friendfluence?code=${code}&drop=${drop_id}`;

    return new Response(
      JSON.stringify({ invite_url: inviteUrl, code }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
