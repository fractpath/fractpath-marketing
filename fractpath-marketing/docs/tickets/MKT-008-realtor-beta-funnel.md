TICKET MKT-008 — Realtor beta funnel + referral narrative
Ticket ID

MKT-008

Title

Realtor beta funnel + referral economics narrative

Objective

Create a clear, credible, low-friction Realtor Beta funnel that:

Explains why FractPath is valuable to realtors

Shows how referrals and commissions work (without overpromising)

Captures realtor-specific leads distinctly in HubSpot

Positions FractPath as a co-pilot, not a competitor or broker

This ticket is about story + conversion, not new backend logic.

Non-goals

No licensing advice

No commission automation

No payments to realtors

No MLS integration

No portal dashboard (post-MVP)

Preconditions

MKT-001 → MKT-007 complete

Persona toggle works (realtor persona exists)

Calculator logic produces outputs (even if simplified)

HubSpot API lead capture implemented

Brand assets and design system in place

Implementation Requirements
A) Dedicated Realtor Beta section (homepage)

Enhance the existing #realtor-beta section so it is purpose-built, not generic.

Required structure:

Section header

Title: Realtor-focused, opportunity-oriented

Subtitle: Reinforces “no disruption to your workflow”

Value proposition (3 cards)
Focus on:

Unlocking stalled deals

Creating new commission streams

Staying involved post-close

How referrals work (simple steps)
3–4 steps max:

Introduce buyer/seller

Scenario modeling + terms

Contract executed through FractPath

Commission paid per agreed schedule

Tone:

Practical

Familiar to real estate professionals

No fintech jargon

B) Realtor-specific calculator framing

When Realtor persona is active:

Calculator title and description should shift to:

“Model referral outcomes”

“See how FractPath creates commission opportunities”

Required output emphasis:

Flat referral fee (if entered)

Ongoing participation (if modeled)

Scenario-based total commission estimate

⚠️ Important:

Clearly label outputs as illustrative

Avoid language that implies guaranteed commissions

C) Realtor beta CTA + funnel behavior

Add a distinct Realtor CTA, separate from Buyer/Homeowner flow.

Primary Realtor CTA:

Button label:
“Join Realtor Beta”

Behavior:

Scrolls to calculator (if not already there)

Sets persona = realtor (if not already)

Optionally highlights realtor-specific inputs

Secondary CTA:

Button label:
“Talk to FractPath” or “Learn how referrals work”

Behavior:

Scroll to a short explainer subsection or FAQ anchor

D) Realtor lead capture enhancements (HubSpot)

Ensure Realtor leads are distinctly tagged.

On lead submission (email reveal or CTA flow):

fp_persona = realtor

Add one additional property (if not already created):

fp_realtor_beta_interest

Type: Boolean or Single-select

Values: true / false

Set to true when Realtor Beta CTA is used

Optional (nice to have):

fp_realtor_market (text)

fp_realtor_license_state (text)

(These can be free-text for MVP.)

E) Trust & compliance framing (realtor-specific)

Add a small Realtor-specific trust note in the Trust section or Realtor Beta section:

Key points to communicate:

FractPath is not replacing the agent

Realtors are referrers / co-pilots

Licensing rules vary by state

Beta participation is exploratory and non-exclusive

Tone:

Protective of the realtor

Clear that FractPath is not asking them to take legal risk

F) FAQ additions (realtor-focused)

Add 3–5 Realtor-specific FAQs under the existing FAQ section.

Examples:

“Does this replace a traditional sale?”

“Do I need to be licensed to participate?”

“How are commissions handled?”

“What happens at sale or refinance?”

“Is this compliant in my state?”

Answers should:

Be conservative

Emphasize FractPath handles structure + coordination

Defer specifics to beta onboarding where appropriate

Acceptance Criteria (Definition of Done)

Realtor Beta section feels intentional and compelling

Realtor persona produces differentiated calculator framing

Realtor CTA reliably sets persona + funnels correctly

Realtor leads are clearly tagged in HubSpot

Copy does not overpromise or create licensing risk

Mobile experience remains clean

No regressions to buyer/homeowner flows

QA Checklist

 Toggle to Realtor persona updates copy + outputs

 Realtor CTA works from both hero and section

 HubSpot contact shows realtor tags

 No “guaranteed commission” language

 Trust language is reassuring, not evasive

Deliverables

Enhanced #realtor-beta section

Realtor-specific copy + FAQs

Updated lead capture tagging

Minor calculator output emphasis for Realtor persona
