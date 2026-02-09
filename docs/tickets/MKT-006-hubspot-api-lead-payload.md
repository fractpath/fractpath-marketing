Replit Agent Prompt — fractpath-marketing
Batch MKT-B: Lead + Draft Token + Marketing Share (MKT-006)

Scope
- Implement marketing backend endpoints exactly as specified in ticket MKT-006.
- Follow the canonical interface and token lifecycle defined in docs/architecture/integration-contract.md.
- This batch supports MKT-004 Save & Continue and Share CTAs.

Hard constraints
- Do NOT implement calculator math or chart logic.
- Do NOT create real deals in marketing.
- Do NOT modify app auth or persistence logic.
- Draft tokens are minted by the app backend; marketing only orchestrates.
- HubSpot upsert must be non-blocking (best effort only).

In scope
- POST /api/lead
  - Validate email, persona, draftSnapshot.
  - Call app draft-token mint endpoint server-to-server.
  - Return { resume_token }.
  - Fire-and-forget HubSpot upsert if configured.
- POST /api/share
  - Validate recipient email and payload.
  - Generate opaque share_token.
  - Send branded proto-deal summary email with magic link.
- Env var wiring (names only, no secrets committed).
- Input validation, basic rate limiting, safe error handling.

Out of scope
- Calculator math, outputs, or chart rendering.
- Deal creation or versioning.
- Auth/session changes.
- Email marketing sequences.

Files expected to change
- src/app/api/lead/route.ts
- src/app/api/share/route.ts
- src/lib/hubspotProperties.ts
- .env.example (env var names only)

Verification
- Endpoints return expected shapes per MKT-006.
- HubSpot failure does not block resume_token or share_token.
- npm run build passes.

Commit
feat(marketing): lead capture, draft-token orchestration, and marketing share (MKT-006)

Stop after push.
