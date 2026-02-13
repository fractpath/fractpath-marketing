# TICKET MKT-004 — Marketing Calculator Embed (Prospect Mode) + Save/Share CTAs
Ticket ID: MKT-004  
Status: REDEFINED (Sprint 0) → Prospect-mode embed + Save/Share handoff  
Depends on: docs/architecture/integration-contract.md (v1.0)  
Last Updated: 2026-02-11  

---

# Architecture Alignment (Authoritative)

This ticket governs the **marketing-side embed only**.

All economic computation, schedule generation, and chart logic are owned by:

- `fractpath-calculator-widget` (canonical compute engine)
- Server-side compute in `fractpath-app` (Sprint 9+ snapshot persistence)

Marketing must never:
- implement calculator math
- compute settlement logic
- persist real deals
- mint app share tokens
- modify role logic

Marketing operates in **Prospect Mode**, not Deal Mode.

---

# Objective

Implement the marketing “Prospect Mode” calculator page that:

1. Lets a visitor self-identify persona via tabs.
2. Shows basic calculated outputs immediately (no email gate).
3. Provides two CTAs:
   - **Save & Continue** → create draft token → redirect to app.
   - **Share** → send branded illustrative summary (marketing-only share).

This creates a high-credibility demo experience without creating real deal state.

---

# Frozen Boundaries

## Widget Owns
- All compute logic (`computeScenario`)
- All chart series generation
- Emitting:
  - `onDraft(draftSnapshot)`
  - `onShare(shareSummary)`
  - `onEvent(name,payload)`
- No network calls
- No persistence

## Marketing Owns
- Persona tabs above widget
- Page layout + wrapper
- Save & Continue flow
- Marketing Share flow
- Query param parsing
- Analytics wiring

---

# Clarified Share Model (Important)

Marketing share (`/calculator?share=...`) is:

- Awareness-only
- Illustrative
- Not connected to `app.fractpath.com/share?t=...`
- Not a real deal thread
- Not using deal_access_grants
- Not minting app share tokens

App share semantics remain:

- Only OWNER may mint
- Token reuse allowed
- Redemption grants VIEWER

Marketing share does not affect that system.

---

# Implementation Requirements

## A) Header Update

- Logo left (light/dark variants)
- “Sign up for beta” → `https://app.fractpath.com/signup`
- Nav anchors:
  - `#how-it-works`
  - `#faq`
  - `#realtor-beta`
- Fully accessible

---

## B) `/calculator` Route

Create dedicated route:

`/calculator`

Must render:

- Persona tabs (marketing-owned)
- `<FractPathCalculatorWidget mode="marketing" persona={selectedPersona} />`
- Primary CTA: Save & Continue
- Secondary CTA: Share

Mobile-first layout required.

---

## C) Persona Tabs

Tabs control widget `persona` prop:

- Homeowner
- Buyer
- Realtor

Rules:
- Persona change does not erase user inputs unintentionally.
- Persona reflected in draftSnapshot emitted from widget.

---

## D) Prospect Mode Output Rules

- Outputs visible immediately.
- No blur gate.
- No email gate for viewing.
- No persistence to database.
- No snapshot saving.

All results are illustrative only.

---

## E) Save & Continue Flow (Draft Token Handoff)

When user clicks **Save & Continue**:

1. Inline email capture.
2. POST to `/api/lead` (MKT-006) with:
   - `email`
   - `persona`
   - `draftSnapshot`
3. Endpoint returns:
   - `resume_token` (opaque)
4. Redirect:
