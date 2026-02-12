Replit Agent Prompt — fractpath-marketing
Batch MKT-B: Lead + Draft Token + Marketing Share (MKT-006)

You are my engineering agent working only in the `fractpath-marketing` repo (Next.js App Router on Vercel).

Goal
Implement the marketing backend endpoints exactly per MKT-006 to support MKT-004 CTAs:
- Save & Continue → `/api/lead` → returns `{ resume_token }`
- Share → `/api/share` → returns `{ share_token }` and sends a branded email

Absolute constraints
- DO NOT implement calculator math or chart logic.
- DO NOT create real deals in marketing.
- DO NOT modify app auth, app persistence, or any app database tables.
- Marketing must treat `DraftSnapshot` and `ShareSummary` as opaque contract payloads:
  - do not add/remove/rename fields
  - do not “normalize”
  - do not compute derived metrics
- Draft-token minting happens in the app backend (server-to-server). Marketing only orchestrates.
- HubSpot upsert must be best-effort only (never block the main response).

Architecture alignment requirements
- DraftSnapshot is transport-only; marketing forwards it untouched.
- App is the compute/persistence authority.
- Marketing share is illustrative only and must not connect to app deal sharing.

Scope (In)
1) POST `/api/lead`
   - Validate: `email`, `persona`, `draftSnapshot`.
   - Call the app “draft token mint” endpoint server-to-server with the same payload (draftSnapshot forwarded unchanged).
   - Return: `{ resume_token }` (opaque string) to the client.
   - Fire-and-forget HubSpot upsert (if configured) using non-blocking behavior.
   - Rate-limit by IP (lightweight in-memory acceptable).

2) POST `/api/share`
   - Validate: `to_email` and `shareSummary` (plus optional persona if your contract requires it).
   - Generate opaque `share_token` (random).
   - Send a branded “proto-deal summary” email that is clearly non-binding.
   - Email must include a magic link:
     - `https://fractpath.com/calculator?share=<share_token>`
   - Return: `{ share_token }`
   - (Optional) persist the share_token server-side ONLY if required by the marketing read-only share landing behavior; do not persist any calculator outputs as structured numbers.

3) Env wiring
   - Add env var names to `.env.example` only (no secrets committed).

4) Input validation + safe error handling
   - Return consistent JSON errors.
   - Never leak upstream error bodies or secrets.

Out of scope (Strict)
- Any calculator math or computed outputs.
- Any deal creation or deal versioning.
- Any auth/session changes.
- Any “marketing analytics derived metrics”.
- Any app DB changes.

Implementation details (Required)

A) Data contracts (do not invent fields)
- `/api/lead` request body:
  - `{ email: string, persona: "homeowner"|"buyer"|"realtor", draftSnapshot: object }`
- `/api/lead` response body (200):
  - `{ resume_token: string }`

- `/api/share` request body:
  - `{ to_email: string, shareSummary: object }`
- `/api/share` response body (200):
  - `{ share_token: string }`

B) Server-to-server call to app (lead flow)
- Use env vars for app base URL and shared secret.
- Use `fetch()` from the marketing API route to the app mint endpoint.
- Ensure timeout/abort so marketing does not hang.
- If HubSpot fails, still return resume_token.

C) Rate limiting
- Lightweight per-IP limiter in-memory is acceptable.
- Return 429 with `{ error: "rate_limited" }`.

D) Email sending (share flow)
- Use the existing SES setup in marketing (do not change architecture).
- Ensure FROM address is configured via env.
- Subject/body must explicitly state “Illustrative / Non-binding”.
- Do not include raw DraftSnapshot or sensitive payload fields in the email.
- Use ShareSummary display-safe fields only.

Files expected to change
- `src/app/api/lead/route.ts`
- `src/app/api/share/route.ts`
- `src/lib/hubspotProperties.ts`
- `.env.example`

Verification steps
- Local build: `npm run build` passes.
- `/api/lead`:
  - returns 200 + `{ resume_token }` when app mint endpoint succeeds
  - returns 400 on invalid email/persona
  - returns 502/500 with safe error if app mint fails (no secret leak)
  - HubSpot failure does not block success response
- `/api/share`:
  - returns 200 + `{ share_token }`
  - sends email with magic link
  - returns 400 on invalid email
  - returns 500 with safe error if email send fails

Commit
`feat(marketing): lead capture, draft-token orchestration, and marketing share (MKT-006)`

Stop after:
- committing
- pushing to origin

Provide:
- the git diff summary
- confirmation of build success
- the final deployed endpoint URLs (paths only, no secrets)

