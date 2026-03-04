

## Plan: Verity Full Build — Phased Implementation

This spec describes a complete application rebuild across 17 sections. The current codebase already implements ~60% of the functionality (auth, matchmaking, Agora video, moderation, Stripe, Drops, Sparks, chat, admin). The gaps are significant but well-defined. Given the scope, this must be broken into sequential phases — attempting everything at once will break the working codebase.

---

### Current State Assessment

**Already working:**
- Auth (email/password signup + login + email verification)
- Onboarding (3-step: excitement → magic link → verify)
- Lobby with Drops, RSVPs, matchmaking (server-side with atomic locking)
- 45-second live video calls via Agora
- Spark/Pass decision flow with server-side mutual resolution
- Post-call Voice Intro + chat unlock
- AI moderation (Gemini via Lovable AI, structured tool calling, thresholds)
- Stripe checkout + webhook + customer portal
- Guardian Net, safe exit, report flow
- Admin dashboard with analytics + pilot metrics
- Transparency page with live stats
- Privacy, About pages
- Feature flags system (Phase 4 toggles)
- Push notifications
- 11 test suites, 38 tests passing

**Guardrail violations to fix (CRITICAL):**
1. **Raw video track published** — `useAgoraCall.ts` publishes the raw camera track. Spec requires canvas-processed anonymized track pre-Spark.
2. **Cloud recording exists** — `start-cloud-recording` and `stop-cloud-recording` edge functions + `LiveCall.tsx` calls them. Spec says NO video storage ever.
3. **Chemistry Replay Vault references video** — `chemistry_replays.video_url`, `ReplayVault.tsx`, `ReplayCard.tsx` all reference video playback. Must be text-only.
4. **Privacy page** mentions "Chemistry Replay Vault clips" implying video storage.

**Missing pages/routes (from spec):**
- `/how-it-works` (standalone page, currently only an anchor section)
- `/safety` (dedicated safety promise page)
- `/terms` (terms of service)
- `/faq` (with FAQPage JSON-LD)
- `/drops` (public schedule, SEO-indexable)
- `/drops/:city/:theme/:datetime` (individual event pages with Event schema)
- `/pricing` (standalone pricing page)
- `/login` and `/signup` (currently unified at `/auth`)
- `/app/*` prefix for authenticated routes (spec wants this; current uses flat routes)
- `/app/green-room` (camera/mic/network check before lobby)
- `/app/verify` (currently part of onboarding)
- `/app/vault` (text-only vault page)
- `/app/settings` (data deletion, account management)

**Missing DB tables (from spec):**
- `verification` (separate from `user_trust`)
- `drop_sessions` (per-pair session record, currently `calls` covers this)
- `spark_reflections` (text insights post-call)
- `chemistry_vault_items` (text-only vault entries)
- `subscriptions` (currently using `profiles.subscription_tier`)
- `chat_threads` (currently messages link directly to sparks)

---

### Phased Implementation Plan

Given the size, I recommend implementing in 4 phases. Each phase ships working code.

#### Phase 1: Guardrail Fixes (MOST CRITICAL — do first)

These are non-negotiable security/privacy violations.

1. **Canvas-processed anonymous video track**
   - Modify `useAgoraCall.ts`: capture camera → draw to offscreen canvas with anonymization filter (pixelation/silhouette) → create `MediaStreamTrack` from canvas → publish that track instead of raw camera
   - On mutual Spark event: swap published track to raw camera track
   - This ensures the remote user never receives raw video pre-Spark

2. **Remove cloud recording**
   - Delete calls to `start-cloud-recording` and `stop-cloud-recording` from `LiveCall.tsx` (lines 175-200)
   - Remove or gate the edge functions behind a disabled feature flag
   - Remove `recording_url`, `recording_sid`, `recording_resource_id` references from UI code (DB columns can remain dormant)

3. **Chemistry Replay Vault → text-only**
   - Update `InnovationsSection.tsx` description: remove "8-second anonymised highlight reel" → "session notes, AI insights, and timestamps from your mutual Spark calls"
   - Update `ReplayVault.tsx` and `ReplayCard.tsx`: remove video playback, show text artifacts (timestamps, user notes, AI reflection text)
   - Update Privacy page: remove "clips" language

4. **Update `ai-moderate` edge function** — add missing threshold constants declaration (currently references `SAFE_THRESHOLD`, `WARN_THRESHOLD`, `AUTO_ACTION_THRESHOLD` but they may not be declared at the top of the file)

