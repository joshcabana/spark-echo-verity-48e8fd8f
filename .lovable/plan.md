

## Phase 5: Granular Drop Scheduling, Real-time Enhancements, Data Export/Deletion, Polish

### Overview

Four workstreams: (1) Admin drop CRUD, (2) real-time UX improvements for Lobby and Chat, (3) functional data export and account deletion, (4) end-to-end polish and error states.

---

### 1. Admin Drop Scheduling (CRUD)

Add a "Drops" section to the Admin page for creating/editing/deleting Drops.

**Add to `src/pages/Admin.tsx`:**
- New `AdminSection` value: `"drops"`
- New nav item with Calendar icon
- Drop management UI:
  - "Create Drop" form: title, description, room (select from `rooms` table), scheduled_at (datetime picker), duration_minutes, max_capacity, region (AU/NZ/US/UK), timezone, is_friendfluence toggle
  - Table listing all drops (not just upcoming) with edit/delete actions
  - Edit modal pre-populated with drop data
  - Delete with confirmation dialog
- All operations use direct Supabase client (admin RLS policies already allow full CRUD)

**No DB changes needed** — `drops` table already has all columns and admin RLS.

---

### 2. Real-time Enhancements

**2a. Typing indicators in Chat (`src/pages/Chat.tsx`)**
- Use Supabase Realtime Broadcast (not DB) for ephemeral typing events
- On composer input, broadcast `{ event: "typing", payload: { user_id } }` to channel `typing-{sparkId}`
- Listen for partner typing broadcasts; show `TypingIndicator` component (already exists) when partner is typing
- Auto-hide after 3 seconds of no typing events

**2b. Live participant count in Lobby (`src/pages/Lobby.tsx`)**
- Already has realtime subscription for `drops` and `drop_rsvps` tables — this is working
- Add live count of users currently in matchmaking queue per drop: query `matchmaking_queue` where `status = 'waiting'` and `drop_id = X`
- Display "X people waiting" badge on live drops in `DropCard`

**2c. Update `src/components/lobby/DropCard.tsx`:**
- Accept optional `waitingCount` prop
- Show "X people waiting" indicator on live drops

---

### 3. Data Export & Account Deletion

**3a. Data export edge function**

**Create `supabase/functions/export-my-data/index.ts`:**
- Authenticated endpoint
- Queries all user-owned data: profile, user_trust, sparks, messages, spark_reflections, chemistry_vault_items, reports, appeals, token_transactions
- Returns JSON blob with all data
- No PII of other users (partner names redacted to "Spark partner")

**3b. Account deletion RPC**

**DB migration — create `delete_my_account` function:**
```sql
CREATE OR REPLACE FUNCTION public.delete_my_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete user-owned data
  DELETE FROM chemistry_vault_items WHERE user_id = auth.uid();
  DELETE FROM spark_reflections WHERE user_id = auth.uid();
  DELETE FROM messages WHERE sender_id = auth.uid();
  DELETE FROM drop_rsvps WHERE user_id = auth.uid();
  DELETE FROM push_subscriptions WHERE user_id = auth.uid();
  DELETE FROM user_blocks WHERE blocker_id = auth.uid();
  DELETE FROM token_transactions WHERE user_id = auth.uid();
  DELETE FROM user_payment_info WHERE user_id = auth.uid();
  DELETE FROM user_trust WHERE user_id = auth.uid();
  DELETE FROM user_roles WHERE user_id = auth.uid();
  DELETE FROM profiles WHERE user_id = auth.uid();
  -- Note: auth.users deletion requires admin API — mark profile as deleted
END;
$$;
```

Note: Full auth user deletion requires the service role. The RPC will clean up all public schema data. We'll also create a small edge function to handle the auth.users deletion.

**Create `supabase/functions/delete-account/index.ts`:**
- Authenticated endpoint
- Calls `delete_my_account()` RPC via service role client
- Then deletes the auth user via `adminClient.auth.admin.deleteUser(userId)`
- Returns success

**3c. Update `src/pages/Settings.tsx`:**
- Wire "Download my data" to call `export-my-data` edge function and trigger browser download of JSON file
- Wire "Delete my account" to call `delete-account` edge function, then sign out and redirect to `/`

---

### 4. End-to-End Polish

**4a. Error states and loading states:**
- Add error boundaries / error UI to Lobby, SparkHistory, Chat for failed queries
- Add skeleton loaders to DropCard list and SparkCard list while loading

**4b. Mobile responsiveness check:**
- Ensure GreenRoom camera preview scales on small screens
- Verify Admin drop management works on mobile (scrollable table)

---

### Files to create (3)
- `supabase/functions/export-my-data/index.ts`
- `supabase/functions/delete-account/index.ts`

### Files to edit (5)
- `src/pages/Admin.tsx` — add Drops management section
- `src/pages/Chat.tsx` — typing indicator via Realtime Broadcast
- `src/pages/Lobby.tsx` — matchmaking queue waiting counts
- `src/components/lobby/DropCard.tsx` — waiting count display
- `src/pages/Settings.tsx` — wire data export and account deletion

### DB migration (1)
- Create `delete_my_account()` RPC function
- Add DELETE policies to `token_transactions` and `user_trust` tables (currently missing DELETE permissions)

### Config
- Add `export-my-data` and `delete-account` to `supabase/config.toml` with `verify_jwt = false`

