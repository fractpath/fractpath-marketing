**Status: REDEFINED (Sprint 0) → Prospect-mode embed + Save/Share handoff**
**Depends on:** docs/architecture/integration-contract.md (v1.0)

---

# TICKET MKT-004 — Marketing Calculator Embed (Prospect Mode) + Save/Share CTAs

## Ticket ID
MKT-004

## Title
Marketing calculator embed (persona tabs + basic results) with Save & Continue + Share

---

## Notes / Scope Split

This ticket defines the **marketing-side** experience only. The calculator widget is canonical.

- **Widget (fractpath-calculator-widget) owns:**
  - Persona-specific input/output rendering in `mode="marketing"`
  - All calculator math and chart logic
  - Emitting `onDraft(draftSnapshot)` as the user edits inputs
  - Emitting `onShare(shareSummary)` for marketing share
  - Emitting `onEvent(name,payload)` telemetry hooks
  - **No network calls** and **no persistence**

- **Marketing (fractpath-marketing) retains:**
  - Persona tabs UI above the widget (controls `persona` prop)
  - Page wrapper layout and section scaffolding
  - Primary CTA: **Save & Continue** (email gate + draft token handoff to app)
  - Secondary CTA: **Share** (email input + send summary + magic link)
  - Query param parsing for marketing share links (read-only render)
  - Header/Nav updates

**Source of truth:** Marketing must not contain calculator math or chart logic. Widget is canonical.  
See: `docs/architecture/integration-contract.md` and `docs/migration/calculator-widget.md`.

---

## Objective

Implement the marketing “prospect mode” calculator page experience:
1) Prospect self-identifies persona using tabs above the widget.
2) Widget shows **basic calculated outputs immediately** (no email required).
3) Prospect can:
   - **Save & Continue** (primary): capture email, create **draft token**, redirect to app `/resume?token=...`
   - **Share** (secondary): capture recipient email and send a **branded proto-deal summary** + magic link to a preconfigured marketing view.

This ticket makes the marketing site feel like a real demo while intentionally reserving “comprehensive deal features” for the authenticated app.

---

## Non-goals

- No calculator math implemented in marketing (ever).
- No chart logic implemented in marketing.
- No real deal creation in marketing (draft token only).
- No app auth changes.
- No negotiation, versioning UI, or “deal workspace” features on marketing.
- No HubSpot wiring if not already specified (belongs to MKT-006); MKT-004 only triggers the flow and uses MKT-006 endpoints.

---

## Preconditions

- Persona toggle system exists or is implemented here as simple tabs:
  - Homeowner / Buyer / Realtor
- Widget dependency method is established for tight integration (workspace/git SHA/package).
- Marketing can render the widget as a client component (`"use client"`).

---

## Implementation Requirements

### A) Header update (still required)
Update TopNav:
- Left: FractPath logo
  - light: `fractpath-logo-black.svg`
  - dark: `fractpath-logo-white.svg`
- Right: “Sign up for beta” → `https://app.fractpath.com/signup`
- Nav links:
  - How it works → `#how-it-works`
  - FAQ → `#faq`
  - Realtor beta → `#realtor-beta`
- Accessibility: alt text, keyboard accessible links/buttons

---

### B) Marketing calculator route + section wrapper
Create a dedicated route for the calculator experience (preferred):
- `/calculator`

Page must render:
- Persona tabs above the widget (marketing-owned)
- Widget embedded below tabs:
  - `<FractPathCalculatorWidget mode="marketing" persona={selectedPersona} ... />`
- CTAs:
  - Primary: **Save & Continue**
  - Secondary: **Share**

Mobile: tabs + widget + CTAs stack cleanly.

---

### C) Persona tabs (marketing-owned)
Persona tabs are rendered above the widget and drive the widget prop:
- Homeowner
- Buyer
- Realtor

Rules:
- Persona selection must not reset user-entered values unless explicitly intended.
- Selected persona must be reflected in the draft snapshot emitted by widget.

---

### D) Basic results visible pre-email (no blur gate)
In marketing prospect mode:
- Widget should display **basic results immediately**
- Marketing must not implement any gating/blur behavior itself.

**Gate happens on Save & Continue only**, not on viewing basic results.

---

### E) Save & Continue (primary CTA → email gate → draft token)
When user clicks **Save & Continue**:
1) Show inline email input (no modal).
2) Minimal email validation (contains “@”).
3) POST to marketing endpoint (implemented in MKT-006):
   - `/api/lead` with:
     - `email`
     - `persona`
     - `draftSnapshot` (latest emitted from widget `onDraft`)
4) `/api/lead` returns:
   - `resume_token` (opaque)
5) Redirect to app:
   - `https://app.fractpath.com/resume?token=${resume_token}`

Requirements:
- Must not lose user input state.
- Must work without JS errors.
- Must not put raw draft contents in query params (token only).

---

### F) Share (secondary CTA → send branded proto-deal summary)
When user clicks **Share**:
1) Show inline “send to email” input.
2) POST to marketing share endpoint (either part of MKT-006 or separate ticket if needed):
   - `/api/share` with:
     - `to_email`
     - `persona`
     - `draftSnapshot`
     - `shareSummary` (emitted by widget via `onShare`)
3) Email content:
   - branded, email-friendly
   - includes key inputs/outputs only
   - includes a **magic link** to marketing view:
     - `/calculator?share=${share_token}` (opaque token)
4) The share link renders the widget in **read-only** mode:
   - no editing OR very limited editing (decide in contract; default: read-only)

Note: marketing share is awareness distribution, not a real deal share.

---

### G) Analytics hooks (marketing-owned logging)
Marketing should log:
- persona changes
- Save & Continue submit
- Share submit
- widget `onEvent` callbacks (if provided)

If analytics provider isn’t ready, logging can be console-only but must be structured to replace later.

---

## Acceptance Criteria (Definition of Done)

- Header matches requirement (logo left, beta CTA right, anchors exist).
- `/calculator` route renders:
  - persona tabs above embedded widget
  - basic results visible immediately
- Save & Continue flow:
  - inline email capture
  - calls `/api/lead`
  - redirects to `app.fractpath.com/resume?token=...`
- Share flow:
  - inline email capture
  - calls `/api/share`
  - sends email summary with magic link (may be stubbed but endpoint exists and returns ok)
- Marketing contains **no calculator math** or chart logic.
- Mobile layout works (no overflow, CTA usable).
- `npm run build` passes.

---

## QA Checklist

- Dark mode readable; accents not used for body text.
- Keyboard tab flow works through tabs + CTAs + inputs.
- Email validation friendly.
- No regulated language (no guaranteed returns).
- No query strings containing raw deal data.

---

## Deliverables

- Updated TopNav
- `/calculator` page with persona tabs + widget embed + CTAs
- Minimal client-side state wiring to retain latest `draftSnapshot`
- Integration with `/api/lead` and `/api/share` (endpoints defined in MKT-006, but wired here)
