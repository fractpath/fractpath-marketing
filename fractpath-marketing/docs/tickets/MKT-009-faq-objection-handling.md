TICKET MKT-009 — FAQ expansion + objection handling
Ticket ID

MKT-009

Title

FAQ expansion + objection handling (persona-aware, compliance-safe)

Objective

Strengthen the homepage’s ability to convert skeptical, high-intent visitors by addressing the most likely objections from each persona (Homeowner, Buyer, Realtor) in a way that is:

easy to skim

consistent with the FractPath tone (confident, not pushy)

compliant (no promises, no legal advice)

operationally honest (manual-first early contracts)

This ticket should reduce drop-off after the calculator by answering “Is this real?” and “What’s the catch?” without adding product complexity.

Non-goals

No SEO keyword strategy (MKT-010)

No new calculator logic or outputs

No legal claims or jurisdiction-specific advice

No in-app onboarding changes

Preconditions

MKT-001 → MKT-008 complete

Persona toggle exists and works

Trust & compliance section exists

Realtor beta funnel exists

Implementation Requirements
A) FAQ section redesign (for scanability)

Update the FAQ section to be structured and scannable.

Required UX:

Use shadcn Accordion

Group FAQs into 3 categories with headings:

Homeowners

Buyers

Realtors

Add a fourth mini-group:
4) Safety & Compliance

Each group should have 4–6 questions max (keep it tight).

B) Persona-aware FAQ behavior (optional but recommended)

When a persona is selected:

that persona’s FAQ group is emphasized (e.g., opened by default or visually highlighted)

other groups remain available below

C) Objection handling: required topics

Include questions and conservative answers covering these topics:

Homeowner objections

“Will I lose control of my home?”

“Is this a loan? Will I have monthly payments?”

“What happens if my home value goes down?”

“Can I buy back shares early?”

“How do appraisals work?”

“What happens at sale or refinance?”

Buyer objections

“Do I get any cash flow?”

“How is my equity tracked over time?”

“What protects me if the homeowner delays exit?”

“What happens if the homeowner wants to buy back early?”

“How do floors/caps work?”

“How do title and liens protect the agreement?”

Realtor objections

“Does this replace the agent or sale process?”

“How do referrals and commissions work?”

“Do I need a license to participate?”

“How do I avoid legal risk?”

“Can I co-pilot onboarding for clients?”

“What happens if my client exits early/late?”

Safety & compliance objections

“Are the calculator results guaranteed?”

“Is this regulated like a mortgage?”

“How do you keep parties from going off-platform?”

“How are disputes handled?”

“How do you maintain an auditable record?”

D) Answer style constraints (must follow)

Keep each answer to 3–5 sentences

Avoid legal claims; use “generally,” “typically,” “varies by state”

Always reinforce “scenario modeling” and “terms summary”

Provide next step CTA at the end of some answers:

“Join beta to see how it would work for your case.”

E) Tie calculator concepts into FAQs

Where relevant, reference the calculator terms users just saw:

early vs standard vs late scenario

timing factor affects payout (not FMV)

floor/cap constraints

“adjust advanced parameters in the app” teaser (where appropriate)

F) Add a “Still have questions?” support route

At end of FAQ section:

Add a simple card:

“Still have questions?”

Button: “Contact FractPath”

Behavior: scroll to footer support email or open mailto (choose one)

Keep it minimal; don’t add ticketing system yet

Acceptance Criteria (Definition of Done)

FAQ is grouped into 4 headings using Accordion

Each group has 4–6 strong FAQs with short answers

Answers are compliant and not salesy

FAQs reference calculator concepts (TF, floor/cap, timing windows) in plain language

Mobile is readable and not overwhelming

No build errors, no console errors

QA Checklist

 No “guaranteed return” language

 Realtor licensing answers are cautious

 Users can quickly find relevant group

 Accordion keyboard navigation works

 Dark mode contrast remains AA-compliant

Deliverables

Updated FAQ section component with grouped Accordions

New FAQ content added to src/content/personas.ts or a dedicated src/content/faq.ts (preferred)

“Still have questions?” support CTA added
