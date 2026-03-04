import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Moderation threshold constants
const SAFE_THRESHOLD = 0.3;    // Below this: skip DB writes entirely (false-positive guard)
const WARN_THRESHOLD = 0.6;    // At or above: flag for human review
const AUTO_ACTION_THRESHOLD = 0.85; // At or above: auto-warn the user

const SYSTEM_PROMPT = `You are a safety moderation system for a video dating platform called Verity. Your job is to analyze text transcripts and behavioral metadata from live video calls and determine if any policy violations are occurring.

Policy violations include:
- Hate speech, slurs, or discriminatory language
- Sexual harassment or unwanted sexual content
- Threats of violence or self-harm
- Sharing personal information (phone numbers, addresses, social media handles) during anonymous calls
- Scam or fraud attempts
- Bullying or intimidation
- Drug solicitation

You must respond ONLY by calling the moderate_call tool. Never respond with plain text.

Be fair and avoid false positives. Context matters — discussing topics like art, history, or medicine that mention sensitive subjects is NOT a violation. Flirting and compliments are normal on a dating platform and are NOT violations unless they become harassment.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const call_id = typeof body.call_id === "string" ? body.call_id.trim() : "";
    const transcript = typeof body.transcript === "string" ? body.transcript.trim() : "";
    const metadata = body.metadata || {};

    // Validate call_id is a UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!call_id || !uuidRegex.test(call_id)) {
      return new Response(JSON.stringify({ error: "Invalid call_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify user is a participant in this call
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: call, error: callErr } = await admin
      .from("calls")
      .select("caller_id, callee_id")
      .eq("id", call_id)
      .single();

    if (callErr || !call) {
      return new Response(JSON.stringify({ error: "Call not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (call.caller_id !== user.id && call.callee_id !== user.id) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If no transcript provided, return safe (nothing to analyze)
    if (!transcript) {
      return new Response(
        JSON.stringify({ safe: true, flagged: false, score: 0, reason: null, call_id }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Lovable AI for moderation analysis
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY not configured");
      // Fail open with a warning — don't block calls if AI is misconfigured
      return new Response(
        JSON.stringify({ safe: true, flagged: false, score: 0, reason: null, call_id, warning: "Moderation temporarily unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `Analyze this call transcript for policy violations.\n\nTranscript:\n"""${transcript.slice(0, 2000)}"""\n\nMetadata: ${JSON.stringify(metadata)}`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "moderate_call",
              description: "Return the moderation result for a call transcript",
              parameters: {
                type: "object",
                properties: {
                  score: {
                    type: "number",
                    description: "Risk score from 0.0 (completely safe) to 1.0 (severe violation)",
                  },
                  flagged: {
                    type: "boolean",
                    description: "Whether the content should be flagged for review (true if score >= 0.6)",
                  },
                  reason: {
                    type: "string",
                    description: "Brief description of the violation, or null if safe",
                  },
                  category: {
                    type: "string",
                    enum: ["safe", "hate_speech", "harassment", "threats", "pii_sharing", "scam", "bullying", "sexual_content", "drugs"],
                    description: "Category of the violation",
                  },
                },
                required: ["score", "flagged", "reason", "category"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "moderate_call" } },
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      console.error("AI gateway error:", status, await aiResponse.text());
      // Fail open — don't block calls due to AI errors
      return new Response(
        JSON.stringify({ safe: true, flagged: false, score: 0, reason: null, call_id, warning: "Moderation temporarily unavailable" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiResponse.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let score = 0;
    let flagged = false;
    let reason: string | null = null;
    let category = "safe";

    if (toolCall?.function?.arguments) {
      try {
        const args = JSON.parse(toolCall.function.arguments);
        score = Math.max(0, Math.min(1, Number(args.score) || 0));
        flagged = args.flagged === true || score >= WARN_THRESHOLD;
        reason = args.reason || null;
        category = args.category || "safe";
      } catch (parseErr) {
        console.error("Failed to parse AI tool call:", parseErr);
      }
    }

    // If below safe threshold, skip DB writes entirely (false-positive guard)
    if (score < SAFE_THRESHOLD) {
      flagged = false;
    }

    // If flagged, record in moderation_flags
    if (flagged) {
      await admin.from("moderation_flags").insert({
        flagged_user_id: user.id,
        call_id,
        reason: reason || `AI flagged: ${category}`,
        ai_confidence: score,
      });

      // Also record moderation event
      await admin.from("moderation_events").insert({
        call_id,
        risk_score: score,
        details: { category, reason, transcript_length: transcript.length },
        action_taken: score >= AUTO_ACTION_THRESHOLD ? "auto_warn" : "flagged_for_review",
      });
    }

    return new Response(
      JSON.stringify({
        safe: !flagged,
        flagged,
        score,
        reason: flagged ? reason : null,
        call_id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ai-moderate error:", error);
    return new Response(
      JSON.stringify({ error: "An error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
