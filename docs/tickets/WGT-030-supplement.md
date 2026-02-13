# WGT-030 Supplement — Marketing Implementation Notes

Last Updated: 2026-02-13

## Purpose

This document records implementation decisions, gaps, and clarifications for items referenced by WGT-030 (Widget UI surface + mode behavior) and WGT-031 (Widget gating semantics) that were not fully specified in the original tickets.

---

## Persona-Specific Inputs

**Decision**: The widget (not marketing) owns all persona-specific input rendering, labels, and conditional visibility. Marketing only sets the `persona` prop on `FractPathCalculatorWidget`.

Per MKT-INT-001:
> "Marketing must NOT introduce persona logic beyond setting widget props."

Marketing does not conditionally show/hide calculator inputs. If persona-specific input behavior is needed, it must be implemented in the widget package.

---

## Persona-Specific Value Props (Marketing-Owned)

Marketing owns persona-specific page content (hero copy, value propositions, trust bullets) via `src/content/personas.ts`. This content system is independent of the widget and changes when the user selects a persona tab.

Content is sourced from MKT-003 persona content system requirements.

---

## Share Flow — Marketing Share vs. App Share

Per MKT-INT-001 and MKT-004:

- Marketing share (`/api/share`) is **illustrative only** and **not connected** to the app's deal sharing system.
- Marketing generates an opaque `share_token` (random UUID) and sends a branded email with a magic link to `/calculator?share=<token>`.
- Marketing does NOT mint app share tokens, modify access grants, or create deal threads.
- The `shareSummary` payload is forwarded opaque (not inspected or mutated).

---

## Events Tracked (Final List)

Per MKT-011 and WGT-031:

| Event Name | Source | Properties |
|---|---|---|
| `persona_selected` | Marketing | `{ persona }` |
| `lead_email_submitted` | Marketing | `{ persona }` |
| `cta_signup_clicked` | Marketing | `{ location, persona? }` |
| `cta_contact_clicked` | Marketing | `{ location }` |
| `calculator_used` | Widget (via onEvent) | `{ persona }` |
| `share_clicked` | Widget (via onEvent) + Marketing | `{ persona }` |
| `save_continue_clicked` | Widget (via onEvent) | `{ persona }` |
| `save_clicked` | Widget (via onEvent) | `{ persona }` |

**Note**: `calculator_input_changed` and `calculator_reveal_clicked` from MKT-011 are not emitted by the current widget version. These would need to be added to the widget's WidgetEvent union type if required.

---

## API Contracts (Implemented)

### POST /api/lead
- Request: `{ email: string, persona: "homeowner"|"buyer"|"realtor", draftSnapshot: object }`
- Response (200): `{ resume_token: string }`
- Error responses: `{ error: string }` with appropriate HTTP status

### POST /api/share
- Request: `{ to_email: string, shareSummary: object }`
- Response (200): `{ share_token: string }`
- Error responses: `{ error: string }` with appropriate HTTP status

---

## Known Gaps / Future Work

1. **`calculator_input_changed` event**: Not currently emitted by widget. Would need widget-side implementation if required for analytics.
2. **`calculator_reveal_clicked` event**: Not applicable — marketing mode shows outputs immediately (no blur gate per MKT-004).
3. **Server-to-server draft token minting**: Currently `/api/lead` generates a local UUID as `resume_token`. Per MKT-006, this should eventually call the app's draft token mint endpoint. Requires `FRACTPATH_APP_URL` and a shared secret to be configured.
4. **Share token persistence**: Currently `share_token` is generated but not persisted. If the marketing read-only share landing page is built (`/calculator?share=<token>`), the token would need server-side storage to reconstruct the shared scenario.
5. **Persona query param**: MKT-003 mentions optional `?persona=buyer` support for ad links. Not yet implemented.
