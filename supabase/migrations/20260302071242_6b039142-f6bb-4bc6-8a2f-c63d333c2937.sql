
-- ============================================================
-- MIGRATION 1: claim_match_candidate RPC (atomic matchmaking)
-- ============================================================

CREATE OR REPLACE FUNCTION public.claim_match_candidate(
  p_user_id uuid,
  p_drop_id uuid
)
RETURNS TABLE(candidate_user_id uuid, candidate_queue_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_candidate_user_id uuid;
  v_candidate_queue_id uuid;
BEGIN
  -- Atomically lock and claim one waiting candidate (not self)
  SELECT mq.user_id, mq.id
  INTO v_candidate_user_id, v_candidate_queue_id
  FROM public.matchmaking_queue mq
  WHERE mq.drop_id = p_drop_id
    AND mq.status = 'waiting'
    AND mq.user_id <> p_user_id
  ORDER BY mq.joined_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF v_candidate_user_id IS NULL THEN
    RETURN;
  END IF;

  -- Mark candidate as claiming (prevents double-match)
  UPDATE public.matchmaking_queue
  SET status = 'claiming'
  WHERE id = v_candidate_queue_id;

  -- Also mark self as claiming
  UPDATE public.matchmaking_queue
  SET status = 'claiming'
  WHERE user_id = p_user_id
    AND drop_id = p_drop_id
    AND status = 'waiting';

  RETURN QUERY SELECT v_candidate_user_id, v_candidate_queue_id;
END;
$$;

-- ============================================================
-- MIGRATION 2: submit_call_decision RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.submit_call_decision(
  p_call_id uuid,
  p_decision spark_decision
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_caller_id uuid;
  v_callee_id uuid;
  v_role text;
BEGIN
  SELECT caller_id, callee_id
  INTO v_caller_id, v_callee_id
  FROM public.calls
  WHERE id = p_call_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Call not found';
  END IF;

  IF auth.uid() = v_caller_id THEN
    v_role := 'caller';
  ELSIF auth.uid() = v_callee_id THEN
    v_role := 'callee';
  ELSE
    RAISE EXCEPTION 'Not a participant';
  END IF;

  IF v_role = 'caller' THEN
    UPDATE public.calls
    SET caller_decision = p_decision
    WHERE id = p_call_id AND caller_decision IS NULL;
  ELSE
    UPDATE public.calls
    SET callee_decision = p_decision
    WHERE id = p_call_id AND callee_decision IS NULL;
  END IF;
END;
$$;

-- ============================================================
-- MIGRATION 3: update_my_profile RPC
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_my_profile(
  p_display_name text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_city text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_handle text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET
    display_name = COALESCE(p_display_name, display_name),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    bio = COALESCE(p_bio, bio),
    city = COALESCE(p_city, city),
    gender = COALESCE(p_gender, gender),
    handle = COALESCE(p_handle, handle),
    updated_at = now()
  WHERE user_id = auth.uid();

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;
END;
$$;

-- ============================================================
-- MIGRATION 4: app_config table + seed
-- ============================================================

CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage app_config"
  ON public.app_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can read app_config"
  ON public.app_config FOR SELECT
  USING (true);

-- Seed auth_policy flag
INSERT INTO public.app_config (key, value_json)
VALUES ('auth_policy', '{"require_phone_verification": false}'::jsonb)
ON CONFLICT (key) DO NOTHING;
