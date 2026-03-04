
-- The previous migration partially applied. Let's apply the remaining items.

-- 2. Create restricted view for flagged users (no clip_url, no reviewed_by)
CREATE VIEW public.my_moderation_flags
WITH (security_invoker = on) AS
  SELECT id, reason, ai_confidence, created_at, action_taken, reviewed_at
  FROM public.moderation_flags
  WHERE flagged_user_id = auth.uid();

-- 3. Restrict app_config: replace public read with key-scoped policy
DROP POLICY IF EXISTS "Anyone can read app_config" ON public.app_config;

CREATE POLICY "Anyone can read non-sensitive config"
ON public.app_config
FOR SELECT
USING (key IN ('vapid_public_key', 'feature_flags', 'maintenance_mode'));

-- 5. Safe view for calls excluding recording metadata
CREATE VIEW public.my_calls
WITH (security_invoker = on) AS
  SELECT id, caller_id, callee_id, room_id, status, agora_channel,
         caller_decision, callee_decision, is_mutual_spark,
         duration_seconds, started_at, ended_at, created_at
  FROM public.calls
  WHERE caller_id = auth.uid() OR callee_id = auth.uid();

-- 6. Safe view for chemistry_replays excluding video_url
CREATE VIEW public.my_chemistry_replays
WITH (security_invoker = on) AS
  SELECT id, call_id, spark_id, user_a, user_b, duration_seconds, status, created_at
  FROM public.chemistry_replays
  WHERE user_a = auth.uid() OR user_b = auth.uid();

-- 7. Safe view for messages excluding voice_url
CREATE VIEW public.my_messages
WITH (security_invoker = on) AS
  SELECT id, spark_id, sender_id, content, is_voice, is_read, created_at
  FROM public.messages
  WHERE public.is_spark_member(auth.uid(), spark_id);
