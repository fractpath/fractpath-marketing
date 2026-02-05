TICKET MKT-012 — Investor “read-only” share mode (no email gate)
Ticket ID

MKT-012

Title

Investor share mode (read-only, ungated, credibility-first)

Objective

Create an Investor Share Mode that allows you to send a link to investors/partners that:

looks polished and credible

demonstrates the calculator + visualization immediately

does not require email gating (to reduce friction)

does not create compliance risk or overpromise

still tracks engagement via Plausible events

This enables quick sharing in outreach messages and decks without “please enter your email” friction.

Non-goals

No investor persona (secondary market investors are post-MVP)

No new pricing page

No portal signup changes

No additional data providers / APIs

Preconditions

MKT-001 → MKT-011 complete

Calculator gating works in normal mode

Plausible is configured and events are firing (MKT-011)

Dark/light modes work

Implementation Requirements
A) Define investor share mode trigger (URL parameter)

Investor mode is activated when URL contains:

?mode=share

Examples:

https://fractpath.com/?mode=share

https://fractpath.com/?mode=share&persona=buyer

Rules:

If mode=share, disable email gating

Default persona remains homeowner unless persona param provided

B) Behavior changes in share mode (required)

When mode=share is active:

Calculator outputs are not blurred

Email gate UI is hidden entirely

Show a small inline badge above calculator:

“Share Mode” (subtle)

Add a short note below outputs:

“This is an illustrative scenario. Create a secure profile to save scenarios and adjust advanced parameters.”

CTA after outputs:

Primary: “Create secure profile” → https://app.fractpath.com/signup?persona={persona}

Secondary: “Back to standard mode” → link to / (no query params)

C) HubSpot submission rules in share mode

In share mode:

Do not submit anything to HubSpot

Do not ask for email

You may still provide an optional “Get updates” link in footer or contact section, but it should not interrupt the calculator experience.

D) Tracking (Plausible)

Add one additional analytics event:

share_mode_viewed

properties: { persona }

Ensure existing events still fire:

persona_selected

calculator_reveal_clicked should NOT fire because there is no reveal

use a new event instead for engagement:

calculator_used on first input interaction

E) UI polish for share mode (investor-presentable)

In share mode:

ensure the default values are loaded and chart is visible immediately

ensure the narrative on the page is calm and confident

ensure the disclaimers are visible without being heavy

Acceptance Criteria (Definition of Done)

Visiting /?mode=share shows calculator outputs immediately (no gate)

No HubSpot lead submission occurs in share mode

Badge and share-mode note appear

CTA to signup is present and includes persona query param

Plausible event share_mode_viewed fires with persona

Standard mode remains unchanged

Vercel build succeeds and no console errors

QA Checklist

 /?mode=share works on mobile

 /?mode=share&persona=realtor sets realtor persona

 No email input appears in share mode

 Analytics events fire as expected

 No compliance language regressions

Deliverables

URL-param controlled share mode

Updated calculator gating logic to support bypass

Share-mode UI elements

Analytics event for share-mode view
