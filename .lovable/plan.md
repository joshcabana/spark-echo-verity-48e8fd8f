

## Phase 3: Green Room, Settings Page, Route Prefix Evaluation

### Route Prefix Decision: Keep Flat Routes

Migrating to `/app/*` prefix would break existing links, bookmarks, the route test file, BottomNav paths, Lobby/LiveCall navigate calls, push notification URLs, and realtime callback URLs throughout the codebase. The benefit is purely cosmetic. **Decision: keep flat routes.** Add the two new pages at `/green-room` and `/settings`.

---

### 1. Green Room Page (`/green-room`)

Pre-call hardware check page. User navigates here before entering the Lobby (or as a pre-flight before joining a Drop).

**Create `src/pages/GreenRoom.tsx`:**
- Camera preview using `getUserMedia` (no Agora import — just native browser API)
- Mic level meter via `AudioContext` + `AnalyserNode` (real-time volume bar)
- Network quality indicator (simple `navigator.connection` check + fetch latency test to Supabase)
- Lighting tips text ("Find good lighting, face a window")
- "Anonymous filter ON (required pre-Spark)" indicator badge
- "You can leave anytime" reassurance copy
- "Enter Lobby" CTA button → navigates to `/lobby`
- Optional: Guardian Net quick-add (link to `/drops/friendfluence`)
- Uses Helmet for SEO title
- BottomNav at bottom
- Clean up `getUserMedia` stream on unmount

**Route:** Protected (requires auth but not requireTrust — users should be able to test hardware before completing verification).

### 2. Settings Page (`/settings`)

Account management, data deletion, subscription management.

**Create `src/pages/Settings.tsx`:**
- Header: "Settings"
- Sections:
  - **Account**: Email display, link to Profile for name/avatar editing
  - **Subscription**: Current tier display + "Manage subscription" button (reuse customer-portal invoke from Profile.tsx)
  - **Privacy & Data**: 
    - "Download my data" button (shows toast "Coming soon" for now)
    - "Delete my account" button with confirmation dialog (re-auth via password prompt, then calls `supabase.rpc('delete_my_account')` — we'll need to note this RPC doesn't exist yet, so show a toast explaining the request has been submitted)
  - **Legal**: Links to Privacy, Terms, Safety pages
  - **App**: Sign out button
- BottomNav with "profile" active tab
- Helmet SEO

**Route:** Protected (auth required, no requireTrust).

### 3. Route + Nav Updates

**`src/App.tsx`:**
- Add lazy imports for GreenRoom and Settings
- Add routes: `/green-room` (ProtectedRoute) and `/settings` (ProtectedRoute)

**`src/components/BottomNav.tsx`:**
- Change "Profile" tab path from `/profile` to `/settings` (settings is the standard destination; profile is accessible from within settings)
- Keep other tabs unchanged

**`src/pages/Lobby.tsx`:**
- Add a "Green Room" banner/link at the top for first-time users or as a persistent "Check your setup" link before joining a Drop

---

### Files to create (2)
- `src/pages/GreenRoom.tsx`
- `src/pages/Settings.tsx`

### Files to edit (3)
- `src/App.tsx` — 2 new lazy imports + 2 new routes
- `src/components/BottomNav.tsx` — update Profile tab to `/settings`
- `src/pages/Lobby.tsx` — add Green Room link in header area

### No DB migrations needed.
No new edge functions needed. The "delete account" action will show a confirmation toast directing user to contact support until a proper RPC is built in a later phase.

