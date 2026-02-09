**Status: REDEFINED (Sprint 0) → Lead + Draft Token + Share Orchestration**
**Depends on:** docs/architecture/integration-contract.md (v1.0)
**Supports:** MKT-004 Save & Continue + Share flows

---

# TICKET MKT-006 — Lead Capture + Draft Token Orchestration + Share Email

## Ticket ID
MKT-006

## Title
Lead capture endpoints (/api/lead, /api/share) + HubSpot upsert (non-blocking) + draft-token minting

---

## Notes / Scope Split

This ticket defines **marketing backend orchestration** only. The widget is canonical for computation.

- **Widget (fractpath-calculator-widget) owns:**
  - Producing `DraftSnapshot` via `onDraft(draftSnapshot)`
  - Producing `ShareSummary` via `onShare(shareSummary)`
  - No network calls and no persistence

- **Marketing (fractpath-marketing) owns:**
  - `/api/lead` endpoint: email capture + handoff to app-owned draft token
  - `/api/share` endpoint: marketing-share email + magic link token
  - Optional HubSpot upsert (server-side only) as a *best-effort* side effect
  - Env vars / secret management
  - Rate limiting and safe error handling

**Source of truth:** Marketing must not contain calculator math. Widget is canonical.  
See `docs/architecture/integration-contract.md` and `docs/migration/calculator-widget.md`.

---

## Objective

Implement secure server-side endpoints to:
1) Accept prospect “Save & Continue” submissions and return an opaque `resume_token` for app handoff.
2) Support marketing share: email a branded proto-deal summary + magic link to a preconfigured marketing view.
3) Optionally upsert HubSpot contact properties for CRM tracking, without blocking the user funnel.

This ticket powers the Sprint 5 bridge: marketing → app resume → saved deal.

---

## Non-goals

- No calculator math or chart logic in marketing.
- No “reveal results” gating UX in marketing (handled by MKT-004 UI and widget behavior).
- No real deal creation in marketing (draft tokens only).
- No auth changes in app (handled in APP-INT-001).
- No email marketing sequences (HubSpot workflows configured in HubSpot).
- No PII beyond email.

---

## Preconditions

- Marketing page (MKT-004) can supply:
  - `email`
  - `persona`
  - latest `draftSnapshot` from widget `onDraft`
  - `shareSummary` from widget `onShare` (for share)
- App provides a server endpoint to mint draft tokens (to be implemented in APP-INT-001 or as a stub for Sprint 0):
  - `POST https://app.fractpath.com/api/drafts`
  - returns `{ resume_token }`

---

## Data Shapes (must align to integration-contract.md)

### DraftSnapshot (proto-deal)
- persona
- minimal inputs
- basic outputs
- no IDs
- safe to serialize

### LeadSubmission
```ts
{
  email: string;
  persona: "homeowner" | "buyer" | "realtor";
  source: "marketing_calculator";
  draftSnapshot: DraftSnapshot;
}
