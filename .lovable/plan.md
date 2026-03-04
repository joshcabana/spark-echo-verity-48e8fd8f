

## Phase 4: Spark Reflections DB, Chemistry Vault Items DB, Spark Reflection AI Edge Function, Text-Only Vault

### 1. Database Migrations

**Table: `spark_reflections`**
- `id` uuid PK default `gen_random_uuid()`
- `call_id` uuid NOT NULL (references calls)
- `user_id` uuid NOT NULL (the user who submitted the reflection)
- `feeling_score` integer (1-5, "How did that feel?")
- `liked_text` text ("What did you like?")
- `next_time_text` text ("What would you try next time?")
- `ai_reflection` text (Gemini-generated reflection)
- `created_at` timestamptz default now()
- UNIQUE(call_id, user_id)
- RLS: user can insert/select/update own only

**Table: `chemistry_vault_items`**
- `id` uuid PK default `gen_random_uuid()`
- `call_id` uuid NOT NULL
- `user_id` uuid NOT NULL
- `partner_user_id` uuid NOT NULL
- `title` text
- `highlights` jsonb default '[]'
- `user_notes` text
- `reflection_id` uuid (references spark_reflections)
- `created_at` timestamptz default now()
- `updated_at` timestamptz default now()
- UNIQUE(call_id, user_id)
- RLS: user can CRUD own only

### 2. Edge Function: `spark-reflection-ai`

New edge function that:
1. Accepts `{ call_id, feeling_score, liked_text, next_time_text }` from authenticated user
2. Verifies user is a participant in the call
3. Calls Lovable AI (gemini-2.5-flash) with a system prompt to generate a short reflection: strengths, one improvement, suggested theme
4. Inserts into `spark_reflections` table
5. Auto-creates a `chemistry_vault_items` entry for this call+user
6. Returns the AI reflection text

### 3. Update `SparkReflection.tsx`

Currently shows hardcoded insights. Upgrade to:
- Show post-session mini prompts: feeling score (1-5 stars), "What did you like?" textarea, "What would you try next time?" textarea
- On submit: call `spark-reflection-ai` edge function
- Display AI-generated reflection when returned
- Keep "Continue" button behavior unchanged

### 4. Update Vault Components

**`ReplayVault.tsx`**: Switch from querying `chemistry_replays` to querying `chemistry_vault_items` joined with `spark_reflections`. Display text-only vault entries with partner names.

**`ReplayCard.tsx`**: Show vault item title, AI reflection preview, user notes, and timestamps. No video references.

### 5. Route + Config

- Add `verify_jwt = false` for `spark-reflection-ai` in `supabase/config.toml`
- No new routes needed (vault is already a tab in SparkHistory)

### Files

**Create:**
- `supabase/functions/spark-reflection-ai/index.ts`

**Edit:**
- `src/components/call/SparkReflection.tsx` — interactive prompts + AI call
- `src/components/vault/ReplayVault.tsx` — query `chemistry_vault_items`
- `src/components/vault/ReplayCard.tsx` — display vault item data
- `supabase/config.toml` — add function entry

**DB Migration:**
- Create `spark_reflections` and `chemistry_vault_items` tables with RLS