#### Phase 2: Public Marketing Pages + SEO

New standalone pages for SEO, all public (no auth required), no Agora/Stripe imports:

1. **`/how-it-works`** — full-page version of the 4-step flow with visual treatment
2. **`/safety`** — dedicated safety promise page (zero-tolerance, verification, moderation, no recordings, Guardian Net, appeal flow)
3. **`/terms`** — terms of service page
4. **`/faq`** — FAQ page with FAQPage JSON-LD schema, answering the 7 objections from the spec
5. **`/drops`** — public Drops schedule (read-only, no auth; shows upcoming events with RSVP CTA that goes to `/auth`)
6. **`/pricing`** — Verity Pass vs Free comparison, "Cancel anytime", Stripe-powered
7. **Update Navbar** — add links: How it works, Drops, Safety, Pricing + "RSVP for the next Drop" primary CTA
8. **Hero updates** — update headline per spec: "Anonymous 45-second video dates. Reveal only with mutual Spark." + trust chips above fold + "Watch 20s demo" CTA
9. **Next Drop strip** — show upcoming Drop time with countdown on landing page
10. **Trust/Safety section** on landing — "Built for safety — not virality." with bullets
11. **Footer** — add Terms, FAQ, Safety links
12. **SEO** — add Organization JSON-LD in footer, Event schema on drop pages, FAQPage schema, sitemap.xml

#### Phase 3: Route Restructuring + New App Pages

1. **Green Room (`/app/green-room`)** — camera preview, mic meter (via `AudioContext` analyser), network quality check, lighting tips, "Anonymous filter ON" indicator, Guardian Net onboarding option
2. **Settings page (`/app/settings`)** — account management, data deletion with re-auth, subscription management
3. **Auth split** — `/login` and `/signup` as separate routes (or keep unified with URL-driven mode toggle)
4. **Route prefix migration** — evaluate whether to add `/app/` prefix or keep current flat structure (this is a significant breaking change to URLs and would need redirects)

#### Phase 4: DB Schema Additions + Spark Reflection AI

1. **`spark_reflections` table** — post-session mini prompts ("How did that feel?", "What did you like?") + Gemini-generated reflection text
2. **`chemistry_vault_items` table** — text-only vault entries (title, highlights JSON, user notes, timestamps)
3. **Spark Reflection AI edge function** — takes user inputs + call metadata, calls Gemini for reflection text, stores in `spark_reflections`
4. **Vault page** — displays text-only vault items

---

### Technical Details

**Phase 1 — Canvas anonymization approach:**
```text
Camera Track → Canvas (requestAnimationFrame loop)
  → Apply filter (gaussian blur / pixelation / silhouette)
  → canvas.captureStream().getVideoTracks()[0]
  → Publish this processed track via Agora
  → On mutual_spark event: client.unpublish(processed) → client.publish(rawCamera)
```

This runs entirely client-side. The remote user's Agora SDK receives only the processed track. There is no CSS blur to bypass via DevTools.

**Phase 1 — Files to edit:**
- `src/hooks/useAgoraCall.ts` — canvas processing + track swap logic
- `src/pages/LiveCall.tsx` — remove cloud recording calls (lines 175-200)
- `src/components/landing/InnovationsSection.tsx` — update Vault description
- `src/components/vault/ReplayVault.tsx` — text-only display
- `src/components/vault/ReplayCard.tsx` — text-only display
- `src/pages/Privacy.tsx` — remove video clip references

**Phase 2 — Files to create:**
- `src/pages/HowItWorks.tsx`
- `src/pages/Safety.tsx`
- `src/pages/Terms.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/Drops.tsx` (public schedule)
- `src/pages/Pricing.tsx`
- `public/sitemap.xml`

**Phase 2 — Files to edit:**
- `src/App.tsx` — add new routes
- `src/components/landing/Navbar.tsx` — new nav links + primary CTA
- `src/components/landing/HeroSection.tsx` — updated headline, trust chips, demo CTA
- `src/components/landing/Footer.tsx` — new links
- `index.html` — Organization JSON-LD

**No DB migrations needed for Phases 1-2.** Phase 4 requires new tables.

---

### Recommendation

Start with **Phase 1** (guardrail fixes) as it addresses the most critical security and privacy violations. This is the smallest phase (~6 files) but the most important. Phase 2 (marketing pages) can follow immediately after. Phases 3-4 are lower priority and can be deferred until after the guardrails and marketing pages are solid.

Shall I proceed with Phase 1 first?

