TICKET MKT-007 — Investor-ready polish pass
Ticket ID

MKT-007

Title

Investor-ready polish pass (copy, visuals, trust, narrative coherence)

Objective

Bring the FractPath marketing homepage to a level that is safe to share with investors, partners, and early beta users.

This ticket focuses on:

tightening copy and hierarchy

improving visual balance and information density

making the calculator outputs and scenario framing feel intentional and professional

reinforcing trust, compliance posture, and novelty without hype

No new product features. No scope expansion.

Non-goals

No new calculator math

No new personas

No new integrations

No portal or auth work

No SEO optimization pass (that’s later)

Preconditions

MKT-001 → MKT-006 complete

Calculator logic and charts working

Persona toggle working

Email gate + HubSpot capture functional

Dark/light mode supported

Brand assets applied correctly

Implementation Requirements
A) Copy tightening pass (persona-aware, compliant)

Review and refine only wording, not structure, across:

Hero headline + subheadline

Value prop cards

Calculator helper text

Scenario output labels

Trust & compliance section

CTA microcopy

Copy rules (must follow)

Plain English

Confident, not salesy

No “guaranteed”, “returns”, “profits”

Use:

“scenario”

“illustrative”

“estimated”

“terms-based”

Reinforce optionality and control, not financial promises

Examples of allowed phrasing:

“Model how equity could shift over time”

“See how timing, floors, and caps affect outcomes”

“Compare early vs standard exit scenarios”

Examples to avoid:

“Earn X% returns”

“Beat the market”

“Guaranteed upside”

B) Visual hierarchy & spacing polish

Perform a visual polish pass using existing components only:

Increase vertical rhythm between sections

Reduce text density where possible

Ensure each section has:

clear entry point

one dominant idea

one primary CTA (if any)

Specific improvements expected:

Hero feels calm and confident (not crowded)

Calculator card feels like a product, not a form dump

Scenario cards feel scannable

Chart labels are readable in both light/dark mode

No redesign — this is refinement.

C) Calculator output clarity (storytelling polish)

Improve how results are explained, not the math.

Required enhancements:

Label when a floor or ceiling is active:

e.g., “Payout capped at 3× capital”

e.g., “Floor applied to protect minimum outcome”

Explicitly label Early / Standard / Late scenarios

Add a short explanatory line below outputs:

“Timing factors adjust payout to account for early liquidity or extended holding periods.”

Add a teaser line below outputs (as agreed):

“Advanced parameters like floors, caps, and timing can be adjusted inside the secure app.”

D) Trust & compliance section upgrade

Refine the Trust section to clearly communicate:

FractPath is a platform, not a lender

Scenarios are illustrative

Contracts are executed later, in a secure environment

Title, appraisal, and legal partners are involved post-signup

Required elements:

3–5 short bullet points

Friendly, non-defensive tone

No legalese wall of text

E) Investor & partner signal pass

Add subtle credibility signals, without logos you don’t have yet:

Examples:

“Built with modern, auditable financial infrastructure”

“Designed to integrate with licensed title and appraisal partners”

“Initial pilots launching in Maryland”

These should be phrased as intent and design posture, not claims.

F) Mobile & presentation readiness

Ensure:

Mobile calculator experience is not overwhelming

Scenario cards stack cleanly

Chart is readable on smaller screens

Page looks presentable when screenshared on Zoom

This is critical for investor conversations.

Acceptance Criteria (Definition of Done)

Page feels credible to show:

investors

title partners

early realtors

Copy is consistent, calm, and compliant

Calculator outputs clearly explain:

equity

timing

floors & caps

No new functionality introduced

No regressions in dark/light mode

No console errors

Vercel build passes

QA Checklist

 Read page top-to-bottom as an investor — no confusion

 No exaggerated claims anywhere

 Scenario differences are obvious and intuitive

 CTAs are clear but not aggressive

 Mobile experience acceptable

 Accessibility contrast still meets WCAG AA (especially cyan accents)

Deliverables

Refined homepage copy

Improved spacing & hierarchy

Clearer scenario explanations

Polished Trust & Compliance section

No new files required unless helper copy constants are extracted.
