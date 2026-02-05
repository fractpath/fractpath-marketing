TICKET MKT-011 — Analytics + conversion tracking (privacy-aware)
Ticket ID

MKT-011

Title

Analytics + conversion tracking (privacy-aware, investor-friendly)

Objective

Add lightweight analytics and conversion tracking so you can answer:

How many people land on the homepage?

Which persona do they choose?

How many engage the calculator?

How many submit email to unlock results?

How many click “Sign up for beta”?

This must be done in a way that:

is simple to operate as a solo founder

doesn’t add significant engineering complexity

respects privacy expectations for a financial-adjacent product

Non-goals

No complex event pipeline

No session replay (too sensitive for this stage)

No marketing pixels (Meta/Google Ads) unless explicitly requested

No full BI dashboard

Preconditions

MKT-001 → MKT-010 complete

HubSpot lead capture works

Persona toggle works

Calculator gating works

Vercel deployment stable

Recommended Tooling (default)

Use Plausible or PostHog in lightweight mode.

Default recommendation: Plausible

Pros:

very easy setup

privacy-friendly positioning

minimal script footprint
Cons:

less product analytics depth than PostHog

If you already have PostHog experience, that’s fine too—ticket should be written to support either.

Implementation Requirements
A) Add analytics provider (script)

Add analytics script to the marketing site globally in layout.tsx or via Next.js Script component.

Requirements:

loads on all marketing pages

does not block rendering

respects DNT if supported by provider

B) Track key events (exact list)

Implement event tracking for these actions:

persona_selected

properties: { persona }

calculator_input_changed

only track on blur or throttled (avoid spamming)

properties: { persona } (no PII)

calculator_reveal_clicked

properties: { persona }

lead_email_submitted

properties: { persona }

DO NOT include email in analytics event properties

cta_signup_clicked

properties: { location: "nav" | "hero" | "calculator" | "footer", persona }

cta_contact_clicked

properties: { persona }

C) Avoid sensitive data in analytics

Explicitly forbid sending:

email

property value

dollar amounts

scenario JSON

Analytics is for funnel behavior only, not the scenario itself (HubSpot stores scenario details).

D) Add a lightweight privacy note

Add (or update) a “Privacy” line in the footer:

“We use privacy-friendly analytics to improve the site.”

link placeholder for privacy policy

No legal heavy lifting yet.

E) Verify event fire

Add a temporary dev-mode console log wrapper (removed before merge) or use provider’s live event view.

Acceptance Criteria (Definition of Done)

Analytics script loads on production

All 6 events fire reliably in production

Events include persona but no sensitive data

Clicking signup from nav logs correct location tag

Dark/light mode unaffected

No console errors

Vercel build succeeds

QA Checklist

 Persona toggles logs once per change

 Reveal click logs once per click

 Email submit logs once per submit (no email captured)

 Signup CTA logs correct location

 Contact CTA logs

 No performance degradation noticeable

Deliverables

Analytics provider integrated

Event tracking utilities (recommended to centralize)

Footer privacy line added/updated

Implementation Notes (recommended pattern)

Create a thin wrapper:

src/lib/analytics.ts

Functions:

track(eventName: string, props?: Record<string, any>)

Guard for server/client

Guard for missing provider (no crash)

Use that wrapper everywhere.
